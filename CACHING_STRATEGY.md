# Caching Strategy - Mobile For You

## Current Implementation

### API Route Caching

We've implemented caching at the API route level using:
1. **Next.js `revalidate` export** - Server-side caching
2. **Cache-Control headers** - Browser/CDN caching

### Caching Durations

| Endpoint | Cache Duration | Reason |
|----------|---------------|--------|
| `/api/products` | 5 minutes (300s) | Products rarely change, but inventory updates matter |
| `/api/deals` | 2 minutes (120s) | Deals are time-sensitive but don't change every second |
| `/api/clients` | Not cached | User-specific data, needs to be fresh |
| `/api/orders` | Not cached | Critical real-time data |

### Cache Headers Explained

```javascript
'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
```

- **`public`**: Can be cached by browsers and CDNs
- **`s-maxage=300`**: CDN/edge cache for 5 minutes
- **`stale-while-revalidate=600`**: Serve stale content for 10 minutes while revalidating in background

## Benefits

1. **Faster Load Times**: Products/deals load instantly from cache
2. **Reduced Database Load**: Fewer queries to Supabase
3. **Better UX**: Instant navigation between pages
4. **Cost Savings**: Less database usage = lower costs

## When Cache is Invalidated

- **Products**: Every 5 minutes automatically
- **Deals**: Every 2 minutes automatically
- **Manual**: When admin creates/updates products or deals

## Future Improvements

### Option 1: Add SWR for Client-Side Caching

```bash
npm install swr
```

Benefits:
- Automatic revalidation
- Optimistic updates
- Background refetching
- Better offline support

### Option 2: Add React Query

```bash
npm install @tanstack/react-query
```

Benefits:
- More powerful caching
- Query invalidation
- Prefetching
- Better DevTools

### Option 3: Add Redis for Server-Side Caching

For production with high traffic:
- Cache database queries in Redis
- Instant responses
- Manual cache invalidation when data changes

## Best Practices

1. **Don't cache user-specific data** (orders, user profiles)
2. **Cache read-heavy data** (products, deals, public info)
3. **Shorter cache for time-sensitive data** (deals, promotions)
4. **Longer cache for static data** (products, categories)
5. **Use stale-while-revalidate** for better UX

## Monitoring

To check if caching is working:
1. Open Network tab in DevTools
2. Look for `Cache-Control` headers
3. Reload page - should see `(disk cache)` or `(memory cache)`
4. Check response times - should be < 50ms for cached

## Cache Invalidation Strategy

Currently: **Time-based** (automatic expiration)

Future options:
- **Event-based**: Invalidate when admin updates data
- **Tag-based**: Invalidate related caches
- **Manual**: Admin button to clear all caches

