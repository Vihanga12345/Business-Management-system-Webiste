import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/types';

const Collections = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [availability, setAvailability] = useState<string>('all');

  // Load products and categories from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading products and categories...');
        
        const [productsList, categoriesList] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        
        setProducts(productsList);
        setCategories(['all', ...categoriesList]);
        
        // Set category from URL parameter if provided
        const categoryParam = searchParams.get('category');
        if (categoryParam && categoriesList.includes(categoryParam)) {
          setSelectedCategory(categoryParam);
        }
        
        console.log('Loaded products:', productsList.length);
        console.log('Loaded categories:', categoriesList);
      } catch (error) {
        console.error('Error loading collections data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const ranges = {
        'under-25': [0, 25],
        '25-50': [25, 50],
        '50-100': [50, 100],
        '100-200': [100, 200],
        'over-200': [200, Infinity],
      };
      const [min, max] = ranges[priceRange as keyof typeof ranges] || [0, Infinity];
      filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }

    // Filter by availability
    if (availability !== 'all') {
      if (availability === 'in-stock') {
        filtered = filtered.filter(p => p.inStock && p.stock > 0);
      } else if (availability === 'out-of-stock') {
        filtered = filtered.filter(p => !p.inStock || p.stock === 0);
      }
    }

    // Sort products
    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [products, selectedCategory, priceRange, sortBy, availability]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center text-white text-xl">
            Loading products from ERP system...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-12">Our Collections</h1>
        <p className="text-cyan-500 mb-8">Live inventory from our ERP system</p>

        {/* Filters */}
        <div className="bg-gray-800 p-8 rounded-lg mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Category Filter */}
            <div>
              <label className="block text-white text-base font-medium mb-3">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-12">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-gray-600">
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-white text-base font-medium mb-3">Price Range</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-12">
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">All Prices</SelectItem>
                  <SelectItem value="under-25" className="text-white hover:bg-gray-600">Under $25</SelectItem>
                  <SelectItem value="25-50" className="text-white hover:bg-gray-600">$25 - $50</SelectItem>
                  <SelectItem value="50-100" className="text-white hover:bg-gray-600">$50 - $100</SelectItem>
                  <SelectItem value="100-200" className="text-white hover:bg-gray-600">$100 - $200</SelectItem>
                  <SelectItem value="over-200" className="text-white hover:bg-gray-600">Over $200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-white text-base font-medium mb-3">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="latest" className="text-white hover:bg-gray-600">Latest</SelectItem>
                  <SelectItem value="name" className="text-white hover:bg-gray-600">Name A-Z</SelectItem>
                  <SelectItem value="price-low" className="text-white hover:bg-gray-600">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="text-white hover:bg-gray-600">Price: High to Low</SelectItem>
                  <SelectItem value="rating" className="text-white hover:bg-gray-600">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-white text-base font-medium mb-3">Availability</label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-12">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">All Products</SelectItem>
                  <SelectItem value="in-stock" className="text-white hover:bg-gray-600">In Stock</SelectItem>
                  <SelectItem value="out-of-stock" className="text-white hover:bg-gray-600">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-8">
          <p className="text-gray-400 text-lg">
            Showing {filteredAndSortedProducts.length} of {products.length} products
            {products.length > 0 && (
              <span className="text-green-500 ml-2">• Live from ERP</span>
            )}
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">No products available in the inventory.</p>
            <p className="text-gray-500">Please check back later or contact us for more information.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {filteredAndSortedProducts.length === 0 && products.length > 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">No products found matching your criteria.</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters to see more products.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
