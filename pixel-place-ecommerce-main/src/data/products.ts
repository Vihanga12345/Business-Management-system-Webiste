// E-commerce Product Data - Now fetched from database
// This file exports database-powered functions that replace the static data

import { Product } from '@/types';
import { 
  fetchProducts, 
  fetchFeaturedProducts, 
  fetchProductsByCategory, 
  fetchProductById, 
  searchProducts as searchProductsInDB, 
  fetchCategories,
  fetchSaleProducts
} from '@/lib/productsService';

// Cache for products to avoid unnecessary database calls
let productsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get all products (with caching)
export const getProducts = async (): Promise<Product[]> => {
  const now = Date.now();
  
  if (productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productsCache;
  }
  
  try {
    productsCache = await fetchProducts();
    cacheTimestamp = now;
    return productsCache;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

// Featured products for homepage
export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    return await fetchFeaturedProducts();
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
};

// Products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    return await fetchProductsByCategory(category);
  } catch (error) {
    console.error('Failed to fetch products by category:', error);
    return [];
  }
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    return await fetchProductById(id);
  } catch (error) {
    console.error('Failed to fetch product by ID:', error);
    return null;
  }
};

// Search products
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    return await searchProductsInDB(query);
  } catch (error) {
    console.error('Failed to search products:', error);
    return [];
  }
};

// Get all categories
export const getCategories = async (): Promise<string[]> => {
  try {
    return await fetchCategories();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

// Get products on sale
export const getSaleProducts = async (): Promise<Product[]> => {
  try {
    return await fetchSaleProducts();
  } catch (error) {
    console.error('Failed to fetch sale products:', error);
    return [];
  }
};

// Clear cache (useful when products are updated)
export const clearProductsCache = (): void => {
  productsCache = null;
  cacheTimestamp = 0;
};

// Legacy static data (fallback) - kept for backward compatibility
export const products: Product[] = [];
export const featuredProducts: Product[] = []; 