-- Questies Assemble! — Database Cleanup Script
-- Deletes all teams (and their members and slots) EXCEPT the IDs listed below.
-- Cascade deletes handle members and availability_slots automatically.
--
-- Instructions:
--   1. Replace the example IDs below with the team IDs you want to KEEP.
--   2. Run this script in the Supabase SQL Editor.
--   3. Verify the results before committing — this cannot be undone.

DELETE FROM teams
WHERE id NOT IN (
  '5357121355',
  '3791044619'
  -- Add more IDs here, one per line, comma-separated
);
