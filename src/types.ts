export type FormaPagamento = 'credito' | 'debito' | 'boleto' | 'pix' | 'dinheiro';

export interface GastoCompartilhado {
  comQuem: string; // ex: 'Marcelo'
  valorParteOutro: number; // ex: 45.00
  status: 'pendente' | 'recebido';
  itemSaldoId?: string; // ID da entrada Pix no saldo
}

export interface Gasto {
  id: string;
  valor: number;
  categoria: string;
  descricao: string;
  data: string; // ISO date
  formaPagamento?: FormaPagamento | string;
  compartilhado?: GastoCompartilhado;
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
  formaPagamento?: FormaPagamento | string;
  dataCompra?: string;
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
  origem?: string; // 'Salário' | 'Freela' | 'Vendas' | 'Investimentos' | 'Racha / Reembolso' | 'Outros'
  data?: string;
  gastoVinculadoId?: string; // ID do gasto associado
  rachaInfo?: {
    comQuem: string;
    gastoDescricao: string;
  };
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
