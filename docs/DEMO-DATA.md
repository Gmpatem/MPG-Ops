# Demo Data Setup Guide

This guide helps you create realistic demo data for testing and showcasing MPG Ops.

---

## Quick Setup (5 minutes)

After registering and creating your business, follow these steps:

### Step 1: Create Services (3-5 services)

Navigate to **Services** → **Add Service**

Create these sample services:

| Service Name | Category | Duration | Price |
|--------------|----------|----------|-------|
| Haircut | Hair | 30 min | ₱300 |
| Hair Coloring | Hair | 90 min | ₱1,500 |
| Beard Trim | Beard | 15 min | ₱150 |
| Hot Towel Shave | Beard | 30 min | ₱400 |
| Full Body Massage | Massage | 60 min | ₱800 |

### Step 2: Create Customers (5-10 customers)

Navigate to **Customers** → **Add Customer**

Sample customers:

| Name | Phone | Email |
|------|-------|-------|
| Juan Dela Cruz | 0917 123 4567 | juan@email.com |
| Maria Santos | 0918 234 5678 | maria@email.com |
| Pedro Reyes | 0919 345 6789 | pedro@email.com |
| Ana Garcia | 0920 456 7890 | ana@email.com |
| Jose Mendoza | 0921 567 8901 | jose@email.com |
| Carmen Lim | 0922 678 9012 | carmen@email.com |
| Roberto Tan | 0923 789 0123 | roberto@email.com |

### Step 3: Create Bookings (3-5 bookings for today)

Navigate to **Bookings** → **Add Booking**

Create bookings for today:

| Time | Customer | Service | Status |
|------|----------|---------|--------|
| 9:00 AM | Juan Dela Cruz | Haircut | Scheduled |
| 10:30 AM | Maria Santos | Hair Coloring | Scheduled |
| 1:00 PM | Pedro Reyes | Beard Trim | Completed |
| 2:30 PM | Ana Garcia | Full Body Massage | Scheduled |
| 4:00 PM | Jose Mendoza | Hot Towel Shave | Cancelled |

### Step 4: Record Payments (2-3 payments)

For completed bookings, click **Record Payment**:

| Booking | Amount | Method |
|---------|--------|--------|
| Pedro Reyes - Beard Trim | ₱150 | Cash |
| (Another completed booking) | (Service price) | GCash |

---

## Demo Flow for Presentation

### Story: "A Day at the Barbershop"

1. **Dashboard Overview**
   - Show today's bookings (4 scheduled, 1 completed)
   - Show today's revenue (₱150 so far)
   - Show total customers (7)

2. **Create a New Booking**
   - Add new customer "Carlos Rivera"
   - Book "Haircut" for 3:00 PM
   - Show auto-calculated end time (3:30 PM)

3. **Complete a Service**
   - Mark "Juan Dela Cruz - Haircut" as completed
   - Record payment of ₱300 via Cash
   - Show dashboard revenue update

4. **Show Search/Filter Features**
   - Search customers by name
   - Filter bookings by status
   - Filter services by active/inactive

5. **Review Analytics**
   - Go to Payments page
   - Show revenue summary (Today/Week/Month)
   - Show payment history

---

## Expected Demo State

After setup, your dashboard should show:

```
Today's Bookings: 5 (1 completed, 4 pending)
Today's Revenue: ₱450 (3 payments recorded)
Total Customers: 7
Services: 5
```

---

## Tips for a Great Demo

1. **Use realistic data** - Local names and prices make it relatable
2. **Mix statuses** - Show scheduled, completed, and cancelled bookings
3. **Record some payments** - Revenue dashboard looks better with data
4. **Test the flow first** - Run through all steps before presenting
5. **Have a backup** - Screenshot key screens in case of connectivity issues

---

## Troubleshooting

**Issue:** Can't create booking
- **Fix:** Ensure you have at least 1 service and 1 customer first

**Issue:** Payment not showing on dashboard
- **Fix:** Make sure the booking is marked as "completed" before recording payment

**Issue:** Data disappears after refresh
- **Fix:** Check that Supabase connection is working and RLS policies are active

---

*Last Updated: 2026-04-13*
