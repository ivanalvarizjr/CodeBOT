import { defineWorkflow, joinSession } from "@github/copilot-sdk/extension";
import os from "node:os";
import path from "node:path";

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

// STRATEGI 1: Menambahkan field `patch` untuk output diff
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
    // Field opsional khusus untuk software-engineer (Strategi 1)
    patch: {
      type: "string",
      description: "Unified diff format of changes. Required for mutative operations.",
    },
  },
};

const FLOW_DIAGRAM = `flowchart TD
  A([Natural-language request]) --> B[Orchestrator agent returns JSON plan]
  B --> C{Plan valid?}
  C -- No --> X[BLOCKED]
  C -- Yes --> D[Dispatch planned specialist roles]
  D --> E{Acceptance criteria evidenced?}
  E -- Yes --> R[COMPLETE]
  E -- Partial --> S[PARTIAL]
  E -- No --> X`;

const codebot = defineWorkflow({
  meta: {
    name: "CodeBOT",
    description: "Natural-language CodeBOT agentic router. Provide userRequest; Orchestrator plans scope and roles.",
    phases: [
      { title: "Intake and planning" },
      { title: "Orchestrator-mediated handoffs" },
      { title: "Verification and final status" },
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
      timeoutSeconds: 900,
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
      
      ctx.phase("Intake and planning");
      
      // STRATEGI 2: Instruksi modularitas pada Orchestrator (Agnostik Framework)
      const plan = await ctx.agent(
        `You are the Orchestrator. Analyze this user request: ${JSON.stringify(userRequest)}. 
        Determine if this task requires file mutations (isMutative). 
        CRITICAL (Token Saving): If mutative, plan for a MODULAR architecture based on the project's tech stack (e.g., separate components, services, or styles into distinct files instead of one monolithic file). Only plan a single-file architecture if explicitly requested by the user.
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
      
      const dispatchRole = async (role) => {
        if (ctx.signal.aborted) return { cancelled: true };
        
        // STRATEGI 3: Context Pruning (Pemangkasan Konteks Spesifik)
        let promptParts = [`Orchestrator-mediated handoff for CodeBOT run ${ctx.runId}.`, `Role: ${role}.`];
        
        if (role === "software-engineer") {
          promptParts.push(`User request: ${userRequest}`);
          promptParts.push(`Target paths: ${JSON.stringify(plannedPaths)}`);
          promptParts.push(`Acceptance criteria: ${JSON.stringify(criteria)}`);
          
          if (plan.isMutative) {
            // STRATEGI 1: Instruksi Patch/Diff
            promptParts.push("This handoff is MUTATIVE. You MUST return your changes as a valid unified diff (using ```diff ... ``` format).");
            promptParts.push("Do NOT return the full file content. Return ONLY the diff.");
            promptParts.push("Place the diff in the `patch` field of your JSON output. Cite the file paths changed in the `evidence` array.");
            promptParts.push("Perform only approved operations within approved paths; do not expand scope.");
          } else {
            promptParts.push("This handoff is read-only. Do not create, edit, delete, execute, or delegate.");
          }
        } else {
          // Agen non-engineer hanya butuh request dan kriteria (tanpa targetPaths)
          promptParts.push(`User request: ${userRequest}`);
          promptParts.push(`Acceptance criteria: ${JSON.stringify(criteria)}`);
          promptParts.push("This handoff is read-only. Do not create, edit, delete, execute, or delegate.");
        }
        
        promptParts.push("Return JSON with status DONE/PARTIAL/BLOCKED and evidence entries {criterion,evidence}; cite concrete paths or observations.");
        const prompt = promptParts.join("\n");

        try {
          const result = await ctx.agent(prompt, { agent: role, label: `${ctx.runId}:${role}`, schema: RESULT_SCHEMA });
          
          if (!result || !["DONE", "PARTIAL", "BLOCKED"].includes(result.status) || !Array.isArray(result.evidence)) {
            roleStates[role] = "BLOCKED";
            handoffs.push({ role, status: "BLOCKED", error: "Agent returned invalid evidence." });
            return { failed: true };
          }
          
          roleStates[role] = result.status;
          handoffs.push({ 
            role, 
            status: result.status, 
            evidence: result.evidence, 
            patch: result.patch // Menyimpan patch ke dalam log handoff
          });
          evidence.push(...result.evidence);
          
          return { failed: result.status === "BLOCKED" };
        } catch (error) {
          if (ctx.signal.aborted) return { cancelled: true };
          roleStates[role] = "BLOCKED";
          handoffs.push({ role, status: "BLOCKED", error: String(error?.message ?? error) });
          return { failed: true };
        }
      };

      ctx.phase("Orchestrator-mediated handoffs");
      
      for (const role of requestedRoles) {
        if (role === "orchestrator") continue;
        
        // STRATEGI 4: Loop Capping (Khusus Software Engineer)
        if (role === "software-engineer" && plan.isMutative) {
          let attempts = 0;
          const maxAttempts = 3;
          let success = false;
          
          while (attempts < maxAttempts) {
            attempts++;
            ctx.log(`[Attempt ${attempts}/${maxAttempts}] Dispatching software-engineer...`);
            
            const outcome = await dispatchRole(role);
            
            if (outcome.cancelled) return final("CANCELLED", "Workflow cancelled.");
            if (!outcome.failed) {
              success = true;
              break; // Keluar dari loop jika berhasil
            }
          }
          
          if (!success) {
            return final("BLOCKED", `Software Engineer failed after ${maxAttempts} attempts. Please review the logs.`);
          }
          
        } else {
          // Agen non-mutatif atau non-engineer jalan normal (1 kali)
          const outcome = await dispatchRole(role);
          if (outcome.cancelled) return final("CANCELLED", "Workflow cancelled during specialist handoff.");
          if (outcome.failed) return final("BLOCKED", `Specialist handoff failed: ${role}.`);
        }
      }

      ctx.phase("Verification and final status");
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

const session = await joinSession({
  workflows: [codebot],
  skillDirectories: [
    path.join(os.homedir(), ".agents", "skills"),
    path.join(os.homedir(), ".copilot", "skills")
  ],
  tools: [
    {
      name: "codebot_resume",
      description: "Resume a paused CodeBOT run. Resuming is not technical approval; a matching owner approval must have been submitted separately.",
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
      description: "Cancel a CodeBOT workflow run. Cancellation does not approve any proposal or authorize mutations.",
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