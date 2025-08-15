-- Fix messages table schema to ensure proper JSONB handling
ALTER TABLE messages 
ALTER COLUMN chart_data TYPE JSONB USING chart_data::JSONB,
ALTER COLUMN diagram_data TYPE JSONB USING diagram_data::JSONB,
ALTER COLUMN file_attachment TYPE JSONB USING file_attachment::JSONB;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;

CREATE POLICY "Users can view their own messages" ON messages
FOR SELECT USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own messages" ON messages
FOR INSERT WITH CHECK (
  conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own conversations" ON conversations
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own conversations" ON conversations
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations" ON conversations
FOR UPDATE USING (user_id = auth.uid());
