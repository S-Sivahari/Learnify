-- Workspace Notes Table (Google Keep-style)
-- Migration for storing workspace notes with colors, pinning, and archiving

CREATE TABLE IF NOT EXISTS workspace_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  color VARCHAR(20) DEFAULT 'yellow' CHECK (color IN ('yellow', 'blue', 'green', 'pink', 'purple', 'white')),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to workspaces table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces') THEN
    ALTER TABLE workspace_notes 
      ADD CONSTRAINT fk_workspace 
      FOREIGN KEY (workspace_id) 
      REFERENCES workspaces(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_workspace_notes_workspace_id ON workspace_notes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_notes_user_id ON workspace_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_notes_is_pinned ON workspace_notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_workspace_notes_is_archived ON workspace_notes(is_archived);

-- Enable Row Level Security
ALTER TABLE workspace_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own notes
CREATE POLICY "Users can view own notes" ON workspace_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes" ON workspace_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON workspace_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON workspace_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_workspace_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_workspace_notes_updated_at
  BEFORE UPDATE ON workspace_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_workspace_notes_updated_at();

-- Add selected_tools column to workspaces table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workspaces' AND column_name = 'selected_tools') THEN
      ALTER TABLE workspaces ADD COLUMN selected_tools TEXT[] DEFAULT ARRAY['code-editor', 'notes'];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workspaces' AND column_name = 'theme_color') THEN
      ALTER TABLE workspaces ADD COLUMN theme_color VARCHAR(20) DEFAULT 'gold';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workspaces' AND column_name = 'layout_preference') THEN
      ALTER TABLE workspaces ADD COLUMN layout_preference VARCHAR(20) DEFAULT 'single';
    END IF;
  END IF;
END $$;
