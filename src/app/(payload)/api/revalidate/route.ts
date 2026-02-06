import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify the request is authorized
  const authHeader = request.headers.get('authorization')
  const secret = process.env.PAYLOAD_SECRET

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { collection, slug, operation } = body

    if (!collection) {
      return NextResponse.json({ message: 'Collection is required' }, { status: 400 })
    }

    // Revalidate based on collection type
    if (collection === 'posts') {
      if (slug) {
        const path = `/posts/${slug}`
        revalidatePath(path)
        console.log(`Revalidated post at path: ${path}`)
      }
      // Also revalidate the posts index page
      revalidatePath('/posts')
      revalidateTag('posts-sitemap')
      console.log('Revalidated posts index and sitemap')
    } else if (collection === 'pages') {
      if (slug) {
        const path = slug === 'home' ? '/' : `/${slug}`
        revalidatePath(path)
        console.log(`Revalidated page at path: ${path}`)
      }
      revalidateTag('pages-sitemap')
      console.log('Revalidated pages sitemap')
    } else if (collection === 'header' || collection === 'footer') {
      // Revalidate all pages when header/footer changes
      revalidatePath('/', 'layout')
      console.log(`Revalidated layout for ${collection}`)
    }

    return NextResponse.json({
      revalidated: true,
      collection,
      slug,
      operation,
      now: Date.now(),
    })
  } catch (err) {
    console.error('Error revalidating:', err)
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 },
    )
  }
}
