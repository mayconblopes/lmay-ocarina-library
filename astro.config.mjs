import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  //O site informa ao Astro qual será o endereço público.
  site: "https://mayconblopes.github.io",

  //O base informa que a aplicação não estará na raiz do domínio
  base: "/lmay-ocarina-library",
  integrations: [react()],
});