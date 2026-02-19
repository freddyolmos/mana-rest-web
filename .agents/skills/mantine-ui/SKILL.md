---
name: mantine-ui
description: Build and refactor React/Next.js UIs using Mantine (components, theming, layout, forms) with accessibility-first defaults.
---

Use this skill when:

- The user asks to build UI with Mantine, or migrate Tailwind/shadcn UI pieces to Mantine.
- The project already uses Mantine packages (`@mantine/core`, `@mantine/hooks`, etc.).
- You need Mantine best practices for Next.js (App Router), theming, and component patterns.

Assumptions & principles:

- Prefer Mantine components over custom CSS/Tailwind for layout, spacing, typography, and forms.
- Keep accessibility and keyboard navigation intact.
- Keep code idiomatic Mantine: use `Stack`, `Group`, `Flex`, `Grid`, `Box` for layout instead of div soup.

Next.js (App Router) baseline:

- Ensure Mantine is wired with `MantineProvider` at the app root.
- Ensure color scheme is handled properly (script/provider) following Mantine Next.js guidance.
- Client components: add `'use client'` where required (providers, interactive components, etc.).

Component conventions:

- Forms: prefer Mantine form patterns (and validation) when present in the project.
- Tables/lists: use Mantine table primitives; avoid over-customization unless requested.
- Modals/notifications: use Mantine equivalents rather than ad-hoc solutions.

Refactor checklist:

1. Identify the UI target (page/component) and the desired look/behavior.
2. Replace layout wrappers with Mantine layout components.
3. Replace inputs/buttons with Mantine equivalents (preserve labels/errors).
4. Verify responsiveness and a11y.
5. Keep API/data logic unchanged unless the user asks.

Output expectations:

- Provide complete code blocks for the files you changed (or the diff if requested).
- Mention any required package installs and any app-root wiring needed.
