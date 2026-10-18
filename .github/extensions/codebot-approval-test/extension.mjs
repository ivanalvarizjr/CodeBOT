import { defineWorkflow, joinSession } from "@github/copilot-sdk/extension";

const approvalTest = defineWorkflow({
  meta: {
    name: "codebot-approval-test",
    description:
      "Read-only smoke test for workflow progress and pause/resume behavior.",
    phases: [
      { title: "Prepare proposal" },
      { title: "Checkpoint" },
      { title: "Cancel test window" },
      { title: "Resume verification" },
    ],
    argsSchema: {
      type: "object",
      properties: {},
    },
  },

  run: async (ctx) => {
    ctx.phase("Prepare proposal");

    const proposal = {
      testId: "CODEBOT-PHASE-A-001",
      version: 1,
      purpose: "Verify workflow checkpoint behavior",
      operations: ["log progress", "pause", "resume", "log result"],
      fileWrites: false,
      externalSideEffects: false,
    };

    const savedProposal = await ctx.step(
      "codebot-test-proposal-v1",
      () => proposal,
    );

    ctx.log(
      "CODEBOT_TEST_PROPOSAL_BEGIN\n" +
        JSON.stringify(savedProposal, null, 2) +
        "\nCODEBOT_TEST_PROPOSAL_END",
    );

    ctx.phase("Checkpoint");

    await ctx.pause("codebot-test-review-v1");

    ctx.phase("Cancel test window");
    ctx.log("CODEBOT_CANCEL_WINDOW_BEGIN");

    await ctx.step(
      "codebot-cancel-window-v1",
      () =>
        new Promise((resolve, reject) => {
          if (ctx.signal.aborted) {
            reject(ctx.signal.reason ?? new Error("Workflow cancelled"));
            return;
          }

          const onAbort = () => {
            clearTimeout(timer);
            reject(ctx.signal.reason ?? new Error("Workflow cancelled"));
          };
          const timer = setTimeout(() => {
            ctx.signal.removeEventListener("abort", onAbort);
            resolve({ completed: true });
          }, 8000);
          ctx.signal.addEventListener("abort", onAbort, { once: true });
        }),
    );

    ctx.log("CODEBOT_CANCEL_WINDOW_END");
    ctx.phase("Resume verification");

    ctx.log("CODEBOT_TEST_RESUMED: workflow continued after checkpoint.");

    return {
      testId: "CODEBOT-PHASE-A-001",
      status: "RESUMED",
      fileWrites: false,
      externalSideEffects: false,
    };
  },
});

await joinSession({ workflows: [approvalTest] });
