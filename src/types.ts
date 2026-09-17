export interface Gasto {
  id: string;
  valor: number;
  categoria: string;
  descricao: string;
  data: string; // ISO date
}

export interface Conta {
  id: string;
  nome: string;
  valor: number;
  diaVencimento: number;
  grupo?: string;
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

export interface AppState {
  rendaMensal: number;
  saldoConta: number;
  contas: Conta[];
  tetos: Teto[];
  gastos: Gasto[];
  mesAtual: string;
  metasEconomia?: MetaEconomia[];
  categorias?: string[];
}
