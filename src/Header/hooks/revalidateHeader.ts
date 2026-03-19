import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'
import { callRevalidateAPI } from '../../utilities/revalidate'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    revalidateTag('global_header')

    // Also call the revalidation API as a backup
    callRevalidateAPI('header', undefined, 'update').catch((err) => {
      console.error('Failed to call revalidate API:', err)
    })
  }

  return doc
}
