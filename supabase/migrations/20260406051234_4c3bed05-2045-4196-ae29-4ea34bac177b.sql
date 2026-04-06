-- Clean up duplicate root profiles: keep the most recently updated one per user
DELETE FROM business_profiles
WHERE parent_id IS NULL
  AND id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM business_profiles
    WHERE parent_id IS NULL
    ORDER BY user_id, updated_at DESC, created_at DESC
  );

-- Add partial unique index: one root profile per user
CREATE UNIQUE INDEX idx_unique_root_business_profile_per_user
ON business_profiles (user_id)
WHERE parent_id IS NULL;