# Product Scope: MPG Ops MVP

## MVP Definition

This document defines exactly what is IN and OUT of the Minimum Viable Product (MVP).

---

## IN SCOPE (MVP Features)

### 1. Authentication
- Email/password registration and login
- Password reset
- Session management
- Protected routes

### 2. Business Setup
- Business profile creation (name, type, contact info)
- Business type selection (salon/barbershop/spa)
- Operating hours configuration
- Basic settings

### 3. Services Management
- Create services (name, price, duration)
- Edit/delete services
- Service categories (optional, simple)
- Active/inactive status

### 4. Customer Management
- Add customers (name, phone, email, notes)
- Customer list with search
- Customer detail view
- Edit customer information
- Service history per customer

### 5. Bookings/Appointments
- Create new booking
- Calendar/day view of appointments
- Booking status (scheduled, completed, cancelled, no-show)
- Assign customer and service to booking
- Time slot selection
- Edit/cancel bookings

### 6. Payments
- Record payment for completed booking
- Payment method tracking (cash, card, mobile money)
- Payment status (pending, paid, partial)
- Simple payment history

### 7. Dashboard
- Daily summary view
- Today's appointments count
- Today's revenue
- Quick action buttons
- Recent activity

---

## OUT OF SCOPE (Post-MVP)

### Excluded Features

| Feature | Reason | Future Priority |
|---------|--------|-----------------|
| Payroll | Complexity, not core problem | Medium |
| Inventory/Stock | Scope creep, different domain | Low |
| Loyalty Program | Nice-to-have, not MVP | Medium |
| Marketing Tools | External to core operations | Low |
| Multi-Branch | Architectural complexity | High |
| Advanced Analytics | Basic reporting sufficient for MVP | Medium |
| Staff Management | Single-owner focus for MVP | Medium |
| Online Customer Booking | External-facing, security concerns | High |
| Receipts/Invoices | Can be added later | Medium |
| Expense Tracking | Revenue focus for MVP | Low |

---

## Feature Priorities (MVP Only)

### P0 - Critical (Launch Blockers)
1. Authentication
2. Business setup
3. Services CRUD
4. Customers CRUD
5. Bookings CRUD
6. Basic payments
7. Dashboard

### P1 - Important (Launch Enablers)
- Customer search
- Booking calendar view
- Payment history
- Service history on customer profile

### P2 - Nice to Have (If Time Permits)
- Booking reminders (in-app)
- Simple reports (weekly summary)
- Data export

---

## Definition of MVP Complete

The MVP is complete when:

- [ ] Business owner can register and set up their business (5 min)
- [ ] Can add services with pricing
- [ ] Can add customers
- [ ] Can create and manage bookings
- [ ] Can record payments
- [ ] Can see daily dashboard summary
- [ ] All functions work on mobile
- [ ] No critical bugs

---

## Business Type Specifics

All business types use the **same features**, but with different defaults/terminology:

| Aspect | Salon | Barbershop | Spa |
|--------|-------|------------|-----|
| Default services | Haircut, Coloring, Styling | Cut, Shave, Beard Trim | Massage, Facial, Body Treatment |
| Service naming | "Stylist" | "Barber" | "Therapist" |
| Booking intervals | 15-30 min | 15-30 min | 30-90 min |

**Implementation:** Single codebase with business_type flag, no separate apps.

---

*Document Version: 1.0*  
*Last Updated: 2026-04-13*
