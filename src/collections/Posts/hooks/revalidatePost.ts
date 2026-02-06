import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'
import { callRevalidateAPI } from '../../../utilities/revalidate'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published' && doc.slug) {
      const path = `/posts/${doc.slug}`

      payload.logger.info(`Revalidating post at path: ${path}`)

      revalidatePath(path)
      revalidateTag('posts-sitemap')

      // Also call the revalidation API as a backup
      callRevalidateAPI('posts', doc.slug, 'publish').catch((err) => {
        console.error('Failed to call revalidate API:', err)
      })
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published' && previousDoc.slug) {
      const oldPath = `/posts/${previousDoc.slug}`

      payload.logger.info(`Revalidating old post at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidateTag('posts-sitemap')

      // Also call the revalidation API as a backup
      callRevalidateAPI('posts', previousDoc.slug, 'unpublish').catch((err) => {
        console.error('Failed to call revalidate API:', err)
      })
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = `/posts/${doc?.slug}`

    revalidatePath(path)
    revalidateTag('posts-sitemap')

    // Also call the revalidation API as a backup
    if (doc?.slug) {
      callRevalidateAPI('posts', doc.slug, 'delete').catch((err) => {
        console.error('Failed to call revalidate API:', err)
      })
    }
  }

  return doc
}
