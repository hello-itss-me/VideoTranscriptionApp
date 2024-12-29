import { supabase } from './supabase';

export async function uploadAudioFile(file: File): Promise<string> {
  console.log('Uploading file to Supabase Storage:', file.name);
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase
    .storage
    .from('audio-files')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Failed to upload file to storage:', uploadError);
    throw new Error('Failed to upload file to storage');
  }

  console.log('File uploaded to Supabase Storage:', filePath);

  return filePath;
}
