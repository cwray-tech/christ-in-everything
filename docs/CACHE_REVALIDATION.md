# Cache Revalidation

This project implements automatic cache revalidation to ensure Vercel always serves the latest content after posts, pages, or global settings are published, edited, or deleted.

## How It Works

The system uses a dual approach to ensure reliable revalidation:

1. **Built-in Next.js Revalidation**: Uses `revalidatePath()` and `revalidateTag()` called from Payload CMS hooks
2. **Backup API Endpoint**: A dedicated revalidation API endpoint that can be called programmatically

### Revalidation API Endpoint

The API endpoint is located at `/api/revalidate` and accepts POST requests with the following payload:

```json
{
  "collection": "posts|pages|header|footer",
  "slug": "post-slug-or-page-slug",
  "operation": "publish|unpublish|delete|update"
}
```

#### Authentication

The endpoint requires authentication via the `PAYLOAD_SECRET` environment variable. Include it as a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_PAYLOAD_SECRET
```

### Automatic Revalidation

Content is automatically revalidated when:

- A post is published, unpublished, or deleted
- A page is published, unpublished, or deleted
- The header or footer global settings are updated

### Manual Revalidation

You can manually trigger revalidation by sending a POST request to the `/api/revalidate` endpoint:

```bash
curl -X POST https://your-domain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_PAYLOAD_SECRET" \
  -d '{"collection": "posts", "slug": "my-post-slug", "operation": "publish"}'
```

## Environment Variables

Ensure the following environment variables are configured:

- `PAYLOAD_SECRET`: Used to authenticate revalidation API requests
- `NEXT_PUBLIC_SERVER_URL`: The base URL of your site (no trailing slash)

## Route Segment Configuration

Static pages use the following configuration:

- `dynamic = 'force-static'`: Pages are statically generated at build time
- `revalidate = false`: Pages are only revalidated on-demand via `revalidatePath()`

This ensures optimal performance while maintaining content freshness.
