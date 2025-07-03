import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const ScriptureReferences: CollectionConfig = {
  slug: 'scripture-references',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'reference',
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      required: true,
    },
    ...slugField(),
  ],
}
