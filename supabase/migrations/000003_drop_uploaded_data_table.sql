-- Drop the uploaded_data table
DROP TABLE IF EXISTS uploaded_data;

-- Drop the file_type enum if it's no longer needed
DROP TYPE IF EXISTS file_type;

-- Remove any related functions or triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS delete_storage_object() CASCADE;
