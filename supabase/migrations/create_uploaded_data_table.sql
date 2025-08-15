-- Create an enum for data types
CREATE TYPE data_type AS ENUM ('csv', 'json', 'png', 'jpg', 'jpeg');

-- Create the uploaded_data table
CREATE TABLE uploaded_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  conversation_id UUID REFERENCES conversations(id) NOT NULL,
  file_name TEXT NOT NULL,
  data_type data_type NOT NULL CHECK (data_type IN ('csv', 'json', 'png', 'jpg', 'jpeg')),
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX idx_uploaded_data_user_id ON uploaded_data(user_id);
CREATE INDEX idx_uploaded_data_conversation_id ON uploaded_data(conversation_id);

-- Add RLS policies
ALTER TABLE uploaded_data ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data"
  ON uploaded_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "Users can insert own data"
  ON uploaded_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own data"
  ON uploaded_data
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own data
CREATE POLICY "Users can delete own data"
  ON uploaded_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_uploaded_data_updated_at
  BEFORE UPDATE ON uploaded_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
