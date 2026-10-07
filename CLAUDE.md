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

- `src/content/*.json`: **todo o conteúdo**, editado pelo painel (ver "Como editar o site"): `textos.json` (textos fixos de cada seção, SEO, rodapé), `produtos`, `frentes`, `etapas`, `clientes`, `parceiros`, `faq`
- `src/data/site.js`: ponte entre o conteúdo e os componentes. Lê os JSON, ignora itens vazios e calcula as regras (`temClientes`, `temFaq`, `emailDefinido`). Não guarda texto
- `.pages.yml`: configuração do painel (Pages CMS): uma tela por arquivo de conteúdo, com rótulos e validações em português
- `public/img/clientes/`: logos dos clientes enviados pelo painel
- `src/components/`: uma seção por arquivo, na ordem da página: Header, Hero, Marquee, Manifesto, Solucoes, Metodo, Clientes, Parceiros, Faq, Contato, Footer. `MiniHub.astro` é a versão reduzida do hub, usada em Soluções
- `src/data/hub.js`: posições dos módulos no hub, calculadas pelo número de produtos (o 1º no topo, os demais distribuídos no círculo); compartilhadas pelo Hero e pelos mini-hubs. Nomes longos quebram em duas linhas no hub, mas o ideal é nome curto (até ~12 letras)
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
- Seções que dependem de conteúdo se ajustam sozinhas: Clientes e FAQ (e seus links no menu) somem se a lista estiver vazia (`temClientes`, `temFaq`); com menos de 6 clientes a faixa fica parada; o Método tem uma coluna por etapa; uma frente cujo `modulo` não existe em `produtos` **para o build** com mensagem clara. O e-mail some enquanto for placeholder (`emailDefinido`)
- Logos de clientes: em silhueta branca e com área visual equilibrada (calculada no build pela proporção). Arquivo inexistente vira o nome do cliente (com aviso no terminal). Pedir logos **horizontais, SVG ou PNG com fundo transparente** (com fundo, viram um bloco branco)

## Usabilidade e acessibilidade

Revisado com a skill ui-ux-pro-max. Manter:

- Contraste: texto ≥ 4,5:1; contornos, bordas e linhas de campo ≥ 3:1. Foco do teclado é navy nas seções claras e verde nas escuras (`.dark`, header)
- Alvos de toque ≥ 44px no celular; textos ≥ 14px (descrições 15px+)
- Formulário: obrigatórios primeiro e marcados no rótulo; erro escrito abaixo de cada campo (`aria-invalid`, rótulo e linha em coral); foco no primeiro campo errado; botão travado com "Enviando..."; limite de 15s; `maxlength` igual ao `contato.php`; rascunho salvo na aba (sessionStorage); sucesso troca o formulário por um painel com o hub inteiro aceso; falha mantém os dados e o botão vira "Tentar de novo"
- Celular: botão "Diagnóstico gratuito" compacto no header (só "Diagnóstico" abaixo de 360px); menu abre com fundo escurecido (tocar fecha) e trava a rolagem da página
- Toque (revisão mobile-native, 04/10/2026): sem a mancha de toque do navegador; `touch-action: manipulation` em links e botões; rótulos de controles não são selecionáveis ao segurar o dedo; todo `:hover` (inclusive módulos do hub e rodapé) só com mouse, com `:active` para o toque; no formulário, a tecla "Próximo" pula para o campo seguinte
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

- [ ] Logos dos clientes: pelo painel, tela "Clientes (logos)" (ou em `public/img/clientes/` + `src/content/clientes.json`). Cliente sem logo aparece com o nome escrito
- [x] E-mail que recebe o formulário: `DESTINO` em `public/contato.php` = rodrigo.a@s4hub.com.br
- E-mail **não** aparece na página (decisão: evitar spam; o formulário é o canal único). Por isso `contato.email` em `src/data/site.js` fica com o placeholder (não está no painel de propósito)
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
- [x] **Desempenho e SEO** (Lighthouse no Edge, 04/10/2026, v5): celular 98 / 97 / 100 / 100, desktop 100 / 97 / 100 / 100. O único ponto em acessibilidade são as palavras apagadas do Manifesto antes de acenderem (trade-off aceito)
- [x] **Testes finais de regressão** (04/10/2026, v5): 38/38 no navegador (erros, links, rolagem lateral em 6 larguras, toque, teclado, menu, formulário completo, hub, movimento reduzido, sem JS), dados extremos 9/9, detector Impeccable limpo. Roteiro em `final.mjs` (pasta temporária da sessão; pedir para recriar se necessário)

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

## Como editar o site (painel)

Painel: **Pages CMS** (https://app.pagescms.org), entrando com o GitHub do Rodrigo. Cada tela edita um arquivo de `src/content/`; salvar no painel cria um commit no GitHub, e a publicação automática gera o site e envia ao HostGator.

- Telas: Textos gerais, Clientes (logos), Módulos, Frentes, Etapas, Parceiros, Dúvidas (FAQ)
- Rede de segurança: se uma alteração quebrar o build (ex.: frente apontando para um módulo inexistente), o site **não é publicado** e o que está no ar continua igual
- Fica fora do painel, de propósito: layout, cores, animações, rótulos do formulário e o e-mail de destino (`public/contato.php`)
- Repositório: https://github.com/rsa1986/s4hub-site (privado)
- Publicação automática: `.github/workflows/publicar.yml`. A cada push na `main` gera o site e confere; **só envia por FTP se a variável `PUBLICAR` = `sim`** (ligar no dia do go-live). Segredos `FTP_SERVIDOR`, `FTP_USUARIO`, `FTP_SENHA`; variáveis opcionais `FTP_PASTA` (padrão `/public_html/`) e `FTP_PROTOCOLO` (padrão `ftps`). Envios em fila, nunca simultâneos; build quebrado não publica
- **Antes de editar o projeto localmente: `git pull`.** O conteúdo também muda pelo painel (commits "via Pages CMS" no GitHub); sem puxar antes, há risco de sobrescrever edições do painel
- Implantação em etapas: [x] 1. conteúdo em `src/content/` + `.pages.yml` (04/10/2026) · [x] 2. repositório privado no GitHub · [x] 3. automação criada (envio desligado; falta cadastrar os segredos de FTP e ligar `PUBLICAR` no go-live) · [x] 4. Pages CMS ativado e testado: o "Save" no painel virou commit no GitHub e o site gerou certo (04/10/2026)
- Actions conferido (06/10/2026): roda a cada push e a cada "Save" do painel, ~15s, termina em "site gerado e conferido, mas NÃO enviado" enquanto `PUBLICAR` estiver desligada. Ações nas versões atuais (checkout v7, setup-node v7, FTP-Deploy-Action v4.4.0)
- GitHub CLI instalado e logado (`"C:Program FilesGitHub CLIgh.exe"`): permite ver execuções (`gh run list -R rsa1986/s4hub-site`) e cadastrar segredos com `gh secret set` (a senha é digitada pelo Rodrigo no terminal)
