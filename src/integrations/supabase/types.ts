export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          actor_role: string | null
          category: string
          created_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          metadata: Json | null
          severity: string | null
          status: string | null
          target_id: string | null
          target_name: string | null
          target_type: string | null
          timestamp: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          category: string
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          severity?: string | null
          status?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          category?: string
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          severity?: string | null
          status?: string | null
          target_id?: string | null
          target_name?: string | null
          target_type?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      code_scan_history: {
        Row: {
          created_at: string | null
          critical_count: number | null
          file_name: string
          high_count: number | null
          id: string
          issues: Json
          issues_count: number | null
          low_count: number | null
          medium_count: number | null
          scanned_at: string | null
          score: number
          summary: string | null
        }
        Insert: {
          created_at?: string | null
          critical_count?: number | null
          file_name: string
          high_count?: number | null
          id?: string
          issues?: Json
          issues_count?: number | null
          low_count?: number | null
          medium_count?: number | null
          scanned_at?: string | null
          score?: number
          summary?: string | null
        }
        Update: {
          created_at?: string | null
          critical_count?: number | null
          file_name?: string
          high_count?: number | null
          id?: string
          issues?: Json
          issues_count?: number | null
          low_count?: number | null
          medium_count?: number | null
          scanned_at?: string | null
          score?: number
          summary?: string | null
        }
        Relationships: []
      }
      installer_metrics: {
        Row: {
          completed_at: string | null
          created_at: string | null
          database_type: string | null
          distro_family: string | null
          distro_name: string | null
          errors: Json | null
          id: string
          install_mode: string | null
          installer_version: string | null
          session_id: string
          started_at: string
          status: string
          steps: Json | null
          system_info: Json | null
          total_duration_ms: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          database_type?: string | null
          distro_family?: string | null
          distro_name?: string | null
          errors?: Json | null
          id?: string
          install_mode?: string | null
          installer_version?: string | null
          session_id: string
          started_at?: string
          status: string
          steps?: Json | null
          system_info?: Json | null
          total_duration_ms?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          database_type?: string | null
          distro_family?: string | null
          distro_name?: string | null
          errors?: Json | null
          id?: string
          install_mode?: string | null
          installer_version?: string | null
          session_id?: string
          started_at?: string
          status?: string
          steps?: Json | null
          system_info?: Json | null
          total_duration_ms?: number | null
        }
        Relationships: []
      }
      jam_participants: {
        Row: {
          avatar_color: string | null
          id: string
          is_active: boolean | null
          is_host: boolean | null
          joined_at: string | null
          last_seen_at: string | null
          nickname: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          avatar_color?: string | null
          id?: string
          is_active?: boolean | null
          is_host?: boolean | null
          joined_at?: string | null
          last_seen_at?: string | null
          nickname: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          avatar_color?: string | null
          id?: string
          is_active?: boolean | null
          is_host?: boolean | null
          joined_at?: string | null
          last_seen_at?: string | null
          nickname?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jam_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "jam_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_queue: {
        Row: {
          added_by: string | null
          added_by_nickname: string | null
          album_art: string | null
          artist_name: string
          created_at: string | null
          duration_ms: number | null
          id: string
          is_played: boolean | null
          position: number
          session_id: string
          track_id: string
          track_name: string
          votes: number | null
        }
        Insert: {
          added_by?: string | null
          added_by_nickname?: string | null
          album_art?: string | null
          artist_name: string
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          is_played?: boolean | null
          position: number
          session_id: string
          track_id: string
          track_name: string
          votes?: number | null
        }
        Update: {
          added_by?: string | null
          added_by_nickname?: string | null
          album_art?: string | null
          artist_name?: string
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          is_played?: boolean | null
          position?: number
          session_id?: string
          track_id?: string
          track_name?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jam_queue_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "jam_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jam_queue_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "jam_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          participant_id: string
          participant_nickname: string
          session_id: string
          track_id: string | null
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          participant_id: string
          participant_nickname: string
          session_id: string
          track_id?: string | null
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          participant_id?: string
          participant_nickname?: string
          session_id?: string
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jam_reactions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "jam_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jam_reactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "jam_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_sessions: {
        Row: {
          access_code: string | null
          code: string
          created_at: string | null
          current_track: Json | null
          host_id: string | null
          host_nickname: string | null
          id: string
          is_active: boolean | null
          max_participants: number | null
          name: string
          playback_state: Json | null
          playlist_id: string | null
          playlist_name: string | null
          privacy: string | null
          updated_at: string | null
        }
        Insert: {
          access_code?: string | null
          code: string
          created_at?: string | null
          current_track?: Json | null
          host_id?: string | null
          host_nickname?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name: string
          playback_state?: Json | null
          playlist_id?: string | null
          playlist_name?: string | null
          privacy?: string | null
          updated_at?: string | null
        }
        Update: {
          access_code?: string | null
          code?: string
          created_at?: string | null
          current_track?: Json | null
          host_id?: string | null
          host_nickname?: string | null
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          name?: string
          playback_state?: Json | null
          playlist_id?: string | null
          playlist_name?: string | null
          privacy?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kiosk_commands: {
        Row: {
          command: string
          created_at: string | null
          created_by: string | null
          executed_at: string | null
          id: string
          machine_id: string
          params: Json | null
          result: string | null
          status: string | null
        }
        Insert: {
          command: string
          created_at?: string | null
          created_by?: string | null
          executed_at?: string | null
          id?: string
          machine_id: string
          params?: Json | null
          result?: string | null
          status?: string | null
        }
        Update: {
          command?: string
          created_at?: string | null
          created_by?: string | null
          executed_at?: string | null
          id?: string
          machine_id?: string
          params?: Json | null
          result?: string | null
          status?: string | null
        }
        Relationships: []
      }
      kiosk_connections: {
        Row: {
          config: Json | null
          cpu_usage_percent: number | null
          crash_count: number | null
          created_at: string | null
          events: Json | null
          hostname: string
          id: string
          install_id: string | null
          ip_address: string | null
          last_event: string | null
          last_event_at: string | null
          last_heartbeat: string | null
          last_screenshot_url: string | null
          machine_id: string | null
          memory_used_mb: number | null
          metrics: Json | null
          status: string | null
          updated_at: string | null
          uptime_seconds: number | null
        }
        Insert: {
          config?: Json | null
          cpu_usage_percent?: number | null
          crash_count?: number | null
          created_at?: string | null
          events?: Json | null
          hostname: string
          id?: string
          install_id?: string | null
          ip_address?: string | null
          last_event?: string | null
          last_event_at?: string | null
          last_heartbeat?: string | null
          last_screenshot_url?: string | null
          machine_id?: string | null
          memory_used_mb?: number | null
          metrics?: Json | null
          status?: string | null
          updated_at?: string | null
          uptime_seconds?: number | null
        }
        Update: {
          config?: Json | null
          cpu_usage_percent?: number | null
          crash_count?: number | null
          created_at?: string | null
          events?: Json | null
          hostname?: string
          id?: string
          install_id?: string | null
          ip_address?: string | null
          last_event?: string | null
          last_event_at?: string | null
          last_heartbeat?: string | null
          last_screenshot_url?: string | null
          machine_id?: string | null
          memory_used_mb?: number | null
          metrics?: Json | null
          status?: string | null
          updated_at?: string | null
          uptime_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kiosk_connections_install_id_fkey"
            columns: ["install_id"]
            isOneToOne: false
            referencedRelation: "installer_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
          read: boolean | null
          severity: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          read?: boolean | null
          severity?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          read?: boolean | null
          severity?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pending_sync_files: {
        Row: {
          category: string | null
          detected_at: string | null
          error_message: string | null
          file_hash: string | null
          file_path: string
          id: string
          priority: number | null
          status: string | null
          synced_at: string | null
        }
        Insert: {
          category?: string | null
          detected_at?: string | null
          error_message?: string | null
          file_hash?: string | null
          file_path: string
          id?: string
          priority?: number | null
          status?: string | null
          synced_at?: string | null
        }
        Update: {
          category?: string | null
          detected_at?: string | null
          error_message?: string | null
          file_hash?: string | null
          file_path?: string
          id?: string
          priority?: number | null
          status?: string | null
          synced_at?: string | null
        }
        Relationships: []
      }
      playback_stats: {
        Row: {
          album_art: string | null
          album_name: string | null
          artist_name: string
          completed: boolean | null
          created_at: string | null
          duration_ms: number | null
          id: string
          played_at: string | null
          provider: string
          track_id: string
          track_name: string
          user_agent: string | null
        }
        Insert: {
          album_art?: string | null
          album_name?: string | null
          artist_name: string
          completed?: boolean | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          played_at?: string | null
          provider?: string
          track_id: string
          track_name: string
          user_agent?: string | null
        }
        Update: {
          album_art?: string | null
          album_name?: string | null
          artist_name?: string
          completed?: boolean | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          played_at?: string | null
          provider?: string
          track_id?: string
          track_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      sync_history: {
        Row: {
          branch: string | null
          commit_message: string | null
          commit_sha: string
          commit_url: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          files_skipped: number | null
          files_synced: number | null
          id: string
          skipped_files: Json | null
          status: string | null
          sync_source: string | null
          sync_type: string | null
          synced_files: Json | null
        }
        Insert: {
          branch?: string | null
          commit_message?: string | null
          commit_sha: string
          commit_url?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          files_skipped?: number | null
          files_synced?: number | null
          id?: string
          skipped_files?: Json | null
          status?: string | null
          sync_source?: string | null
          sync_type?: string | null
          synced_files?: Json | null
        }
        Update: {
          branch?: string | null
          commit_message?: string | null
          commit_sha?: string
          commit_url?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          files_skipped?: number | null
          files_synced?: number | null
          id?: string
          skipped_files?: Json | null
          status?: string | null
          sync_source?: string | null
          sync_type?: string | null
          synced_files?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_user_has_role: { Args: { _user_id: string }; Returns: undefined }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "newbie"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "newbie"],
    },
  },
} as const
