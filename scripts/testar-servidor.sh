#!/usr/bin/env bash
# Testa o site gerado (dist/) num Apache + PHP parecido com o do HostGator, antes de publicar.
# Roda na automação do GitHub (.github/workflows/publicar.yml). Qualquer falha impede a publicação.
# Confere: páginas, 404, redirecionamentos do WordPress antigo, https/www, bloqueios, cache,
# cabeçalhos de segurança e todas as proteções do formulário (contato.php).
set -uo pipefail

DIST="$(cd "$(dirname "$0")/../dist" && pwd)"
falhas=0
ok()   { echo "  ✓ $1"; }
erro() { echo "  ✗ $1"; falhas=$((falhas + 1)); }

echo "== Preparando Apache + PHP servindo $DIST"
sudo apt-get update -qq >/dev/null
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq apache2 libapache2-mod-php >/dev/null
sudo a2enmod -q rewrite headers deflate >/dev/null
sudo tee /etc/apache2/sites-available/000-default.conf >/dev/null <<EOF
<VirtualHost *:80>
  DocumentRoot $DIST
  <Directory $DIST>
    AllowOverride All
    Require all granted
  </Directory>
</VirtualHost>
EOF
# o Apache precisa conseguir atravessar as pastas até o dist
p="$DIST"; while [ "$p" != "/" ]; do sudo chmod o+x "$p"; p="$(dirname "$p")"; done
echo "{}" > "$DIST/.ftp-deploy-sync-state.json"   # simula o registro da publicação automática
sudo apachectl configtest
sudo systemctl restart apache2

# requisições como se fossem https://s4hub.com.br (o teste roda em http local)
URL="http://127.0.0.1"
H=(-H "Host: s4hub.com.br" -H "X-Forwarded-Proto: https")
status()   { curl -s -o /dev/null -w "%{http_code}" "${H[@]}" "$@"; }
destino()  { curl -s -o /dev/null -w "%{redirect_url}" "${H[@]}" "$@"; }
cabecalho(){ curl -s -D - -o /dev/null "${H[@]}" "$1" | tr -d '\r' | grep -i "^$2:" | head -1; }

echo "== Páginas"
[ "$(status $URL/)" = 200 ] && ok "home" || erro "home não respondeu 200"
[ "$(status $URL/privacidade/)" = 200 ] && ok "/privacidade/" || erro "/privacidade/ não respondeu 200"
[ "$(status $URL/endereco-que-nao-existe)" = 404 ] && ok "endereço inexistente dá 404" || erro "inexistente não deu 404"
curl -s "${H[@]}" $URL/endereco-que-nao-existe | grep -q "Esta página não existe" && ok "404 usa a página do site" || erro "404 não mostra a página do site"

echo "== Redirecionamentos"
for caminho in /hello-world/ /category/uncategorized/ /author/admin-s4hub/ /feed/; do
  [ "$(status $URL$caminho)" = 301 ] && [ "$(destino $URL$caminho)" = "https://s4hub.com.br/" ] && ok "$caminho → home" || erro "$caminho não redireciona para a home"
done
[ "$(destino $URL/sitemap_index.xml)" = "https://s4hub.com.br/sitemap.xml" ] && ok "sitemap antigo → sitemap.xml" || erro "sitemap antigo não redireciona"
[ "$(curl -s -o /dev/null -w "%{redirect_url}" -H "Host: s4hub.com.br" $URL/privacidade/)" = "https://s4hub.com.br/privacidade/" ] && ok "http → https" || erro "http não vai para https"
[ "$(curl -s -o /dev/null -w "%{redirect_url}" -H "Host: www.s4hub.com.br" -H "X-Forwarded-Proto: https" $URL/)" = "https://s4hub.com.br/" ] && ok "www → sem www" || erro "www não redireciona"

