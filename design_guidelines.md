# Hospital Rio Rise - Design Guidelines

## Design Approach
**Selected System:** Carbon Design System with Medical Industry Adaptation
**Justification:** Utility-focused healthcare management platform requiring data-dense displays, role-based access, and professional credibility. Carbon's enterprise patterns align perfectly with complex information architecture and real-time data tracking needs.

## Core Design Principles
1. **Clarity Over Decoration:** Information must be scannable and actionable
2. **Professional Authority:** Medical industry aesthetic with dark theme sophistication
3. **Hierarchy Through Structure:** Clear visual separation between data types and access levels
4. **Real-time Visibility:** Dynamic countdown timers and status indicators prominent

---

## Color Palette

### Dark Mode (Primary Theme)
**Background Layers:**
- Primary Background: 220 15% 8%
- Elevated Surface: 220 15% 12%
- Interactive Surface: 220 15% 16%
- Hover Surface: 220 15% 20%

**Medical Brand Colors:**
- Primary (Medical Blue): 210 90% 55%
- Primary Hover: 210 90% 65%
- Success (Active Status): 145 70% 50%
- Warning (Expiring Soon): 38 95% 60%
- Danger (Expired/Critical): 0 85% 60%
- Info (System Messages): 200 85% 55%

**Text Hierarchy:**
- Primary Text: 0 0% 95%
- Secondary Text: 0 0% 70%
- Disabled Text: 0 0% 45%
- Link Text: 210 90% 65%

**Accent Elements:**
- Border Default: 220 15% 25%
- Border Focus: 210 90% 55%
- Badge Background: 210 90% 55% at 15% opacity

---

## Typography

**Font Stack:**
- Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- Monospace (Codes/Timers): 'JetBrains Mono', 'Consolas', monospace

**Scale:**
- Hero/Page Title: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card Headers: text-lg font-semibold (18px)
- Body Text: text-base (16px)
- Small Labels: text-sm (14px)
- Caption/Meta: text-xs (12px)

**Weight Usage:**
- Bold (700): Titles, active states
- Semibold (600): Headers, emphasis
- Medium (500): Interactive elements
- Regular (400): Body text

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, 16, 20
- Component padding: p-6
- Section spacing: py-12 to py-20
- Card gaps: gap-6
- Element margins: m-4, mb-8

**Container Strategy:**
- Public page: max-w-7xl mx-auto
- Dashboard: Full width with px-6 lg:px-12
- Content cards: max-w-6xl
- Forms: max-w-2xl

**Grid Patterns:**
- Covenant list: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Member cards: grid-cols-1 lg:grid-cols-2
- Stats dashboard: grid-cols-2 md:grid-cols-4
- Rule sections: Single column, stacked

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed header with backdrop blur
- Hospital logo/name left-aligned
- Access code input (when logged out)
- User badge with role indicator (when logged in)
- Logout button
- Background: Primary Background with bottom border

**Sidebar Navigation (Logged In):**
- Collapsed/Expandable on mobile
- Icon + label pattern
- Active state: Primary color left border + background tint
- Sections: Dashboard, Turnos, Convênios, Regras, /me Templates, Membros

### Data Display Components

**Covenant Card:**
- Organization/Family name header
- Large countdown timer (monospace font, Primary color)
- Status badge (Active/Expiring/Expired)
- Payment amount display
- Time remaining breakdown (days, hours, minutes, seconds)
- Progress bar visualization
- Edit/Delete actions (role-based visibility)

**Member Card:**
- Role badge (color-coded by level)
- Access code (monospace)
- Narnia name + phone (turno-specific views)
- Assigned shift indicator
- Status dot (online/offline if applicable)

**Rule Block:**
- Turno/Global tag
- Rule text with markdown support
- Timestamp of last edit
- Edit button (password-protected)

**/me Template Card:**
- Command preview text
- Scope badge (Turno/General)
- Copy-to-clipboard button
- Quick actions: Edit, Delete

**Real-time Timer Display:**
- Monospace font, large size (text-3xl)
- Format: "13d 0h 48m 57s"
- Color changes: Green (>7 days), Yellow (3-7 days), Red (<3 days)
- Automatic updates every second

### Forms & Inputs

**Standard Text Input:**
- Dark background with subtle border
- Focus: Primary color border with glow
- Label above input
- Helper text below in secondary color

**Password Modal:**
- Centered overlay with backdrop blur
- Single password input with eye icon toggle
- "Cancelar" and "Confirmar" buttons
- Required for all administrative actions

**Add Covenant Form:**
- Organization/Family name input
- Money amount input (with R$ prefix)
- Auto-calculated time preview below
- Large "Adicionar" button

### Interactive Elements

**Primary Button:**
- Background: Primary color
- Hover: Primary hover color
- Padding: px-6 py-3
- Rounded corners: rounded-lg
- Font: font-semibold

**Secondary Button:**
- Border: Primary color
- Background: Transparent
- Hover: Primary color at 10% opacity

**Icon Buttons:**
- Size: 40x40px minimum
- Hover: Background tint
- Active: Slight scale

**Status Badges:**
- Rounded full pill shape
- Size: text-xs px-3 py-1
- Color-coded by type
- Icons optional

### Overlays

**Modal Pattern:**
- Centered with max-width
- Backdrop: Black at 60% opacity with blur
- Modal background: Elevated surface
- Close button top-right
- Actions bottom-right

**Toast Notifications:**
- Fixed top-right
- Auto-dismiss after 4 seconds
- Types: Success, Error, Info, Warning
- Icon + message + close button

---

## Page-Specific Layouts

### Public Landing Page (Logged Out)
**Hero Section (60vh):**
- Hospital name and tagline
- Subtle medical cross or hospital building silhouette
- Access code input with "Entrar" button
- General stats display (total members, active covenants)

**Sections (full-width):**
1. Regras Gerais (collapsible accordion)
2. Convênios Ativos (card grid, no sensitive data)
3. Informações do Hospital (contact, RP server info)

### Dashboard (Logged In)
**Layout:** Sidebar + Main content area

**Main Content Sections:**
1. **Overview Cards:** Active covenants count, turno info, role display
2. **Turno-Specific Rules:** Editable by authorized roles
3. **Turno Members:** Filtered by logged-in user's shift
4. **/me Templates:** Personal and turno-specific quick actions
5. **Covenant Management:** Add/edit/view based on role

---

## Animations
**Minimal, Purposeful Motion:**
- Timer updates: Smooth number transitions (transition-all duration-300)
- Card hover: Subtle lift (hover:shadow-lg hover:-translate-y-1)
- Modal appearance: Fade in with slight scale (animate-in)
- Button interactions: Native browser states only

---

## Images
**Hospital Logo/Icon:**
- Placement: Top-left navigation
- Style: Medical cross or stylized "HRR" monogram in Primary color
- Size: 40x40px

**Hero Background (Optional):**
- Subtle medical pattern or abstract geometric shapes
- Low opacity (15-20%) overlay on Primary background
- Non-distracting, professional aesthetic

No large hero images required - focus on data and functionality over decorative visuals.