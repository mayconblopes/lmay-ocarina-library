import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const articles = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/articles',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    locale: z.enum(['pt-BR', 'en']),
    translationKey: z.string(),
    slug: z.string(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    related: z.array(z.string()).default([]),
  }),
})

export const collections = {
  articles,
}
