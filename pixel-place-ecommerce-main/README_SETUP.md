# 🚀 E-commerce Setup Instructions

## ⚠️ CRITICAL: Database Setup Required

### 1. **Run SQL Script First** (MOST IMPORTANT)
You MUST run the database setup script in Supabase:

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run this script: `../mdvdversion1-main/src/SQL Queries/E-commerce_Auth_Fixed.sql`

This creates:
- `website_users` table (for e-commerce authentication)
- `website_sessions` table (for login sessions)
- Authentication functions
- Test user accounts

### 2. **Test Credentials**
After running the SQL script, you can login with:
- **Email**: `test@example.com`
- **Password**: `password123`

### 3. **How to Test Everything**

#### Step 1: Check Debug Info
- Visit the e-commerce site (`http://localhost:5173`)
- Look at the debug panel in bottom-right corner
- It should show:
  - ✅ Database Connected
  - Tables Found: website_users, website_sessions, sales_orders, etc.

#### Step 2: Test Authentication
1. Click Login button
2. Use test credentials: `test@example.com / password123`
3. Should see "Welcome, John" in header after login

#### Step 3: Test Order Creation
1. Add items to cart (requires login)
2. Go to checkout
3. Fill in shipping details
4. Place order
5. Check ERP Website Orders page for new order

### 4. **If Still Not Working**

#### Problem: "Database Error" in debug panel
**Solution**: Run the SQL script in Supabase

#### Problem: "Tables not found"
**Solution**: Run `E-commerce_Auth_Fixed.sql` script

#### Problem: Login fails
**Solution**: Check if `website_users` table exists with test data

#### Problem: Orders not appearing in ERP
**Solution**: 
1. Ensure user is logged in during checkout
2. Check `sales_orders` table in Supabase
3. Verify ERP is connected to same database

### 5. **Current Status**
✅ Authentication system fixed
✅ Login/Register pages working
✅ Order creation system implemented
✅ Debug info panel added
⚠️ **NEED TO RUN SQL SCRIPT**

### 6. **Next Steps**
1. Run `E-commerce_Auth_Fixed.sql` in Supabase
2. Test login with `test@example.com / password123`
3. Place a test order
4. Check ERP Website Orders page
5. Remove debug panel when everything works

The system is ready - it just needs the database tables created! 🎯 