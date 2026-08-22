import type { Plugin } from 'vite'

const OCARINA_TAB_IMPORT = "import OcarinaTab from '@/components/OcarinaTab'"

const OCARINA_TAB_PATTERN = /<OcarinaTab\b/

const OCARINA_TAB_IMPORT_PATTERN =
  /import\s+OcarinaTab\s+from\s+['"][^'"]*OcarinaTab[^'"]*['"]/

function injectAfterFrontmatter(code: string): string {
  /*
   * Frontmatter YAML:
   *
   * ---
   * title: "..."
   * ---
   *
   * O import precisa ser inserido depois do segundo "---".
   */

  if (!code.startsWith('---')) {
    return `${OCARINA_TAB_IMPORT}\n\n${code}`
  }

  const frontmatterEnd = code.indexOf('\n---', 3)

  if (frontmatterEnd === -1) {
    return `${OCARINA_TAB_IMPORT}\n\n${code}`
  }

  const insertPosition = frontmatterEnd + '\n---'.length

  return (
    code.slice(0, insertPosition) +
    '\n\n' +
    OCARINA_TAB_IMPORT +
    code.slice(insertPosition)
  )
}

export default function viteInjectOcarinaTab(): Plugin {
  return {
    name: 'lmay-library-inject-ocarina-tab',

    enforce: 'pre',

    transform(code, id) {
      if (!id.endsWith('.mdx')) {
        return null
      }

      if (!OCARINA_TAB_PATTERN.test(code)) {
        return null
      }

      /*
       * Artigos que já possuem o import continuam funcionando
       * normalmente.
       */
      if (OCARINA_TAB_IMPORT_PATTERN.test(code)) {
        return null
      }

      return {
        code: injectAfterFrontmatter(code),
        map: null,
      }
    },
  }
}
