// Placeholder types — replace with output of:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          slug: string
          name: string
          logo_url: string | null
          email_domain: string | null
          restrict_email_domain: boolean
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'free' | 'starter' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          logo_url?: string | null
          email_domain?: string | null
          restrict_email_domain?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          logo_url?: string | null
          email_domain?: string | null
          restrict_email_domain?: boolean
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          workspace_id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          job_title: string | null
          start_date: string | null
          date_of_birth: string | null
          role: 'user' | 'admin'
          status: 'active' | 'blocked' | 'invited'
          push_token: string | null
          push_notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          workspace_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          job_title?: string | null
          start_date?: string | null
          date_of_birth?: string | null
          role?: 'user' | 'admin'
          status?: 'active' | 'blocked' | 'invited'
          push_token?: string | null
          push_notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          job_title?: string | null
          start_date?: string | null
          date_of_birth?: string | null
          role?: 'user' | 'admin'
          status?: 'active' | 'blocked' | 'invited'
          push_token?: string | null
          push_notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'users_workspace_id_fkey'; columns: ['workspace_id']; referencedRelation: 'workspaces'; referencedColumns: ['id'] }
        ]
      }
      teams: {
        Row: {
          id: string
          workspace_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'teams_workspace_id_fkey'; columns: ['workspace_id']; referencedRelation: 'workspaces'; referencedColumns: ['id'] }
        ]
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          is_manager: boolean
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          is_manager?: boolean
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          is_manager?: boolean
        }
        Relationships: [
          { foreignKeyName: 'team_members_team_id_fkey'; columns: ['team_id']; referencedRelation: 'teams'; referencedColumns: ['id'] },
          { foreignKeyName: 'team_members_user_id_fkey'; columns: ['user_id']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
      absence_types: {
        Row: {
          id: string
          workspace_id: string
          name: string
          color: string
          icon: string | null
          requires_attachment: boolean
          accrual_type: 'none' | 'monthly' | 'yearly'
          accrual_amount: number
          default_days: number
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          color?: string
          icon?: string | null
          requires_attachment?: boolean
          accrual_type?: 'none' | 'monthly' | 'yearly'
          accrual_amount?: number
          default_days?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          color?: string
          icon?: string | null
          requires_attachment?: boolean
          accrual_type?: 'none' | 'monthly' | 'yearly'
          accrual_amount?: number
          default_days?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'absence_types_workspace_id_fkey'; columns: ['workspace_id']; referencedRelation: 'workspaces'; referencedColumns: ['id'] }
        ]
      }
      absence_balances: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          absence_type_id: string
          total_days: number
          used_days: number
          year: number
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          absence_type_id: string
          total_days?: number
          used_days?: number
          year?: number
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          absence_type_id?: string
          total_days?: number
          used_days?: number
          year?: number
        }
        Relationships: [
          { foreignKeyName: 'absence_balances_workspace_id_fkey'; columns: ['workspace_id']; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
          { foreignKeyName: 'absence_balances_user_id_fkey'; columns: ['user_id']; referencedRelation: 'users'; referencedColumns: ['id'] },
          { foreignKeyName: 'absence_balances_absence_type_id_fkey'; columns: ['absence_type_id']; referencedRelation: 'absence_types'; referencedColumns: ['id'] }
        ]
      }
      absence_requests: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          absence_type_id: string
          start_date: string
          end_date: string
          total_days: number
          status: 'pending' | 'approved' | 'rejected' | 'modified' | 'cancelled'
          comment: string | null
          reviewer_id: string | null
          reviewer_comment: string | null
          modified_start_date: string | null
          modified_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          absence_type_id: string
          start_date: string
          end_date: string
          total_days: number
          status?: 'pending' | 'approved' | 'rejected' | 'modified' | 'cancelled'
          comment?: string | null
          reviewer_id?: string | null
          reviewer_comment?: string | null
          modified_start_date?: string | null
          modified_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          absence_type_id?: string
          start_date?: string
          end_date?: string
          total_days?: number
          status?: 'pending' | 'approved' | 'rejected' | 'modified' | 'cancelled'
          comment?: string | null
          reviewer_id?: string | null
          reviewer_comment?: string | null
          modified_start_date?: string | null
          modified_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: 'absence_requests_workspace_id_fkey'; columns: ['workspace_id']; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
          { foreignKeyName: 'absence_requests_user_id_fkey'; columns: ['user_id']; referencedRelation: 'users'; referencedColumns: ['id'] },
          { foreignKeyName: 'absence_requests_absence_type_id_fkey'; columns: ['absence_type_id']; referencedRelation: 'absence_types'; referencedColumns: ['id'] },
          { foreignKeyName: 'absence_requests_reviewer_id_fkey'; columns: ['reviewer_id']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
      absence_request_files: {
        Row: {
          id: string
          request_id: string
          file_url: string
          file_name: string
          file_size: number | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          request_id: string
          file_url: string
          file_name: string
          file_size?: number | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          file_url?: string
          file_name?: string
          file_size?: number | null
          uploaded_at?: string
        }
        Relationships: [
          { foreignKeyName: 'absence_request_files_request_id_fkey'; columns: ['request_id']; referencedRelation: 'absence_requests'; referencedColumns: ['id'] }
        ]
      }
      invites: {
        Row: {
          id: string
          workspace_id: string
          email: string | null
          token: string
          invited_by: string
          status: 'pending' | 'accepted' | 'expired'
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          email?: string | null
          token?: string
          invited_by: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string | null
          token?: string
          invited_by?: string
          status?: 'pending' | 'accepted' | 'expired'
          expires_at?: string | null
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'invites_workspace_id_fkey'; columns: ['workspace_id']; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
          { foreignKeyName: 'invites_invited_by_fkey'; columns: ['invited_by']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
      notifications: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          type: string
          title: string
          body: string | null
          read: boolean
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          type: string
          title: string
          body?: string | null
          read?: boolean
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          read?: boolean
          payload?: Json | null
          created_at?: string
        }
        Relationships: [
          { foreignKeyName: 'notifications_workspace_id_fkey'; columns: ['workspace_id']; referencedRelation: 'workspaces'; referencedColumns: ['id'] },
          { foreignKeyName: 'notifications_user_id_fkey'; columns: ['user_id']; referencedRelation: 'users'; referencedColumns: ['id'] }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      seed_default_absence_types: {
        Args: { p_workspace_id: string }
        Returns: undefined
      }
      increment_used_days: {
        Args: { p_user_id: string; p_type_id: string; p_year: number; p_days: number }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
