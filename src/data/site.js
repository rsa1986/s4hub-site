// Conteúdo central do site. Edite aqui textos de produtos, FAQ e clientes.

export const contato = {
  email: '[SEU E-MAIL DE CONTATO]', // TODO: definir e-mail que recebe os contatos
};

export const frentes = [
  {
    titulo: 'Estruturamos seu comercial do zero',
    texto: 'Mapeamos seu modelo de negócio, definimos ICP, construímos o pitch, criamos os scripts e implementamos seu processo com CRM, cadências e automações.',
  },
  {
    titulo: 'Terceirize seu comercial com segurança',
    texto: 'Atuamos como seu time de vendas: prospectamos, qualificamos e fechamos negócios com base no processo criado.',
  },
  {
    titulo: 'Marketing com propósito e performance',
    texto: 'Campanhas inteligentes para atrair clientes qualificados, gerar leads e transformar sua presença digital em resultado.',
  },
  {
    titulo: 'Presença e planejamento estratégico',
    texto: 'Redes sociais com consistência, conteúdo alinhado ao posicionamento da marca e um plano de marketing realista e acionável.',
  },
];

export const produtos = [
  {
    id: 'go',
    nome: 'S4 Go',
    tag: 'Diagnóstico e Plano de Ação',
    texto: 'Um diagnóstico rápido e estratégico para entender o momento do seu negócio e os próximos passos ideais.',
    visual: 'radar',
    destaque: 'Comece por aqui',
  },
  {
    id: 'impulso',
    nome: 'S4 Impulso',
    tag: 'Estruturação Comercial',
    texto: 'Organizamos seu processo de vendas do zero, com ICP, pitch, CRM e automações.',
    visual: 'pipeline',
  },
  {
    id: 'vendas',
    nome: 'S4 Vendas',
    tag: 'Terceirização Comercial',
    texto: 'Assumimos a gestão da sua operação de vendas, da prospecção ao fechamento, com foco total em performance e resultados reais.',
    visual: 'funil',
  },
  {
    id: 'trafego',
    nome: 'S4 Tráfego',
    tag: 'Marketing de Performance',
    texto: 'Campanhas em Google, Meta e LinkedIn Ads para atrair leads e gerar resultado.',
    visual: 'curva',
  },
  {
    id: 'social',
    nome: 'S4 Social',
    tag: 'Redes Sociais com Constância',
    texto: 'Presença digital alinhada com sua estratégia, com conteúdo e frequência bem definidos.',
    visual: 'grade',
  },
];

export const etapas = [
  { titulo: 'Diagnóstico', texto: 'Entendemos o momento da sua empresa, seus números e seus gargalos em vendas e marketing.' },
  { titulo: 'Plano de ação', texto: 'Indicamos os módulos certos e montamos um plano realista, com prioridades claras.' },
  { titulo: 'Execução', texto: 'Colocamos o plano em prática junto com o seu time ou atuando como ele.' },
];

// Clientes: troque `nome` e adicione `logo: '/img/clientes/arquivo.svg'` quando tiver os arquivos.
export const clientes = Array.from({ length: 10 }, (_, i) => ({ nome: `Cliente ${i + 1}`, logo: null }));

export const parceiros = [
  {
    titulo: 'Tecnologia e cibersegurança',
    pergunta: 'Precisa desenvolver um app ou reforçar sua segurança digital?',
    texto: 'Temos parceiros confiáveis em desenvolvimento, infraestrutura e cibersegurança, prontos para acelerar sua operação com tecnologia.',
  },
  {
    titulo: 'Finanças e ERP',
    pergunta: 'Quer organizar suas finanças ou entender melhor os números?',
    texto: 'Conectamos você ao ERP ideal para o seu porte e modelo de negócio.',
  },
  {
    titulo: 'Contabilidade e fiscal',
    pergunta: 'Dúvidas sobre contabilidade, fiscal ou tributário?',
    texto: 'Já mapeamos os parceiros que entregam bem e com preço justo.',
  },
];

export const faq = [
  { p: 'Como a S4 Hub pode ajudar minha empresa a crescer?', r: 'Com diagnóstico estratégico, estruturação de processos e execução comercial e de marketing orientada a resultados reais.' },
  { p: 'Quais serviços de marketing digital vocês oferecem?', r: 'Criamos campanhas de tráfego pago, otimizamos seu site para conversão e cuidamos da sua presença nas redes com consistência e estratégia.' },
  { p: 'A S4 Hub pode estruturar meu time de vendas?', r: 'Sim. Estruturamos seu comercial do zero e, se quiser, operamos como seu time de vendas terceirizado.' },
  { p: 'Como posso começar a trabalhar com a S4 Hub?', r: 'Comece pelo diagnóstico gratuito. Em poucos minutos entendemos o seu momento e indicamos o plano ideal para o seu crescimento.' },
];
