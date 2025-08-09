import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PostHero } from '@/heros/PostHero'
import { formatAuthors } from '@/utilities/formatAuthors'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/posts/' + slug
  const post = await queryPostBySlug({ slug })

  if (!post) return <PayloadRedirects url={url} />
  const { populatedAuthors, keyPassages } = post
  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const hasKeyPassages = keyPassages && keyPassages.length > 0

  return (
    <article className="pt-16 pb-16">
      <PageClient {...post} />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText
            className="max-w-[48rem] mx-auto text-wrap"
            data={post.content}
            enableGutter={false}
          />
          <div className="grid gap-4 mt-6">
            {hasAuthors && (
              <div className="flex flex-col gap-2">
                <p className="text-sm">By</p>
                <p className="text-sm">{formatAuthors(populatedAuthors)}</p>
              </div>
            )}
            {hasKeyPassages && (
              <div className="flex flex-col gap-2">
                <p className="text-sm">Key Passages</p>
                <p className="text-sm">
                  {keyPassages?.map((keyPassage, index) => {
                    if (typeof keyPassage === 'object' && keyPassage !== null) {
                      const { reference } = keyPassage

                      const titleToUse = reference || 'Unknown reference'

                      const isLast = index === keyPassages.length - 1

                      return (
                        <React.Fragment key={index}>
                          {titleToUse}
                          {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                        </React.Fragment>
                      )
                    }
                    return null
                  })}
                </p>
              </div>
            )}
          </div>

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
