export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      inventory_items: {
        Row: {
          business_id: string | null
          category: string | null
          created_at: string
          current_stock: number
          description: string | null
          id: string
          is_active: boolean
          name: string
          purchase_cost: number
          reorder_level: number
          selling_price: number
          sku: string | null
          unit_of_measure: string
          updated_at: string
          // E-commerce fields
          is_website_item: boolean | null
          image_url: string | null
          additional_images: string | null
          specifications: string | null
          weight: number | null
          dimensions: string | null
          url_slug: string | null
          meta_description: string | null
          is_featured: boolean | null
          sale_price: number | null
        }
        Insert: {
          business_id?: string | null
          category?: string | null
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          purchase_cost: number
          reorder_level?: number
          selling_price: number
          sku?: string | null
          unit_of_measure: string
          updated_at?: string
          // E-commerce fields
          is_website_item?: boolean | null
          image_url?: string | null
          additional_images?: string | null
          specifications?: string | null
          weight?: number | null
          dimensions?: string | null
          url_slug?: string | null
          meta_description?: string | null
          is_featured?: boolean | null
          sale_price?: number | null
        }
        Update: {
          business_id?: string | null
          category?: string | null
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          purchase_cost?: number
          reorder_level?: number
          selling_price?: number
          sku?: string | null
          unit_of_measure?: string
          updated_at?: string
          // E-commerce fields
          is_website_item?: boolean | null
          image_url?: string | null
          additional_images?: string | null
          specifications?: string | null
          weight?: number | null
          dimensions?: string | null
          url_slug?: string | null
          meta_description?: string | null
          is_featured?: boolean | null
          sale_price?: number | null
        }
        Relationships: []
      }
      website_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          is_verified: boolean | null
          verification_token: string | null
          reset_token: string | null
          reset_token_expires: string | null
          created_at: string
          updated_at: string
          last_login: string | null
          business_id: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          is_verified?: boolean | null
          verification_token?: string | null
          reset_token?: string | null
          reset_token_expires?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          business_id?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          is_verified?: boolean | null
          verification_token?: string | null
          reset_token?: string | null
          reset_token_expires?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          business_id?: string
        }
        Relationships: []
      }
      website_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          name: string
          telephone: string | null
          address: string | null
          email: string | null
          created_at: string
          updated_at: string
          business_id: string
          source: string | null
          registered_at: string | null
          website_user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          telephone?: string | null
          address?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
          business_id?: string
          source?: string | null
          registered_at?: string | null
          website_user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          telephone?: string | null
          address?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
          business_id?: string
          source?: string | null
          registered_at?: string | null
          website_user_id?: string | null
        }
        Relationships: []
      }
      sales_orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          status: string
          order_date: string
          total_amount: number
          payment_method: string
          notes: string | null
          created_at: string
          updated_at: string
          business_id: string
          order_source: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_postal_code: string | null
          customer_email: string | null
          customer_phone: string | null
          delivery_instructions: string | null
          website_user_id: string | null
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          status: string
          order_date?: string
          total_amount: number
          payment_method: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          business_id?: string
          order_source?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_postal_code?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          delivery_instructions?: string | null
          website_user_id?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          status?: string
          order_date?: string
          total_amount?: number
          payment_method?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          business_id?: string
          order_source?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_postal_code?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          delivery_instructions?: string | null
          website_user_id?: string | null
        }
        Relationships: []
      }
      sales_order_items: {
        Row: {
          id: string
          sales_order_id: string
          product_id: string
          quantity: number
          unit_price: number
          discount: number
          total_price: number
        }
        Insert: {
          id?: string
          sales_order_id: string
          product_id: string
          quantity: number
          unit_price: number
          discount?: number
          total_price: number
        }
        Update: {
          id?: string
          sales_order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          discount?: number
          total_price?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_customer_from_website_user: {
        Args: { p_user_id: string }
        Returns: string
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
 