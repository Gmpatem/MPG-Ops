# Database Schema: MPG Ops

## Overview

PostgreSQL database via Supabase. All tables use Row Level Security (RLS).

---

## Core Tables

### 1. profiles
Extends Supabase auth.users with application data.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. businesses
Main business entity. One business per owner for MVP.

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN ('salon', 'barbershop', 'spa')),
  phone TEXT,
  email TEXT,
  address TEXT,
  operating_hours JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
```

### 3. services
Services offered by the business.

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_services_business ON services(business_id);
CREATE INDEX idx_services_active ON services(business_id, is_active);
```

### 4. customers
Customer records per business.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(business_id, phone);
```

### 5. bookings
Appointment bookings.

```sql
CREATE TYPE booking_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status booking_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_business ON bookings(business_id);
CREATE INDEX idx_bookings_date ON bookings(business_id, booking_date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
```

### 6. payments
Payment records for bookings.

```sql
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mobile_money');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'refunded');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_business ON payments(business_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_date ON payments(business_id, created_at);
```

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌───────────────┐       ┌─────────────┐
│   profiles  │◄──────┤  businesses   │◄──────┤   services  │
│  (auth ext) │   1:1 │               │   1:M │             │
└─────────────┘       └───────┬───────┘       └─────────────┘
                              │
                              │ 1:M
                              ▼
                        ┌─────────────┐       ┌─────────────┐
                        │  customers  │◄──────┤   bookings  │
                        │             │   1:M │             │
                        └─────────────┘       └──────┬──────┘
                                                     │
                                                     │ 1:1
                                                     ▼
                                              ┌─────────────┐
                                              │   payments  │
                                              │             │
                                              └─────────────┘
```

---

## Relationships

| Parent | Child | Type | On Delete |
|--------|-------|------|-----------|
| profiles | businesses | 1:1 | CASCADE |
| businesses | services | 1:M | CASCADE |
| businesses | customers | 1:M | CASCADE |
| businesses | bookings | 1:M | CASCADE |
| businesses | payments | 1:M | CASCADE |
| customers | bookings | 1:M | RESTRICT |
| services | bookings | 1:M | RESTRICT |
| bookings | payments | 1:1 | RESTRICT |

---

## RLS Policies

### businesses
```sql
-- Owners can CRUD their own businesses
CREATE POLICY "Users can manage their own businesses"
ON businesses
FOR ALL
USING (owner_id = auth.uid());
```

### services
```sql
-- Users can manage services for their business
CREATE POLICY "Users can manage their business services"
ON services
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = services.business_id
    AND businesses.owner_id = auth.uid()
  )
);
```

### customers
```sql
-- Users can manage customers for their business
CREATE POLICY "Users can manage their customers"
ON customers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = customers.business_id
    AND businesses.owner_id = auth.uid()
  )
);
```

### bookings
```sql
-- Users can manage bookings for their business
CREATE POLICY "Users can manage their bookings"
ON bookings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = bookings.business_id
    AND businesses.owner_id = auth.uid()
  )
);
```

### payments
```sql
-- Users can manage payments for their business
CREATE POLICY "Users can manage their payments"
ON payments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = payments.business_id
    AND businesses.owner_id = auth.uid()
  )
);
```

---

## Common Queries

### Daily Dashboard Data
```sql
-- Today's bookings count
SELECT COUNT(*) FROM bookings
WHERE business_id = :business_id
AND booking_date = CURRENT_DATE;

-- Today's revenue
SELECT COALESCE(SUM(amount), 0) FROM payments
WHERE business_id = :business_id
AND DATE(created_at) = CURRENT_DATE
AND status = 'paid';
```

### Customer Service History
```sql
SELECT 
  b.booking_date,
  s.name as service_name,
  p.amount,
  p.status as payment_status
FROM bookings b
JOIN services s ON s.id = b.service_id
LEFT JOIN payments p ON p.booking_id = b.id
WHERE b.customer_id = :customer_id
ORDER BY b.booking_date DESC;
```

### Schedule View
```sql
SELECT 
  b.*,
  c.name as customer_name,
  c.phone as customer_phone,
  s.name as service_name,
  s.duration_minutes
FROM bookings b
JOIN customers c ON c.id = b.customer_id
JOIN services s ON s.id = b.service_id
WHERE b.business_id = :business_id
AND b.booking_date = :date
ORDER BY b.start_time;
```

---

## Migrations Strategy

Use Supabase CLI for migrations:
```bash
# Create migration
supabase migration new add_new_feature

# Apply locally
supabase db reset

# Deploy
supabase db push
```

---

*Document Version: 1.0*  
*Last Updated: 2026-04-13*
