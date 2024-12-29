import { useCallback } from 'react';
    import { FileUpload } from '@/components/FileUpload';
    import { TranscriptionList } from '@/components/TranscriptionList';
    import { Toaster } from '@/components/ui/toaster';
    import { handleTranscriptionUpload } from '@/lib/transcription';
    import { Card } from '@/components/ui/card';
    import { Avatar, AvatarFallback } from '@/components/ui/avatar';
    import { UserRound } from 'lucide-react';

    function App() {
      const handleUpload = useCallback(async (files: File[]) => {
        await handleTranscriptionUpload(files);
      }, []);

      return (
        <div className="container mx-auto py-8 px-4 md:pl-96">
          <Card className="mb-8 p-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Audio Transcription</h1>
            <Avatar>
              <AvatarFallback>
                <UserRound />
              </AvatarFallback>
            </Avatar>
          </Card>
          <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
            <div>
              <FileUpload onUpload={handleUpload} />
            </div>
            <div>
              <TranscriptionList />
            </div>
          </div>
          <Toaster />
        </div>
      );
    }

    export default App;
