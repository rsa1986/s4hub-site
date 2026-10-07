<?php
// Recebe o formulário de contato e envia por e-mail (HostGator suporta mail()).
// Proteções: honeypot, tempo mínimo de preenchimento, origem do envio, limite de envios por hora,
// campos de uma linha sem quebras (impede injeção de cabeçalhos) e tamanhos iguais aos do formulário.

const DESTINO = 'rodrigo.a@s4hub.com.br';   // e-mail que recebe os contatos
const REMETENTE = 'site@s4hub.com.br';      // do próprio domínio, para não cair em spam
const ORIGENS = ['s4hub.com.br', 'www.s4hub.com.br'];
const LIMITE_POR_HORA = 5;                  // envios por endereço de origem
const TEMPO_MINIMO_MS = 3000;               // pessoas levam mais que isso para preencher

// Com JavaScript o site espera JSON. Sem JavaScript (form comum), redireciona para uma página de resposta.
$quer_json = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function responder($ok, $status = 200, $erro = '') {
  global $quer_json;
  if ($quer_json) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($erro ? ['ok' => $ok, 'erro' => $erro] : ['ok' => $ok]);
  } else {
    header('Location: ' . ($ok ? '/mensagem-enviada/' : '/mensagem-nao-enviada/'), true, 303);
  }
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') responder(false, 405);

// 1. Origem: só aceita envios feitos a partir do próprio site (quando o navegador informa a origem)
$origem = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
if ($origem !== '') {
  $host = strtolower((string)parse_url($origem, PHP_URL_HOST));
  if (!in_array($host, ORIGENS, true)) responder(false, 403, 'Origem não permitida.');
}

// 2. Robôs: campo isca preenchido, ou envio rápido demais (só medido com JavaScript).
//    Respondemos "ok" para o robô não saber que foi barrado, mas nada é enviado.
if (!empty($_POST['site'])) responder(true);
if ($quer_json && (int)($_POST['decorrido'] ?? 0) < TEMPO_MINIMO_MS) responder(true);

// 3. Limite de envios por hora por endereço (o IP é guardado só como hash, fora da pasta pública)
function dentro_do_limite() {
  $pasta = dirname(__DIR__) . '/.s4hub-contato';
  if (!is_dir($pasta) && !@mkdir($pasta, 0700, true)) $pasta = sys_get_temp_dir();
  $ip = $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';
  $arquivo = $pasta . '/limite-' . hash('sha256', 's4hub|' . $ip) . '.json';
  $agora = time();
  $envios = is_file($arquivo) ? (json_decode((string)@file_get_contents($arquivo), true) ?: []) : [];
  $envios = array_values(array_filter($envios, fn($t) => is_int($t) && $t > $agora - 3600));
  if (count($envios) >= LIMITE_POR_HORA) return false;
  $envios[] = $agora;
  @file_put_contents($arquivo, json_encode($envios), LOCK_EX);
  return true;
}

// 4. Campos: uma linha só (sem \r, \n ou caracteres de controle) e tamanhos iguais aos do formulário
function campo($k, $max) {
  $v = trim((string)($_POST[$k] ?? ''));
  $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
  return mb_substr($v, 0, $max);
}
$nome = campo('nome', 120);
$empresa = campo('empresa', 120);
$email = filter_var(campo('email', 160), FILTER_VALIDATE_EMAIL);
$telefone = campo('telefone', 40);
$mensagem = mb_substr(str_replace("\0", '', trim((string)($_POST['mensagem'] ?? ''))), 0, 4000);

if (!$nome || !$email) responder(false, 422, 'Nome e e-mail são obrigatórios.');
if (!dentro_do_limite()) responder(false, 429, 'Muitos envios seguidos. Aguarde alguns minutos.');

// 5. E-mail em texto puro, com cabeçalhos completos e remetente técnico do domínio (ajuda a não cair em spam)
$assunto = '=?UTF-8?B?' . base64_encode("Novo contato pelo site: $nome") . '?=';
$corpo = "Nome: $nome\nEmpresa: $empresa\nE-mail: $email\nTelefone: $telefone\n\nDesafio:\n$mensagem\n";
$headers = [
  'From: S4 Hub Site <' . REMETENTE . '>',
  'Reply-To: ' . $email,
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
];
$ok = @mail(DESTINO, $assunto, $corpo, implode("\r\n", $headers), '-f' . REMETENTE);
if (!$ok) error_log('[contato.php] mail() falhou ao enviar o formulário');
responder((bool)$ok, $ok ? 200 : 500);
