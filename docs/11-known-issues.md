# Known Issues: MPG Ops

## Purpose

This document tracks bugs, technical debt, workarounds, and limitations.

---

## Issue Format

| Field | Description |
|-------|-------------|
| **ID** | Unique issue identifier (ISS-XXX) |
| **Status** | Open / In Progress / Resolved / Won't Fix |
| **Severity** | Critical / High / Medium / Low |
| **Reported** | Date reported |
| **Description** | What the issue is |
| **Impact** | How it affects users/system |
| **Workaround** | Temporary solution if any |
| **Resolution** | How it was/will be fixed |

---

## Open Issues

None at this time.

---

## Resolved Issues

None at this time.

---

## Technical Debt

None at this time.

---

## Limitations

### MVP-001: Single Business Per Account
**Status:** By Design  
**Description:** Each user account can only have one business.

**Rationale:** Multi-business support is post-MVP. Single business keeps schema simple.

**Future:** Add multi-business support in Phase 2+.

---

### MVP-002: No Offline Support
**Status:** By Design  
**Description:** App requires internet connection.

**Rationale:** Supabase requires connectivity. Offline sync adds complexity.

**Future:** Consider service worker for basic offline functionality post-MVP.

---

### MVP-003: Email-Only Authentication
**Status:** By Design  
**Description:** Only email/password auth supported.

**Rationale:** Social auth adds complexity. Email is universal.

**Future:** Add Google OAuth if requested by users.

---

### MVP-004: No Receipts/Invoices
**Status:** By Design  
**Description:** Payment recording only, no printable receipts.

**Rationale:** Core problem is tracking, not invoicing.

**Future:** Add PDF receipt generation post-MVP.

---

### MVP-005: No Password Reset
**Status:** By Design  
**Description:** No self-service password reset flow.

**Rationale:** Not critical for MVP testing. Supabase makes it easy to add later.

**Future:** Add password reset flow in post-MVP.

---

### MVP-006: Services Page is Client Component
**Status:** By Design  
**Description:** Services page uses 'use client' for Sheet state management.

**Rationale:** Sheet component requires client-side state. Tradeoff for better UX.

**Impact:** Slightly more client-side JavaScript, but better interactivity.

---

### MVP-007: No Booking Conflict Detection
**Status:** By Design  
**Description:** System allows creating overlapping bookings.

**Rationale:** MVP focuses on core booking creation; conflict detection adds complexity.

**Impact:** Users must manually manage scheduling conflicts.

**Future:** Add availability checking and conflict warnings post-MVP.

---

### MVP-008: No Calendar Grid View
**Status:** By Design  
**Description:** Bookings displayed as list, not calendar grid.

**Rationale:** List view faster to implement, clearer on mobile, sufficient for MVP.

**Impact:** No visual overview of multiple days at once.

**Future:** Add week/month calendar view post-MVP.

---

### MVP-009: No Partial Payments
**Status:** By Design  
**Description:** System only supports full payment recording.

**Rationale:** Simplifies payment flow; most service businesses take full payment.

**Impact:** Cannot track deposits or partial payments.

**Future:** Add partial payment and balance tracking post-MVP.

---

### MVP-010: No Payment Editing/Refund
**Status:** By Design  
**Description:** Payments cannot be edited or refunded once recorded.

**Rationale:** Payment correction adds complexity; workaround is to record new payment.

**Impact:** Incorrect payments require manual adjustment or new entry.

**Future:** Add payment editing and refund functionality post-MVP.

---

### MVP-011: Single Currency (PHP)
**Status:** By Design  
**Description:** System uses Philippine Peso (₱) only.

**Rationale:** Initial target market uses PHP; multi-currency adds complexity.

**Impact:** Not suitable for businesses using other currencies.

**Future:** Add multi-currency support with exchange rates post-MVP.

---

## Watch List

Potential issues to monitor:

1. **Supabase Free Tier Limits**
   - Monitor database connections
   - Monitor auth users limit
   - Action: Upgrade if limits approached

2. **Vercel Cold Starts**
   - Monitor Server Action response times
   - Action: Optimize if > 500ms consistently

3. **Mobile Performance**
   - Monitor bundle size
   - Action: Code split if > 200KB initial

4. **Service Card Grid**
   - Currently uses simple grid
   - Monitor if many services (>20) need pagination

---

*Last Updated: 2026-04-13*
