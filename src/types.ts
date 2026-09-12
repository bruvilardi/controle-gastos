export interface ItemFixo {
  id: string;
  nome: string;
  valor: number;
  restantes?: number;
}

export interface Categoria {
  id: string;
  nome: string;
  hist: number;
  teto: number;
  anual?: boolean;
  cor?: string;
  icone?: string;
}

export interface DiscoConfig {
  preco: number;
  frete: number;
  imposto: number;
  porRemessa: number;
}

export interface Gasto {
  id: string;
  mes: string;
  ano: number;
  dia: number;
  cat: string;
  valor: number;
  descricao?: string;
  criadoEm?: string;
}

export interface ConfigFinancas {
  renda: number;
  meta: number;
  saldoConta: number;
  faturaAberta: number;
  diaFechamento: number;
  ticketIfood: number;
  divideIfood: number;
  disco: DiscoConfig;
  contas: ItemFixo[];
  parcelas: ItemFixo[];
  assinaturas: ItemFixo[];
  categorias: Categoria[];
}

export interface CalculoFinancas {
  contas: number;
  parcelas: number;
  assin: number;
  fixos: number;
  verba: number;
  tetos: number;
  sobra: number;
  gastoMes: number;
  porCat: Record<string, { mes: number; anoTodo: number }>;
  fech: number;
  diasRestantes: number;
  folgaCrua: number;
  folgaComMeta: number;
  cobertura: number;
  porDia: number;
  porDiaCru: number;
  histTotal: number;
  valorRemessa: number;
  custoRemessa: number;
  custoDisco: number;
  reservaDisco: number;
  gastoDisco: number;
  porRemessa: number;
  remessasAno: number;
  discosAno: number;
  meses: number;
  discosRest: number;
  anualDisco: boolean;
  custoIfood: number;
  pedidos: number;
  tetoDel: number;
}

export type TabKey = 'painel' | 'tetos' | 'fixos' | 'metas';
