-- ==============================================================================
-- Adds the fourth accommodation pillar: support & cognitive needs.
-- Mirrors hospital ADA intake practice (support person, extra time,
-- step-by-step explanations) alongside the mobility / sensory /
-- communication columns from the baseline migration.
-- Applied with: bunx supabase db push
-- ==============================================================================

ALTER TABLE public.patients
    ADD COLUMN IF NOT EXISTS accessibility_support TEXT
    DEFAULT 'Support Person Welcome & Extra Time';

-- Backfill the seeded chart (and any rows predating this column)
UPDATE public.patients
SET accessibility_support = 'Support Person Welcome & Extra Time'
WHERE accessibility_support IS NULL;
