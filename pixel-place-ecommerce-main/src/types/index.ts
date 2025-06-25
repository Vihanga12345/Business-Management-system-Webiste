// Database types from inventory_items table
export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  selling_price: number;
  current_stock: number;
  is_active: boolean;
  business_id: string | null;
  // E-commerce specific fields
  is_website_item: boolean | null;
  image_url: string | null;
  additional_images: string | null;
  specifications: string | null;
  weight: number | null;
  dimensions: string | null;
  url_slug: string | null;
  meta_description: string | null;
  is_featured: boolean | null;
  sale_price: number | null;
  sku: string | null;
  unit_of_measure: string;
  created_at: string;
  updated_at: string;
}

// E-commerce product interface derived from database
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  image: string;
  category: string;
  description: string;
  specs: string[];
  specifications?: string[];
  inStock: boolean;
  stock: number;
  isOnSale?: boolean;
  isFeatured?: boolean;
  rating?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  metaDescription?: string;
  urlSlug?: string;
  sku?: string;
  unitOfMeasure?: string;
}

// Authentication types
export interface WebsiteUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AuthResponse {
  user: WebsiteUser;
  session_token: string;
  expires_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

// Order types
export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string;
}

export interface ShippingInfo {
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  delivery_instructions?: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  shipping: ShippingInfo;
  payment_method: string;
  notes?: string;
}

export interface WebsiteOrder {
  id: string;
  order_number: string;
  status: string;
  order_date: string;
  total_amount: number;
  payment_method: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  customer_email: string;
  customer_phone: string;
  delivery_instructions?: string;
  items: OrderItem[];
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
  };
  createdAt: Date;
}
