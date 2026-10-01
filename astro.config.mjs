import { defineConfig } from 'astro/config';

// Site estático: `npm run build` gera a pasta dist/, que vai para o public_html do HostGator.
export default defineConfig({
  site: 'https://s4hub.com.br',
  build: { inlineStylesheets: 'auto' },
});
