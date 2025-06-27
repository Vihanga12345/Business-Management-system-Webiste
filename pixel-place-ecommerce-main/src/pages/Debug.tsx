import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Debug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDebugChecks = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        supabaseUrl: 'https://zgdfjcodbzpkjlgnjxrk.supabase.co',
        checks: {}
      };

      try {
        // Test 1: Basic database connection
        console.log('Testing database connection...');
        const { data: testData, error: testError } = await supabase
          .from('inventory_items')
          .select('count(*)')
          .limit(1);
        
        info.checks.dbConnection = testError ? `Error: ${testError.message}` : 'Connected';
        
        // Test 2: Check if inventory_items table exists and has data
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('id, name, is_website_item, is_active, current_stock')
          .limit(10);
        
        info.checks.inventoryTable = inventoryError ? `Error: ${inventoryError.message}` : `Found ${inventoryData?.length || 0} items`;
        info.checks.inventoryItems = inventoryData;

        // Test 3: Check website_users table
        const { data: usersData, error: usersError } = await supabase
          .from('website_users')
          .select('id, email, first_name, last_name')
          .limit(5);
        
        info.checks.usersTable = usersError ? `Error: ${usersError.message}` : `Found ${usersData?.length || 0} users`;
        info.checks.users = usersData;

        // Test 4: Check for website products specifically
        const { data: websiteProducts, error: websiteError } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('is_website_item', true)
          .limit(5);
        
        info.checks.websiteProducts = websiteError ? `Error: ${websiteError.message}` : `Found ${websiteProducts?.length || 0} website products`;
        info.checks.websiteProductData = websiteProducts;

        // Test 5: Check categories
        const { data: categoryData, error: categoryError } = await supabase
          .from('inventory_items')
          .select('category')
          .not('category', 'is', null)
          .limit(10);
        
        info.checks.categories = categoryError ? `Error: ${categoryError.message}` : `Found categories`;
        info.checks.categoryData = categoryData;

      } catch (error) {
        info.checks.generalError = `Unexpected error: ${error}`;
      }

      setDebugInfo(info);
      setLoading(false);
    };

    runDebugChecks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-4">Debug Information</h1>
        <p>Loading debug information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Debug Information</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Application Status</h2>
        <p>Timestamp: {debugInfo.timestamp}</p>
        <p>Supabase URL: {debugInfo.supabaseUrl}</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Database Checks</h2>
        {Object.entries(debugInfo.checks || {}).map(([key, value]: [string, any]) => (
          <div key={key} className="mb-2">
            <strong>{key}:</strong> 
            {typeof value === 'object' ? (
              <pre className="bg-gray-700 p-2 mt-1 rounded text-sm overflow-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <span className="ml-2">{String(value)}</span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Full Debug Data</h2>
        <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto max-h-96">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Debug; 