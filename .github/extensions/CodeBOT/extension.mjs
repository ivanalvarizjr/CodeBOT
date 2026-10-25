import { defineWorkflow, joinSession } from "@github/copilot-sdk/extension";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

// ==========================================
// 1. CUSTOM SKILL PROVIDER
// ==========================================
const SKILL_DIRS = [
  path.join(os.homedir(), ".agents", "skills"),
  path.join(os.homedir(), ".copilot", "skills")
];

const skillProvider = {
  listSkills: () => {
    const skills = [];
    for (const dir of SKILL_DIRS) {
      if (!fs.existsSync(dir)) continue;
      const folders = fs.readdirSync(dir);
      for (const folder of folders) {
        const skillPath = path.join(dir, folder, "SKILL.md");
        if (fs.existsSync(skillPath)) {
          const content = fs.readFileSync(skillPath, "utf-8");
          const descMatch = content.match(/description:\s*(.+)/);
          skills.push({
            name: folder,
            description: descMatch ? descMatch[1].trim() : "Custom skill",
            directory: path.join(dir, folder) 
          });
        }
      }
    }
    return skills;
  },
  readSkill: (name) => {
    for (const dir of SKILL_DIRS) {
      const skillPath = path.join(dir, name, "SKILL.md");
      if (fs.existsSync(skillPath)) {
        return fs.readFileSync(skillPath, "utf-8");
      }
    }
    return null;
  }
};

// ==========================================
// 2. SCHEMAS & CONSTANTS
// ==========================================
const ROLES = [
  "orchestrator",
  "data-analyst-manager",
  "application-uiux-designer-manager",
  "software-engineer",
  "prompt-engineer",
];

const PLAN_SCHEMA = {
  type: "object",
  required: ["isMutative", "requiredRoles", "targetPaths", "acceptanceCriteria"],
  properties: {
    isMutative: { type: "boolean" },
    requiredRoles: { type: "array", items: { type: "string", enum: ROLES } },
    targetPaths: { type: "array", items: { type: "string" } },
    acceptanceCriteria: { type: "array", items: { type: "string" } },
  },
};

const RESULT_SCHEMA = {
  type: "object",
  required: ["status", "evidence"],
  properties: {
    status: { type: "string", enum: ["DONE", "PARTIAL", "BLOCKED"] },
    evidence: {
      type: "array",
      items: {
        type: "object",
        required: ["criterion", "evidence"],
        properties: {
          criterion: { type: "string" },
          evidence: { type: "string" },
        },
      },
    },
    patch: {
      type: "string",
      description: "Unified diff format of changes. Required for mutative operations.",
    },
  },
};

const FLOW_DIAGRAM = `flowchart TD
  A([User Request]) --> B[Orchestrator Planning]
  B --> C{Plan Valid?}
  C -- No --> X[BLOCKED]
  C -- Yes --> D[Parallel: Analyst & UI/UX]
  D --> E[Prompt Engineer Optimization]
  E --> F[Software Engineer Execution]
  F --> G{Success?}
  G -- No, Retry < 2 --> F
  G -- No, Retry == 2 --> H[Dynamic Re-plan: Analyst Debug]
  H --> F
  G -- Yes --> I[Verification]
  I --> J[COMPLETE]`;

