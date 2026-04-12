# User Flows: MPG Ops

## Overview

This document defines the primary user journeys through MPG Ops.

---

## Flow 1: First-Time Setup

**Actor:** New Business Owner  
**Goal:** Complete onboarding and create first booking

```
[Landing Page]
    ↓
[Sign Up] → Enter email, password
    ↓
[Business Setup]
    ├── Business Name
    ├── Business Type (salon/barbershop/spa)
    ├── Contact Info
    └── Operating Hours
    ↓
[Add First Service]
    ├── Service Name
    ├── Price
    └── Duration
    ↓
[Dashboard] ← Setup Complete!
```

**Time Target:** < 5 minutes to dashboard

---

## Flow 2: Daily Operations

**Actor:** Business Owner  
**Goal:** Manage day's appointments and revenue

```
[Login]
    ↓
[Dashboard]
    ├── View: Today's bookings count
    ├── View: Today's expected revenue
    ├── Quick: Add new booking
    └── Quick: View today's schedule
    ↓
[Select Action]
    ├── New Booking → Flow 3
    ├── View Schedule → Flow 4
    └── Record Payment → Flow 5
```

---

## Flow 3: Creating a Booking

**Actor:** Business Owner  
**Goal:** Schedule a customer appointment

```
[Initiate Booking]
    ↓
[Select/Create Customer]
    ├── Search existing customers
    └── OR Add new customer
    ↓
[Select Service]
    ├── Choose from service list
    └── View price & duration
    ↓
[Select Date & Time]
    ├── Date picker
    └── Time slot selection
    ↓
[Confirm Booking]
    ├── Review details
    └── Save
    ↓
[Booking Created] → Return to dashboard/schedule
```

---

## Flow 4: Viewing Schedule

**Actor:** Business Owner  
**Goal:** See and manage appointments

```
[Schedule View]
    ├── Date selector (Today default)
    ├── List of bookings
    │   ├── Time
    │   ├── Customer name
    │   ├── Service
    │   └── Status
    └── Actions per booking
        ├── View details
        ├── Edit
        ├── Mark complete
        └── Cancel
```

**Views:**
- Day view (default)
- Week view (optional)

---

## Flow 5: Recording Payment

**Actor:** Business Owner  
**Goal:** Mark service as paid

```
[From Booking or Dashboard]
    ↓
[Select Booking to Pay]
    ↓
[Payment Screen]
    ├── Amount (auto-filled from service)
    ├── Payment Method
    │   ├── Cash
    │   ├── Card
    │   └── Mobile Money
    └── Notes (optional)
    ↓
[Record Payment]
    ↓
[Payment Confirmed]
    ├── Update booking status
    └── Add to revenue tracking
```

---

## Flow 6: Customer Management

**Actor:** Business Owner  
**Goal:** View and manage customer information

```
[Customers List]
    ├── Search bar
    ├── Filter/Sort options
    └── Customer cards
        ├── Name
        ├── Phone
        └── Last visit
    ↓
[Select Customer]
    ↓
[Customer Detail]
    ├── Contact Info
    ├── Notes
    ├── Service History
    │   ├── Date
    │   ├── Service
    │   ├── Amount paid
    │   └── Status
    └── Actions
        ├── Edit info
        ├── New booking
        └── Call/Contact
```

---

## Flow 7: Managing Services

**Actor:** Business Owner  
**Goal:** Update service offerings

```
[Services List]
    ├── All services
    ├── Active/Inactive toggle
    └── Prices & durations
    ↓
[Actions]
    ├── Add new service
    ├── Edit existing
    └── Deactivate (don't delete, hide)
```

---

## Mobile-First Considerations

All flows optimized for mobile:

- **Touch targets:** Minimum 44x44px
- **Forms:** Single column, large inputs
- **Navigation:** Bottom tab bar
- **Actions:** Floating action button for primary actions
- **Lists:** Card-based, swipeable actions

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No internet | Queue actions, sync when online |
| Time slot taken | Show conflict, suggest alternatives |
| Customer not found | Offer to create new inline |
| Payment exceeds amount | Validation error |
| Session expired | Redirect to login, preserve state |

---

## Access Patterns

**Frequency:**
- **Daily:** Dashboard, Bookings, Payments
- **Weekly:** Schedule review, Customer lookup
- **Monthly:** Service updates, Business settings

**Primary Entry Points:**
1. Dashboard (60% of sessions)
2. Direct to Bookings (25%)
3. Direct to Customers (15%)

---

*Document Version: 1.0*  
*Last Updated: 2026-04-13*
