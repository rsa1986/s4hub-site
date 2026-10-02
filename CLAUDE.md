# S4 Hub: site institucional

Site de página única da S4 Hub (consultoria de Vendas e Marketing). Substitui o WordPress antigo em s4hub.com.br.

## Stack

- **Astro 7** (site estático) + **GSAP / ScrollTrigger** (animações) + **Lenis** (rolagem suave)
- Fontes self-hosted via Fontsource: Bricolage Grotesque (títulos, arquivo `wdth.css`: eixos de peso e largura) e Manrope (texto)
- CSS embutido no HTML no build (`inlineStylesheets: always`), para não bloquear a primeira pintura
- Formulário: `public/contato.php`, que envia o e-mail com `mail()` do HostGator

## Comandos

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/
npm run preview  # serve o dist/
```

## Estrutura

- `src/data/site.js`: **todo o conteúdo** (produtos, frentes, etapas, clientes, parceiros, FAQ, e-mail). Edite os textos aqui.
- `src/components/`: uma seção por arquivo, na ordem da página: Header, Hero, Marquee, Manifesto, Solucoes, Metodo, Clientes, Parceiros, Faq, Contato, Footer. `MiniHub.astro` é a versão reduzida do hub, usada em Soluções
- `src/data/hub.js`: posições dos 5 módulos no hub (compartilhadas pelo Hero e pelos mini-hubs)
- `src/scripts/motion.js`: todas as animações, organizadas por seção
- `src/styles/global.css`: tokens (cores, fontes), botões e utilitários
- `public/img/`: logos (variações para fundo escuro e claro, com fundo transparente)
- `.impeccable/critique/`: relatórios da crítica da skill Impeccable (local, fora do git). O mais recente: `2026-10-02T18-47-20Z__src-pages-index-astro.md` (nota 22/32). Use para comparar quando rodar `/impeccable critique` de novo
- `src/assets/logo-h-dark.png`: cópia do logo usada no header e no rodapé via `<Image>` do Astro, que gera WebP no tamanho exibido (troque aqui se o logo mudar)

## Identidade

Cores tiradas do logo, definidas como tokens em `global.css`:

- `--navy #00214E`: fundo principal escuro
- `--green #00E451`: o "S" do logo, usado em botões e destaques
- `--teal #34AF80`: o "4" do logo, usado em detalhes
- `--teal-ink #1B7A58`: verde para texto sobre fundo claro (contraste AA)
- `--paper #F2F4F1`: fundo claro

Direção visual: editorial, assimétrica e tipografia grande, com movimento sutil. **Evitar a cara de template de IA**: nada de grades de cards todos iguais com ícone num quadrado, etiquetas em fonte mono tipo "// SEÇÃO", gradientes chapados de fundo ou emojis.

Regras da revisão de design (v2):

- **O hub é a assinatura**: ele aparece no Hero e volta como mini-hub em cada módulo de Soluções. A ousadia fica nele; o resto da página é quieto
- Sem rótulo/kicker acima dos títulos e sem palavra destacada em outra cor dentro do título
- Verde reservado para ação (botões) e para o hub
- Títulos grandes (`.h-xl`, `.h-lg`) usam a Bricolage condensada (`--condensed`); os médios ficam na largura normal
- Numeração só onde há sequência real (etapas do Método)
- Fundos: só navy e paper. Linhas divisórias em blocos `.wrap` usam a classe `.rule-top`
- Hero com uma só ação forte: "Quero meu diagnóstico" é o único botão (magnético, sem seta "→"); "Ver as soluções" é link de texto. Nada de botão cheio + botão de contorno lado a lado
- Quebra de linha: `text-wrap: balance` em títulos e `pretty` em textos (sem palavra sozinha na última linha). Respiro das seções: `--section` em cima e `--section-end`, um pouco maior, embaixo
- FAQ é uma lista aberta (perguntas e respostas visíveis), sem acordeão: são poucas perguntas com respostas curtas. Se o FAQ crescer muito, reavaliar
- Escala contida: títulos, hub e espaçamentos moderados (token `--section` para o respiro vertical das seções). Evitar voltar a fontes e blocos gigantes
- Clientes aparece conforme `temClientes` em `site.js` (hoje `true`, com os nomes no lugar dos logos que faltam). O e-mail some enquanto for placeholder (`emailDefinido`)

## Usabilidade e acessibilidade

Revisado com a skill ui-ux-pro-max. Manter:

- Contraste: texto ≥ 4,5:1; contornos, bordas e linhas de campo ≥ 3:1. Foco do teclado é navy nas seções claras e verde nas escuras (`.dark`, header)
- Alvos de toque ≥ 44px no celular; textos ≥ 14px (descrições 15px+)
- Formulário: obrigatórios primeiro e marcados no rótulo; erro escrito abaixo de cada campo (`aria-invalid`, rótulo e linha em coral); foco no primeiro campo errado; botão travado com "Enviando..."; limite de 15s; `maxlength` igual ao `contato.php`; rascunho salvo na aba (sessionStorage); sucesso troca o formulário por um painel com o hub inteiro aceso; falha mantém os dados e o botão vira "Tentar de novo"
- Celular: botão "Diagnóstico gratuito" compacto no header; menu abre com fundo escurecido (tocar fecha)
- Menu mobile fecha com Esc e troca o rótulo para "Fechar menu"
- Marquees pausam com o mouse em cima ou com foco; link "Pular para o conteúdo" é o primeiro Tab

## Motion

