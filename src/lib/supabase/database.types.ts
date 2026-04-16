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
      bookings: {
        Row: {
          id: string
          business_id: string
          customer_id: string
          service_id: string
          booking_date: string
          start_time: string
          end_time: string
          status: Database['public']['Enums']['booking_status']
          notes: string | null
          created_at: string
          updated_at: string
          source: Database['public']['Enums']['booking_source'] | null
          source_meta: Json | null
        }
        Insert: {
          id?: string
          business_id: string
          customer_id: string
          service_id: string
          booking_date: string
          start_time: string
          end_time: string
          status?: Database['public']['Enums']['booking_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
          source?: Database['public']['Enums']['booking_source'] | null
          source_meta?: Json | null
        }
        Update: {
          id?: string
          business_id?: string
          customer_id?: string
          service_id?: string
          booking_date?: string
          start_time?: string
          end_time?: string
          status?: Database['public']['Enums']['booking_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
          source?: Database['public']['Enums']['booking_source'] | null
          source_meta?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: true
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_service_id_fkey'
            columns: ['service_id']
            isOneToOne: true
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      booking_services: {
        Row: {
          id: string
          booking_id: string
          service_id: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          service_id: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          service_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'booking_services_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: false
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'booking_services_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      business_members: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'business_members_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'business_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          business_type: string
          phone: string | null
          email: string | null
          address: string | null
          operating_hours: Json | null
          created_at: string
          updated_at: string
          public_site_settings: Json | null
          slug: string | null
          plan_tier: string
          trial_started_at: string | null
          trial_ends_at: string | null
          subscription_status: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          business_type: string
          phone?: string | null
          email?: string | null
          address?: string | null
          operating_hours?: Json | null
          created_at?: string
          updated_at?: string
          public_site_settings?: Json | null
          slug?: string | null
          plan_tier?: string
          trial_started_at?: string | null
          trial_ends_at?: string | null
          subscription_status?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          business_type?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          operating_hours?: Json | null
          created_at?: string
          updated_at?: string
          public_site_settings?: Json | null
          slug?: string | null
          plan_tier?: string
          trial_started_at?: string | null
          trial_ends_at?: string | null
          subscription_status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'businesses_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      customers: {
        Row: {
          id: string
          business_id: string
          name: string
          phone: string | null
          email: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'customers_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      payments: {
        Row: {
          id: string
          business_id: string
          booking_id: string
          amount: number
          method: Database['public']['Enums']['payment_method']
          status: Database['public']['Enums']['payment_status']
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          booking_id: string
          amount: number
          method: Database['public']['Enums']['payment_method']
          status?: Database['public']['Enums']['payment_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          booking_id?: string
          amount?: number
          method?: Database['public']['Enums']['payment_method']
          status?: Database['public']['Enums']['payment_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_booking_id_fkey'
            columns: ['booking_id']
            isOneToOne: true
            referencedRelation: 'bookings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
          is_platform_admin: boolean
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          is_platform_admin?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          is_platform_admin?: boolean
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          price: number
          duration_minutes: number
          is_active: boolean
          created_at: string
          updated_at: string
          category: string | null
          show_on_public_booking: boolean
          is_featured: boolean
          promo_badge: string | null
          promo_text: string | null
          public_description: string | null
          display_order: number
          public_title: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          price: number
          duration_minutes?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          category?: string | null
          show_on_public_booking?: boolean
          is_featured?: boolean
          promo_badge?: string | null
          promo_text?: string | null
          public_description?: string | null
          display_order?: number
          public_title?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          category?: string | null
          show_on_public_booking?: boolean
          is_featured?: boolean
          promo_badge?: string | null
          promo_text?: string | null
          public_description?: string | null
          display_order?: number
          public_title?: string | null
          image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'services_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_source: 'public_booking' | 'dashboard' | 'walk_in'
      booking_status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
      payment_method: 'cash' | 'card' | 'mobile_money'
      payment_status: 'pending' | 'paid' | 'partial' | 'refunded'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
