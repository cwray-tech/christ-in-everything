import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

const callRevalidateAPI = async (collection: string) => {
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
        collection,
        operation: 'update',
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

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)

    revalidateTag('global_footer')

    // Also call the revalidation API as a backup
    callRevalidateAPI('footer').catch((err) => {
      console.error('Failed to call revalidate API:', err)
    })
  }

  return doc
}
