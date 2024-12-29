import { useEffect, useState } from 'react';
    import { Download, CheckCircle } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card } from '@/components/ui/card';
    import { supabase } from '@/lib/supabase';
    import type { Database } from '@/types/supabase';
    import { format } from 'date-fns';

    type Transcription = Database['public']['Tables']['transcriptions']['Row'];

    export function TranscriptionList() {
      const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);

      useEffect(() => {
        const fetchTranscriptions = async () => {
          const { data, error } = await supabase
            .from('transcriptions')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) {
            setTranscriptions(data);
          }
        };

        fetchTranscriptions();

        // Subscribe to changes
        const channel = supabase
          .channel('transcriptions_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'transcriptions'
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setTranscriptions(prev => [payload.new as Transcription, ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                setTranscriptions(prev =>
                  prev.map(t =>
                    t.id === payload.new.id ? (payload.new as Transcription) : t
                  )
                );
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }, []);

      const downloadTranscription = (transcription: Transcription) => {
        const blob = new Blob([transcription.transcription_text || ''], {
          type: 'text/plain'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${transcription.file_name}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Transcription Queue</h2>
          {transcriptions.map((transcription) => (
            <Card key={transcription.id} className="p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {transcription.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <h3 className="font-semibold">{transcription.file_name}</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(transcription.created_at), 'dd.MM.yyyy, HH:mm:ss')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {transcription.transcription_text || 'Transcription result text...'}
                </p>
                {transcription.status === 'completed' && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTranscription(transcription)}
                      className="flex items-center gap-2"
                    >
                      Download
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      );
    }
