// Ponte entre o conteúdo do site e os componentes.
// O CONTEÚDO fica em src/content/*.json e é editado pelo painel (Pages CMS, configurado em .pages.yml).
// Aqui só se lê esses arquivos e se calculam as regras que dependem do conteúdo.
import textosJson from '../content/textos.json';
import produtosJson from '../content/produtos.json';
import frentesJson from '../content/frentes.json';
import etapasJson from '../content/etapas.json';
import clientesJson from '../content/clientes.json';
import parceirosJson from '../content/parceiros.json';
import faqJson from '../content/faq.json';

// lista vinda do painel: ignora itens vazios (ex.: um item adicionado e não preenchido)
const lista = (json, campo) => (json?.itens ?? []).filter((item) => item && String(item[campo] ?? '').trim());

export const textos = textosJson;
export const produtos = lista(produtosJson, 'nome');
// `modulo`: id do produto (em `produtos`) para onde a linha do Manifesto leva.
export const frentes = lista(frentesJson, 'titulo');
export const etapas = lista(etapasJson, 'titulo');
// Clientes sem `logo` aparecem com o nome escrito no lugar.
export const clientes = lista(clientesJson, 'nome');
export const parceiros = lista(parceirosJson, 'pergunta');
export const faq = lista(faqJson, 'pergunta');

// E-mail de contato: decisão de não mostrar na página (evitar spam; o formulário é o canal único).
// Enquanto for o placeholder, ele não aparece na seção de contato.
export const contato = { email: '[SEU E-MAIL DE CONTATO]' };
export const emailDefinido = !contato.email.startsWith('[');

// Seções que somem (com o link no menu) quando a lista está vazia.
export const temClientes = clientes.length > 0;
export const temFaq = faq.length > 0;
