import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

const callRevalidateAPI = async (slug: string, operation: string) => {
  try {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL
    if (!serverUrl) {
      console.error('NEXT_PUBLIC_SERVER_URL is not defined')
      return
    }

    const response = await fetch(`${serverUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAYLOAD_SECRET}`,
      },
      body: JSON.stringify({
        collection: 'pages',
        slug,
        operation,
      }),
    })

    if (!response.ok) {
      console.error('Failed to revalidate via API:', await response.text())
    } else {
      console.log('Successfully triggered revalidation via API')
    }
  } catch (error) {
    console.error('Error calling revalidate API:', error)
  }
}

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published' && doc.slug) {
      const path = doc.slug === 'home' ? '/' : `/${doc.slug}`

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      revalidateTag('pages-sitemap')

      // Also call the revalidation API as a backup
      callRevalidateAPI(doc.slug, 'publish').catch((err) => {
        console.error('Failed to call revalidate API:', err)
      })
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published' && previousDoc.slug) {
      const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('pages-sitemap')

      // Also call the revalidation API as a backup
      callRevalidateAPI(previousDoc.slug, 'unpublish').catch((err) => {
        console.error('Failed to call revalidate API:', err)
      })
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = doc?.slug === 'home' ? '/' : `/${doc?.slug}`
    revalidatePath(path)
    revalidateTag('pages-sitemap')

    // Also call the revalidation API as a backup
    if (doc?.slug) {
      callRevalidateAPI(doc.slug, 'delete').catch((err) => {
        console.error('Failed to call revalidate API:', err)
      })
    }
  }

  return doc
}
