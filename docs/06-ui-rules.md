# UI Rules: MPG Ops

## Design Philosophy

**Mobile-First, Simplicity-Always**

Every UI decision prioritizes mobile usability and operational speed.

---

## Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| **Mobile** | < 640px | Primary target, optimize first |
| **Tablet** | 640px - 1024px | Secondary support |
| **Desktop** | > 1024px | Extended layouts |

**Design mobile, adapt up. Never design desktop-first.**

---

## Layout Principles

### Mobile Layout
```
┌─────────────────────────────┐
│ Header (Logo + Actions)     │
├─────────────────────────────┤
│                             │
│                             │
│      MAIN CONTENT           │
│      (Single column)        │
│                             │
│                             │
├─────────────────────────────┤
│      Bottom Navigation      │
│  [Home] [Book] [Cust] [Set] │
└─────────────────────────────┘
```

### Spacing Scale

Use Tailwind spacing:
- `gap-2` (8px) — Tight groupings
- `gap-4` (16px) — Standard spacing
- `gap-6` (24px) — Section separation
- `p-4` (16px) — Screen padding mobile
- `p-6` (24px) — Screen padding desktop

### Touch Targets

Minimum 44x44px for all interactive elements.

```css
/* Always */
<button class="min-h-[44px] min-w-[44px]">
```

---

## Color Palette

Use shadcn/ui defaults with these semantics:

| Purpose | Color | Usage |
|---------|-------|-------|
| Primary | `primary` | CTAs, active states, key actions |
| Success | `green-500` | Completed, paid, success states |
| Warning | `yellow-500` | Pending, scheduled |
| Danger | `red-500` | Cancelled, delete, errors |
| Neutral | `gray-500` | Inactive, placeholder |

### Status Colors

| Status | Color | Background |
|--------|-------|------------|
| Scheduled | Yellow | `bg-yellow-100 text-yellow-800` |
| Completed | Green | `bg-green-100 text-green-800` |
| Cancelled | Red | `bg-red-100 text-red-800` |
| No-Show | Gray | `bg-gray-100 text-gray-800` |
| Paid | Green | `bg-green-100 text-green-800` |
| Pending | Yellow | `bg-yellow-100 text-yellow-800` |

---

## Typography

### Font Stack
- **Primary:** System UI font stack (shadcn/ui default)
- **No custom fonts for MVP**

### Hierarchy

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | `text-2xl` | 700 | Page titles (mobile) |
| H1 | `text-3xl` | 700 | Page titles (desktop) |
| H2 | `text-xl` | 600 | Section headers |
| H3 | `text-lg` | 600 | Card titles |
| Body | `text-base` | 400 | Default text |
| Small | `text-sm` | 400 | Secondary text |
| XSmall | `text-xs` | 400 | Captions, metadata |

---

## Component Patterns

### Cards

Standard card for lists:
```tsx
<Card className="p-4">
  <div className="flex justify-between items-start">
    <div>
      <h3 className="font-semibold">Customer Name</h3>
      <p className="text-sm text-muted-foreground">Service Name</p>
    </div>
    <Badge>Status</Badge>
  </div>
  <div className="mt-2 text-sm text-muted-foreground">
    2:00 PM - $50
  </div>
</Card>
```

### Forms

Mobile-optimized forms:
```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input 
      id="name" 
      placeholder="Enter name"
      className="h-12" // Larger touch target
    />
  </div>
  {/* Single column, full width */}
</form>
```

### Lists

Card-based lists with clear tap targets:
```tsx
<div className="space-y-3">
  {items.map(item => (
    <Card 
      key={item.id}
      className="p-4 active:scale-[0.99] transition-transform"
    >
      {/* Content */}
    </Card>
  ))}
</div>
```

### Buttons

| Type | Usage | Style |
|------|-------|-------|
| Primary | Main CTAs | `variant="default" size="lg"` |
| Secondary | Alternative actions | `variant="outline"` |
| Ghost | Tertiary actions | `variant="ghost"` |
| Danger | Destructive | `variant="destructive"` |

**Mobile buttons:** Always `size="lg"` for primary actions

### Navigation

Bottom tab bar for mobile:
```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
  <div className="flex justify-around p-2">
    <NavItem icon={Home} label="Home" href="/dashboard" />
    <NavItem icon={Calendar} label="Bookings" href="/bookings" />
    <NavItem icon={Users} label="Customers" href="/customers" />
    <NavItem icon={Settings} label="Settings" href="/settings" />
  </div>
</nav>
```

---

## Page Templates

### Dashboard Page
```
┌─────────────────────────────┐
│ Dashboard          [Menu]   │
├─────────────────────────────┤
│ Today's Summary             │
│ ┌─────────┐ ┌─────────┐    │
│ │ Bookings│ │ Revenue │    │
│ │   12    │ │  $450   │    │
│ └─────────┘ └─────────┘    │
├─────────────────────────────┤
│ Quick Actions               │
│ [New Booking] [Add Customer]│
├─────────────────────────────┤
│ Today's Schedule            │
│ ┌─────────────────────────┐ │
│ │ 9:00 AM  John - Cut     │ │
│ │ 10:00 AM Jane - Color   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### List Page (Customers, Services)
```
┌─────────────────────────────┐
│ Customers        [Search]   │
├─────────────────────────────┤
│ [Search input...       ]    │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ John Doe        >       │ │
│ │ +1 234 567 8900         │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Jane Smith      >       │ │
│ │ +1 234 567 8901         │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│         [ + Add New ]       │
└─────────────────────────────┘
```

### Form Page
```
┌─────────────────────────────┐
│ < New Customer              │
├─────────────────────────────┤
│                             │
│  Name                       │
│  ┌─────────────────────┐    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  Phone                      │
│  ┌─────────────────────┐    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  Email (optional)           │
│  ┌─────────────────────┐    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│         [ Save ]            │
│                             │
└─────────────────────────────┘
```

---

## Animation Guidelines

**Minimal, purposeful animations only:**

```css
/* Page transitions */
.transition-all duration-200

/* Button press feedback */
.active:scale-[0.98]

/* List item tap */
.active:bg-muted

/* Modal */
.animate-in fade-in duration-200
```

**No:**
- Complex animations
- Parallax effects
- Loading spinners (use skeletons)

---

## Accessibility

- All interactive elements keyboard accessible
- Focus visible states
- ARIA labels where needed
- Color not sole indicator (icons + text)
- Minimum contrast ratio 4.5:1

---

## shadcn/ui Components Available

Installed:
- Button
- Card
- Input
- Label
- Badge

Add as needed:
- Dialog
- Dropdown Menu
- Select
- Tabs
- Toast
- Skeleton
- Calendar
- Popover
- Sheet

---

*Document Version: 1.0*  
*Last Updated: 2026-04-13*
