import { defineConfig } from 'astro/config';

// Site estático: `npm run build` gera a pasta dist/, que vai para o public_html do HostGator.
export default defineConfig({
  site: 'https://s4hub.com.br',
  // CSS embutido no HTML: o navegador não espera um arquivo .css antes de pintar a página
  build: { inlineStylesheets: 'always' },
});
