-- Create table
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL,
    participant_phone TEXT NOT NULL,
    participant_city TEXT NOT NULL,
    participant_state TEXT NOT NULL,
    friend_name TEXT NOT NULL,
    friend_phone TEXT NOT NULL,
    campaign TEXT DEFAULT 'Escale uma Amiga',
    status TEXT DEFAULT 'Novo'
);

-- Indexes
CREATE INDEX idx_participants_created_at ON participants(created_at DESC);
CREATE INDEX idx_participants_email ON participants(participant_email);
CREATE INDEX idx_participants_phone ON participants(participant_phone);

-- RLS
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert
CREATE POLICY "Allow public insert" ON participants FOR INSERT WITH CHECK (true);

-- Policy: Authenticated users can select, update, delete
CREATE POLICY "Allow authenticated select" ON participants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON participants FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete" ON participants FOR DELETE USING (auth.role() = 'authenticated');
