// E-commerce Order Sync Service
// This service handles the integration between the e-commerce site and the ERP system

export interface EcommerceOrderData {
  orderId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  orderDate: string;
  notes?: string;
}

export interface OrderSyncResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

export class EcommerceOrderSyncService {
  private static instance: EcommerceOrderSyncService;
  private readonly ERP_API_BASE_URL = 'http://localhost:8080'; // ERP system URL
  private readonly API_KEY = 'ecommerce-api-key';

  public static getInstance(): EcommerceOrderSyncService {
    if (!EcommerceOrderSyncService.instance) {
      EcommerceOrderSyncService.instance = new EcommerceOrderSyncService();
    }
    return EcommerceOrderSyncService.instance;
  }

  /**
   * Direct sync to ERP using the OrderSyncAPI
   */
  public async syncOrderToERP(orderData: EcommerceOrderData): Promise<OrderSyncResponse> {
    try {
      console.log('Syncing order to ERP:', orderData.orderId);

      // For development/demo purposes, we'll simulate the ERP integration
      // In production, this would make an actual HTTP request to the ERP API
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate successful sync with generated ERP order number
      const erpOrderNumber = `WEB-${Date.now().toString().slice(-6)}`;
      const erpOrderId = `erp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log('Order sync successful:', {
        ecommerceOrderId: orderData.orderId,
        erpOrderId: erpOrderId,
        erpOrderNumber: erpOrderNumber
      });
      
      // Store sync success info locally
      this.storeSyncInfo(orderData.orderId, {
        success: true,
        orderId: erpOrderId,
        orderNumber: erpOrderNumber
      });

      return {
        success: true,
        orderId: erpOrderId,
        orderNumber: erpOrderNumber
      };

    } catch (error) {
      console.error('Error syncing order to ERP:', error);
      
      // In case of network issues, store order locally and mark for retry
      await this.storeOrderForRetry(orderData);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync with ERP system'
      };
    }
  }

  /**
   * Store order locally in case of sync failure for later retry
   */
  private async storeOrderForRetry(orderData: EcommerceOrderData): Promise<void> {
    try {
      const failedOrders = this.getFailedOrders();
      failedOrders.push({
        ...orderData,
        failedAt: new Date().toISOString(),
        retryCount: 0
      });
      
      localStorage.setItem('failed_order_syncs', JSON.stringify(failedOrders));
      console.log('Order stored for retry:', orderData.orderId);
    } catch (error) {
      console.error('Failed to store order for retry:', error);
    }
  }

  /**
   * Store successful sync information
   */
  private storeSyncInfo(ecommerceOrderId: string, syncResult: OrderSyncResponse): void {
    try {
      const syncInfo = {
        ecommerceOrderId,
        erpOrderId: syncResult.orderId,
        erpOrderNumber: syncResult.orderNumber,
        syncedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`sync_info_${ecommerceOrderId}`, JSON.stringify(syncInfo));
    } catch (error) {
      console.error('Failed to store sync info:', error);
    }
  }

  /**
   * Get failed orders for retry attempts
   */
  private getFailedOrders(): Array<EcommerceOrderData & { failedAt: string; retryCount: number }> {
    try {
      const stored = localStorage.getItem('failed_order_syncs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Retry failed order syncs
   */
  public async retryFailedOrders(): Promise<void> {
    const failedOrders = this.getFailedOrders();
    const maxRetries = 3;
    
    if (failedOrders.length === 0) return;

    console.log(`Retrying ${failedOrders.length} failed order syncs...`);
    
    const stillFailed: Array<EcommerceOrderData & { failedAt: string; retryCount: number }> = [];

    for (const order of failedOrders) {
      if (order.retryCount >= maxRetries) {
        stillFailed.push(order);
        continue;
      }

      try {
        const result = await this.syncOrderToERP(order);
        
        if (!result.success) {
          order.retryCount += 1;
          stillFailed.push(order);
        }
        // If successful, it's automatically removed from failed list
        
      } catch (error) {
        order.retryCount += 1;
        stillFailed.push(order);
      }
    }

    // Update failed orders list
    localStorage.setItem('failed_order_syncs', JSON.stringify(stillFailed));
  }

  /**
   * Check ERP system health
   */
  public async checkERPHealth(): Promise<boolean> {
    try {
      // For demo purposes, always return true
      // In production, this would ping the ERP health endpoint
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get sync status for an order
   */
  public getSyncStatus(ecommerceOrderId: string): { synced: boolean; erpOrderId?: string; erpOrderNumber?: string } {
    try {
      const syncInfo = localStorage.getItem(`sync_info_${ecommerceOrderId}`);
      if (syncInfo) {
        const info = JSON.parse(syncInfo);
        return {
          synced: true,
          erpOrderId: info.erpOrderId,
          erpOrderNumber: info.erpOrderNumber
        };
      }
    } catch {
      // Handle parsing errors
    }
    
    return { synced: false };
  }

  /**
   * Initialize service and attempt retry of failed orders
   */
  public async initialize(): Promise<void> {
    console.log('Initializing e-commerce order sync service...');
    
    // Check if ERP is available
    const isERPHealthy = await this.checkERPHealth();
    console.log('ERP system health:', isERPHealthy ? 'Healthy' : 'Unavailable');
    
    // Retry failed orders if ERP is available
    if (isERPHealthy) {
      await this.retryFailedOrders();
    }
  }

  /**
   * Get all synced orders from local storage
   */
  public getAllSyncedOrders(): Array<{
    ecommerceOrderId: string;
    erpOrderId: string;
    erpOrderNumber: string;
    syncedAt: string;
  }> {
    const syncedOrders: Array<{
      ecommerceOrderId: string;
      erpOrderId: string;
      erpOrderNumber: string;
      syncedAt: string;
    }> = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sync_info_')) {
          const syncInfo = JSON.parse(localStorage.getItem(key) || '{}');
          syncedOrders.push(syncInfo);
        }
      }
    } catch (error) {
      console.error('Error retrieving synced orders:', error);
    }

    return syncedOrders.sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime());
  }
}

// Export singleton instance
export const orderSyncService = EcommerceOrderSyncService.getInstance(); 