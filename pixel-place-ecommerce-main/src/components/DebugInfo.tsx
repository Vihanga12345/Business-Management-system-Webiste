import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const DebugInfo: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [dbStatus, setDbStatus] = useState<string>('Checking...');
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      // Test basic connectivity
      const { data, error } = await supabase
        .from('website_users')
        .select('count(*)', { count: 'exact' })
        .limit(1);

      if (error) {
        setDbStatus(`Database Error: ${error.message}`);
      } else {
        setDbStatus('Database Connected ✅');
        // Check if tables exist
        checkTables();
      }
    } catch (error) {
      setDbStatus(`Connection Error: ${error}`);
    }
  };

  const checkTables = async () => {
    const tableChecks = [
      'website_users',
      'website_sessions', 
      'sales_orders',
      'sales_order_items',
      'customers',
      'inventory_items'
    ];

    const existingTables: string[] = [];

    for (const table of tableChecks) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          existingTables.push(table);
        }
      } catch (e) {
        // Table doesn't exist
      }
    }

    setTables(existingTables);
  };

  const testCreateOrder = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    try {
      // Test order creation
      const testOrder = {
        items: [{
          product_id: 'test-123',
          product_name: 'Test Product',
          quantity: 1,
          unit_price: 10.00,
          total_price: 10.00
        }],
        shipping: {
          address: 'Test Address',
          city: 'Test City',
          postal_code: '12345',
          phone: '+1234567890',
          delivery_instructions: 'Test order'
        },
        payment_method: 'test',
        notes: 'Debug test order'
      };

      const response = await fetch('/api/test-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          orderData: testOrder
        })
      });

      if (response.ok) {
        alert('Test order created successfully!');
      } else {
        alert('Failed to create test order');
      }
    } catch (error) {
      alert(`Order test error: ${error}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg border border-gray-600 max-w-sm text-sm">
      <h3 className="font-bold mb-2">🔧 Debug Info</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Auth Status:</strong> {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}
        </div>
        
        {user && (
          <div>
            <strong>User:</strong> {user.first_name} {user.last_name}
            <br />
            <strong>ID:</strong> {user.id}
          </div>
        )}
        
        <div>
          <strong>Database:</strong> {dbStatus}
        </div>
        
        <div>
          <strong>Tables Found:</strong>
          <div className="text-xs">
            {tables.length > 0 ? tables.join(', ') : 'None found'}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            onClick={checkDatabaseConnection}
            className="text-xs"
          >
            Recheck DB
          </Button>
          {user && (
            <Button 
              size="sm" 
              onClick={testCreateOrder}
              className="text-xs"
            >
              Test Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugInfo; 