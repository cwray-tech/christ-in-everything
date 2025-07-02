import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Series: CollectionConfig = {
  slug: 'series',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    ...slugField(),
  ],
}
