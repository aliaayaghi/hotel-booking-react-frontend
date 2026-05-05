# AGENTS.md — Hotel Booking Frontend Codex Instructions

## Project goal

Build a clean, modern, user-friendly React frontend for a Spring Boot Hotel Booking System backend.

The backend ZIP is the source of truth. Do not invent API endpoints, request fields, response fields, or roles that are not found in the backend. If something is unclear, mark it as `needs backend verification`.

## Backend summary

Backend type:

- Java Spring Boot monolith
- REST API
- Spring Security
- JWT authentication
- Spring Data JPA
- MySQL
- Bean Validation
- Swagger/OpenAPI

Backend local URL:

```txt
http://localhost:8080
```

## Supported roles

Use these backend roles exactly:

```txt
ADMIN
HOTEL_MANAGER
CUSTOMER
```

Frontend route access should be based on these roles.

## Auth rules

The backend uses JWT.

Login/register return a token. Frontend should send protected requests with:

```txt
Authorization: Bearer <token>
```

Public endpoints include:

```txt
POST /api/auth/register
POST /api/auth/login
GET /api/hotels
GET /api/hotels/**
```

Protected frontend areas:

```txt
/customer  -> CUSTOMER only
/manager   -> HOTEL_MANAGER only
/admin     -> ADMIN only
/profile   -> any authenticated user
```

Logout should remove the local token. The backend also has:

```txt
POST /api/auth/logout
```

## Main backend modules

The backend includes these modules/features:

- Auth / Users
- Admin
- Hotels
- Hotel locations
- Hotel photos
- Hotel amenities
- Hotel accessibility
- Hotel nearby places
- Hotel policies
- Rooms / room types
- Room photos
- Room amenities
- Room accessibility
- Room availability
- Cancellation policies
- Pricing rules
- Search
- Bookings
- Payments
- Reviews
- Saved hotels
- Notifications

## Important frontend rule

Do not create fake endpoints.

If an endpoint is missing, write one of these:

```txt
Missing from backend
Needs backend verification
Frontend-only feature
```

## Recommended frontend stack

Use:

- Vite + React
- React Router
- TanStack React Query
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Sonner or React Hot Toast
- Lucide React icons

Use JavaScript unless the project has already been started with TypeScript.

## Chosen design direction

Use the calm luxury hotel style.

Color palette:

```txt
Primary: #1F2937 deep charcoal
Secondary: #C9A227 muted gold
Background: #F8F6F1 warm off-white
Card: #FFFFFF
Text: #111827
Accent: #8B7355
Buttons: charcoal background with gold hover
```

Design feeling:

- Premium
- Calm
- Clean
- Professional
- Hotel-like
- Not too complicated

Avoid:

- Bright blue/purple SaaS style
- Overly playful colors
- Crowded layouts
- Fake data that looks like real backend data unless clearly marked as placeholder

## UI rules

Use:

- Large clean hero sections
- Soft shadows
- Rounded cards
- Good spacing
- Clear page headings
- Simple forms
- Responsive mobile-first layout
- Loading states
- Error states
- Empty states
- Toast success/error messages
- Confirmation modals for destructive actions
- Status badges for booking/hotel/payment status

## Main public pages

Create only when the relevant task asks for them:

```txt
/
/about
/hotels
/search
/hotels/:hotelId
/hotels/:hotelId/rooms/:roomId
/login
/register
```

## Main customer pages

```txt
/customer
/booking/:hotelId/:roomId
/booking/:bookingId/payment
/booking/:bookingId/confirmation
/customer/bookings
/customer/bookings/:bookingId
/customer/saved
/customer/reviews
/customer/notifications
/profile
```

## Main hotel manager pages

```txt
/manager
/manager/hotels
/manager/hotels/new
/manager/hotels/:hotelId/edit
/manager/hotels/:hotelId/photos
/manager/hotels/:hotelId/amenities
/manager/hotels/:hotelId/policies
/manager/hotels/:hotelId/rooms
/manager/hotels/:hotelId/rooms/:roomId/edit
/manager/rooms/:roomId/availability
/manager/rooms/:roomId/pricing
/manager/hotels/:hotelId/bookings
/manager/reviews
```

## Main admin pages

```txt
/admin
/admin/hotels
/admin/users
/admin/bookings
/admin/reviews
```

## Coding rules for Codex

When completing a task:

1. Only edit files mentioned in the prompt, unless a tiny supporting change is required.
2. Do not rewrite the whole app.
3. Do not build future tasks early.
4. Do not add fake endpoints.
5. Use reusable components when reasonable.
6. Use React Query for server data.
7. Use React Hook Form + Zod for forms when validation is needed.
8. Use Axios through the shared API client.
9. Use the calm luxury palette.
10. Add loading, error, and empty states for data pages.
11. Explain how to run and test the result at the end.

## Response format Codex should use

After each task, explain:

```txt
What changed
Files created/edited
How to run
How to test
Any backend verification needed
```