// ==========================================
// 3. WORKFLOW DEFINITION
// ==========================================
const codebot = defineWorkflow({
  meta: {
    name: "CodeBOT",
    description: "Advanced agentic router with parallel execution, dynamic re-planning, and prompt injection.",
    phases: [
      { title: "Intake and planning" },
      { title: "Parallel analysis and design" },
      { title: "Prompt optimization" },
      { title: "Implementation and re-planning" },
      { title: "Verification" },
    ],
    argsSchema: {
      type: "object",
      required: ["userRequest"],
      properties: {
        userRequest: { type: "string" },
      },
    },
    limits: {
      maxConcurrentSubagents: 3,
      timeoutSeconds: 1200,
    },
  },
  run: async (ctx) => {
    const roleStates = Object.fromEntries(ROLES.map((role) => [role, role === "orchestrator" ? "PLANNING" : "NOT_REQUESTED"]));
    const handoffs = [];
    
    const final = (chainStatus, reason, extra = {}) => {
      return {
        workflow: "CodeBOT",
        run_id: ctx.runId,
        chain_status: chainStatus,
        role_states: roleStates,
        handoffs,
        reason,
        mermaid: FLOW_DIAGRAM,
        ...extra,
      };
    };

    try {
      if (typeof ctx.args?.userRequest !== "string" || !ctx.args.userRequest.trim()) {
        return final("BLOCKED", "A non-empty userRequest is required.");
      }
      if (ctx.signal.aborted) return final("CANCELLED", "Workflow cancelled before planning.");

      const userRequest = ctx.args.userRequest.trim();
      
      // FASE 1: INTAKE & PLANNING
      ctx.phase("Intake and planning");
      
      const plan = await ctx.agent(
        `You are the Orchestrator. Analyze this user request: ${JSON.stringify(userRequest)}. 
        Determine if this task requires file mutations (isMutative). 
        CRITICAL (Token Saving): If mutative, plan for a MODULAR architecture based on the project's tech stack.
        Select the required roles from: ${ROLES.join(", ")}. 
        Determine absolute targetPaths based on the current working directory (${process.cwd()}); use an empty array if no project path is needed. 
        Define concrete acceptanceCriteria. Return only the requested structured plan.`,
        { agent: "orchestrator", label: `${ctx.runId}:orchestrator-plan`, schema: PLAN_SCHEMA },
      );
      
      roleStates.orchestrator = "PLANNED";
      
      if (!plan || typeof plan.isMutative !== "boolean" || !Array.isArray(plan.requiredRoles) ||
        !Array.isArray(plan.targetPaths) || !Array.isArray(plan.acceptanceCriteria) ||
        plan.requiredRoles.some((role) => !ROLES.includes(role)) ||
        plan.targetPaths.some((target) => typeof target !== "string") ||
        plan.acceptanceCriteria.some((criterion) => typeof criterion !== "string" || !criterion.trim())) {
        roleStates.orchestrator = "BLOCKED";
        return final("BLOCKED", "Orchestrator returned an invalid plan.");
      }

      const requestedRoles = [...new Set(plan.requiredRoles)];
      if (plan.isMutative && !requestedRoles.includes("software-engineer")) {
        return final("BLOCKED", "Mutative plan must explicitly request the software-engineer role.");
      }
      
      const criteria = plan.acceptanceCriteria.map((criterion) => criterion.trim());
      if (!criteria.length) return final("BLOCKED", "Orchestrator plan must include acceptance criteria.");
      
      for (const role of requestedRoles) {
        if (role !== "orchestrator") roleStates[role] = "PENDING";
      }

      const plannedPaths = plan.targetPaths.length ? plan.targetPaths : [process.cwd()];
      const evidence = [];

      // FUNGSI DISPATCH UNIVERSAL
      const dispatchRole = async (role, customPrompt = null) => {
        if (ctx.signal.aborted) return { cancelled: true };
        
        let prompt = "";
        if (customPrompt) {
          prompt = customPrompt;
        } else {
          let promptParts = [`Orchestrator-mediated handoff for CodeBOT run ${ctx.runId}.`, `Role: ${role}.`];
          promptParts.push(`User request: ${userRequest}`);
          promptParts.push(`Acceptance criteria: ${JSON.stringify(criteria)}`);

          if (role === "software-engineer") {
            promptParts.push(`Target paths: ${JSON.stringify(plannedPaths)}`);
            if (plan.isMutative) {
              promptParts.push("This handoff is MUTATIVE.");
              promptParts.push("INSTRUCTION: You MUST use your tools (edit/write) to APPLY the changes to the filesystem.");
              promptParts.push("After applying, return the unified diff in the `patch` field of your JSON output.");
            }
          } else if (role === "prompt-engineer") {
            promptParts.push("Optimize the instructions for the software-engineer. Return the optimized prompt in the `evidence` field.");
          } else {
            promptParts.push("This handoff is read-only. Do not create, edit, delete, execute, or delegate.");
          }
          
          promptParts.push("Return JSON with status DONE/PARTIAL/BLOCKED and evidence entries {criterion,evidence}; cite concrete paths or observations.");
          prompt = promptParts.join("\n");
        }

        try {
          const result = await ctx.agent(prompt, { agent: role, label: `${ctx.runId}:${role}`, schema: RESULT_SCHEMA });
          
          if (!result || !["DONE", "PARTIAL", "BLOCKED"].includes(result.status) || !Array.isArray(result.evidence)) {
            roleStates[role] = "BLOCKED";
            handoffs.push({ role, status: "BLOCKED", error: "Agent returned invalid evidence." });
            return { failed: true };
          }
          
          roleStates[role] = result.status;
          
          // Mencegah 'undefined' pada 'patch'
          const handoff = { 
            role, 
            status: result.status, 
            evidence: result.evidence,
            ...(result.patch !== undefined && { patch: result.patch })
          };
          
          handoffs.push(handoff);
          evidence.push(...result.evidence);
          
          return { failed: result.status === "BLOCKED", handoff };
        } catch (error) {
          if (ctx.signal.aborted) return { cancelled: true };
          roleStates[role] = "BLOCKED";
          handoffs.push({ role, status: "BLOCKED", error: String(error?.message ?? error) });
          return { failed: true };
        }
      };

      // FASE 2: PARALLEL EXECUTION (ANALYST & UI/UX)
      const parallelRoles = requestedRoles.filter(r => 
        r !== "orchestrator" && 
        r !== "software-engineer" && 
        r !== "prompt-engineer"
      );

      if (parallelRoles.length > 0) {
        ctx.phase("Parallel analysis and design");
        ctx.log(`Running parallel roles: ${parallelRoles.join(", ")}`);
        await Promise.all(parallelRoles.map(role => dispatchRole(role)));
      }

      // FASE 3: PROMPT ENGINEER INJECTION
      let optimizedPrompt = null;
      if (requestedRoles.includes("prompt-engineer")) {
        ctx.phase("Prompt optimization");
        ctx.log("Running Prompt Engineer...");
        const peResult = await dispatchRole("prompt-engineer");
        
        if (peResult.failed) {
          return final("BLOCKED", "Prompt Engineer failed to optimize instructions.");
        }
        
        if (peResult.handoff && peResult.handoff.evidence.length > 0) {
          optimizedPrompt = peResult.handoff.evidence[0].evidence;
          ctx.log("Optimized prompt successfully extracted from Prompt Engineer.");
        }
      }

      // FASE 4: SOFTWARE ENGINEER (DENGAN RE-PLANNING)
      if (requestedRoles.includes("software-engineer")) {
        ctx.phase("Implementation and re-planning");
        
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;

        while (attempts < maxAttempts) {
          attempts++;
          ctx.log(`[Attempt ${attempts}/${maxAttempts}] Dispatching software-engineer...`);
          
          let engPrompt = `Orchestrator-mediated handoff for CodeBOT run ${ctx.runId}.\nRole: software-engineer.\n`;
          engPrompt += `User request: ${userRequest}\n`;
          engPrompt += `Acceptance criteria: ${JSON.stringify(criteria)}\n`;
          engPrompt += `Target paths: ${JSON.stringify(plannedPaths)}\n`;
          
          if (optimizedPrompt) {
            engPrompt += `\nOPTIMIZED INSTRUCTIONS FROM PROMPT ENGINEER:\n${optimizedPrompt}\n`;
          }

          if (plan.isMutative) {
            engPrompt += "\nThis handoff is MUTATIVE. You MUST use your tools (edit/write) to APPLY the changes to the filesystem.";
            engPrompt += "\nAfter applying, return the unified diff in the `patch` field.";
          }

          const outcome = await dispatchRole("software-engineer", engPrompt);
          
          if (outcome.cancelled) return final("CANCELLED", "Workflow cancelled.");
          if (!outcome.failed) {
            success = true;
            break; 
          }

          // DYNAMIC RE-PLANNING
          if (attempts === 2) {
            ctx.log("Engineer failed twice. Initiating Dynamic Re-planning: calling Data Analyst for debugging...");
            
            const debugPrompt = `Orchestrator-mediated handoff for CodeBOT run ${ctx.runId}.\nRole: data-analyst-manager.\n` +
              `User request: ${userRequest}\n` +
              `The software-engineer failed to implement the changes. Investigate the workspace and logs to find out why it failed. ` +
              `Provide actionable debugging steps or context for the engineer to succeed on the next try.`;
            
            const debugResult = await dispatchRole("data-analyst-manager", debugPrompt);
            
            if (debugResult.handoff && debugResult.handoff.evidence.length > 0) {
              optimizedPrompt = (optimizedPrompt || "") + `\n\nDEBUG CONTEXT FROM ANALYST:\n${debugResult.handoff.evidence[0].evidence}`;
              ctx.log("Injecting debugging context for final attempt.");
            }
          }
        }

        if (!success) {
          return final("BLOCKED", `Software Engineer failed after ${maxAttempts} attempts.`);
        }
      }

      // FASE 5: VERIFICATION
      ctx.phase("Verification");
      const verifiedCriteria = new Set(evidence.filter((item) => item && typeof item.criterion === "string" && typeof item.evidence === "string" && item.evidence.trim()).map((item) => item.criterion));
      const missing = criteria.filter((criterion) => !verifiedCriteria.has(criterion));
      
      if (handoffs.some((handoff) => handoff.status === "PARTIAL") || missing.length) {
        return final(handoffs.length ? "PARTIAL" : "BLOCKED", "Acceptance criteria lack complete specialist evidence.", { missing_criteria: missing });
      }
      
      return final("COMPLETE", "All acceptance criteria have specialist evidence.", { verified_criteria: criteria });
    } catch (error) {
      if (ctx.signal.aborted) return final("CANCELLED", "Workflow cancelled.");
      return final("BLOCKED", String(error?.message ?? error));
    }
  },
});

