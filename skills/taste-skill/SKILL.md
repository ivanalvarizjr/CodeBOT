---
name: taste-skill
description: Use when the user enters `/taste-skill list` or asks which Taste-Skill frontend design skills are available and how to invoke them.
---

# Taste-Skill selector

When the user asks `/taste-skill list`, show the six installed Taste-Skill options with a short purpose, whether the agent may select it automatically, and one prompt example. Do not implement or modify a project just to display the list.

Skills are selected automatically when the task matches their descriptions, but automatic selection is not guaranteed and only relevant skills should be loaded. For a specific visual direction, explicitly name the skill with `/skill-name`. The examples below are prompt templates; the selected skill generates project code when used on a project.

| Skill | Use |
|---|---|
| `design-taste-frontend` | General frontend design, especially landing pages, portfolios, and redesigns. A good default when the brief does not specify a visual direction. |
| `image-to-code` | Image-first website workflow: create and analyze visual references, then implement them. Requires an image-generation capability; if unavailable, say so rather than claiming images were generated. |
| `redesign-existing-projects` | Audit and upgrade an existing interface while preserving its framework and behavior. |
| `high-end-visual-design` | Premium, agency-style visual direction with detailed layout and motion rules. |
| `minimalist-ui` | Restrained editorial interfaces with a warm monochrome palette and minimal decoration. |
| `stitch-design-taste` | Create a `DESIGN.md` design system for Google Stitch; this is a design specification workflow, not direct project-code generation. |

## Prompt examples

```text
Use /design-taste-frontend to build this landing page: [brief]
Use /image-to-code to create and analyze visual references before implementing: [brief]
Use /redesign-existing-projects to audit and improve this existing UI without changing its behavior.
Use /high-end-visual-design for a premium visual direction for: [brief]
Use /minimalist-ui for a restrained editorial interface for: [brief]
Use /stitch-design-taste to create a Google Stitch DESIGN.md for: [brief]
```

If the user asks for the list only, return the index and examples without choosing a skill or starting implementation. Explain that 9router routes model requests; the agent client must load these local skills and include their instructions in the request. If the client does not support Agent Skills, the user must provide the relevant instructions in the prompt.
