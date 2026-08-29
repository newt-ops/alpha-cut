## Alpha Cut Responsive UX Audit & Rebuild

Do NOT treat mobile responsiveness as simply stacking the desktop layout into one column.

The current desktop UI is good, but on mobile many components become oversized, vertically excessive, visually heavy, or overflow their containers. The goal is to make the mobile experience feel intentionally designed, similar to polished modern SaaS dashboards.

### Core principle

Mobile is NOT a smaller desktop.

For every major component, decide how its layout, spacing, typography, information density, and interaction model should change at smaller widths.

### 1. Audit before modifying

Inspect the existing frontend and identify:

- Fixed widths
- Fixed heights
- `min-width` constraints
- Hardcoded large padding/margins
- Large typography that remains unchanged on mobile
- Grid layouts that blindly collapse to one column
- Horizontal overflow
- Tables that overflow
- Cards that become unnecessarily tall
- Buttons that become oversized
- Navigation that consumes excessive vertical space
- Long labels that wrap badly
- Elements positioned with desktop assumptions
- Components that should change structure rather than simply resize

Do not make random CSS changes before understanding the component.

### 2. Establish responsive behavior

Use the project's existing design system and CSS architecture where possible.

Support:

- Large desktop
- Desktop
- Tablet
- Mobile
- Small mobile

Do not create unnecessary breakpoints for individual components.

Prefer a small, consistent responsive system.

### 3. Mobile layout philosophy

On mobile:

- Reduce unnecessary padding
- Reduce excessive vertical gaps
- Scale headings appropriately
- Keep body text readable
- Keep important actions easy to tap
- Prevent horizontal overflow
- Keep cards compact
- Preserve visual hierarchy
- Avoid turning every desktop row into a huge vertical stack
- Hide secondary information when appropriate
- Move secondary actions into menus where appropriate
- Convert complex layouts into mobile-specific compositions when necessary

### 4. Do NOT blindly stack everything

Never use:

```css
grid-template-columns: 1fr;
```

as the default solution for every desktop grid.

Ask whether the content can instead:

- Remain horizontally compact
- Use a 2-column mobile grid
- Become a horizontal scroll section
- Become a condensed summary
- Hide secondary metadata
- Become a different component
- Open in a drawer/modal
- Use tabs
- Use an accordion

The goal is to reduce unnecessary page height.

### 5. Typography

Desktop typography should not simply remain unchanged on mobile.

Use the existing typography system and responsive sizing where appropriate.

Avoid oversized mobile headings.

Maintain clear hierarchy:

- Page title
- Section title
- Card title
- Body
- Metadata

Do not make everything bold.

### 6. Spacing

Create a compact mobile spacing rhythm.

Desktop may use larger spacing, but mobile should generally use smaller:

- Card padding
- Section gaps
- Grid gaps
- Header spacing
- Form spacing

Do not compress the interface so much that it becomes difficult to tap or read.

### 7. Dashboard cards

Review all dashboard metric cards.

Do not automatically render:

```text
Card
Card
Card
Card
```

vertically on mobile.

Where appropriate, use:

- 2-column compact grids
- Horizontal metric groups
- Condensed cards
- Priority-based information

Keep the most important number prominent and secondary metadata compact.

### 8. Tables

Audit every table.

Desktop tables can remain tables.

On mobile, if a table cannot fit comfortably, convert it into an appropriate mobile representation such as:

- Compact cards
- List rows
- Priority columns only
- Horizontally scrollable table when the table genuinely requires all columns

Never allow a table to push the entire page horizontally.

### 9. Navigation

Audit desktop navigation separately from mobile navigation.

Mobile navigation should be intentionally designed for small screens.

Do not simply shrink the desktop sidebar.

Use an appropriate mobile navigation pattern such as:

- Bottom navigation
- Compact top navigation
- Drawer
- Menu button

depending on the existing Alpha Cut information architecture.

### 10. Forms

Forms should become compact on mobile.

Do not make every field unnecessarily tall.

Use:

- Full-width controls where appropriate
- 1-column layout for fields that genuinely need full width
- Compact 2-column layouts for short fields where readability remains good
- Appropriate input heights
- Clear labels
- Proper spacing

For complex admin forms, preserve logical sections rather than creating an extremely long sequence of oversized controls.

### 11. Proposal Studio specifically

Desktop:

```text
Proposal Form | Live Preview
```

Mobile should NOT simply become:

```text
Entire Form
↓
Entire Preview
```

Instead, prioritize the proposal editor.

The preview should be accessible through a compact action such as:

```text
Preview Proposal
```

and open as a dedicated mobile view, drawer, modal, or appropriate full-screen preview.

The final proposal preview should resemble the actual client-facing proposal.

### 12. Overflow prevention

Guarantee:

```css
html,
body {
  overflow-x: hidden;
}
```

only if appropriate for the existing application architecture.

Do NOT use overflow hiding to conceal actual layout bugs.

Find and fix the actual source of overflow.

Every major container should respect:

```text
max-width: 100%
box-sizing: border-box
min-width: 0
```

where appropriate.

### 13. Visual density

The mobile interface should feel:

- Clean
- Compact
- Intentional
- Modern
- Readable
- Touch-friendly

Avoid:

- Huge empty spaces
- Oversized cards
- Excessive bold text
- Excessive vertical stacking
- Desktop-sized headings
- Giant buttons
- Unnecessary decorative elements

### 14. Important

Do not redesign the desktop UI unnecessarily.

Desktop currently works well.

The goal is to preserve the Alpha Cut visual identity while creating a genuinely responsive mobile experience.

Before finishing:

1. Test at 320px
2. Test at 360px
3. Test at 375px
4. Test at 390px
5. Test at 414px
6. Test tablet width
7. Test desktop width

Check for:

- Horizontal overflow
- Clipped content
- Broken cards
- Text wrapping
- Button overflow
- Navigation problems
- Excessive page height
- Oversized typography
- Excessive spacing
- Unusable tables
- Form layout problems

Do not declare the work complete merely because the page technically fits inside the viewport.

The final result should look like a product intentionally designed for mobile, not a desktop website squeezed into a phone.
