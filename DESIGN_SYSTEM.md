# Opulanz Design System Documentation

## Brand Identity

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 400 (Regular), 600 (Semibold), 700 (Bold)
- **Usage**:
  - Headings: Bold (700), uppercase for brand name
  - Body: Regular (400)
  - UI Elements: Semibold (600)

### Color Palette

#### Primary Colors
```css
--gold: #b59354          /* Primary accent, CTAs, underlines */
--gold-dark: #886844     /* Secondary accent, hover states */
--gold-light: #dac5a4    /* Subtle tints, backgrounds */
--dark: #252623          /* Primary text, dark backgrounds */
--off-white: #f6f8f8     /* Primary page background */
```

#### Neutrals
```css
--gray-light: #c2c9cd   /* Section backgrounds, borders */
--gray-med: #949ea3     /* Secondary text, placeholders */
```

#### Accent Colors
```css
--teal: #629daf         /* Minor accent (limited use) */
--beige: #c0aa9a        /* Subtle backgrounds, cards */
```

### Semantic Token Mapping
```css
--primary: gold (#b59354)
--primary-foreground: white
--secondary: gold-dark (#886844)
--muted: gray-light
--accent: gold
--foreground: dark
--background: off-white
```

## Design Features

### Hero Gradient
```css
background: linear-gradient(135deg, #252623 0%, #3d3428 50%, #886844 100%);
```
- Always dark → gold gradient
- White text overlay
- Large, bold typography (48px-72px)
- Generous padding (96px-160px vertical)

### Gold Underline
- Width: 64px
- Height: 5px
- Color: #b59354
- Position: Below section headings
- Margin-top: 0.75rem

