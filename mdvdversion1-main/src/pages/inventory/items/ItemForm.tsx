import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { UnitOfMeasure, InventoryItem } from '@/types';
import { useInventory } from '@/hooks/useInventory';
import { toast } from 'sonner';

const unitOfMeasureOptions: { value: UnitOfMeasure; label: string }[] = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'liters', label: 'Liter' },
  { value: 'meters', label: 'Meter' },
  { value: 'units', label: 'Units' }
];

// IT Hardware categories for consistent categorization
const categoryOptions = [
  { value: 'Laptops', label: '💻 Laptops' },
  { value: 'Desktop PCs', label: '🖥️ Desktop PCs' },
  { value: 'Monitors', label: '📺 Monitors' },
  { value: 'Keyboards', label: '⌨️ Keyboards' },
  { value: 'Mice & Pointing', label: '🖱️ Mice & Pointing' },
  { value: 'Speakers & Audio', label: '🔊 Speakers & Audio' },
  { value: 'Headphones', label: '🎧 Headphones' },
  { value: 'Webcams', label: '📹 Webcams' },
  { value: 'Storage Devices', label: '💾 Storage Devices' },
  { value: 'Memory (RAM)', label: '🧠 Memory (RAM)' },
  { value: 'Graphics Cards', label: '🎮 Graphics Cards' },
  { value: 'Processors', label: '⚡ Processors' },
  { value: 'Motherboards', label: '🔌 Motherboards' },
  { value: 'Power Supplies', label: '🔋 Power Supplies' },
  { value: 'Cases & Cooling', label: '❄️ Cases & Cooling' },
  { value: 'Cables & Adapters', label: '🔗 Cables & Adapters' },
  { value: 'Networking', label: '🌐 Networking' },
  { value: 'Printers', label: '🖨️ Printers' },
  { value: 'Tablets', label: '📱 Tablets' },
  { value: 'Accessories', label: '🔧 Accessories' }
];

const ItemForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { addItem, updateItem, getItemById, isLoading, items } = useInventory();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Accessories',
    unitOfMeasure: 'pieces' as UnitOfMeasure,
    purchaseCost: '0',
    sellingPrice: '0',
    currentStock: '0',
    reorderLevel: '0',
    sku: '',
    isActive: true,
    isWebsiteItem: false,
    imageUrl: '',
    salePrice: '',
    weight: '0',
    specifications: ''
  });

  useEffect(() => {
    if (isEditMode && id && !isLoading) {
      // Wait for items to load before trying to find the item
      const item = getItemById(id);
      if (item) {
        console.log('Loading item for edit:', item);
        setFormData({
          name: item.name,
          description: item.description,
          category: item.category || 'Accessories',
          unitOfMeasure: item.unitOfMeasure,
          purchaseCost: item.purchaseCost.toString(),
          sellingPrice: item.sellingPrice.toString(),
          currentStock: item.currentStock.toString(),
          reorderLevel: item.reorderLevel.toString(),
          sku: item.sku || '',
          isActive: item.isActive,
          isWebsiteItem: item.isWebsiteItem || false,
          imageUrl: item.imageUrl || '',
          salePrice: item.salePrice?.toString() || '',
          weight: item.weight?.toString() || '0',
          specifications: (() => {
            try {
              if (!item.specifications || item.specifications === '{}') return '';
              if (typeof item.specifications === 'string') return item.specifications;
              const parsed = JSON.parse(item.specifications as string);
              return (parsed.features || []).join('\n');
            } catch {
              return '';
            }
          })()
        });
      } else if (items.length > 0) {
        // Items have loaded but item not found
        console.error('Item not found with ID:', id, 'Available items:', items.length);
        toast.error('Item not found');
        navigate('/inventory/items');
      }
      // If items.length === 0, we're still loading, so don't show error yet
    }
  }, [id, isEditMode, getItemById, navigate, isLoading, items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isWebsiteItem: checked }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, unitOfMeasure: value as UnitOfMeasure }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    
    const purchaseCost = parseFloat(formData.purchaseCost);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const currentStock = parseInt(formData.currentStock);
    const reorderLevel = parseInt(formData.reorderLevel);

    if (isNaN(purchaseCost) || purchaseCost < 0) {
      toast.error('Purchase cost must be a positive number');
      return;
    }

    if (isNaN(sellingPrice) || sellingPrice < 0) {
      toast.error('Selling price must be a positive number');
      return;
    }

    if (isNaN(currentStock) || currentStock < 0) {
      toast.error('Current stock must be a positive number');
      return;
    }
    
    try {
      const baseItemData = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          unitOfMeasure: formData.unitOfMeasure,
          purchaseCost,
          sellingPrice,
          currentStock,
          reorderLevel,
          sku: formData.sku || undefined,
        isActive: formData.isActive,
        isWebsiteItem: formData.isWebsiteItem,
        imageUrl: formData.isWebsiteItem ? formData.imageUrl || undefined : undefined,
        salePrice: formData.isWebsiteItem && formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        weight: formData.isWebsiteItem && formData.weight ? parseFloat(formData.weight) : undefined,
        specifications: formData.isWebsiteItem ? formData.specifications || undefined : undefined
      };

      if (isEditMode && id) {
        updateItem(id, baseItemData);
        toast.success('Item updated successfully');
      } else {
        const itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> = {
          ...baseItemData,
          category: baseItemData.category,
          sku: baseItemData.sku || ''
        };
        addItem(itemData);
        toast.success('Item added successfully');
      }
      navigate('/inventory/items');
    } catch (error) {
      console.error('Error saving item:', error);
      
      // Handle specific database errors
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as any;
        if (dbError.code === '23505') {
          if (dbError.details?.includes('sku')) {
            toast.error('SKU already exists. Please use a different SKU or leave it empty.');
          } else if (dbError.details?.includes('name')) {
            toast.error('Item name already exists. Please use a different name.');
          } else {
            toast.error('This item conflicts with existing data. Please check your inputs.');
          }
        } else {
          toast.error(`Database error: ${dbError.message || 'Unknown error'}`);
        }
      } else {
        toast.error(`Error: ${(error as Error).message}`);
      }
    }
  };

  // Show loading state while waiting for items to load in edit mode
  if (isEditMode && isLoading) {
    return (
      <Layout>
        <div className="container mx-auto">
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/inventory/items')} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Loading Item...</h1>
            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">Loading item details...</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto">
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/inventory/items')} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Item' : 'Add Item'}</h1>
          </div>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Item Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter item name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter item description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                  <Select 
                    value={formData.unitOfMeasure} 
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger id="unitOfMeasure">
                      <SelectValue placeholder="Select unit of measure" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOfMeasureOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchaseCost">Purchase Cost</Label>
                    <Input
                      id="purchaseCost"
                      name="purchaseCost"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter purchase cost"
                      value={formData.purchaseCost}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price</Label>
                    <Input
                      id="sellingPrice"
                      name="sellingPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter selling price"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Initial Stock</Label>
                  <Input
                    id="currentStock"
                    name="currentStock"
                    type="number"
                    min="0"
                    placeholder="Enter initial stock quantity"
                    value={formData.currentStock}
                    onChange={handleInputChange}
                    required
                  />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                    <Input
                      id="reorderLevel"
                      name="reorderLevel"
                      type="number"
                      min="0"
                      placeholder="Enter reorder level"
                      value={formData.reorderLevel}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Optional)</Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="Enter SKU"
                    value={formData.sku}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Website Item Section */}
                <div className="border-t pt-4 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isWebsiteItem" 
                        checked={formData.isWebsiteItem}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <Label htmlFor="isWebsiteItem" className="text-lg font-medium">
                        Website Sale Item
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Check this box to make this item available for sale on the website
                    </p>

                    {formData.isWebsiteItem && (
                      <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                        <div className="space-y-2">
                          <Label htmlFor="imageUrl">Product Image URL</Label>
                          <div className="flex gap-2">
                            <Input
                              id="imageUrl"
                              name="imageUrl"
                              type="url"
                              placeholder="Enter image URL or upload image"
                              value={formData.imageUrl}
                              onChange={handleInputChange}
                              className="flex-1"
                            />
                            <Button type="button" variant="outline" size="icon">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Recommended size: 400x400px or higher
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="salePrice">Sale Price (Optional)</Label>
                            <Input
                              id="salePrice"
                              name="salePrice"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Enter sale price"
                              value={formData.salePrice}
                              onChange={handleInputChange}
                            />
                            <p className="text-xs text-muted-foreground">
                              Leave empty if no sale price
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              name="weight"
                              type="number"
                              step="0.001"
                              min="0"
                              placeholder="Enter weight in kg"
                              value={formData.weight}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="specifications">Product Specifications</Label>
                          <Textarea
                            id="specifications"
                            name="specifications"
                            placeholder="Enter product specifications (one per line)"
                            value={formData.specifications}
                            onChange={handleInputChange}
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter each specification on a new line (e.g., "Bluetooth 5.0 connectivity")
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => navigate('/inventory/items')}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Item' : 'Add Item'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ItemForm;
