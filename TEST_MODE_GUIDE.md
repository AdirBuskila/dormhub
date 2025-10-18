# Test Mode (Demo Mode) - Implementation Guide

## How It Works

### Flow:
1. User visits `/test-user` (no authentication required)
2. Sets localStorage + cookie for `testMode=true`
3. Redirects to `/customer/new-order`
4. Page detects test mode cookie and bypasses authentication
5. User can browse and "create orders" (not saved to DB)
6. Yellow banner shows "Demo Mode" with "Exit Demo" button

## Changes Made

### 1. Middleware (`src/middleware.ts`)
- Added `/test-user` to public routes
- Added `/customer/new-order` to public routes
- No authentication required for these paths

### 2. Test User Page (`src/app/[locale]/test-user/page.tsx`)
- Sets `localStorage` items (client-side)
- Sets `testMode` cookie (server-side detection)
- Redirects to `/customer/new-order` after 100ms

### 3. New Order Page (`src/app/[locale]/customer/new-order/page.tsx`)
- Checks for `testMode` cookie on server-side
- If test mode: bypasses Clerk authentication
- Uses dummy client ID: `test-client-demo`
- Otherwise: normal authentication flow

### 4. Order API (`src/app/api/orders/route.ts`)
- Already implemented: checks `testMode` from request body
- Simulates order creation without DB insert
- Returns test order ID

### 5. Components
- `NewOrderPage` already has demo banner
- Shows "Exit Demo" button
- Clears flags and redirects home on exit

## URLs

### Production:
- **Test Mode Entry**: `https://www.mobileforyou.co.il/test-user`
- **Demo Shopping**: `https://www.mobileforyou.co.il/customer/new-order`

### Development:
- **Test Mode Entry**: `http://localhost:3000/test-user`
- **Demo Shopping**: `http://localhost:3000/customer/new-order`

## Test Mode Features

### ✅ What Works:
- Browse all products
- Add items to cart
- Select payment methods
- "Complete" orders
- View deals
- Full UI/UX experience

### ⚠️ What's Different:
- No authentication required
- Orders NOT saved to database
- Shows yellow "Demo Mode" banner
- Success message says "🧪 Demo Order Created!"
- Can't view past orders (demo only)

## Security

### Safe because:
1. Test mode flag stored in localStorage (client-only)
2. Cookie expires in 24 hours
3. No real data is created/modified
4. Orders are simulated, not saved
5. Can't access other users' data
6. Easy to exit (clear flags and redirect)

## How to Exit Test Mode

### Method 1: Click "Exit Demo" button
- Visible in yellow banner at top
- Clears localStorage and cookie
- Redirects to home page

### Method 2: Manually
```javascript
localStorage.removeItem('testMode');
localStorage.removeItem('testUser');
document.cookie = 'testMode=; path=/; max-age=0';
window.location.href = '/';
```

### Method 3: Clear browser data
- Clear cookies
- Clear localStorage
- Refresh page

## Testing Checklist

- [ ] Visit `/test-user`
- [ ] Verify no authentication prompt
- [ ] See "Entering Demo Mode" message
- [ ] Redirect to `/customer/new-order`
- [ ] See yellow "Demo Mode" banner
- [ ] Browse products
- [ ] Add items to cart
- [ ] Complete an order
- [ ] See success animation with "Demo Order"
- [ ] Click "Exit Demo"
- [ ] Verify redirect to home
- [ ] Verify test mode cleared

## Troubleshooting

### Issue: "Authentication Error"
**Solution**: Clear cookies and try again
```javascript
document.cookie = 'testMode=true; path=/; max-age=86400';
```

### Issue: Stuck in test mode
**Solution**: Run this in console:
```javascript
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.split("=")[0] + "=;expires=" + new Date(0).toUTCString() + ";path=/";
});
location.reload();
```

### Issue: Orders saving to DB in test mode
**Solution**: Check API handles `testMode` flag:
```typescript
const { testMode } = body;
if (testMode === true) {
  // Simulate order creation
  return NextResponse.json({ 
    orderId: `test-order-${Date.now()}`,
    testMode: true 
  });
}
```

## Future Improvements

1. **Better visual indicator**: Add "DEMO" watermark
2. **Sample data**: Pre-fill cart with demo items
3. **Analytics**: Track demo mode usage
4. **Time limit**: Auto-exit after X minutes
5. **Guided tour**: Show tooltips for key features
6. **Share link**: Generate shareable demo links

