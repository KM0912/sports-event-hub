export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          comment: string | null
          created_at: string
          event_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          event_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_with_spots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          event_id: string
          host_user_id: string
          id: string
          participant_user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          host_user_id: string
          id?: string
          participant_user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          host_user_id?: string
          id?: string
          participant_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_with_spots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_user_id_fkey"
            columns: ["participant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string
          application_deadline: string | null
          chat_expires_at: string
          city: string
          created_at: string
          description: string
          end_at: string
          equipment: string | null
          fee: number
          host_user_id: string
          id: string
          level: string
          notes: string | null
          participation_rules: string
          start_at: string
          status: string
          title: string
          updated_at: string
          venue_name: string
          visitor_capacity: number
        }
        Insert: {
          address: string
          application_deadline?: string | null
          chat_expires_at: string
          city: string
          created_at?: string
          description: string
          end_at: string
          equipment?: string | null
          fee: number
          host_user_id: string
          id?: string
          level: string
          notes?: string | null
          participation_rules: string
          start_at: string
          status?: string
          title: string
          updated_at?: string
          venue_name: string
          visitor_capacity: number
        }
        Update: {
          address?: string
          application_deadline?: string | null
          chat_expires_at?: string
          city?: string
          created_at?: string
          description?: string
          end_at?: string
          equipment?: string | null
          fee?: number
          host_user_id?: string
          id?: string
          level?: string
          notes?: string | null
          participation_rules?: string
          start_at?: string
          status?: string
          title?: string
          updated_at?: string
          venue_name?: string
          visitor_capacity?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      host_blocks: {
        Row: {
          blocked_user_id: string
          created_at: string
          host_user_id: string
          id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string
          host_user_id: string
          id?: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string
          host_user_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "host_blocks_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "host_blocks_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_user_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_user_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      events_with_spots: {
        Row: {
          address: string | null
          application_deadline: string | null
          chat_expires_at: string | null
          city: string | null
          created_at: string | null
          description: string | null
          end_at: string | null
          equipment: string | null
          fee: number | null
          host_display_name: string | null
          host_user_id: string | null
          id: string | null
          level: string | null
          notes: string | null
          participation_rules: string | null
          remaining_spots: number | null
          start_at: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          venue_name: string | null
          visitor_capacity: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_host_user_id_fkey"
            columns: ["host_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_apply_to_event: {
        Args: { event_uuid: string; user_uuid: string }
        Returns: boolean
      }
      get_approved_count: { Args: { event_uuid: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<
  TableName extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
> = (PublicSchema["Tables"] & PublicSchema["Views"])[TableName] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName] extends {
  Insert: infer I
}
  ? I
  : never

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName] extends {
  Update: infer U
}
  ? U
  : never
