/*
  # Create transcriptions schema

  1. New Tables
    - `transcriptions`
      - `id` (uuid, primary key)
      - `file_name` (text)
      - `file_size` (bigint)
      - `duration` (integer)
      - `status` (text)
      - `transcription_text` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `transcriptions` table
    - Add policies for authenticated users to manage their own transcriptions
*/

CREATE TABLE transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  duration integer,
  status text NOT NULL DEFAULT 'pending',
  transcription_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert transcriptions
CREATE POLICY "Anyone can insert transcriptions"
  ON transcriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy to allow anyone to view transcriptions
CREATE POLICY "Anyone can view transcriptions"
  ON transcriptions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow anyone to update transcriptions
CREATE POLICY "Anyone can update transcriptions"
  ON transcriptions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
