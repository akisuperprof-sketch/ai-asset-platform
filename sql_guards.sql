-- 1. Prevent updating SLUG if review_status is 'approved'
CREATE OR REPLACE FUNCTION check_slug_update_on_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.review_status = 'approved' AND OLD.slug IS DISTINCT FROM NEW.slug THEN
    RAISE EXCEPTION 'Cannot modify slug of an approved asset (Additive Only Rule).';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_slug_update ON assets;
CREATE TRIGGER trg_check_slug_update
BEFORE UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION check_slug_update_on_approved();

-- 2. Prevent nullification of seo_title and alt_text (only if it was previously not null)
CREATE OR REPLACE FUNCTION check_seo_nulls()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.seo_title IS NOT NULL AND (NEW.seo_title IS NULL OR trim(NEW.seo_title) = '') THEN
    RAISE EXCEPTION 'seo_title cannot be null or empty once set.';
  END IF;
  IF OLD.alt_text IS NOT NULL AND (NEW.alt_text IS NULL OR trim(NEW.alt_text) = '') THEN
    RAISE EXCEPTION 'alt_text cannot be null or empty once set.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_seo_nulls ON assets;
CREATE TRIGGER trg_check_seo_nulls
BEFORE UPDATE ON assets
FOR EACH ROW
EXECUTE FUNCTION check_seo_nulls();
