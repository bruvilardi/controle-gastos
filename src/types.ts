export interface Gasto {
  id: string;
  valor: number;
  categoria: string;
  descricao: string;
  data: string; // ISO date
  formaPagamento?: 'debito' | 'credito';
}

export interface Conta {
  id: string;
  nome: string;
  valor: number;
  diaVencimento: number;
  grupo?: string;
  categoria?: string;
  parcelaAtual?: number;
  parcelasTotal?: number;
  valorTotal?: number;
}

export interface Teto {
  id: string;
  categoria: string;
  limite: number;
}

export interface MetaEconomia {
  id: string;
  titulo: string;
  valorAlvo: number;
  valorAtual: number;
}

export interface ItemSaldo {
  id: string;
  descricao: string;
  valor: number;
  origem?: string; // 'Salário' | 'Freela' | 'Vendas' | 'Investimentos' | 'Outros'
  data?: string;
}

export interface AppState {
  rendaMensal: number;
  saldoConta: number;
  itensSaldo?: ItemSaldo[];
  contas: Conta[];
  tetos: Teto[];
  gastos: Gasto[];
  mesAtual: string;
  metasEconomia?: MetaEconomia[];
  categorias?: string[];
}
