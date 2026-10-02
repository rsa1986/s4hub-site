<?php
// Recebe o formulário de contato e envia por e-mail (HostGator suporta mail()).
// E-mail que recebe os contatos do formulário.
const DESTINO = 'rodrigo.a@s4hub.com.br';
const REMETENTE = 'site@s4hub.com.br'; // use um e-mail do próprio domínio para não cair em spam

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok' => false]); exit; }
if (!empty($_POST['site'])) { echo json_encode(['ok' => true]); exit; } // honeypot anti-spam

function campo($k, $max = 500) {
  $v = trim((string)($_POST[$k] ?? ''));
  $v = str_replace(["\r", "\n"], ' ', $v);
  return mb_substr($v, 0, $max);
}
$nome = campo('nome', 120);
$empresa = campo('empresa', 120);
$email = filter_var(campo('email', 160), FILTER_VALIDATE_EMAIL);
$telefone = campo('telefone', 40);
$mensagem = mb_substr(trim((string)($_POST['mensagem'] ?? '')), 0, 4000);

if (!$nome || !$email) { http_response_code(422); echo json_encode(['ok' => false, 'erro' => 'Nome e e-mail são obrigatórios.']); exit; }

$assunto = '=?UTF-8?B?' . base64_encode("Novo contato pelo site: $nome") . '?=';
$corpo = "Nome: $nome\nEmpresa: $empresa\nE-mail: $email\nTelefone: $telefone\n\nDesafio:\n$mensagem\n";
$headers = [
  'From: S4 Hub Site <' . REMETENTE . '>',
  'Reply-To: ' . $email,
  'Content-Type: text/plain; charset=UTF-8',
];
$ok = @mail(DESTINO, $assunto, $corpo, implode("\r\n", $headers));
if (!$ok) http_response_code(500);
echo json_encode(['ok' => (bool)$ok]);
