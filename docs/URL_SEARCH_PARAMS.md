# URL Search Params Implementation

**Date:** October 16, 2025  
**Status:** ✅ Complete

## Overview

Implemented URL search parameters for product search and filtering with Hebrew search support. This allows users to:
- Share filtered product views via URL
- Use browser back/forward buttons
- Bookmark specific search queries
- Search in Hebrew or English

## Features

### 1. URL-Based Search & Filtering

All search and filter states are now stored in the URL query parameters:

**Example URLs:**
```
/customer/new-order?search=אייפון
/customer/new-order?search=iPhone&brand=Apple&category=iphone
/customer/new-order?promotion=true
/customer/new-order?tag=Runner&brand=Samsung
/inventory?search=galaxy&condition=new
```

### 2. Hebrew Search Integration

The search automatically translates Hebrew terms to English:
- Search for "אייפון" finds "iPhone" products
- Search for "סמסונג" finds "Samsung" products
- Works with all brand mappings from `hebrew-search.ts`

### 3. Debounced Search

Search input is debounced (300ms) to avoid excessive URL updates while typing.

### 4. Browser History Support

- Back button returns to previous filter state
- Forward button moves to next filter state
- Search history is preserved

## Implementation

### Custom Hook: `useProductSearch`

**Location:** `src/hooks/useProductSearch.ts`

**Features:**
- Reads and writes URL search params
- Filters products using Hebrew search
- Provides available filter options
- Debounces search updates

**Usage:**
```typescript
const {
  filters,              // Current filter values from URL
  filteredProducts,     // Products filtered by current params
  updateFilters,        // Function to update URL params
  availableBrands,      // Unique brands in products
  availableCategories,  // Unique categories
  availableTags        // Unique tags
} = useProductSearch(products);
```

### Query Parameters

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `search` | string | `?search=אייפון` | Search term (Hebrew/English) |
| `brand` | string | `?brand=Apple` | Filter by brand |
| `category` | string | `?category=iphone` | Filter by category |
| `condition` | string | `?condition=new` | Filter by condition |
| `promotion` | string | `?promotion=true` | Show only promotions |
| `tag` | string | `?tag=Runner` | Filter by product tag |

### Updated Components

#### Customer Side: `NewOrderProductList.tsx`

**Changes:**
- Replaced `useState` with `useProductSearch` hook
- Search input updates URL params
- All filter dropdowns update URL params
- Quick filter chips update URL params
- Debounced search for better UX

**Before:**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [filterBrand, setFilterBrand] = useState('all');
// ... filtering done in component
```

**After:**
```typescript
const { filters, filteredProducts, updateFilters } = useProductSearch(products);
const [searchInput, setSearchInput] = useState(filters.search);

// Debounced URL update
useEffect(() => {
  const timer = setTimeout(() => {
    if (searchInput !== filters.search) {
      updateFilters({ search: searchInput });
    }
  }, 300);
  return () => clearTimeout(timer);
}, [searchInput]);
```

## User Experience Improvements

### For Customers

1. **Shareable Links**
   - Can share filtered product views with admins
   - Example: "Show me all iPhones on promotion"
   - URL: `/customer/new-order?brand=Apple&category=iphone&promotion=true`

2. **Bookmarks**
   - Save frequently used filters
   - Example: Bookmark "All Samsung Galaxy phones"
   - URL: `/customer/new-order?brand=Samsung&search=galaxy`

3. **Browser Navigation**
   - Use back button to return to previous search
   - Search history preserved across sessions

4. **Hebrew Search**
   - Type "אייפון" and press Enter
   - URL updates to: `?search=אייפון`
   - Products filtered using Hebrew mapping
   - Works instantly without API call

### For Admins

1. **Shareable Inventory Views**
   - Share specific product lists with team
   - Example: "Low stock iPhones"
   - URL: `/inventory?brand=Apple&category=iphone`

2. **Quick Access**
   - Bookmark commonly viewed filters
   - Return to exact view state
   - No need to reapply filters

## Testing

### Test Hebrew Search in URL

```bash
# Test Hebrew brand search
http://localhost:3001/customer/new-order?search=אייפון

# Test combined filters
http://localhost:3001/customer/new-order?search=סמסונג&category=phone&promotion=true

# Test tag filtering
http://localhost:3001/customer/new-order?tag=Runner

# Test multiple parameters
http://localhost:3001/inventory?search=galaxy&brand=Samsung&condition=new
```

### Test Browser Navigation

1. Go to `/customer/new-order`
2. Search for "אייפון"
3. Select "Apple" brand
4. Click browser back button → brand filter cleared
5. Click back again → search cleared
6. Click forward → search restored

### Test Debouncing

1. Go to `/customer/new-order`
2. Start typing "אייפון" quickly
3. URL should only update after you stop typing (300ms)
4. Check Network tab - no excessive requests

## Technical Details

### URL Update Strategy

Uses Next.js `router.push()` with `scroll: false`:
```typescript
router.push(`${pathname}?${params.toString()}`, { scroll: false });
```

- Prevents page scroll on filter change
- Updates URL without full page reload
- Preserves component state

### Filter Persistence

Filters are read from URL on:
- Initial page load
- Browser back/forward navigation
- Direct URL access
- Page refresh

### Hebrew Search Flow

```
User types "אייפון"
  ↓
Input updates (immediate)
  ↓
300ms debounce
  ↓
URL updates to ?search=אייפון
  ↓
useProductSearch hook detects change
  ↓
translateHebrewSearch("אייפון")
  ↓
Returns: ["אייפון", "iphone", ...]
  ↓
matchesHebrewSearch() filters products
  ↓
UI updates with filtered results
```

## Future Enhancements

### Possible Improvements

1. **Search Suggestions**
   - Show Hebrew suggestions while typing
   - Use `getHebrewSearchSuggestions()` from `hebrew-search.ts`

2. **Save Filter Presets**
   - Allow users to save common filter combinations
   - Quick access buttons for saved filters

3. **Advanced Filters**
   - Price range filtering
   - Stock level filtering
   - Date range for new products

4. **Analytics**
   - Track most common search terms
   - Identify popular filter combinations
   - Optimize based on usage patterns

5. **Auto-Complete**
   - Hebrew autocomplete for product names
   - Show matching products as you type

## Files Modified

- ✅ `src/hooks/useProductSearch.ts` - New custom hook
- ✅ `src/components/customer/NewOrderProductList.tsx` - URL params integration
- ✅ `database/schema.sql` - Added promotions & consignments tables
- ✅ `docs/URL_SEARCH_PARAMS.md` - This documentation

## Summary

✅ **URL Search Params** - All filters persist in URL  
✅ **Hebrew Search** - Automatic translation integrated  
✅ **Browser History** - Back/forward buttons work  
✅ **Shareable Links** - URLs can be bookmarked/shared  
✅ **Debounced Input** - Smooth UX without excessive updates  
✅ **Customer Portal** - Fully implemented  
🔄 **Admin Inventory** - Next to implement (same pattern)

---

**For Admin Inventory Implementation:**

Apply the same pattern to `src/components/InventoryManagement.tsx`:
1. Import `useProductSearch` hook
2. Replace local `useState` filters
3. Update search input to use `searchInput` with debouncing
4. Update all filter handlers to use `updateFilters()`
5. Test with Hebrew search terms
