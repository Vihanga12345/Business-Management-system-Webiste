// E-commerce Order Service
// Handles order creation, management, and status tracking

import { orderSyncService, EcommerceOrderData } from './orderSyncService';
import type { CartItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { CreateOrderData, WebsiteOrder, OrderItem } from '@/types';

export interface OrderCustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EcommerceOrder {
  id: string;
  orderNumber: string;
  customerInfo: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
  paymentMethod: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  erpOrderId?: string;
  erpOrderNumber?: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

class OrderService {
  private static instance: OrderService;
  private orders: Map<string, EcommerceOrder> = new Map();

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  constructor() {
    this.loadOrdersFromStorage();
  }

  /**
   * Create a new order from cart items and customer info
   */
  public async createOrder(
    cartItems: CartItem[],
    customerInfo: OrderCustomerInfo,
    paymentMethod: string,
    userId?: string
  ): Promise<EcommerceOrder> {
    const orderId = this.generateOrderId();
    const orderNumber = this.generateOrderNumber();
    const orderDate = new Date().toISOString();

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const totalAmount = subtotal + tax + shipping;

    const order: EcommerceOrder = {
      id: orderId,
      orderNumber,
      customerInfo,
      items: cartItems,
      subtotal,
      tax,
      shipping,
      totalAmount,
      paymentMethod,
      orderDate,
      status: 'pending',
      syncStatus: 'pending'
    };

    // If user is authenticated, create order directly in database
    if (userId) {
      try {
        const orderData: CreateOrderData = {
          items: cartItems.map(item => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
            total_price: item.product.price * item.quantity
          })),
          shipping: {
            address: customerInfo.address,
            city: customerInfo.city,
            postal_code: customerInfo.postalCode,
            phone: customerInfo.phone,
            delivery_instructions: ''
          },
          payment_method: paymentMethod,
          notes: `E-commerce order ${orderNumber}`
        };

        const dbOrder = await createOrder(userId, orderData);
        
        // Update local order with database information
        order.erpOrderId = dbOrder.id;
        order.erpOrderNumber = dbOrder.order_number;
        order.syncStatus = 'synced';
        order.status = 'processing';

        console.log('Order created successfully in database:', dbOrder);
        
      } catch (error) {
        console.error('Failed to create order in database:', error);
        order.syncStatus = 'failed';
        // Continue with local storage as fallback
      }
    }

    // Store order locally as backup/cache
    this.orders.set(orderId, order);
    this.saveOrdersToStorage();

    // If database creation failed, attempt sync with ERP
    if (order.syncStatus !== 'synced') {
      try {
        await this.syncOrderWithERP(order);
      } catch (error) {
        console.error('Failed to sync order with ERP immediately:', error);
        // Order is still created, sync will be retried later
      }
    }

    return order;
  }

  /**
   * Sync order with ERP system
   */
  private async syncOrderWithERP(order: EcommerceOrder): Promise<void> {
    const orderData: EcommerceOrderData = {
      orderId: order.id,
      customerInfo: order.customerInfo,
      items: order.items.map(item => ({
        productId: item.id,
        productName: item.name,
        sku: item.id, // Using product id as SKU for now
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      orderDate: order.orderDate,
      notes: `E-commerce order ${order.orderNumber}`
    };

    const syncResult = await orderSyncService.syncOrderToERP(orderData);

    if (syncResult.success) {
      order.erpOrderId = syncResult.orderId;
      order.erpOrderNumber = syncResult.orderNumber;
      order.syncStatus = 'synced';
    } else {
      order.syncStatus = 'failed';
    }

    this.orders.set(order.id, order);
    this.saveOrdersToStorage();
  }

  /**
   * Get order by ID
   */
  public getOrder(orderId: string): EcommerceOrder | undefined {
    return this.orders.get(orderId);
  }

  /**
   * Get order by order number
   */
  public getOrderByNumber(orderNumber: string): EcommerceOrder | undefined {
    for (const order of this.orders.values()) {
      if (order.orderNumber === orderNumber) {
        return order;
      }
    }
    return undefined;
  }

  /**
   * Get all orders for a customer
   */
  public getCustomerOrders(email: string): EcommerceOrder[] {
    const customerOrders: EcommerceOrder[] = [];
    
    for (const order of this.orders.values()) {
      if (order.customerInfo.email.toLowerCase() === email.toLowerCase()) {
        customerOrders.push(order);
      }
    }

    return customerOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  /**
   * Get all orders
   */
  public getAllOrders(): EcommerceOrder[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
  }

  /**
   * Update order status
   */
  public updateOrderStatus(orderId: string, status: EcommerceOrder['status']): boolean {
    const order = this.orders.get(orderId);
    if (!order) {
      return false;
    }

    order.status = status;
    this.orders.set(orderId, order);
    this.saveOrdersToStorage();
    return true;
  }

  /**
   * Cancel order
   */
  public cancelOrder(orderId: string, reason?: string): boolean {
    const order = this.orders.get(orderId);
    if (!order || order.status === 'delivered') {
      return false;
    }

    order.status = 'cancelled';
    if (reason) {
      order.notes = (order.notes || '') + `\nCancelled: ${reason}`;
    }
    
    this.orders.set(orderId, order);
    this.saveOrdersToStorage();
    return true;
  }

  /**
   * Retry failed syncs
   */
  public async retryFailedSyncs(): Promise<void> {
    const failedOrders = Array.from(this.orders.values()).filter(
      order => order.syncStatus === 'failed'
    );

    for (const order of failedOrders) {
      try {
        await this.syncOrderWithERP(order);
      } catch (error) {
        console.error(`Failed to retry sync for order ${order.id}:`, error);
      }
    }
  }

  /**
   * Get order statistics
   */
  public getOrderStatistics(): {
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: Record<string, number>;
    syncStatistics: Record<string, number>;
  } {
    const orders = Array.from(this.orders.values());
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const ordersByStatus: Record<string, number> = {};
    const syncStatistics: Record<string, number> = {};
    
    for (const order of orders) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
      syncStatistics[order.syncStatus] = (syncStatistics[order.syncStatus] || 0) + 1;
    }

    return {
      totalOrders,
      totalRevenue,
      ordersByStatus,
      syncStatistics
    };
  }

  /**
   * Generate unique order ID
   */
  private generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate human-readable order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp.slice(-6)}${random}`;
  }

  /**
   * Load orders from localStorage
   */
  private loadOrdersFromStorage(): void {
    try {
      const stored = localStorage.getItem('ecommerce_orders');
      if (stored) {
        const ordersArray: EcommerceOrder[] = JSON.parse(stored);
        this.orders = new Map(ordersArray.map(order => [order.id, order]));
      }
    } catch (error) {
      console.error('Failed to load orders from storage:', error);
      this.orders = new Map();
    }
  }

  /**
   * Save orders to localStorage
   */
  private saveOrdersToStorage(): void {
    try {
      const ordersArray = Array.from(this.orders.values());
      localStorage.setItem('ecommerce_orders', JSON.stringify(ordersArray));
    } catch (error) {
      console.error('Failed to save orders to storage:', error);
    }
  }

  /**
   * Clear all orders (for testing/demo purposes)
   */
  public clearAllOrders(): void {
    this.orders.clear();
    localStorage.removeItem('ecommerce_orders');
  }

  /**
   * Get orders by date range
   */
  public getOrdersByDateRange(startDate: Date, endDate: Date): EcommerceOrder[] {
    const orders = Array.from(this.orders.values());
    
    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }

  /**
   * Search orders by customer name, email, or order number
   */
  public searchOrders(query: string): EcommerceOrder[] {
    const lowercaseQuery = query.toLowerCase();
    const orders = Array.from(this.orders.values());

    return orders.filter(order => 
      order.orderNumber.toLowerCase().includes(lowercaseQuery) ||
      order.customerInfo.firstName.toLowerCase().includes(lowercaseQuery) ||
      order.customerInfo.lastName.toLowerCase().includes(lowercaseQuery) ||
      order.customerInfo.email.toLowerCase().includes(lowercaseQuery) ||
      (order.erpOrderNumber && order.erpOrderNumber.toLowerCase().includes(lowercaseQuery))
    ).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }
}

// Export singleton instance
export const orderService = OrderService.getInstance();

const BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440000';

// Create order using the new database function
export const createOrder = async (
  userId: string,
  orderData: CreateOrderData
): Promise<WebsiteOrder> => {
  try {
    console.log('Creating order for user:', userId);
    console.log('Order data:', orderData);

    // Calculate total amount
    const totalAmount = orderData.items.reduce((sum, item) => sum + item.total_price, 0);

    // Prepare order items for the database function
    const orderItems = orderData.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    // Use the database function to create the order
    const { data: orderId, error: orderError } = await supabase
      .rpc('create_website_order', {
        p_user_id: userId,
        p_total_amount: totalAmount,
        p_payment_method: orderData.payment_method,
        p_shipping_address: orderData.shipping.address,
        p_shipping_city: orderData.shipping.city,
        p_shipping_postal_code: orderData.shipping.postal_code,
        p_delivery_instructions: orderData.shipping.delivery_instructions || '',
        p_order_items: orderItems
      });

    if (orderError || !orderId) {
      console.error('Order creation error:', orderError);
      throw new Error('Failed to create order: ' + (orderError?.message || 'Unknown error'));
    }

    // Fetch the created order details
    const { data: orderDetails, error: fetchError } = await supabase
      .from('website_orders_for_erp')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !orderDetails) {
      console.error('Failed to fetch order details:', fetchError);
      throw new Error('Order created but failed to fetch details');
    }

    console.log('Order created successfully:', orderDetails);
    
    return {
      id: orderDetails.id,
      order_number: orderDetails.order_number,
      status: orderDetails.status,
      total_amount: orderDetails.total_amount,
      payment_method: orderDetails.payment_method,
      customer_email: orderDetails.customer_email,
      customer_phone: orderDetails.customer_phone,
      shipping_address: orderDetails.shipping_address,
      shipping_city: orderDetails.shipping_city,
      shipping_postal_code: orderDetails.shipping_postal_code,
      delivery_instructions: orderDetails.delivery_instructions,
      order_items: orderDetails.order_items || [],
      created_at: orderDetails.created_at,
      updated_at: orderDetails.updated_at
    };

  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get user orders
export const getUserOrders = async (userId: string): Promise<WebsiteOrder[]> => {
  try {
    const { data: orders, error } = await supabase
      .from('website_orders_for_erp')
      .select('*')
      .eq('website_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }

    return orders || [];
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return [];
  }
};

// Get order by ID
export const getOrderById = async (orderId: string, userId: string): Promise<WebsiteOrder | null> => {
  try {
    const { data: order, error } = await supabase
      .from('website_orders_for_erp')
      .select('*')
      .eq('id', orderId)
      .eq('website_user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    return order;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return null;
  }
}; 