### Section Alternation
- Pattern: Off-White (#f6f8f8) → Light Gray (#c2c9cd) → Beige accent (#c0aa9a)
- Vertical spacing: 80px-120px between sections

### Cards
- Border radius: 1rem (rounded-2xl)
- Border: 1px solid #c2c9cd
- Shadow: Subtle, elevated on hover
- Hover effect: -8px translateY, shadow increase
- Transition: 300ms ease

### Buttons

#### Primary (White on Dark)
- Background: white
- Text: #252623 (dark)
- Hover: #f6f8f8 (off-white)
- Use: Primary CTAs on hero

#### Gold (Gold background)
- Background: #b59354
- Text: white
- Hover: #886844
- Use: Main CTAs throughout site

#### Outline (Gold border)
- Border: 2px solid #b59354
- Text: #b59354
- Background: transparent
- Hover: Fill with gold, text white
- Use: Secondary CTAs

## Layout System

### Grid
- Desktop: 12 columns
- Tablet: 6 columns
- Mobile: 4 columns

### Container
- Max-width: 1280px (2xl)
- Padding: 1.5rem (24px)
- Centered: mx-auto

### Spacing Scale
```
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
3xl: 4rem (64px)
4xl: 5rem (80px)
```

### Breakpoints
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## Component Library

### SectionHeading
```tsx
<SectionHeading
  overline="OPTIONAL OVERLINE"
  title="Main Heading"
  description="Optional description text"
  align="center" | "left"
/>
```
- Includes automatic gold underline
- Center or left alignment
- Optional overline (uppercase, gold, small)

### Hero
```tsx
<Hero
  title="Large Hero Title"
  subtitle="Supporting subtitle"
  primaryCta={{ label: "Get Started", href: "/..." }}
  secondaryCta={{ label: "Learn More", href: "/..." }}
/>
```
- Gradient background
- Animated entrance (Framer Motion)
- Responsive typography
- Optional CTAs

### ServiceCard
```tsx
<ServiceCard
  title="Service Name"
  description="Brief description"
  image="https://..."
  href="/service-page"
  ctaLabel="Learn More"
/>
```
- Image top, content below
- Hover lift effect
- Arrow icon on CTA

### StatusChip
```tsx
<StatusChip status="pending" | "approved" | "declined" | ... />
```
- Color-coded by status
- Rounded full pill
- Small text, semibold

### Timeline
```tsx
<Timeline
  items={[
    { id, title, description, status, date },
    ...
  ]}
/>
```
- Vertical timeline with status icons
- Check mark for completed
- Pulsing circle for in-progress
- Connected with vertical line

### FileDropzone
```tsx
<FileDropzone
  maxSize={15} // MB
  acceptedTypes={['.pdf', '.jpg', ...]}
  multiple={true}
  onFilesChange={(files) => ...}
/>
```
- Drag & drop or click to upload
- File validation (type, size)
- Progress bars
- File list with remove option

### ConsentCheckbox
```tsx
<ConsentCheckbox
  id="consent-id"
  checked={value}
  onCheckedChange={setValue}
  label="I agree to..."
  required={true}
  links={[{ text: "T&Cs", href: "/legal/terms" }]}
/>
```
- Custom styled checkbox
- Inline legal links
- Required indicator
- Validation error display

## Accessibility

### Focus States
- Ring: 2px solid #b59354
- Ring offset: 2px
- Applied to all interactive elements

### Contrast Ratios
- Dark text on off-white: 13.5:1 (AAA)
- Gold on white: 4.6:1 (AA)
- White on gold: 4.6:1 (AA)
- Gold on dark: Pass

### ARIA Attributes
- All form fields have labels
- Error messages use role="alert"
- Status changes announced with aria-live
- Buttons have descriptive aria-labels where needed

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Skip to content link
- Modal focus trap

### Screen Reader
- Semantic HTML (header, nav, main, footer, section)
- Alt text for all images
- Form labels properly associated
- Status updates announced

## Motion & Interaction

### Animation Library
Framer Motion for:
- Hero entrance animations
- Card hover effects
- Page transitions (optional)
- Loading states

### Timing
- Fast: 200ms (hover, focus)
- Medium: 300ms (cards, transitions)
- Slow: 600ms (page entrance)

### Easing
- Default: ease-out
- Hover: ease-in-out

## Icons

### Library
Lucide React

### Common Icons
- Building2: Company/business
- User: Individual/profile
- CreditCard: Banking/payments
- FileText: Documents
- CheckCircle: Success
- AlertCircle: Warning/info
- ArrowRight: CTAs, navigation
- X: Close, dismiss

### Sizing
- Small: 16px (h-4 w-4)
- Default: 20px (h-5 w-5)
- Large: 24px (h-6 w-6)
- XL: 32px (h-8 w-8)

## Forms

### Input Fields
- Height: 48px (h-12)
- Border radius: 12px (rounded-xl)
- Border: 1px solid #c2c9cd
- Focus: 2px ring #b59354
- Padding: 16px horizontal

### Labels
- Font weight: 600 (semibold)
- Size: 14px (text-sm)
- Color: #252623
- Required indicator: red asterisk

### Validation
- Inline errors below field
- Red text (#ef4444)
- 12px font size
- Icon for visual indicator

### File Uploads
- Drag & drop zone
- 15MB max size
- Accepted types clearly listed
- Progress indicators
- File preview/list

## States

### Empty State
- Icon (large, muted)
- Heading
- Description
- CTA to populate

### Loading State
- Skeleton loaders matching content shape
- Pulse animation
- Maintain layout (no CLS)

### Error State
- Alert banner
- Icon (AlertCircle)
- Clear error message
- Action to resolve

### Success State
- CheckCircle icon (green)
- Success message
- Next steps
- CTA to continue

## Responsive Behavior

### Mobile (<768px)
- Single column layouts
- Stacked CTAs
- Hamburger menu
- Larger touch targets (min 44px)
- Reduced text sizes

### Tablet (768px-1024px)
- 2-column grids
- Hybrid navigation (persistent + menu)
- Medium text sizes

### Desktop (>1024px)
- Multi-column grids (3-6 cols)
- Persistent navigation
- Full typography scale
- Hover effects active

## Image Guidelines

### Photography Style
- Professional business contexts
- Clean, modern settings
- Consistent color grading (warm tones)
- High quality, crisp
- Diversity in representation

### Formats
- WebP with JPEG fallback
- Responsive srcsets
- Lazy loading
- next/image optimization

### Dimensions
- Hero: 1920x1080
- Cards: 800x500 (16:10 ratio)
- Icons/logos: SVG preferred

## Performance Targets

### Lighthouse Scores
- Performance: ≥95
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥95

### Core Web Vitals
- LCP: <2.5s
- FID: <100ms
- CLS: <0.1

### Optimizations
- Route-level code splitting
- Image optimization
- Font preloading
- Prefetch critical routes
- Minimize third-party scripts
