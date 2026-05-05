# Backend-to-Frontend Context

This file summarizes the backend information the React frontend should use.

## Backend base URL

```txt
http://localhost:8080
```

## Roles

```txt
ADMIN
HOTEL_MANAGER
CUSTOMER
```

## Auth endpoints

| Method | Endpoint | Access | Usage |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register page |
| POST | `/api/auth/login` | Public | Login page |
| POST | `/api/auth/logout` | Authenticated | Logout |
| GET | `/api/auth/me` | Authenticated | Restore current user |
| PATCH | `/api/auth/me` | Authenticated | Update profile |
| PATCH | `/api/auth/me/password` | Authenticated | Change password |

### Register fields

```txt
name
email
password
role
phone
nationality
dateOfBirth
```

Do not allow self-registering as `ADMIN`.

### Login fields

```txt
email
password
```

## Public hotel/search endpoints

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/api/hotels` | Basic hotel list/search |
| GET | `/api/hotels/{id}` | Hotel details |
| GET | `/api/hotels/search` | Advanced hotel search |
| GET | `/api/hotels/autocomplete?q=` | Search suggestions |
| GET | `/api/hotels/nearby` | Nearby hotels |

### Basic hotel search params

```txt
keyword
city
countryCode
type
starRating
page
size
sort
```

### Advanced search params

```txt
city
checkIn
checkOut
adults
children
childrenAges
rooms
hotelType
stars
priceMin
priceMax
hotelAmenities
amenityCategories
roomType
bedType
view
freeCancellation
breakfastIncluded
petsAllowed
wheelchairAccessible
sortBy
sortOrder
page
size
```

## Hotel manager hotel endpoints

| Method | Endpoint | Access | Usage |
|---|---|---|---|
| GET | `/api/hotels/my` | HOTEL_MANAGER | Manager hotel list |
| POST | `/api/hotels` | HOTEL_MANAGER | Create hotel |
| PATCH | `/api/hotels/{id}` | HOTEL_MANAGER | Update hotel |
| DELETE | `/api/hotels/{id}` | HOTEL_MANAGER | Delete/suspend own hotel |

### Create/update hotel fields

```txt
name
type
overview
starRating
address
city
countryCode
latitude
longitude
phone
email
website
```

## Hotel subresource endpoints

| Method | Endpoint | Access | Usage |
|---|---|---|---|
| GET | `/api/hotels/{hotelId}/photos` | Public | Hotel gallery |
| POST | `/api/hotels/{hotelId}/photos` | HOTEL_MANAGER | Add photo |
| DELETE | `/api/hotels/{hotelId}/photos/{photoId}` | HOTEL_MANAGER | Delete photo |
| PATCH | `/api/hotels/{hotelId}/photos/reorder` | HOTEL_MANAGER | Reorder photos |
| GET | `/api/hotels/{hotelId}/amenities` | Public | Hotel amenities |
| POST | `/api/hotels/{hotelId}/amenities` | HOTEL_MANAGER | Add amenity |
| DELETE | `/api/hotels/{hotelId}/amenities/{amenityId}` | HOTEL_MANAGER or ADMIN | Delete amenity |
| GET | `/api/hotels/{hotelId}/accessibility` | Public | Accessibility section |
| POST | `/api/hotels/{hotelId}/accessibility` | HOTEL_MANAGER | Add accessibility feature |
| DELETE | `/api/hotels/{hotelId}/accessibility/{featureId}` | HOTEL_MANAGER | Delete accessibility feature |
| GET | `/api/hotels/{hotelId}/nearby` | Public | Nearby places |
| POST | `/api/hotels/{hotelId}/nearby` | HOTEL_MANAGER | Add nearby place |
| DELETE | `/api/hotels/{hotelId}/nearby/{placeId}` | HOTEL_MANAGER or ADMIN | Delete nearby place |

## Hotel policy endpoints

| Method | Endpoint | Access | Usage |
|---|---|---|---|
| GET | `/api/hotels/{hotelId}/policies/checkin` | Public | Hotel details |
| POST | `/api/hotels/{hotelId}/policies/checkin` | HOTEL_MANAGER | Create check-in policy |
| PUT | `/api/hotels/{hotelId}/policies/checkin` | HOTEL_MANAGER | Update check-in policy |
| GET | `/api/hotels/{hotelId}/policies/pets` | Public | Hotel details |
| POST | `/api/hotels/{hotelId}/policies/pets` | HOTEL_MANAGER | Create/update pet policy |
| GET | `/api/hotels/{hotelId}/policies/breakfast` | Public | Hotel details |
| POST | `/api/hotels/{hotelId}/policies/breakfast` | HOTEL_MANAGER | Create/update breakfast policy |

## Room endpoints

| Method | Endpoint | Access | Usage |
|---|---|---|---|
| GET | `/api/hotels/{hotelId}/rooms` | Public | Active rooms on hotel details |
| GET | `/api/hotels/{hotelId}/rooms/all` | Needs verification | Manager room list |
| GET | `/api/hotels/{hotelId}/rooms/{roomId}` | Public | Room details |
| POST | `/api/hotels/{hotelId}/rooms` | Authenticated, needs role verification | Create room |
| PUT | `/api/hotels/{hotelId}/rooms/{roomId}` | Authenticated, needs role verification | Update room |
| DELETE | `/api/hotels/{hotelId}/rooms/{roomId}` | Authenticated, needs role verification | Delete room |

### Room fields

```txt
name
type
bedType
description
maxAdults
maxChildren
quantity
sizeSqm
floor
view
price
```

## Availability and price endpoints

| Method | Endpoint | Usage |
|---|---|---|
| GET | `/api/rooms/{roomId}/availability` | Check room availability |
| GET | `/api/hotels/{hotelId}/rooms/{roomId}/availability` | Check nested room availability |
| GET | `/api/rooms/{roomId}/availability/blocked` | Blocked dates, needs verification |
| POST | `/api/rooms/{roomId}/availability/block` | Manager block dates, needs verification |
| DELETE | `/api/rooms/{roomId}/availability/unblock` | Manager unblock dates, needs verification |
| GET | `/api/rooms/{roomId}/price` | Price preview, needs verification |
| GET | `/api/rooms/{roomId}/pricing-rules/active` | Active pricing rules, needs verification |

Availability params:

```txt
from
to
roomQuantity
```

Price params:

```txt
date
basePrice
```

## Booking endpoints

| Method | Endpoint | Access | Usage |
|---|---|---|---|
| POST | `/api/bookings` | CUSTOMER | Create booking |
| GET | `/api/bookings` | CUSTOMER | My bookings |
| GET | `/api/bookings/{bookingId}` | CUSTOMER | Booking details |
| PATCH | `/api/bookings/{bookingId}/cancel` | CUSTOMER | Cancel booking |
| PATCH | `/api/bookings/{bookingId}/confirm` | ADMIN or HOTEL_MANAGER | Confirm booking |
| PATCH | `/api/bookings/{bookingId}/complete` | ADMIN or HOTEL_MANAGER | Complete booking |
| PATCH | `/api/bookings/{bookingId}/no-show` | ADMIN or HOTEL_MANAGER | Mark no-show |
| GET | `/api/bookings/hotels/{hotelId}` | ADMIN or HOTEL_MANAGER | Hotel bookings |

### Booking fields

```txt
hotelId
roomId
checkInDate
checkOutDate
adults
children
roomCount
cancellationPolicyId
specialRequests
```

## Payment endpoints

| Method | Endpoint | Access | Usage |
|---|---|---|---|
| POST | `/api/bookings/{bookingId}/payment` | CUSTOMER | Mock payment |
| POST | `/api/bookings/{bookingId}/payment/refund` | CUSTOMER | Refund |
| GET | `/api/bookings/{bookingId}/payment` | CUSTOMER | Booking payment |
| GET | `/api/payments/{paymentId}` | Authenticated | Payment details |

### Payment fields

```txt
paymentMethod
simulateFailure
```

## Saved hotels endpoints

Prefer these customer routes:

| Method | Endpoint | Access | Usage |
|---|---|---|---|
| GET | `/api/customers/me/saved` | CUSTOMER | Saved hotels |
| POST | `/api/customers/me/saved/{hotelId}` | CUSTOMER | Save hotel |
| DELETE | `/api/customers/me/saved/{hotelId}` | CUSTOMER | Unsave hotel |
| GET | `/api/customers/me/saved/{hotelId}/status` | CUSTOMER | Check saved status |
| PATCH | `/api/customers/me/saved/{hotelId}/notes` | CUSTOMER | Update saved hotel notes |

There are also `/api/saved-hotels/**` routes, but prefer the customer-specific routes unless the task says otherwise.

## Reviews endpoints

| Method | Endpoint | Access | Usage |
|---|---|---|---|
| GET | `/api/reviews` | Public | Reviews/admin moderation |
| GET | `/api/reviews/hotel/{hotelId}` | Public | Hotel reviews |
| GET | `/api/reviews/hotel/{hotelId}/average-scores` | Public | Rating summary |
| POST | `/api/reviews` | CUSTOMER | Create review |
| GET | `/api/reviews/{id}` | Public | Review details |
| PATCH | `/api/reviews/{id}/reply` | HOTEL_MANAGER or ADMIN | Manager/admin reply |
| PATCH | `/api/reviews/{id}/flag` | Authenticated | Flag review |
| PATCH | `/api/reviews/{id}/hide` | ADMIN | Hide review |
| DELETE | `/api/reviews/{id}` | ADMIN or CUSTOMER | Delete review |

## Admin endpoints

| Method | Endpoint | Access | Usage |
|---|---|---|---|
| GET | `/api/admin/hotels` | ADMIN | Admin hotel management |
| PATCH | `/api/admin/hotels/{id}/approve` | ADMIN | Approve hotel |
| PATCH | `/api/admin/hotels/{id}/reject` | ADMIN | Reject hotel |
| DELETE | `/api/admin/hotels/{id}` | ADMIN | Delete hotel |
| GET | `/api/admin/users` | ADMIN | Admin users |
| PATCH | `/api/admin/users/{id}/suspend` | ADMIN | Suspend user |
| PATCH | `/api/admin/users/{id}/unsuspend` | ADMIN | Unsuspend user |
| GET | `/api/admin/stats` | ADMIN | Admin dashboard stats |

Reject/suspend body:

```txt
reason
```

## Requirement check status

| Requirement | Status |
|---|---|
| Home/About | Frontend-only supported |
| Hotel search by city/date/guests | Supported |
| Filters | Supported |
| Hotel details | Supported |
| Room types | Supported |
| Availability/quote | Partially supported |
| Booking flow | Supported |
| Mock payment | Supported |
| Booking confirmation | Supported |
| My Bookings | Supported |
| Cancel booking | Supported |
| Manager/admin dashboard | Partially supported |
| Hotel CRUD | Supported |
| Room Type CRUD | Supported, needs security verification |
| Upcoming bookings | Partially supported |
| Protected routes | Supported |
| React Query/data caching | Frontend responsibility |
| Form validation | Backend + frontend responsibility |
| Responsive UI | Frontend responsibility |
| Toasts/alerts | Frontend responsibility |
| Loading/error/empty states | Frontend responsibility |
| Login/logout | Supported |
