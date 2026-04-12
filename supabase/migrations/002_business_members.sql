-- ============================================
-- BUSINESS MEMBERS TABLE
-- Junction table for users and businesses
-- Supports future multi-user/multi-business features
-- ============================================

CREATE TABLE business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- Indexes
CREATE INDEX idx_business_members_business ON business_members(business_id);
CREATE INDEX idx_business_members_user ON business_members(user_id);

-- Enable RLS
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own memberships"
ON business_members
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Business owners can manage members"
ON business_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM businesses
    WHERE businesses.id = business_members.business_id
    AND businesses.owner_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_business_members_updated_at 
  BEFORE UPDATE ON business_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
