import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'
import { callRevalidateAPI } from '../../../utilities/revalidate'

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
      callRevalidateAPI('pages', doc.slug, 'publish').catch((err) => {
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
      callRevalidateAPI('pages', previousDoc.slug, 'unpublish').catch((err) => {
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
      callRevalidateAPI('pages', doc.slug, 'delete').catch((err) => {
        console.error('Failed to call revalidate API:', err)
      })
    }
  }

  return doc
}
