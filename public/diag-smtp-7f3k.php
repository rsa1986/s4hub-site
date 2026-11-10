<?php
// TEMPORÁRIO: confere se o servidor consegue abrir conexão com o SMTP da Titan. Não envia nada. Apagar depois.
header('Content-Type: text/plain; charset=utf-8');
foreach ([['ssl://smtp.titan.email', 465], ['tcp://smtp.titan.email', 587]] as [$h, $p]) {
  $t = microtime(true);
  $s = @stream_socket_client("$h:$p", $e, $m, 6);
  $ms = round((microtime(true) - $t) * 1000);
  if (!$s) { echo "$h:$p FALHOU ($m) em {$ms}ms\n"; continue; }
  stream_set_timeout($s, 5);
  echo "$h:$p OK em {$ms}ms: " . trim((string)fgets($s, 512)) . "\n";
  fwrite($s, "QUIT\r\n"); fclose($s);
}