Só três momentos animados por rolagem; o resto aparece pronto.

- Hero: linhas do título sobem; o "hub" em SVG tem órbitas lentas, pulsos verdes viajando do centro aos 5 módulos e anéis espaçados (a cada ~7s); parallax leve com o mouse. Os módulos **não se mexem** (são links). Todas as animações do hub pausam quando o hero sai da tela. Cada módulo é um link: o hover acende a ligação e mostra nome + tag (no toque, uma legenda fixa embaixo do hub), o clique leva ao módulo em Soluções
- Manifesto: as palavras "acendem" conforme a rolagem. Cada linha das frentes leva ao módulo correspondente (`modulo` em `frentes`)
- Método: linha do tempo que se desenha
- Também: marquee que acelera com a velocidade da rolagem; Soluções com rolagem horizontal fixa (pin) no desktop e empilhado no mobile (≤900px)
- `prefers-reduced-motion` desliga o movimento e mostra o estado final, mas mantém transições de cor e opacidade (em Soluções, a faixa vira rolagem horizontal nativa)
- Ritmo (revisão Emil Kowalski, 02/10/2026): interface ≤ 300ms (hover 250ms, resposta a clique ~200ms, FAQ 300ms); nada nasce de `scale(0)`; hovers com movimento só em `@media (hover: hover) and (pointer: fine)`; botões têm `scale: 0.97` no clique; nunca animar `font-size`/layout

## Pendências

- [ ] Logos dos clientes: colocar em `public/img/clientes/` e preencher `clientes` em `src/data/site.js` (`{ nome, logo }`). Cliente sem logo aparece com o nome escrito
- [x] E-mail que recebe o formulário: `DESTINO` em `public/contato.php` = rodrigo.a@s4hub.com.br
- E-mail **não** aparece na página (decisão: evitar spam; o formulário é o canal único). Por isso `contato.email` em `site.js` fica com o placeholder
- [ ] Ajuste fino de textos. Da crítica Impeccable (02/10/2026): Manifesto como problemas do leitor (hoje repete Soluções e não inclui o S4 Go), um elemento de prova (caso com número ou fundador), linha "para quem é" no hero, jargão (ICP, pitch, cadências), frase do rodapé, um único texto para os botões de diagnóstico e a decisão sobre o marquee (repete os módulos)

## Checklist para pôr o site no ar

Fazer depois que o design estiver aprovado. Logos de clientes, e-mails e ajuste de textos ficam para o final.

**Impede a publicação**

- [ ] **Oferta: "diagnóstico gratuito" x produto S4 Go** (crítica Impeccable, P1): decidir se o S4 Go é o diagnóstico gratuito ou se a conversa grátis vem antes; depois, uma linha de garantia junto ao formulário (gratuito, sem compromisso, prazo de resposta). Decidir no final, com os textos
- [ ] **Clientes com nomes de exemplo** ("Cliente 1…10"): ou entram nomes/logos reais, ou a seção é ocultada (`temClientes = false` em `site.js`) até o material chegar. Aguardando decisão
- [ ] **Segurança do formulário** (`/security-review`): `contato.php` já remove quebras de linha, valida e-mail e tem honeypot; falta limite de envios e revisão formal
- [ ] **Política de privacidade (LGPD)**: o formulário coleta nome, e-mail e telefone. Página de privacidade + link no rodapé + frase curta junto ao botão de enviar (texto padrão para a empresa revisar)

**Recomendado antes de publicar**

- [ ] **og:image** 1200x630 a partir do hub, nas cores do site (substitui `og-square.png` em `Base.astro`)
- [ ] **Redirecionamentos do WordPress antigo**: `.htaccess` levando URLs antigas (ex.: `/contato`, `/servicos`) para a página nova + página 404 no visual do site
- [ ] **Analytics** (GA4 / Tag Manager / Meta Pixel): perguntar se o WordPress antigo tinha códigos, para não perder histórico. Com rastreamento, a LGPD exige também aviso de cookies. Aguardando resposta
- [ ] **Revisão de código** (`/code-review`): `motion.js` e componentes (opcional)
- [ ] **Prévia pública na Vercel** (opcional): link temporário para aprovação antes de mexer no HostGator (o formulário não funciona lá, só o visual)
- [x] **Desempenho e SEO** (Lighthouse no Edge, 01/10/2026): celular 98 / 96 / 100 / 100, desktop 100 / 96 / 100 / 100. Os 96 de acessibilidade vêm das palavras apagadas do Manifesto antes de acenderem (trade-off aceito)

**No dia da publicação** (passos em "Deploy" abaixo)

- [ ] Commit das mudanças pendentes, `npm run build`, backup do WordPress
- [ ] Enviar `dist/` para `public_html` (acesso ao cPanel é do Rodrigo)
- [ ] Testar o formulário de verdade (envio para rodrigo.a@s4hub.com.br) e conferir https (cadeado). Se o HostGator exigir caixa real como remetente, ajustar `REMETENTE` em `contato.php`
- [ ] Rodar o Lighthouse de novo no domínio real
- [ ] Remover a cópia de comparação da v1: `git worktree remove ../s4hub-v1`

## Deploy (HostGator)

1. `npm run build`
2. Faça backup e remova o WordPress de `public_html` (ou mova para uma subpasta)
3. Envie o **conteúdo** de `dist/` para `public_html` (Gerenciador de Arquivos do cPanel ou FTP)
4. O DNS já aponta para o HostGator (ns900/ns901.hostgator.com.br)
