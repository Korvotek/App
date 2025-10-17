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
      activity_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type_enum"]
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          success: boolean | null
          tenant_id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type_enum"]
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          success?: boolean | null
          tenant_id: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type_enum"]
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          success?: boolean | null
          tenant_id?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conta_azul_customers: {
        Row: {
          active: boolean | null
          city: string | null
          country: string | null
          created_at: string
          document: string | null
          email: string | null
          external_id: string
          id: string
          name: string | null
          person_type: string | null
          phone: string | null
          postal_code: string | null
          raw_payload: Json | null
          state: string | null
          synced_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          external_id: string
          id?: string
          name?: string | null
          person_type?: string | null
          phone?: string | null
          postal_code?: string | null
          raw_payload?: Json | null
          state?: string | null
          synced_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          external_id?: string
          id?: string
          name?: string | null
          person_type?: string | null
          phone?: string | null
          postal_code?: string | null
          raw_payload?: Json | null
          state?: string | null
          synced_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conta_azul_customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conta_azul_services: {
        Row: {
          cnae_code: string | null
          code: string | null
          cost: number | null
          created_at: string
          description: string | null
          external_code: string | null
          external_id: string
          id: string
          legacy_id: number | null
          lei_116: string | null
          municipality_code: string | null
          price: number | null
          raw_payload: Json | null
          service_type: string | null
          status: string | null
          synced_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cnae_code?: string | null
          code?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          external_code?: string | null
          external_id: string
          id?: string
          legacy_id?: number | null
          lei_116?: string | null
          municipality_code?: string | null
          price?: number | null
          raw_payload?: Json | null
          service_type?: string | null
          status?: string | null
          synced_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cnae_code?: string | null
          code?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          external_code?: string | null
          external_id?: string
          id?: string
          legacy_id?: number | null
          lei_116?: string | null
          municipality_code?: string | null
          price?: number | null
          raw_payload?: Json | null
          service_type?: string | null
          status?: string | null
          synced_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conta_azul_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_contracts: {
        Row: {
          contract_date: string | null
          contract_number: string
          contract_value: number | null
          created_at: string | null
          event_id: string
          id: string
          is_primary: boolean | null
          notes: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          contract_date?: string | null
          contract_number: string
          contract_value?: number | null
          created_at?: string | null
          event_id: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          contract_date?: string | null
          contract_number?: string
          contract_value?: number | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_contracts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_issues: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string
          id: string
          severity: Database["public"]["Enums"]["issue_severity_enum"] | null
          status: Database["public"]["Enums"]["issue_status_enum"] | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id: string
          id?: string
          severity?: Database["public"]["Enums"]["issue_severity_enum"] | null
          status?: Database["public"]["Enums"]["issue_status_enum"] | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          severity?: Database["public"]["Enums"]["issue_severity_enum"] | null
          status?: Database["public"]["Enums"]["issue_status_enum"] | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_issues_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_issues_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_locations: {
        Row: {
          city: string
          complement: string | null
          created_at: string | null
          event_id: string
          id: string
          is_primary: boolean | null
          location_role: Database["public"]["Enums"]["event_location_role_enum"]
          neighborhood: string | null
          number: string | null
          postal_code: string | null
          reference_point: string | null
          state: string
          street: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          is_primary?: boolean | null
          location_role: Database["public"]["Enums"]["event_location_role_enum"]
          neighborhood?: string | null
          number?: string | null
          postal_code?: string | null
          reference_point?: string | null
          state: string
          street?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_primary?: boolean | null
          location_role?: Database["public"]["Enums"]["event_location_role_enum"]
          neighborhood?: string | null
          number?: string | null
          postal_code?: string | null
          reference_point?: string | null
          state?: string
          street?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_locations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_notes: {
        Row: {
          category: Database["public"]["Enums"]["event_note_category_enum"]
          created_at: string | null
          event_id: string
          id: string
          tenant_id: string
          text: string
        }
        Insert: {
          category: Database["public"]["Enums"]["event_note_category_enum"]
          created_at?: string | null
          event_id: string
          id?: string
          tenant_id: string
          text: string
        }
        Update: {
          category?: Database["public"]["Enums"]["event_note_category_enum"]
          created_at?: string | null
          event_id?: string
          id?: string
          tenant_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_notes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_operations: {
        Row: {
          created_at: string | null
          driver_id: string | null
          event_id: string
          id: string
          notes: string | null
          operation_type: Database["public"]["Enums"]["event_operation_type_enum"]
          scheduled_end: string | null
          scheduled_start: string
          status: Database["public"]["Enums"]["operation_status_enum"] | null
          tenant_id: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          event_id: string
          id?: string
          notes?: string | null
          operation_type: Database["public"]["Enums"]["event_operation_type_enum"]
          scheduled_end?: string | null
          scheduled_start: string
          status?: Database["public"]["Enums"]["operation_status_enum"] | null
          tenant_id: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          operation_type?: Database["public"]["Enums"]["event_operation_type_enum"]
          scheduled_end?: string | null
          scheduled_start?: string
          status?: Database["public"]["Enums"]["operation_status_enum"] | null
          tenant_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_operations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_operations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_operations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_operations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          contact_type:
            | Database["public"]["Enums"]["event_participant_contact_type_enum"]
            | null
          contact_value: string | null
          created_at: string | null
          event_id: string
          id: string
          is_primary: boolean | null
          notes: string | null
          participant_role: Database["public"]["Enums"]["event_participant_role_enum"]
          party_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          contact_type?:
            | Database["public"]["Enums"]["event_participant_contact_type_enum"]
            | null
          contact_value?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          participant_role: Database["public"]["Enums"]["event_participant_role_enum"]
          party_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          contact_type?:
            | Database["public"]["Enums"]["event_participant_contact_type_enum"]
            | null
          contact_value?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          participant_role?: Database["public"]["Enums"]["event_participant_role_enum"]
          party_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_services: {
        Row: {
          created_at: string
          discount_amount: number | null
          end_date: string | null
          event_id: string
          id: string
          notes: string | null
          product_service_id: string
          quantity: number
          start_date: string | null
          status: string | null
          tenant_id: string
          total_price: number | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          end_date?: string | null
          event_id: string
          id?: string
          notes?: string | null
          product_service_id: string
          quantity?: number
          start_date?: string | null
          status?: string | null
          tenant_id: string
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          end_date?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          product_service_id?: string
          quantity?: number
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_services_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_services_product_service_id_fkey"
            columns: ["product_service_id"]
            isOneToOne: false
            referencedRelation: "products_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          end_datetime: string | null
          event_number: string
          event_type: Database["public"]["Enums"]["event_type_enum"] | null
          event_year: number
          id: string
          start_datetime: string
          status: Database["public"]["Enums"]["event_status_enum"] | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_datetime?: string | null
          event_number: string
          event_type?: Database["public"]["Enums"]["event_type_enum"] | null
          event_year: number
          id?: string
          start_datetime: string
          status?: Database["public"]["Enums"]["event_status_enum"] | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_datetime?: string | null
          event_number?: string
          event_type?: Database["public"]["Enums"]["event_type_enum"] | null
          event_year?: number
          id?: string
          start_datetime?: string
          status?: Database["public"]["Enums"]["event_status_enum"] | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          provider: string
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      molide_operations: {
        Row: {
          created_at: string | null
          equipment_pcd: number | null
          equipment_standard: number | null
          event_id: string
          id: string
          operation_date: string
          operation_type: Database["public"]["Enums"]["molide_operation_enum"]
          status: Database["public"]["Enums"]["molide_status_enum"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_pcd?: number | null
          equipment_standard?: number | null
          event_id: string
          id?: string
          operation_date: string
          operation_type: Database["public"]["Enums"]["molide_operation_enum"]
          status?: Database["public"]["Enums"]["molide_status_enum"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_pcd?: number | null
          equipment_standard?: number | null
          event_id?: string
          id?: string
          operation_date?: string
          operation_type?: Database["public"]["Enums"]["molide_operation_enum"]
          status?: Database["public"]["Enums"]["molide_status_enum"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "molide_operations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "molide_operations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_fulfillment_items: {
        Row: {
          created_at: string | null
          daily_count: number | null
          end_date: string
          id: string
          item_description: string
          notes: string | null
          of_id: string
          product_service_id: string | null
          quantity: number
          start_date: string
          tenant_id: string
          total_price: number | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_count?: number | null
          end_date: string
          id?: string
          item_description: string
          notes?: string | null
          of_id: string
          product_service_id?: string | null
          quantity?: number
          start_date: string
          tenant_id: string
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_count?: number | null
          end_date?: string
          id?: string
          item_description?: string
          notes?: string | null
          of_id?: string
          product_service_id?: string | null
          quantity?: number
          start_date?: string
          tenant_id?: string
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_fulfillment_items_of_id_fkey"
            columns: ["of_id"]
            isOneToOne: false
            referencedRelation: "order_fulfillments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_fulfillment_items_product_service_id_fkey"
            columns: ["product_service_id"]
            isOneToOne: false
            referencedRelation: "products_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_fulfillment_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_fulfillments: {
        Row: {
          cancellation_reason: string | null
          created_at: string | null
          event_id: string
          id: string
          is_cancelled: boolean | null
          of_number: string
          of_status: Database["public"]["Enums"]["of_status_enum"] | null
          received_at: string | null
          tenant_id: string
        }
        Insert: {
          cancellation_reason?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          is_cancelled?: boolean | null
          of_number: string
          of_status?: Database["public"]["Enums"]["of_status_enum"] | null
          received_at?: string | null
          tenant_id: string
        }
        Update: {
          cancellation_reason?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          is_cancelled?: boolean | null
          of_number?: string
          of_status?: Database["public"]["Enums"]["of_status_enum"] | null
          received_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_fulfillments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_fulfillments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          active: boolean | null
          birth_date: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string | null
          customer_code: string | null
          display_name: string
          full_name: string | null
          id: string
          legal_name: string | null
          notes: string | null
          party_type: string
          rg: string | null
          tax_metadata: Json | null
          tenant_id: string
          trade_name: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          birth_date?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          customer_code?: string | null
          display_name: string
          full_name?: string | null
          id?: string
          legal_name?: string | null
          notes?: string | null
          party_type: string
          rg?: string | null
          tax_metadata?: Json | null
          tenant_id: string
          trade_name?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          birth_date?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          customer_code?: string | null
          display_name?: string
          full_name?: string | null
          id?: string
          legal_name?: string | null
          notes?: string | null
          party_type?: string
          rg?: string | null
          tax_metadata?: Json | null
          tenant_id?: string
          trade_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parties_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      party_addresses: {
        Row: {
          address_type: Database["public"]["Enums"]["address_type"]
          city: string | null
          complement: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          neighborhood: string | null
          number: string | null
          party_id: string
          postal_code: string | null
          state: string | null
          street: string | null
          tenant_id: string
        }
        Insert: {
          address_type: Database["public"]["Enums"]["address_type"]
          city?: string | null
          complement?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          neighborhood?: string | null
          number?: string | null
          party_id: string
          postal_code?: string | null
          state?: string | null
          street?: string | null
          tenant_id: string
        }
        Update: {
          address_type?: Database["public"]["Enums"]["address_type"]
          city?: string | null
          complement?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          neighborhood?: string | null
          number?: string | null
          party_id?: string
          postal_code?: string | null
          state?: string | null
          street?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_addresses_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_addresses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      party_contacts: {
        Row: {
          contact_type: Database["public"]["Enums"]["contact_type"]
          contact_value: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          party_id: string
          tenant_id: string
        }
        Insert: {
          contact_type: Database["public"]["Enums"]["contact_type"]
          contact_value: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          party_id: string
          tenant_id: string
        }
        Update: {
          contact_type?: Database["public"]["Enums"]["contact_type"]
          contact_value?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          party_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_contacts_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      party_employees: {
        Row: {
          created_at: string | null
          employee_number: string
          hire_date: string | null
          id: string
          is_driver: boolean | null
          is_helper: boolean | null
          party_id: string
          tenant_id: string
          termination_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_number: string
          hire_date?: string | null
          id?: string
          is_driver?: boolean | null
          is_helper?: boolean | null
          party_id: string
          tenant_id: string
          termination_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_number?: string
          hire_date?: string | null
          id?: string
          is_driver?: boolean | null
          is_helper?: boolean | null
          party_id?: string
          tenant_id?: string
          termination_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "party_employees_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      party_integrations: {
        Row: {
          created_at: string
          external_data: Json | null
          external_id: string
          id: string
          integration_provider: string
          is_active: boolean
          last_synced_at: string
          party_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_data?: Json | null
          external_id: string
          id?: string
          integration_provider: string
          is_active?: boolean
          last_synced_at?: string
          party_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_data?: Json | null
          external_id?: string
          id?: string
          integration_provider?: string
          is_active?: boolean
          last_synced_at?: string
          party_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_integrations_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      party_roles: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          party_id: string
          role_type: Database["public"]["Enums"]["party_role_type"]
          tenant_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          party_id: string
          role_type: Database["public"]["Enums"]["party_role_type"]
          tenant_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          party_id?: string
          role_type?: Database["public"]["Enums"]["party_role_type"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_roles_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products_services: {
        Row: {
          active: boolean
          cnae_code: string | null
          code: string | null
          cost_price: number | null
          created_at: string
          description: string
          external_id: string | null
          external_metadata: Json | null
          id: string
          item_type: Database["public"]["Enums"]["product_service_type_enum"]
          lei_116: string | null
          municipality_code: string | null
          sale_price: number | null
          service_type: Database["public"]["Enums"]["service_type_enum"] | null
          tax_scenarios: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          cnae_code?: string | null
          code?: string | null
          cost_price?: number | null
          created_at?: string
          description: string
          external_id?: string | null
          external_metadata?: Json | null
          id?: string
          item_type?: Database["public"]["Enums"]["product_service_type_enum"]
          lei_116?: string | null
          municipality_code?: string | null
          sale_price?: number | null
          service_type?: Database["public"]["Enums"]["service_type_enum"] | null
          tax_scenarios?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          cnae_code?: string | null
          code?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string
          external_id?: string | null
          external_metadata?: Json | null
          id?: string
          item_type?: Database["public"]["Enums"]["product_service_type_enum"]
          lei_116?: string | null
          municipality_code?: string | null
          sale_price?: number | null
          service_type?: Database["public"]["Enums"]["service_type_enum"] | null
          tax_scenarios?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          active: boolean | null
          business_config: Json | null
          business_domain: Database["public"]["Enums"]["business_domain_enum"]
          cnpj: string | null
          company_name: string
          created_at: string | null
          id: string
          subdomain: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          business_config?: Json | null
          business_domain: Database["public"]["Enums"]["business_domain_enum"]
          cnpj?: string | null
          company_name: string
          created_at?: string | null
          id?: string
          subdomain: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          business_config?: Json | null
          business_domain?: Database["public"]["Enums"]["business_domain_enum"]
          cnpj?: string | null
          company_name?: string
          created_at?: string | null
          id?: string
          subdomain?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          ended_at: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity_at: string | null
          started_at: string | null
          tenant_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity_at?: string | null
          started_at?: string | null
          tenant_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity_at?: string | null
          started_at?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string
          full_name: string | null
          google_id: string | null
          id: string
          last_activity_at: string | null
          last_login_at: string | null
          picture_url: string | null
          role: Database["public"]["Enums"]["user_role_enum"] | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email: string
          full_name?: string | null
          google_id?: string | null
          id: string
          last_activity_at?: string | null
          last_login_at?: string | null
          picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          google_id?: string | null
          id?: string
          last_activity_at?: string | null
          last_login_at?: string | null
          picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          active: boolean | null
          brand: string
          created_at: string | null
          fuel_type: string | null
          id: string
          license_plate: string
          model: string
          module_capacity: number | null
          tenant_id: string
          updated_at: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type_enum"] | null
          year: number
        }
        Insert: {
          active?: boolean | null
          brand: string
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          license_plate: string
          model: string
          module_capacity?: number | null
          tenant_id: string
          updated_at?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type_enum"] | null
          year: number
        }
        Update: {
          active?: boolean | null
          brand?: string
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          license_plate?: string
          model?: string
          module_capacity?: number | null
          tenant_id?: string
          updated_at?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type_enum"] | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      action_type_enum:
        | "LOGIN"
        | "LOGOUT"
        | "CREATE_EVENT"
        | "UPDATE_EVENT"
        | "DELETE_EVENT"
        | "CREATE_CLIENT"
        | "UPDATE_CLIENT"
        | "DELETE_CLIENT"
        | "CREATE_EMPLOYEE"
        | "UPDATE_EMPLOYEE"
        | "DELETE_EMPLOYEE"
        | "CREATE_USER"
        | "UPDATE_USER"
        | "DELETE_USER"
        | "CREATE_MOLIDE_OPERATION"
        | "UPDATE_MOLIDE_OPERATION"
        | "DELETE_MOLIDE_OPERATION"
        | "ASSIGN_DRIVER"
        | "ASSIGN_VEHICLE"
        | "EXPORT_DATA"
        | "IMPORT_DATA"
      address_type:
        | "BILLING"
        | "SHIPPING"
        | "EVENT"
        | "HEADQUARTERS"
        | "BRANCH"
        | "RESIDENTIAL"
        | "COMMERCIAL"
      business_domain_enum:
        | "BATHROOM_RENTAL"
        | "CATERING"
        | "SECURITY"
        | "STAGE_SETUP"
        | "GENERAL_SERVICES"
      contact_type:
        | "EMAIL"
        | "PHONE"
        | "MOBILE"
        | "FAX"
        | "WHATSAPP"
        | "WEBSITE"
        | "LINKEDIN"
        | "INSTAGRAM"
      event_location_role_enum:
        | "VENUE"
        | "CLIENT_ADDRESS"
        | "SUPPLIER_ADDRESS"
        | "WAREHOUSE"
        | "OTHER"
      event_note_category_enum:
        | "GENERAL"
        | "LOGISTICS"
        | "BILLING"
        | "INSTRUCTIONS"
        | "RISK"
        | "OTHER"
      event_operation_type_enum:
        | "MOBILIZATION"
        | "OPERATION"
        | "DEMOBILIZATION"
        | "CLEANING_PRE"
        | "CLEANING_POST"
        | "CLEANING"
        | "OTHER"
      event_participant_contact_type_enum:
        | "EMAIL"
        | "PHONE"
        | "WHATSAPP"
        | "OTHER"
      event_participant_role_enum:
        | "CLIENT_CONTACT"
        | "PRODUCER"
        | "COORDINATOR"
        | "SUPPLIER"
        | "SUPPLIER_CONTACT"
        | "OTHER"
      event_status_enum:
        | "RECEIVED"
        | "VERIFIED"
        | "SCHEDULED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "BILLED"
        | "CANCELLED"
        | "INCOMPLETE"
        | "DRAFT"
        | "CONFIRMED"
        | "ACTIVE"
      event_type_enum: "UNICO" | "INTERMITENTE"
      issue_severity_enum: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
      issue_status_enum: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
      molide_operation_enum: "MOBILIZATION" | "CLEANING" | "DEMOBILIZATION"
      molide_status_enum:
        | "SCHEDULED"
        | "RECEIVED"
        | "VERIFIED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
        | "INCOMPLETE"
        | "TIME_ERROR"
      of_status_enum: "ACTIVE" | "CANCELLED" | "MERGED" | "COMPLETED"
      operation_status_enum:
        | "PENDING"
        | "SCHEDULED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
      party_role_type:
        | "CLIENT"
        | "SUPPLIER"
        | "PARTNER"
        | "COORDINATOR"
        | "PRODUCER"
        | "EMPLOYEE"
        | "CONTACT"
        | "TRANSPORTER"
      product_service_type_enum: "PRODUCT" | "SERVICE"
      service_type_enum: "PROVIDED" | "TAKEN" | "BOTH"
      user_role_enum: "ADMIN" | "OPERATOR" | "VIEWER"
      vehicle_type_enum: "CARGA" | "TANQUE"
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
      action_type_enum: [
        "LOGIN",
        "LOGOUT",
        "CREATE_EVENT",
        "UPDATE_EVENT",
        "DELETE_EVENT",
        "CREATE_CLIENT",
        "UPDATE_CLIENT",
        "DELETE_CLIENT",
        "CREATE_EMPLOYEE",
        "UPDATE_EMPLOYEE",
        "DELETE_EMPLOYEE",
        "CREATE_USER",
        "UPDATE_USER",
        "DELETE_USER",
        "CREATE_MOLIDE_OPERATION",
        "UPDATE_MOLIDE_OPERATION",
        "DELETE_MOLIDE_OPERATION",
        "ASSIGN_DRIVER",
        "ASSIGN_VEHICLE",
        "EXPORT_DATA",
        "IMPORT_DATA",
      ],
      address_type: [
        "BILLING",
        "SHIPPING",
        "EVENT",
        "HEADQUARTERS",
        "BRANCH",
        "RESIDENTIAL",
        "COMMERCIAL",
      ],
      business_domain_enum: [
        "BATHROOM_RENTAL",
        "CATERING",
        "SECURITY",
        "STAGE_SETUP",
        "GENERAL_SERVICES",
      ],
      contact_type: [
        "EMAIL",
        "PHONE",
        "MOBILE",
        "FAX",
        "WHATSAPP",
        "WEBSITE",
        "LINKEDIN",
        "INSTAGRAM",
      ],
      event_location_role_enum: [
        "VENUE",
        "CLIENT_ADDRESS",
        "SUPPLIER_ADDRESS",
        "WAREHOUSE",
        "OTHER",
      ],
      event_note_category_enum: [
        "GENERAL",
        "LOGISTICS",
        "BILLING",
        "INSTRUCTIONS",
        "RISK",
        "OTHER",
      ],
      event_operation_type_enum: [
        "MOBILIZATION",
        "OPERATION",
        "DEMOBILIZATION",
        "CLEANING_PRE",
        "CLEANING_POST",
        "CLEANING",
        "OTHER",
      ],
      event_participant_contact_type_enum: [
        "EMAIL",
        "PHONE",
        "WHATSAPP",
        "OTHER",
      ],
      event_participant_role_enum: [
        "CLIENT_CONTACT",
        "PRODUCER",
        "COORDINATOR",
        "SUPPLIER",
        "SUPPLIER_CONTACT",
        "OTHER",
      ],
      event_status_enum: [
        "RECEIVED",
        "VERIFIED",
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "BILLED",
        "CANCELLED",
        "INCOMPLETE",
        "DRAFT",
        "CONFIRMED",
        "ACTIVE",
      ],
      event_type_enum: ["UNICO", "INTERMITENTE"],
      issue_severity_enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      issue_status_enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      molide_operation_enum: ["MOBILIZATION", "CLEANING", "DEMOBILIZATION"],
      molide_status_enum: [
        "SCHEDULED",
        "RECEIVED",
        "VERIFIED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "INCOMPLETE",
        "TIME_ERROR",
      ],
      of_status_enum: ["ACTIVE", "CANCELLED", "MERGED", "COMPLETED"],
      operation_status_enum: [
        "PENDING",
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      party_role_type: [
        "CLIENT",
        "SUPPLIER",
        "PARTNER",
        "COORDINATOR",
        "PRODUCER",
        "EMPLOYEE",
        "CONTACT",
        "TRANSPORTER",
      ],
      product_service_type_enum: ["PRODUCT", "SERVICE"],
      service_type_enum: ["PROVIDED", "TAKEN", "BOTH"],
      user_role_enum: ["ADMIN", "OPERATOR", "VIEWER"],
      vehicle_type_enum: ["CARGA", "TANQUE"],
    },
  },
} as const
