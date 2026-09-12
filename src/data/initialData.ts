import { ConfigFinancas, CalculoFinancas, Gasto } from '../types';

export const STORAGE_KEY = 'orcamento:v3';

export const CONFIG_PADRAO: ConfigFinancas = {
  renda: 7903,
  meta: 1000,
  saldoConta: 5678.79,
  faturaAberta: 5018.13,
  diaFechamento: 30,
  ticketIfood: 111.87,
  divideIfood: 50,
  disco: { preco: 200, frete: 200, imposto: 90, porRemessa: 3 },
  contas: [
    { id: 'c1', nome: 'Condomínio', valor: 510.50 },
    { id: 'c2', nome: 'Luz (Neoenergia)', valor: 329 },
    { id: 'c3', nome: 'Vivo', valor: 152 },
    { id: 'c4', nome: 'Claro celular', valor: 49.91 },
    { id: 'c5', nome: 'DAS / Receita', valor: 86.05 },
    { id: 'c6', nome: 'Seguro cartão', valor: 9.90 }
  ],
  parcelas: [
    { id: 'p1', nome: 'Academia Vasco', valor: 253.49, restantes: 5 },
    { id: 'p2', nome: 'Globoplay', valor: 22.90, restantes: 4 },
    { id: 'p3', nome: 'Nuv*Fanatik', valor: 162.37, restantes: 5 },
    { id: 'p4', nome: 'Gol Linhas', valor: 327.42, restantes: 1 },
    { id: 'p5', nome: 'RD Saúde', valor: 333, restantes: 2 }
  ],
  assinaturas: [
    { id: 'a1', nome: 'Google One', valor: 119.98 },
    { id: 'a2', nome: 'Apple', valor: 118 },
    { id: 'a4', nome: 'HBO Max', valor: 22.45 },
    { id: 'a5', nome: 'iFood Clube', valor: 12.90 },
    { id: 'a6', nome: 'Amazon Prime (anual ÷ 12)', valor: 13.90 }
  ],
  categorias: [
    { id: 'k1', nome: 'Delivery', hist: 485, teto: 340, cor: '#EA580C', icone: 'Utensils' },
    { id: 'k2', nome: 'Restaurante e bar', hist: 831, teto: 700, cor: '#D97706', icone: 'Beer' },
    { id: 'k3', nome: 'Mercado', hist: 1089, teto: 1000, cor: '#16A34A', icone: 'ShoppingCart' },
    { id: 'k4', nome: 'Discos e importação', hist: 1400, teto: 500, anual: true, cor: '#7C3AED', icone: 'Disc' },
    { id: 'k5', nome: 'Transporte', hist: 394, teto: 350, cor: '#0284C7', icone: 'Car' },
    { id: 'k6', nome: 'Saúde', hist: 375, teto: 330, cor: '#059669', icone: 'HeartPulse' },
    { id: 'k7', nome: 'Vestuário', hist: 342, teto: 250, cor: '#DB2777', icone: 'Shirt' },
    { id: 'k8', nome: 'Lazer', hist: 192, teto: 180, cor: '#4F46E5', icone: 'Ticket' },
    { id: 'k9', nome: 'Outros', hist: 692, teto: 729, cor: '#64748B', icone: 'Package' }
  ]
};

export const GASTOS_INICIAIS: Gasto[] = [
  {
    id: 'g-demo-1',
    mes: `${new Date().getFullYear()}-${new Date().getMonth()}`,
    ano: new Date().getFullYear(),
    dia: Math.max(1, new Date().getDate() - 2),
    cat: 'Mercado',
    valor: 184.60,
    descricao: 'Supermercado da semana',
    criadoEm: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'g-demo-2',
    mes: `${new Date().getFullYear()}-${new Date().getMonth()}`,
    ano: new Date().getFullYear(),
    dia: Math.max(1, new Date().getDate() - 1),
    cat: 'Delivery',
    valor: 58.90,
    descricao: 'Jantar japonês',
    criadoEm: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'g-demo-3',
    mes: `${new Date().getFullYear()}-${new Date().getMonth()}`,
    ano: new Date().getFullYear(),
    dia: new Date().getDate(),
    cat: 'Transporte',
    valor: 26.50,
    descricao: 'Uber volta do trabalho',
    criadoEm: new Date().toISOString()
  }
];

export function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(n) ? n : 0);
}

export function formatPercent(n: number): string {
  const rounded = Math.round(n * 100);
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
}

