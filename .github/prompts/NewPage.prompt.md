---
name: scaffoldNewPage
description: Generates a new application page following project-specific component architecture and styling standards
argument-hint: A description of the page or feature you want to create
---
Act as an expert Next.js and Tailwind CSS developer familiar with this repository's design system. I need you to scaffold a new page or major feature based on the requirements below.

**Feature Description:**
(Input requirements here)

**Architectural & Styling Preferences:**

1.  **Modular Component Structure:**
    *   **Avoid Monoliths:** Break the UI down into small, single-responsibility components (e.g., separate the logic for filters, lists, and summary cards).
    *   **File Organization:** Suggest creating a dedicated folder in `components/` for this feature.
    *   **Wrappers:** Use the project's standard `ComponentCard` (or equivalent wrapper) for main content blocks, especially those requiring headers or action buttons.
    *   **Props & State Management:** Use TypeScript interfaces for props. Manage local state with React hooks; lift state up only when necessary.\
    *   **Hooks:** Leverage custom hooks for data fetching or complex logic to keep components clean, and keep reusable logic separate in `hooks/`.

2.  **Visual Design & Tailwind:**
    *   **Consistency:** Match the existing visual style (spacing, rounded corners, shadow depths, and color palette).
    *   **Interactivity:** Implement UI behaviors (like carousels, expandable filters, or tabs) using React's `useState` and `useRef`.
    *   **Responsiveness:** Ensure the layout adapts gracefully from mobile to desktop.

3.  **Iconography:**
    *   Use icons from the central export file (e.g., `@/icons/index`).
    *   *SVG Handling:* If an icon appears cropped or doesn't resize efficiently, plan to adjust its `viewBox` rather than relying on external padding.

4.  **Implementation Steps:**
    *   Define the TypeScript interfaces/types first.
    *   Create the sub-components.
    *   Assemble them in the main page file.
    *   Ensure all imports use valid absolute paths (e.g., `@/components/...`).

5.  **Testing & Validation:**
    *   Ensure the new page is linted, formatted, and type checked without errors.
    *   Ensure all new components are covered by unit tests using the existing testing framework.
    *   Validate responsiveness and interactivity across common device sizes.