echo "== Bloqueios"
[ "$(status $URL/wp-antigo/)" = 403 ] && ok "/wp-antigo/ bloqueado" || erro "/wp-antigo/ acessível"
[ "$(status $URL/.ftp-deploy-sync-state.json)" = 403 ] && ok "arquivo oculto bloqueado" || erro "arquivo oculto acessível"
[ "$(status $URL/.htaccess)" = 403 ] && ok ".htaccess bloqueado" || erro ".htaccess acessível"

echo "== Cache e segurança"
js="$(cd "$DIST" && ls _astro/*.js | head -1)"
cabecalho "$URL/$js" cache-control | grep -q immutable && ok "arquivos de /_astro/ com cache longo" || erro "/_astro/ sem cache longo"
cabecalho "$URL/" cache-control | grep -q no-cache && ok "HTML sempre conferido (no-cache)" || erro "HTML com cache"
cabecalho "$URL/" x-content-type-options | grep -q nosniff && ok "cabeçalhos de segurança" || erro "faltam cabeçalhos de segurança"

echo "== Formulário (contato.php)"
J=(-H "Accept: application/json" -H "Origin: https://s4hub.com.br")
campos=(--data-urlencode "nome=Maria Teste" --data-urlencode "email=maria@example.com" --data-urlencode "decorrido=5000")
curl -s -D - -o /dev/null "${H[@]}" $URL/contato.php | tr -d '\r' | grep -qi "^location: /#contato$" && ok "abrir contato.php direto volta ao formulário" || erro "GET em contato.php não volta ao formulário"
[ "$(status -X POST -H "Accept: application/json" -H "Origin: https://site-estranho.example" "${campos[@]}" $URL/contato.php)" = 403 ] && ok "origem de outro site recusada (403)" || erro "origem estranha aceita"
r="$(curl -s "${H[@]}" "${J[@]}" "${campos[@]}" --data-urlencode "site=spam" $URL/contato.php)"
[ "$r" = '{"ok":true}' ] && ok "isca (honeypot): robô recebe ok falso" || erro "honeypot: resposta $r"
r="$(curl -s "${H[@]}" "${J[@]}" --data-urlencode "nome=Bot" --data-urlencode "email=bot@example.com" --data-urlencode "decorrido=200" $URL/contato.php)"
[ "$r" = '{"ok":true}' ] && ok "envio rápido demais: robô recebe ok falso" || erro "tempo mínimo: resposta $r"
[ "$(status "${J[@]}" --data-urlencode "nome=" --data-urlencode "email=x@example.com" --data-urlencode "decorrido=5000" $URL/contato.php)" = 422 ] && ok "nome vazio recusado (422)" || erro "nome vazio aceito"
# envios válidos: aqui o e-mail falha de propósito (sem servidor de e-mail), o que conta é o limite
for i in 1 2 3 4 5; do status "${J[@]}" "${campos[@]}" --data-urlencode "nome=Maria $(printf 'X\r\nBcc: invasor@example.com')" $URL/contato.php >/dev/null; done
[ "$(status "${J[@]}" "${campos[@]}" $URL/contato.php)" = 429 ] && ok "6º envio na mesma hora recusado (429)" || erro "limite de envios não funcionou"
curl -s -D - -o /dev/null "${H[@]}" -H "Origin: https://s4hub.com.br" --data-urlencode "site=x" $URL/contato.php | tr -d '\r' | grep -qi "^location: /mensagem-enviada/$" && ok "sem JavaScript: vai para a página de confirmação" || erro "sem JavaScript não redireciona"
[ "$(status $URL/mensagem-enviada/)" = 200 ] && [ "$(status $URL/mensagem-nao-enviada/)" = 200 ] && ok "páginas de resposta existem" || erro "páginas de resposta faltando"

rm -f "$DIST/.ftp-deploy-sync-state.json"
sudo tail -n 5 /var/log/apache2/error.log | grep -v "contato.php\] mail() falhou" | grep -iE "error|alert" && erro "erros no log do Apache" || ok "log do Apache sem erros"

echo
if [ "$falhas" -gt 0 ]; then echo "FALHOU: $falhas verificação(ões). O site NÃO será publicado."; exit 1; fi
echo "Tudo certo: o site pode ser publicado."