export function getMesChave(date: Date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function getDiasNoMes(date: Date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function calcularFinancas(cfg: ConfigFinancas, gastos: Gasto[], refDate: Date = new Date()): CalculoFinancas {
  const soma = (a: { valor?: number }[]) => a.reduce((s, x) => s + (Number(x.valor) || 0), 0);
  const somaChave = (a: any[], k: string) => a.reduce((s, x) => s + (Number(x[k]) || 0), 0);

  const contas = soma(cfg.contas);
  const parcelas = soma(cfg.parcelas);
  const assin = soma(cfg.assinaturas);
  const fixos = contas + parcelas + assin;
  const verba = cfg.renda - cfg.meta - fixos;
  const tetos = somaChave(cfg.categorias, 'teto');

  const mesChave = getMesChave(refDate);
  const ano = refDate.getFullYear();
  const diaAtual = refDate.getDate();
  const diasNoMes = getDiasNoMes(refDate);

  const doMes = gastos.filter(g => g.mes === mesChave);
  const gastoMes = doMes.reduce((s, g) => s + g.valor, 0);

  const porCat: Record<string, { mes: number; anoTodo: number }> = {};
  cfg.categorias.forEach(c => {
    porCat[c.nome] = {
      mes: doMes.filter(g => g.cat === c.nome).reduce((s, g) => s + g.valor, 0),
      anoTodo: gastos.filter(g => g.ano === ano && g.cat === c.nome).reduce((s, g) => s + g.valor, 0),
    };
  });

  const fech = Math.min(cfg.diaFechamento || diasNoMes, diasNoMes);
  const diasRestantes = Math.max(1, fech - diaAtual + 1);
  const folgaCrua = cfg.saldoConta - cfg.faturaAberta;
  const folgaComMeta = folgaCrua - contas - cfg.meta;
  const cobertura = cfg.faturaAberta > 0 ? cfg.saldoConta / cfg.faturaAberta : 2;

  const dk = cfg.disco;
  const porRemessa = Math.max(1, Number(dk.porRemessa) || 1);
  const valorRemessa = dk.preco * porRemessa + dk.frete;
  const custoRemessa = valorRemessa * (1 + (Number(dk.imposto) || 0) / 100);
  const custoDisco = custoRemessa / porRemessa;
  const cd = cfg.categorias.find(c => c.nome === 'Discos e importação');
  const reservaDisco = cd ? (cd.anual ? cd.teto * 12 : cd.teto) : 0;
  const gastoDisco = cd ? ((cd.anual ? porCat[cd.nome]?.anoTodo : porCat[cd.nome]?.mes) || 0) : 0;
  const remessasAno = custoRemessa > 0 ? reservaDisco / custoRemessa : 0;

  const custoIfood = cfg.ticketIfood * (1 - cfg.divideIfood / 100);
  const tetoDel = (cfg.categorias.find(c => c.nome === 'Delivery') || { teto: 0 }).teto || 0;

  return {
    contas,
    parcelas,
    assin,
    fixos,
    verba,
    tetos,
    sobra: verba - tetos,
    gastoMes,
    porCat,
    fech,
    diasRestantes,
    folgaCrua,
    folgaComMeta,
    cobertura,
    porDia: folgaComMeta / diasRestantes,
    porDiaCru: folgaCrua / diasRestantes,
    histTotal: somaChave(cfg.categorias, 'hist'),
    valorRemessa,
    custoRemessa,
    custoDisco,
    reservaDisco,
    gastoDisco,
    porRemessa,
    remessasAno,
    discosAno: remessasAno * porRemessa,
    meses: remessasAno > 0 ? 12 / remessasAno : 0,
    discosRest: custoDisco > 0 ? (reservaDisco - gastoDisco) / custoDisco : 0,
    anualDisco: Boolean(cd && cd.anual),
    custoIfood,
    pedidos: custoIfood > 0 ? tetoDel / custoIfood : 0,
    tetoDel,
  };
}

export function loadSavedData(): { cfg: ConfigFinancas; gastos: Gasto[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        cfg: { ...CONFIG_PADRAO, ...(parsed.cfg || {}) },
        gastos: Array.isArray(parsed.gastos) ? parsed.gastos : GASTOS_INICIAIS,
      };
    }
  } catch (e) {
    console.error('Falha ao carregar dados salvos', e);
  }
  return { cfg: CONFIG_PADRAO, gastos: GASTOS_INICIAIS };
}

export function saveLocalData(cfg: ConfigFinancas, gastos: Gasto[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cfg, gastos }));
  } catch (e) {
    console.error('Falha ao salvar dados no localStorage', e);
  }
}
