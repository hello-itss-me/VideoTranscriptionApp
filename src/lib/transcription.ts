import { supabase } from './supabase';
    import { uploadAudioFile } from './storage';
    import { transcribeAudio } from './openai';

    const MAX_CONCURRENT_TRANSCRIPTIONS = 1; // Limit concurrent requests
    const DELAY_BETWEEN_REQUESTS = 2000; // Delay in milliseconds (2 seconds)
    const MAX_RETRIES = 3; // Maximum number of retries
    const INITIAL_BACKOFF = 1000; // Initial backoff in milliseconds

    function delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function transcribeWithRetry(filePath: string, retries = 0): Promise<string> {
      try {
        return await transcribeAudio(filePath);
      } catch (error: any) {
        if (retries < MAX_RETRIES && error.message === 'Failed to transcribe audio') {
          const backoff = INITIAL_BACKOFF * Math.pow(2, retries);
          console.log(`Retrying transcription in ${backoff}ms (attempt ${retries + 1})`);
          await delay(backoff);
          return transcribeWithRetry(filePath, retries + 1);
        }
        throw error;
      }
    }

    export async function handleTranscriptionUpload(files: File[]) {
      const queue = [...files]; // Create a copy of the files array
      
      async function processNext() {
        if (queue.length === 0) {
          return; // All files processed
        }

        const file = queue.shift()!; // Get the next file from the queue

        try {
          // Create transcription record
          const { data: transcription, error: transcriptionError } = await supabase
            .from('transcriptions')
            .insert({
              file_name: file.name,
              file_size: file.size,
              status: 'processing'
            })
            .select()
            .single();

          if (!transcription) {
            console.error('Failed to create transcription record:', transcriptionError);
            return;
          }

          // Upload file to Supabase Storage
          const filePath = await uploadAudioFile(file);

          // Get transcription from Whisper API
          await delay(DELAY_BETWEEN_REQUESTS); // Add a delay before transcription
          const transcriptionText = await transcribeWithRetry(filePath);

          // Update transcription record
          const { error: updateError } = await supabase
            .from('transcriptions')
            .update({
              status: 'completed',
              transcription_text: transcriptionText
            })
            .eq('id', transcription.id);

          if (updateError) {
            console.error('Failed to update transcription record:', updateError);
          }

        } catch (error) {
          console.error('Transcription error:', error);
          // Update transcription record with error status
          await supabase
            .from('transcriptions')
            .update({
              status: 'error',
              transcription_text: 'Failed to process file'
            })
            .eq('id', transcription.id);
        } finally {
          processNext(); // Process the next file in the queue
        }
      }

      // Start processing the queue
      for (let i = 0; i < MAX_CONCURRENT_TRANSCRIPTIONS; i++) {
        processNext();
      }
    }