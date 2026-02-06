import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'
import { callRevalidateAPI } from '../../utilities/revalidate'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)

    revalidateTag('global_footer')

    // Also call the revalidation API as a backup
    callRevalidateAPI('footer', undefined, 'update').catch((err) => {
      console.error('Failed to call revalidate API:', err)
    })
  }

  return doc
}
