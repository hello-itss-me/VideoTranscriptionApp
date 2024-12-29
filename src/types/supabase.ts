export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      transcriptions: {
        Row: {
          id: string
          file_name: string
          file_size: number
          duration: number | null
          status: string
          transcription_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_size: number
          duration?: number | null
          status?: string
          transcription_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_size?: number
          duration?: number | null
          status?: string
          transcription_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
