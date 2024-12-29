import { useState, useCallback } from 'react';
    import { useDropzone } from 'react-dropzone';
    import { Upload, X } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Progress } from '@/components/ui/progress';
    import { Card } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';

    interface FileUploadProps {
      onUpload: (files: File[]) => Promise<void>;
    }

    export function FileUpload({ onUpload }: FileUploadProps) {
      const [files, setFiles] = useState<File[]>([]);
      const [uploading, setUploading] = useState(false);
      const [progress, setProgress] = useState(0);
      const { toast } = useToast();

      const onDrop = useCallback((acceptedFiles: File[]) => {
        const validFiles = acceptedFiles.filter(file => {
          if (!file.type.startsWith('audio/')) {
            toast({
              title: 'Invalid file type',
              description: `${file.name} is not an audio file`,
              variant: 'destructive',
            });
            return false;
          }
          return true;
        });
        setFiles(prev => [...prev, ...validFiles]);
      }, [toast]);

      const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
          'audio/*': ['.mp3', '.wav', '.m4a']
        }
      });

      const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
      };

      const handleUpload = async () => {
        if (files.length === 0) return;
        
        setUploading(true);
        try {
          await onUpload(files);
          setFiles([]);
          toast({
            title: 'Success',
            description: 'Files uploaded successfully',
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to upload files',
            variant: 'destructive',
          });
        } finally {
          setUploading(false);
          setProgress(0);
        }
      };

      return (
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Drag & drop audio files here, or click to select files
            </p>
          </div>

          {files.length > 0 && (
            <Card className="p-4">
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                {uploading && <Progress value={progress} className="mb-2" />}
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      );
    }
