# S4 Hub: site institucional

Site de página única da S4 Hub (consultoria de Vendas e Marketing). Substitui o WordPress antigo em s4hub.com.br.

## Stack

- **Astro 7** (site estático) + **GSAP / ScrollTrigger** (animações) + **Lenis** (rolagem suave)
- Fontes self-hosted via Fontsource: Bricolage Grotesque (títulos) e Manrope (texto)
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
- Seta e botão magnético só no CTA principal do Hero
- Escala contida: títulos, hub e espaçamentos moderados (token `--section` para o respiro vertical das seções). Evitar voltar a fontes e blocos gigantes
- Clientes aparece conforme `temClientes` em `site.js` (hoje `true`, com os nomes no lugar dos logos que faltam). O e-mail some enquanto for placeholder (`emailDefinido`)

## Motion

Só três momentos animados por rolagem; o resto aparece pronto.

- Hero: linhas do título sobem; o "hub" em SVG tem órbitas girando, pulsos verdes viajando do centro aos 5 módulos e anéis pulsando; parallax leve com o mouse. Cada módulo do hub é um link: o hover acende a ligação e mostra nome + tag, o clique leva ao módulo em Soluções
- Manifesto: as palavras "acendem" conforme a rolagem. Cada linha das frentes leva ao módulo correspondente (`modulo` em `frentes`)
- Método: linha do tempo que se desenha
- Também: marquee que acelera com a velocidade da rolagem; Soluções com rolagem horizontal fixa (pin) no desktop e empilhado no mobile (≤900px); FAQ com acordeão animado
- `prefers-reduced-motion` desliga tudo e mostra o estado final (em Soluções, a faixa vira rolagem horizontal nativa)

## Pendências

- [ ] Logos dos clientes: colocar em `public/img/clientes/` e preencher `clientes` em `src/data/site.js` (`{ nome, logo }`). Cliente sem logo aparece com o nome escrito
- [ ] E-mail de contato: `contato.email` em `site.js` e `DESTINO` em `public/contato.php`. O e-mail só aparece na seção Contato depois de definido
- [ ] Ajuste fino de textos
- [ ] Imagem de compartilhamento (og:image) 1200x630; hoje usa o logo quadrado
- [ ] Testar o formulário no HostGator (o PHP só roda no servidor, não no `npm run dev`)

## Deploy (HostGator)

1. `npm run build`
2. Faça backup e remova o WordPress de `public_html` (ou mova para uma subpasta)
3. Envie o **conteúdo** de `dist/` para `public_html` (Gerenciador de Arquivos do cPanel ou FTP)
4. O DNS já aponta para o HostGator (ns900/ns901.hostgator.com.br)
