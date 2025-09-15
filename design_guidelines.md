# Filter Interface Redesign Guidelines

## Design Approach
**System-Based Approach**: Following modern dashboard design patterns with emphasis on utility and efficiency. This is a data-heavy, productivity-focused interface where function takes precedence over visual flair.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary** (matching existing interface):
- Background: 222 47% 11% (dark slate)
- Surface: 215 28% 17% (lighter slate)
- Text Primary: 210 40% 98% (near white)
- Text Secondary: 215 16% 65% (muted gray)
- Accent Blue: 217 91% 60% (primary actions)
- Success Green: 142 71% 45% (applied filters)
- Border: 217 19% 27% (subtle divisions)

### B. Typography
- **Font Family**: System fonts (ui-sans-serif, system-ui)
- **Filter Labels**: text-sm font-medium
- **Badge Text**: text-xs font-medium
- **Button Text**: text-sm font-medium

### C. Layout System
**Tailwind Spacing**: Consistently use units of 2, 3, 4, 6, and 8
- Component padding: p-3, p-4
- Element spacing: space-x-2, gap-3
- Margins: m-2, mb-4

### D. Component Library

#### Filter Bar Components
1. **Customize Filters Button**
   - Left-aligned before search bar
   - Subtle styling: border border-slate-600 with hover:bg-slate-700
   - Icon: settings/sliders icon from Heroicons
   - Text: "Customize filters"

2. **Filter Badges** (when active)
   - Rounded badges: bg-blue-900/30 border border-blue-700
   - Clear button: small × icon on right
   - Edit functionality: click badge to open filter
   - Examples: "Time range: last 7 days", "State: 6 selected"

3. **Customization Panel**
   - Collapsible dropdown below filter bar
   - Checkboxes for each filter type
   - Smooth expand/collapse transition
   - Background: bg-slate-800 with subtle border

4. **Table Controls Toggle**
   - Collapsible section below main interface
   - Toggle button: "Table options" with chevron icon
   - Contains: Periodic refresh, Refresh data, Table options
   - Default: collapsed state

#### Search Integration
- Search bar maintains current styling
- Positioned right of "Customize filters" button
- Full-width when no filter badges present

### E. Interaction Patterns

#### Default State
- Show only: "Customize filters" button + Search bar
- Clean, minimal appearance
- Maximum horizontal space for search

#### Active Filters State
- Filter badges appear between "Customize filters" and search
- Each badge shows filter name and current selection
- Individual clear buttons (×) for each badge
- Click badge to edit that specific filter

#### Customization Panel
- Smooth slide-down animation
- List of available filters with toggle switches
- "Show/Hide" functionality for each filter type
- Close panel when clicking outside

## Key Design Principles
1. **Progressive Disclosure**: Show complexity only when needed
2. **Space Efficiency**: Minimize vertical and horizontal footprint
3. **Contextual Actions**: Filter management appears when relevant
4. **Consistency**: Match existing dark theme and component styling
5. **Accessibility**: Proper contrast ratios and keyboard navigation

## Responsive Behavior
- Mobile: Stack badges vertically if needed
- Tablet: Maintain horizontal layout with text truncation
- Desktop: Full horizontal layout with all elements visible

This design transforms the cluttered filter interface into a clean, progressive system that scales with user needs while maintaining the existing visual language and dark theme consistency.