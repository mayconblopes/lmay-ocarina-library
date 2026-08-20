const articleAssets = import.meta.glob(
  '/src/content/articles/**/*.{png,jpg,jpeg,webp,avif,gif,bmp}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  }
)

/* Essa função recebe:

articleId
    +
cover

por exemplo:

escala-maior-na-ocarina
./escala-maior.webp

e procura:

/src/content/articles/escala-maior-na-ocarina/escala-maior.webp */

export function resolveArticleAsset(
  articleId: string,
  assetPath?: string
): string | undefined {
  if (!assetPath) {
    return undefined
  }

  const normalizedPath = assetPath.replace(/^\.\/+/, '')

  const key = `/src/content/articles/${articleId}/${normalizedPath}`

  return articleAssets[key] as string | undefined
}