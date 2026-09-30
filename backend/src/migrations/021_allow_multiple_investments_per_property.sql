-- Migration: Allow multiple investments per investor on same property
-- Description: Drops the unique_investor_property constraint so investors can make incremental/additional investments in the same property
-- Created: 2026-09-30

ALTER TABLE investments DROP CONSTRAINT IF EXISTS unique_investor_property;
