export const locales = ['pt-BR', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'pt-BR'

export const localeLabels: Record<Locale, string> = {
  'pt-BR': 'Português',
  en: 'English',
}

export const translations = {
  'pt-BR': {
    articles: 'Artigos',
    article: 'Artigo',
    exploreArticles: 'Explorar artigos',
    library: 'Biblioteca',
    libraryDescription:
      'Conteúdos para estudar ocarina, música, técnica e tudo aquilo que pode ajudar você a compreender melhor o instrumento.',
    learnOcarina: 'Aprenda ocarina com conhecimento, prática e música.',
    homeDescription:
      'Um espaço dedicado ao estudo da ocarina, reunindo teoria musical, técnica, exercícios, digitações e conteúdos para ajudar você a compreender e tocar melhor o instrumento.',
    recentContent: 'Conteúdos recentes',
    seeAll: 'Ver todos',
    seeAllArticles: 'Ver todos os artigos',
    readArticle: 'Ler artigo',
    backToArticles: 'Voltar para artigos',
    relatedContent: 'Conteúdos relacionados',
    continueStudying: 'Continue estudando',
    noArticles: 'Ainda não há artigos publicados.',
    newContentSoon: 'Novos conteúdos serão adicionados em breve.',
    language: 'Idioma',
  },
  en: {
    articles: 'Articles',
    article: 'Article',
    exploreArticles: 'Explore articles',
    library: 'Library',
    libraryDescription:
      'Content for studying ocarina, music, technique, and everything that can help you better understand the instrument.',
    learnOcarina: 'Learn ocarina through knowledge, practice, and music.',
    homeDescription:
      'A space dedicated to studying the ocarina, bringing together music theory, technique, exercises, fingerings, and content to help you understand and play the instrument better.',
    recentContent: 'Recent content',
    seeAll: 'See all',
    seeAllArticles: 'See all articles',
    readArticle: 'Read article',
    backToArticles: 'Back to articles',
    relatedContent: 'Related content',
    continueStudying: 'Keep studying',
    noArticles: 'No articles have been published yet.',
    newContentSoon: 'New content will be added soon.',
    language: 'Language',
  },
} as const

export function getTranslations(locale: Locale) {
  return translations[locale]
}

export function getLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith('/en/') || pathname === '/en'
    ? 'en'
    : defaultLocale
}

export function localizedPath(locale: Locale, path = '') {
  const normalizedPath = path ? `/${path.replace(/^\//, '')}` : ''

  return locale === 'en' ? `/en${normalizedPath}` : normalizedPath || '/'
}

export function articlesPath(locale: Locale) {
  return localizedPath(locale, locale === 'en' ? 'articles' : 'artigos')
}

export function switchLocalePath(pathname: string, locale: Locale) {
  let path = pathname.replace(/^\/en(?=\/|$)/, '')
  path = path.replace(/^\/articles(?=\/|$)/, '/artigos')

  if (locale === 'en') {
    path = path.replace(/^\/artigos(?=\/|$)/, '/articles')
    return `/en${path || '/'}`
  }

  return path || '/'
}
