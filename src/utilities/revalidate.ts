export const callRevalidateAPI = async (
  collection: string,
  slug: string | undefined,
  operation: string,
) => {
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
