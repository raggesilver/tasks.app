import {
  createMarkdownParser,
  createShikiHighlighter,
  rehypeHighlight,
} from "@nuxtjs/mdc/runtime";
import HtmlLang from "shiki/langs/html.mjs";
import MdcLang from "shiki/langs/mdc.mjs";
import ScssLang from "shiki/langs/scss.mjs";
import TsLang from "shiki/langs/typescript.mjs";
import VueLang from "shiki/langs/vue.mjs";
import YamlLang from "shiki/langs/yaml.mjs";
import RosePineDawn from "shiki/themes/rose-pine-dawn.mjs";
import RosePineMoon from "shiki/themes/rose-pine-moon.mjs";

export default function useMarkdownParser() {
  let parser: Awaited<ReturnType<typeof createMarkdownParser>>;

  const parse = async (markdown: string) => {
    if (!parser) {
      parser = await createMarkdownParser({
        rehype: {
          plugins: {
            highlight: {
              instance: rehypeHighlight,
              options: {
                // Pass in your desired theme(s)
                theme: "rose-pine-dawn",
                // Create the Shiki highlighter
                highlighter: createShikiHighlighter({
                  themes: [RosePineMoon, RosePineDawn],
                  bundledThemes: {
                    "rose-pine-dawn": RosePineDawn,
                    "rose-pine-moon": RosePineMoon,
                  },
                  // Configure the bundled languages
                  bundledLangs: {
                    html: HtmlLang,
                    mdc: MdcLang,
                    vue: VueLang,
                    yml: YamlLang,
                    scss: ScssLang,
                    ts: TsLang,
                    typescript: TsLang,
                  },
                }),
              },
            },
          },
        },
      });
    }
    return parser(markdown);
  };

  return parse;
}