// ==========================================
// 4. SESSION INITIALIZATION
// ==========================================
const session = await joinSession({
  workflows: [codebot],
  enableSkills: true,               // Memaksa runtime untuk memuat skills
  skillProvider: skillProvider,     // <-- PERBAIKAN: Mendaftarkan custom provider di sini
  skillDirectories: [               // Tetap dipertahankan sebagai fallback standar
    path.join(os.homedir(), ".agents", "skills"),
    path.join(os.homedir(), ".copilot", "skills")
  ],
  tools: [
    {
      name: "codebot_resume",
      description: "Resume a paused CodeBOT run.",
      parameters: {
        type: "object",
        required: ["runId"],
        properties: { runId: { type: "string" } },
      },
      handler: async ({ runId }) => {
        try {
          const result = await session.workflow.resume(runId, { notifyOnComplete: true, logPhaseNames: true });
          return JSON.stringify({ runId, status: result.status, result: result.status === "completed" ? result.result : undefined, failure: result.failure ?? result.error });
        } catch (error) {
          return { textResultForLlm: `CodeBOT resume failed: ${String(error?.message ?? error)}`, resultType: "failure" };
        }
      },
    },
    {
      name: "codebot_cancel",
      description: "Cancel a CodeBOT workflow run.",
      parameters: {
        type: "object",
        required: ["runId"],
        properties: { runId: { type: "string" } },
      },
      handler: async ({ runId }) => {
        try {
          const result = await session.workflow.cancel(runId);
          return JSON.stringify({ runId, status: result.status, failure: result.failure ?? result.error });
        } catch (error) {
          return { textResultForLlm: `CodeBOT cancellation failed: ${String(error?.message ?? error)}`, resultType: "failure" };
        }
      },
    },
  ],
});