import { supabase } from '@/integrations/supabase/client';
import { Product, InventoryItem } from '@/types';

const BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440000';

// Transform database inventory item to e-commerce product
const transformInventoryItemToProduct = (item: InventoryItem): Product => {
  // Parse specifications safely
  let specs: string[] = [];
  try {
    if (item.specifications) {
      const parsed = JSON.parse(item.specifications);
      specs = parsed.features || [];
    }
  } catch {
    specs = [];
  }

  // Parse dimensions safely
  let dimensions = { length: 0, width: 0, height: 0 };
  try {
    if (item.dimensions) {
      dimensions = JSON.parse(item.dimensions);
    }
  } catch {
    dimensions = { length: 0, width: 0, height: 0 };
  }

  // Parse additional images
  let additionalImages: string[] = [];
  try {
    if (item.additional_images) {
      additionalImages = JSON.parse(item.additional_images);
    }
  } catch {
    additionalImages = [];
  }

  return {
    id: item.id,
    name: item.name,
    price: item.sale_price || item.selling_price,
    originalPrice: item.sale_price ? item.selling_price : undefined,
    salePrice: item.sale_price || undefined,
    image: item.image_url || '/placeholder.svg?height=400&width=400',
    category: item.category || 'Uncategorized',
    description: item.description || '',
    specs,
    specifications: specs,
    inStock: item.current_stock > 0,
    stock: item.current_stock,
    isOnSale: !!item.sale_price,
    isFeatured: item.is_featured || false,
    rating: 4.5, // Default rating - could be added to database later
    weight: item.weight || undefined,
    dimensions: dimensions.length > 0 || dimensions.width > 0 || dimensions.height > 0 ? dimensions : undefined,
    metaDescription: item.meta_description || undefined,
    urlSlug: item.url_slug || undefined,
    sku: item.sku || undefined,
    unitOfMeasure: item.unit_of_measure
  };
};

// Fetch all website products from database
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from database...');
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('business_id', BUSINESS_ID)
      .eq('is_website_item', true)
      .eq('is_active', true)
      .gt('current_stock', 0) // Only show items in stock
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No website products found in database');
      return [];
    }

    console.log(`Found ${data.length} website products in database`);
    const products = data.map(transformInventoryItemToProduct);
    
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

// Fetch featured products
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('business_id', BUSINESS_ID)
      .eq('is_website_item', true)
      .eq('is_active', true)
      .eq('is_featured', true)
      .gt('current_stock', 0)
      .order('name', { ascending: true });

    if (error) throw error;

    return data?.map(transformInventoryItemToProduct) || [];
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
};

// Fetch products by category
export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('business_id', BUSINESS_ID)
      .eq('is_website_item', true)
      .eq('is_active', true)
      .ilike('category', `%${category}%`)
      .gt('current_stock', 0)
      .order('name', { ascending: true });

    if (error) throw error;

    return data?.map(transformInventoryItemToProduct) || [];
  } catch (error) {
    console.error('Failed to fetch products by category:', error);
    return [];
  }
};

// Fetch product by ID
export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .eq('business_id', BUSINESS_ID)
      .eq('is_website_item', true)
      .eq('is_active', true)
      .gt('current_stock', 0)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data ? transformInventoryItemToProduct(data) : null;
  } catch (error) {
    console.error('Failed to fetch product by ID:', error);
    return null;
  }
};

// Search products
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('business_id', BUSINESS_ID)
      .eq('is_website_item', true)
      .eq('is_active', true)
      .gt('current_stock', 0)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (error) throw error;

    return data?.map(transformInventoryItemToProduct) || [];
  } catch (error) {
    console.error('Failed to search products:', error);
    return [];
  }
};

// Get all categories
export const fetchCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('category')
      .eq('business_id', BUSINESS_ID)
      .eq('is_website_item', true)
      .eq('is_active', true)
      .gt('current_stock', 0)
      .not('category', 'is', null);

    if (error) throw error;

    const categories = data?.map(item => item.category).filter(Boolean) || [];
    return [...new Set(categories)];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

// Get products on sale
export const fetchSaleProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('business_id', BUSINESS_ID)
      .eq('is_website_item', true)
      .eq('is_active', true)
      .gt('current_stock', 0)
      .not('sale_price', 'is', null)
      .order('name', { ascending: true });

    if (error) throw error;

    return data?.map(transformInventoryItemToProduct) || [];
  } catch (error) {
    console.error('Failed to fetch sale products:', error);
    return [];
  }
}; 