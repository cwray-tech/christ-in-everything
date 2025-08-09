import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Christ is all and in all.',
  images: [
    {
      url: `${getServerSideURL()}/images/hero.jpg`,
    },
  ],
  siteName: 'Christ in Everything',
  title: 'Christ in Everything',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
