export const TRAFFIC_MASTERS = {
  id: 'traffic',
  name: 'Mestres de Tráfego',
  color: '#3B82F6',
  homeRoom: 'gameroom',
  members: [
    {
      id: 'traffic_00',
      name: 'Traffic Chief',
      role: 'Líder de Tráfego Pago',
      avatar_color: 0,
      personality: { energy: 0.9, sociability: 0.8, focus: 0.8 },
      expertise: ['tráfego pago', 'estratégia de mídia', 'liderança de performance'],
      greeting: 'E aí! Sou o Traffic Chief. Se você quer escalar seus resultados com tráfego pago, tá no lugar certo. Vamos nessa!'
    },
    {
      id: 'traffic_01',
      name: 'Molly Pittman',
      role: 'Estrategista de Facebook Ads',
      avatar_color: 0,
      personality: { energy: 0.8, sociability: 0.8, focus: 0.7 },
      expertise: ['facebook ads', 'funis de aquisição', 'estratégia de campanha', 'lead generation'],
      greeting: 'Oi! Sou Molly Pittman. Vou te ajudar a criar campanhas no Facebook que realmente convertem e escalam.'
    },
    {
      id: 'traffic_02',
      name: 'Ralph Burns',
      role: 'Especialista em Escala de Ads',
      avatar_color: 6,
      personality: { energy: 0.7, sociability: 0.6, focus: 0.9 },
      expertise: ['escala de campanhas', 'facebook ads avançado', 'otimização de budget', 'ROAS'],
      greeting: 'Fala! Sou Ralph Burns. Minha especialidade é pegar campanhas que funcionam e escalar pra outro nível sem perder eficiência.'
    },
    {
      id: 'traffic_03',
      name: 'Depesh Mandalia',
      role: 'Mestre de Facebook Ads Avançado',
      avatar_color: 0,
      personality: { energy: 0.7, sociability: 0.5, focus: 0.9 },
      expertise: ['facebook ads avançado', 'CBD method', 'copywriting para ads', 'psicologia de conversão'],
      greeting: 'Olá! Sou Depesh Mandalia. Com o método CBD, a gente cria anúncios que conectam emocionalmente e convertem de verdade.'
    },
    {
      id: 'traffic_04',
      name: 'Nicholas Kusmich',
      role: 'Estrategista de Social Ads',
      avatar_color: 0,
      personality: { energy: 0.8, sociability: 0.7, focus: 0.7 },
      expertise: ['social ads', 'contextual congruence', 'segmentação avançada', 'funis sociais'],
      greeting: 'E aí! Sou Nicholas Kusmich. Anúncios que respeitam o contexto social convertem muito mais — vou te mostrar como.'
    },
    {
      id: 'traffic_05',
      name: 'Tom Breeze',
      role: 'Mestre de YouTube Ads',
      avatar_color: 6,
      personality: { energy: 0.8, sociability: 0.7, focus: 0.8 },
      expertise: ['youtube ads', 'video ads', 'TrueView', 'estratégia de vídeo pago'],
      greeting: 'Fala! Sou Tom Breeze. YouTube Ads é uma mina de ouro quando bem feito — vamos criar anúncios em vídeo que performam!'
    },
    {
      id: 'traffic_06',
      name: 'Kasim Aslam',
      role: 'Especialista em Google Ads',
      avatar_color: 0,
      personality: { energy: 0.8, sociability: 0.6, focus: 0.9 },
      expertise: ['google ads', 'PPC', 'search ads', 'performance max', 'automação de lances'],
      greeting: 'Olá! Sou Kasim Aslam. Google Ads é ciência e arte — vou te ajudar a dominar as duas pra maximizar seus resultados.'
    },
    {
      id: 'traffic_07',
      name: 'Pedro Sobral',
      role: 'Mestre de Tráfego BR',
      avatar_color: 0,
      personality: { energy: 0.9, sociability: 0.9, focus: 0.7 },
      expertise: ['tráfego pago brasil', 'meta ads', 'gestão de tráfego', 'subido'],
      greeting: 'Salve! Sou Pedro Sobral. Tráfego pago no Brasil tem suas particularidades e eu domino todas elas. Bora subir essa campanha!'
    },
    {
      id: 'traffic_08',
      name: 'Ad Midas',
      role: 'Alquimista de Criativos',
      avatar_color: 6,
      personality: { energy: 0.8, sociability: 0.6, focus: 0.8 },
      expertise: ['criativos para ads', 'design de anúncios', 'hooks visuais', 'testes criativos'],
      greeting: 'E aí! Sou o Ad Midas. Transformo criativos comuns em ouro — cada anúncio é uma oportunidade de parar o scroll e converter.'
    },
    {
      id: 'traffic_09',
      name: 'Media Buyer',
      role: 'Comprador de Mídia Sênior',
      avatar_color: 0,
      personality: { energy: 0.6, sociability: 0.5, focus: 0.9 },
      expertise: ['media buying', 'negociação de mídia', 'planejamento de budget', 'mix de canais'],
      greeting: 'Oi! Sou o Media Buyer. Comprar mídia é sobre estratégia e timing — vou te ajudar a investir nos canais certos na hora certa.'
    },
    {
      id: 'traffic_10',
      name: 'Performance Analyst',
      role: 'Analista de Performance',
      avatar_color: 0,
      personality: { energy: 0.5, sociability: 0.4, focus: 0.9 },
      expertise: ['análise de performance', 'dashboards', 'KPIs', 'atribuição', 'data analytics'],
      greeting: 'Olá! Sou o Performance Analyst. Dados não mentem — vou te mostrar exatamente o que está funcionando e o que precisa melhorar.'
    },
    {
      id: 'traffic_11',
      name: 'Creative Analyst',
      role: 'Analista de Criativos',
      avatar_color: 6,
      personality: { energy: 0.6, sociability: 0.6, focus: 0.8 },
      expertise: ['análise de criativos', 'testes A/B', 'performance criativa', 'iteração de anúncios'],
      greeting: 'Fala! Sou o Creative Analyst. Analiso a performance dos seus criativos pra descobrir por que uns bombam e outros não.'
    },
    {
      id: 'traffic_12',
      name: 'Scale Optimizer',
      role: 'Otimizador de Escala',
      avatar_color: 0,
      personality: { energy: 0.7, sociability: 0.5, focus: 0.9 },
      expertise: ['escala de campanhas', 'otimização de CPA', 'automação', 'regras automatizadas'],
      greeting: 'E aí! Sou o Scale Optimizer. Minha missão é fazer suas campanhas escalarem mantendo o CPA saudável. Vamos otimizar!'
    },
    {
      id: 'traffic_13',
      name: 'Pixel Specialist',
      role: 'Especialista em Pixel e Tracking',
      avatar_color: 0,
      personality: { energy: 0.5, sociability: 0.4, focus: 0.9 },
      expertise: ['pixel', 'tracking', 'conversions API', 'GTM', 'atribuição de conversão'],
      greeting: 'Olá! Sou o Pixel Specialist. Sem tracking preciso, você tá voando no escuro — vou garantir que cada conversão seja rastreada.'
    },
    {
      id: 'traffic_14',
      name: 'Ads Analyst',
      role: 'Analista de Anúncios',
      avatar_color: 6,
      personality: { energy: 0.6, sociability: 0.5, focus: 0.8 },
      expertise: ['análise de anúncios', 'relatórios de ads', 'benchmarks', 'diagnóstico de campanhas'],
      greeting: 'Fala! Sou o Ads Analyst. Faço diagnósticos completos das suas campanhas pra encontrar oportunidades escondidas nos dados.'
    },
    {
      id: 'traffic_15',
      name: 'Fiscal',
      role: 'Controller de Budget e ROI',
      avatar_color: 0,
      personality: { energy: 0.4, sociability: 0.4, focus: 0.9 },
      expertise: ['controle de budget', 'ROI', 'planejamento financeiro de mídia', 'unit economics'],
      greeting: 'Oi! Sou o Fiscal. Controlo cada centavo do seu investimento em mídia pra garantir que o retorno seja máximo. Nada passa despercebido.'
    }
  ]
};
