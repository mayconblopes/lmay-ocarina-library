import type { CollectionEntry } from 'astro:content'

import type { Locale } from './i18n'

type Article = CollectionEntry<'articles'>

export function getLocalizedArticles(
  articles: Article[],
  locale: Locale,
): Article[] {
  return articles.filter(article => article.data.locale === locale)
}

export function getLocalizedArticle(
  articles: Article[],
  locale: Locale,
  slug: string,
) {
  return getLocalizedArticles(articles, locale).find(
    article => article.data.slug === slug,
  )
}

export function getTranslation(
  articles: Article[],
  article: Article,
  locale: Locale,
) {
  return articles.find(
    candidate =>
      candidate.data.locale === locale &&
      candidate.data.translationKey === article.data.translationKey,
  )
}
