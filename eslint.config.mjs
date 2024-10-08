// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    rules: {
      // Vue 3 has support for multiple root elements. Nuxt forbids multiple 
      // root elements in some cases, so it would be nice if we could 
      // conditionally turn this off, rather than having to disable it globally.
      "vue/no-multiple-template-root": "off",
      // Vue transpiles this to valid HTML, so it doesn't matter. Plus, not
      // closing tags physically hurts me.
      "vue/html-self-closing": "off",
      // We use ts-ignore to stop infinite type recursion in some cases. We 
      // should find a better solution.
      "@typescript-eslint/ban-ts-comment": "warn",
      // Vue allows optional (undefined) props. No clue why this complains when
      // some prop isn't initialized in `withDefaults`.
      "vue/require-default-prop": "off",
    },
  },
  {
    files: ["app/components/ui/**/*.vue"],
    rules: {
      // Eslint doesn't know about vue's multi-script setup, so it thinks
      // we're importing things not at the top of the file.
      "import/first": "off",
    }
  }
)
