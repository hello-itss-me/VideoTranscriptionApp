import { supabase } from './supabase';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

interface Segment {
  start: number;
  end: number;
  text: string;
  speaker: string;
}

export async function transcribeAudio(fileUrl: string): Promise<string> {
  // Download file from Supabase Storage
  const { data: fileData, error: downloadError } = await supabase
    .storage
    .from('audio-files')
    .download(fileUrl);

  if (downloadError) {
    throw new Error('Failed to download file from storage');
  }

  // Create form data for OpenAI API
  const formData = new FormData();
  formData.append('file', fileData);
  formData.append('model', 'whisper-1');
  formData.append('language', 'ru');
  formData.append('response_format', 'verbose_json'); // Request verbose JSON output

  // Send request to OpenAI
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to transcribe audio');
  }

  const result = await response.json();

  // Process segments
  const formattedTranscription = result.segments
    .map((segment: Segment) => {
      const startTime = formatTime(segment.start);
      return `[${startTime}] Спикер ${segment.speaker}: ${segment.text.trim()}`;
    })
    .join('\n');

  return formattedTranscription;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}