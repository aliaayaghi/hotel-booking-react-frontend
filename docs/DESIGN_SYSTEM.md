# Design System — Calm Luxury Hotel Style

Use this design system for the Hotel Booking React frontend.

## Visual feeling

The UI should feel:

- Calm
- Premium
- Clean
- Simple
- Professional
- Hotel-like
- Easy to use

Avoid:

- Bright blue/purple SaaS style
- Too many colors
- Overly playful UI
- Crowded screens
- Heavy shadows
- Complicated dashboards

## Color palette

```txt
Primary: #1F2937 deep charcoal
Secondary: #C9A227 muted gold
Background: #F8F6F1 warm off-white
Card: #FFFFFF
Text: #111827
Accent: #8B7355
```

## Usage

### Background

Use `#F8F6F1` for the main app background.

### Cards

Use `#FFFFFF` for hotel cards, room cards, booking cards, dashboard cards, and forms.

Cards should have:

- Rounded corners
- Soft shadow
- Good padding
- Clear spacing

### Main text

Use `#111827` for normal readable text.

### Primary UI

Use `#1F2937` for:

- Navbar
- Main buttons
- Dashboard sidebar
- Important headings
- Footer

### Gold accent

Use `#C9A227` for:

- Button hover states
- Stars/rating icons
- Important small highlights
- Active sidebar item
- Premium accent lines
- Selected filters

Do not overuse gold.

### Warm accent

Use `#8B7355` for:

- Secondary text accents
- Subtle labels
- Icons
- Soft decorative details

## Buttons

Primary button:

```txt
Background: #1F2937
Text: white
Hover: #C9A227
Hover text: #111827 or white depending on readability
```

Secondary button:

```txt
Background: transparent or white
Border: #1F2937
Text: #1F2937
Hover background: #F8F6F1
```

Danger button:

Use a normal red danger style only for delete/cancel actions.

## Layout rules

Use:

- Max width containers
- Clean spacing
- Responsive grid
- Mobile-first layout
- Dashboard sidebar on desktop
- Collapsible sidebar on mobile
- Sticky search/booking summary only where useful

## Public homepage layout

Recommended structure:

1. Navbar
2. Hero section with premium hotel image or warm gradient
3. Search box
4. Featured hotels section
5. Why choose us section
6. Popular destinations or benefits
7. Footer

## Hotel listing page

Recommended structure:

1. Page heading
2. Search summary bar
3. Filter sidebar
4. Hotel card grid/list
5. Sort dropdown
6. Pagination
7. Empty state if no hotels

## Hotel details page

Recommended structure:

1. Hotel title, city, star rating
2. Gallery
3. Overview
4. Amenities
5. Rooms
6. Policies
7. Nearby places
8. Reviews
9. Sticky booking/room selection section on desktop

## Dashboard layout

Recommended structure:

1. Dark charcoal sidebar
2. White content cards
3. Gold active navigation indicator
4. Tables with simple actions
5. Status badges
6. Confirmation modals for destructive actions

## Form design

Use:

- Clear labels
- Required field indicators
- Helpful validation messages
- Good spacing
- One main action button
- Toast on success/error

## Status badges

Use badges for:

- Hotel status: PENDING, ACTIVE, REJECTED, SUSPENDED
- Booking status: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW, FAILED
- Payment status: PAID, FAILED, PENDING_REFUND, REFUNDED

## Feedback states

Every data page should have:

- Loading state
- Error state
- Empty state
- Success toast
- Error toast

## Component style checklist

Reusable components should match the calm luxury style:

- Navbar
- Footer
- HotelCard
- RoomCard
- BookingCard
- SearchBar
- FilterSidebar
- DateRangePicker
- GuestSelector
- PriceRangeFilter
- RatingStars
- StatusBadge
- DashboardSidebar
- DataTable
- FormInput
- SelectInput
- Modal
- Toast notification
- ProtectedRoute
