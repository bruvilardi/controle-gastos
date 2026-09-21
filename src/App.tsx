import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Plus, Wallet, Calendar, PiggyBank, Target, Trash2, CheckCircle2, Pencil, X, CreditCard, Banknote, FileText, Zap, PieChart as PieChartIcon, TrendingUp, Coins, Tag, FolderPlus, Settings2, Download, Briefcase, Laptop, ShoppingBag, ChevronDown, ChevronUp, ArrowDownLeft, Receipt, LayoutDashboard, ArrowRight, ArrowUpRight, Users, UserCheck, Clock } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { AppState, Conta, Gasto, Teto, MetaEconomia, ItemSaldo, FormaPagamento, GastoCompartilhado } from './types';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const DEFAULT_CATEGORIES = [
  'Uber',
  'Delivery',
  'Mercado',
  'Discos',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Moradia',
  'Educação',
  'Vestuário',
  'Assinaturas',
  'Cuidados Pessoais',
  'Pet',
  'Viagem',
  'Outros'
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Uber': '#1F2937',             // Dark Charcoal
  'Delivery': '#EA4335',         // Coral Red
  'Mercado': '#FBBC04',          // Gold Yellow
  'Discos': '#4285F4',           // Google Blue
  'Alimentação': '#FA7B17',      // Orange
  'Transporte': '#0EA5E9',       // Sky Blue
  'Saúde': '#34A853',            // Emerald Green
  'Lazer': '#A855F7',            // Purple
  'Moradia': '#8B5CF6',          // Indigo Violet
  'Educação': '#059669',         // Deep Teal
  'Vestuário': '#EC4899',        // Rose Pink
  'Assinaturas': '#6366F1',      // Indigo
  'Cuidados Pessoais': '#F43F5E', // Rose Red
  'Pet': '#D97706',              // Amber / Brown
  'Viagem': '#14B8A6',           // Teal
  'Outros': '#9AA0A6',           // Gray
};

export const PALETTE_FALLBACK = [
  '#0B57D0', '#12B5CB', '#7C3AED', '#E65100', '#D93025', 
  '#188038', '#D81B60', '#8E24AA', '#3949AB', '#00897B', 
  '#F4511E', '#6D4C41', '#546E7A', '#C0CA33', '#00ACC1'
];

export const getCategoryColor = (cat: string, index = 0): string => {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % PALETTE_FALLBACK.length;
  return PALETTE_FALLBACK[colorIndex] || PALETTE_FALLBACK[index % PALETTE_FALLBACK.length];
};

export const getFormaPagamentoInfo = (forma?: string) => {
  const f = (forma || 'credito').toLowerCase();
  switch (f) {
    case 'credito':
      return {
        id: 'credito',
        label: 'Crédito',
        sublabel: 'Cartão de Crédito',
        faturaTag: true,
        icon: CreditCard,
        bg: 'bg-[#E8F0FE]',
        text: 'text-[#0B57D0]',
        border: 'border-[#D2E3FC]',
        badgeBg: 'bg-[#E8F0FE] text-[#0B57D0] border-[#D2E3FC]',
        dotColor: '#0B57D0'
      };
    case 'debito':
      return {
        id: 'debito',
        label: 'Débito',
        sublabel: 'Débito em Conta',
        faturaTag: false,
        icon: Banknote,
        bg: 'bg-[#E6F4EA]',
        text: 'text-[#0F9D58]',
        border: 'border-[#CEEAD6]',
        badgeBg: 'bg-[#E6F4EA] text-[#0F9D58] border-[#CEEAD6]',
        dotColor: '#0F9D58'
      };
    case 'boleto':
      return {
        id: 'boleto',
        label: 'Boleto',
        sublabel: 'Boleto Bancário',
        faturaTag: false,
        icon: FileText,
        bg: 'bg-[#FEF7E0]',
        text: 'text-[#B06000]',
        border: 'border-[#FEEFC3]',
        badgeBg: 'bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]',
        dotColor: '#B06000'
      };
    case 'pix':
      return {
        id: 'pix',
        label: 'Pix',
        sublabel: 'Pix Instantâneo',
        faturaTag: false,
        icon: Zap,
        bg: 'bg-[#E0F2FE]',
        text: 'text-[#0284C7]',
        border: 'border-[#BAE6FD]',
        badgeBg: 'bg-[#E0F2FE] text-[#0284C7] border-[#BAE6FD]',
        dotColor: '#0284C7'
      };
    default:
      return {
        id: 'credito',
        label: 'Crédito',
        sublabel: 'Cartão de Crédito',
        faturaTag: true,
        icon: CreditCard,
        bg: 'bg-[#E8F0FE]',
        text: 'text-[#0B57D0]',
        border: 'border-[#D2E3FC]',
        badgeBg: 'bg-[#E8F0FE] text-[#0B57D0] border-[#D2E3FC]',
        dotColor: '#0B57D0'
      };
  }
};

export const ORIGENS_ENTRADA = ['Salário', 'Freela', 'Vendas', 'Investimentos', 'Racha / Reembolso', 'Outros'];

export const getOrigemIcon = (origem?: string) => {
  switch (origem) {
    case 'Salário':
      return <Briefcase className="w-4 h-4 text-[#0B57D0]" />;
    case 'Freela':
      return <Laptop className="w-4 h-4 text-[#7C3AED]" />;
    case 'Vendas':
      return <ShoppingBag className="w-4 h-4 text-[#E67C3B]" />;
    case 'Investimentos':
      return <TrendingUp className="w-4 h-4 text-[#0F9D58]" />;
    case 'Racha / Reembolso':
      return <Users className="w-4 h-4 text-[#0284C7]" />;
    default:
      return <Coins className="w-4 h-4 text-[#5F6368]" />;
  }
};

export const getOrigemBadgeClass = (origem?: string) => {
  switch (origem) {
    case 'Salário':
      return 'bg-[#E8F0FE] text-[#0B57D0] border-[#D2E3FC]';
    case 'Freela':
      return 'bg-[#F3E8FF] text-[#7C3AED] border-[#E9D5FF]';
    case 'Vendas':
      return 'bg-[#FFF8F3] text-[#A0460A] border-[#FED7AA]';
    case 'Investimentos':
      return 'bg-[#E6F4EA] text-[#0F9D58] border-[#CEEAD6]';
    case 'Racha / Reembolso':
      return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
    default:
      return 'bg-[#F1F3F4] text-[#5F6368] border-[#DADCE0]';
  }
};

const INITIAL_STATE: AppState = {
  rendaMensal: 7914.00,
  saldoConta: 7914.00,
  itensSaldo: [
    { id: 'sal-1', descricao: 'Salário Mensal', valor: 7914.00, origem: 'Salário' }
  ],
  mesAtual: new Date().toISOString().substring(0, 7),
  contas: [
    { id: 'f1', nome: 'Boleto Partner Instituição', valor: 510.50, diaVencimento: 5, grupo: 'Gastos Fixos', categoria: 'Educação', formaPagamento: 'boleto' },
    { id: 'f2', nome: 'Neoenergia (Luz)', valor: 307.43, diaVencimento: 10, grupo: 'Gastos Fixos', categoria: 'Moradia', formaPagamento: 'boleto' },
    { id: 'f3', nome: 'Telefônica (Internet)', valor: 156.60, diaVencimento: 10, grupo: 'Gastos Fixos', categoria: 'Moradia', formaPagamento: 'debito' },
    { id: 'f4', nome: 'DAS / Receita Federal', valor: 86.05, diaVencimento: 20, grupo: 'Gastos Fixos', categoria: 'Outros', formaPagamento: 'boleto' },
    { id: 'f5', nome: 'Claro Celular', valor: 49.91, diaVencimento: 15, grupo: 'Gastos Fixos', categoria: 'Outros', formaPagamento: 'debito' },
    { id: 'f6', nome: 'Seguro Cartão Itaú', valor: 9.90, diaVencimento: 10, grupo: 'Gastos Fixos', categoria: 'Outros', formaPagamento: 'debito' },
    
    { id: 'c1', nome: 'Google One', valor: 119.98, diaVencimento: 12, grupo: 'Gastos Fixos', categoria: 'Assinaturas', formaPagamento: 'credito' },
    { id: 'c3', nome: 'Apple.com/Bill (1)', valor: 42.90, diaVencimento: 12, grupo: 'Gastos Fixos', categoria: 'Assinaturas', formaPagamento: 'credito' },
    { id: 'c5', nome: 'HBO Max', valor: 22.45, diaVencimento: 12, grupo: 'Gastos Fixos', categoria: 'Assinaturas', formaPagamento: 'credito' },
    { id: 'c8', nome: 'iFood Club', valor: 12.90, diaVencimento: 12, grupo: 'Gastos Fixos', categoria: 'Delivery', formaPagamento: 'credito' },
    
    { id: 'p1', nome: 'Academia Vasco (06/12)', valor: 253.49, diaVencimento: 12, grupo: 'Parcelamentos', categoria: 'Saúde', parcelaAtual: 6, parcelasTotal: 12, formaPagamento: 'credito' },
    { id: 'p2', nome: 'Nuv Fanatiksao (01/08)', valor: 162.37, diaVencimento: 12, grupo: 'Parcelamentos', categoria: 'Outros', parcelaAtual: 1, parcelasTotal: 8, formaPagamento: 'credito' },
    { id: 'p3', nome: 'Globo Globoplay (07/12)', valor: 22.90, diaVencimento: 12, grupo: 'Parcelamentos', categoria: 'Assinaturas', parcelaAtual: 7, parcelasTotal: 12, formaPagamento: 'credito' },
  ],
  tetos: [
    { id: 't1', categoria: 'Discos', limite: 800 },
    { id: 't2', categoria: 'Delivery', limite: 400 },
    { id: 't3', categoria: 'Mercado', limite: 1200 },
    { id: 't4', categoria: 'Uber', limite: 300 },
  ],
  categorias: DEFAULT_CATEGORIES,
  gastos: [],
  metasEconomia: [
    { id: 'm1', titulo: 'Poupança Mensal', valorAlvo: 500, valorAtual: 350 },
    { id: 'm2', titulo: 'Reserva de Emergência', valorAlvo: 300, valorAtual: 150 },
  ],
};

const getTodayLocal = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateBR = (dateStr?: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const parseCurrency = (value: string | number): number => {
  if (typeof value === 'number') return value;
  let clean = value.replace(/[R$\s]/g, '');
  if (clean.includes(',') && clean.includes('.')) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }
  return parseFloat(clean) || 0;
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSaldo, setIsEditingSaldo] = useState(false);
  const [tempSaldoInput, setTempSaldoInput] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseValue, setNewExpenseValue] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState(getTodayLocal());
  const [newExpenseType, setNewExpenseType] = useState<'Fixo' | 'Parcela' | 'Variável'>('Variável');
  const [parcelasTotal, setParcelasTotal] = useState<number>(10);
  const [parcelaAtual, setParcelaAtual] = useState<number>(1);
  const [tipoValorParcela, setTipoValorParcela] = useState<'parcela' | 'total'>('parcela');
  const [newExpenseCategory, setNewExpenseCategory] = useState('Outros');
  const [isCategoryManual, setIsCategoryManual] = useState(false);
  const [newExpenseForma, setNewExpenseForma] = useState<FormaPagamento>('credito');
  const [editingGastoId, setEditingGastoId] = useState<string | null>(null);
  const [editingContaId, setEditingContaId] = useState<string | null>(null);
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState<string>('todos');
  const [filtroContasForma, setFiltroContasForma] = useState<string>('todos');
  const [isFaturaExpanded, setIsFaturaExpanded] = useState(true);
  const [showAllGastos, setShowAllGastos] = useState(false);
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'fatura' | 'contas' | 'gastos' | 'metas'>('visao-geral');

  // Estados para Gastos Compartilhados (Racha com Marcelo / Delivery)
  const [isExpenseShared, setIsExpenseShared] = useState(false);
  const [sharedWith, setSharedWith] = useState('Marcelo');
  const [sharedSplitType, setSharedSplitType] = useState<'50%' | 'valor'>('50%');
  const [sharedCustomValue, setSharedCustomValue] = useState('');
  const [sharedStatus, setSharedStatus] = useState<'pendente' | 'recebido'>('pendente');
  const [sharedAutoCreatePix, setSharedAutoCreatePix] = useState(true);

  // Estados para Entrada de Saldo vinculada a Gasto de Delivery/Racha
  const [itemSaldoGastoVinculadoId, setItemSaldoGastoVinculadoId] = useState<string>('');

  // Categorias management states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatTeto, setNewCatTeto] = useState('');
  const [isInlineAddingCategory, setIsInlineAddingCategory] = useState(false);
  const [inlineCategoryInput, setInlineCategoryInput] = useState('');
  const [expandedTetoCategoria, setExpandedTetoCategoria] = useState<string | null>(null);

  // Metas de Economia state & handlers
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [editingMetaId, setEditingMetaId] = useState<string | null>(null);
  const [metaFormTitle, setMetaFormTitle] = useState('');
  const [metaFormTarget, setMetaFormTarget] = useState('');
  const [metaFormCurrent, setMetaFormCurrent] = useState('');

  const handleOpenNewMeta = () => {
    setEditingMetaId(null);
    setMetaFormTitle('');
    setMetaFormTarget('');
    setMetaFormCurrent('');
    setIsMetaModalOpen(true);
  };

  const handleOpenEditMeta = (meta: MetaEconomia) => {
    setEditingMetaId(meta.id);
    setMetaFormTitle(meta.titulo);
    setMetaFormTarget(meta.valorAlvo.toString());
    setMetaFormCurrent(meta.valorAtual.toString());
    setIsMetaModalOpen(true);
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaFormTitle) return;
    const alvo = parseCurrency(metaFormTarget);
    const atual = parseCurrency(metaFormCurrent);
    if (alvo <= 0) return;

    if (editingMetaId) {
      setState(prev => {
        const metas = (prev.metasEconomia || []).map(m =>
          m.id === editingMetaId ? { ...m, titulo: metaFormTitle, valorAlvo: alvo, valorAtual: atual } : m
        );
        return {
          ...prev,
          metasEconomia: metas,
        };
      });
    } else {
      const newMeta: MetaEconomia = {
        id: Math.random().toString(36).substr(2, 9),
        titulo: metaFormTitle,
        valorAlvo: alvo,
        valorAtual: atual,
      };
      setState(prev => ({
        ...prev,
        metasEconomia: [...(prev.metasEconomia || []), newMeta],
      }));
    }
    setIsMetaModalOpen(false);
  };

  const handleDeleteMeta = (id: string) => {
    setConfirmDialog({
      message: "Deseja remover esta meta de economia?",
      onConfirm: () => {
        setState(prev => ({
          ...prev,
          metasEconomia: (prev.metasEconomia || []).filter(m => m.id !== id),
        }));
      }
    });
  };

  const handleQuickAddEconomia = (id: string, valorAporte: number) => {
    setState(prev => ({
      ...prev,
      metasEconomia: (prev.metasEconomia || []).map(m =>
        m.id === id ? { ...m, valorAtual: Math.max(0, m.valorAtual + valorAporte) } : m
      )
    }));
  };

  // Descritivo do Saldo (Entradas / Freelas / Vendas / Salário)
  const [isItemSaldoModalOpen, setIsItemSaldoModalOpen] = useState(false);
  const [editingItemSaldoId, setEditingItemSaldoId] = useState<string | null>(null);
  const [itemSaldoDescricao, setItemSaldoDescricao] = useState('');
  const [itemSaldoValor, setItemSaldoValor] = useState('');
  const [itemSaldoOrigem, setItemSaldoOrigem] = useState('Freela');
  const [itemSaldoData, setItemSaldoData] = useState(getTodayLocal());
  const [isDescritivoSaldoExpanded, setIsDescritivoSaldoExpanded] = useState(true);

  const handleOpenAddItemSaldo = (origemDefault = 'Freela', gastoIdVinculado?: string) => {
    setEditingItemSaldoId(null);
    setItemSaldoOrigem(origemDefault);
    setItemSaldoData(getTodayLocal());
    setItemSaldoGastoVinculadoId(gastoIdVinculado || '');

    if (gastoIdVinculado) {
      const targetGasto = state.gastos.find(g => g.id === gastoIdVinculado);
      if (targetGasto) {
        const val = targetGasto.compartilhado?.valorParteOutro || Number((targetGasto.valor / 2).toFixed(2));
        setItemSaldoValor(val.toFixed(2).replace('.', ','));
        setItemSaldoDescricao(`Pix ${targetGasto.compartilhado?.comQuem || 'Marcelo'} (Racha: ${targetGasto.descricao})`);
      } else {
        setItemSaldoDescricao(origemDefault === 'Racha / Reembolso' ? 'Pix Marcelo (Racha Delivery)' : '');
        setItemSaldoValor('');
      }
    } else {
      setItemSaldoDescricao(origemDefault === 'Racha / Reembolso' ? 'Pix Marcelo (Racha Delivery)' : '');
      setItemSaldoValor('');
    }
    setIsItemSaldoModalOpen(true);
  };

  const handleOpenEditItemSaldo = (item: ItemSaldo) => {
    setEditingItemSaldoId(item.id);
    setItemSaldoDescricao(item.descricao);
    setItemSaldoValor(item.valor.toString());
    setItemSaldoOrigem(item.origem || 'Outros');
    setItemSaldoData(item.data || getTodayLocal());
    setItemSaldoGastoVinculadoId(item.gastoVinculadoId || '');
    setIsItemSaldoModalOpen(true);
  };

  const handleSaveItemSaldo = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseCurrency(itemSaldoValor);
    if (isNaN(val) || val <= 0) return;

    const finalOrigem = itemSaldoOrigem;
    const finalDesc = itemSaldoDescricao.trim() || finalOrigem;
    const finalGastoId = itemSaldoGastoVinculadoId || undefined;

    // Se houver gasto vinculado, buscar info do gasto
    let rachaInfoData: { comQuem: string; gastoDescricao: string } | undefined = undefined;
    if (finalGastoId) {
      const gLinked = state.gastos.find(g => g.id === finalGastoId);
      if (gLinked) {
        rachaInfoData = {
          comQuem: gLinked.compartilhado?.comQuem || 'Marcelo',
          gastoDescricao: gLinked.descricao
        };
      }
    }

    setState(prev => {
      const currentItens: ItemSaldo[] = prev.itensSaldo !== undefined
        ? [...prev.itensSaldo]
        : [{ id: 'sal-base', descricao: 'Salário Base', valor: prev.saldoConta, origem: 'Salário' }];

      let updatedItens: ItemSaldo[];
      let targetItemId = editingItemSaldoId;

      if (editingItemSaldoId) {
        updatedItens = currentItens.map(it =>
          it.id === editingItemSaldoId
            ? {
                ...it,
                descricao: finalDesc,
                valor: val,
                origem: finalOrigem,
                data: itemSaldoData,
                gastoVinculadoId: finalGastoId,
                rachaInfo: rachaInfoData || it.rachaInfo
              }
            : it
        );
      } else {
        targetItemId = 'sal_' + Math.random().toString(36).substr(2, 9);
        const newItem: ItemSaldo = {
          id: targetItemId,
          descricao: finalDesc,
          valor: val,
          origem: finalOrigem,
          data: itemSaldoData,
          gastoVinculadoId: finalGastoId,
          rachaInfo: rachaInfoData
        };
        updatedItens = [newItem, ...currentItens];
      }

      const newTotalSaldo = updatedItens.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

      // Se vinculou a um gasto, atualiza o status do gasto para 'recebido' e vincula o ID do Pix
      let updatedGastos = prev.gastos;
      if (finalGastoId) {
        updatedGastos = prev.gastos.map(g => {
          if (g.id === finalGastoId) {
            return {
              ...g,
              compartilhado: {
                comQuem: g.compartilhado?.comQuem || 'Marcelo',
                valorParteOutro: g.compartilhado?.valorParteOutro || val,
                status: 'recebido' as const,
                itemSaldoId: targetItemId || undefined
              }
            };
          }
          return g;
        });
      }

      return {
        ...prev,
        gastos: updatedGastos,
        itensSaldo: updatedItens,
        saldoConta: newTotalSaldo
      };
    });

    setIsItemSaldoModalOpen(false);
    setEditingItemSaldoId(null);
    setItemSaldoDescricao('');
    setItemSaldoValor('');
    setItemSaldoGastoVinculadoId('');
  };

  const handleRemoveItemSaldo = (id: string) => {
    const currentItens = state.itensSaldo || [];
    const target = currentItens.find(it => it.id === id);
    if (!target) return;

    setConfirmDialog({
      message: `Deseja remover "${target.descricao}" (${formatBRL(target.valor)}) das suas entradas de saldo?${target.gastoVinculadoId ? ' O pedido de delivery correspondente voltará ao status "Aguardando Pix".' : ''}`,
      onConfirm: () => {
        setState(prev => {
          const updatedItens = (prev.itensSaldo || []).filter(it => it.id !== id);
          const newTotalSaldo = updatedItens.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

          // Reverter status do gasto vinculado se houver
          const updatedGastos = prev.gastos.map(g => {
            if (g.compartilhado?.itemSaldoId === id || (target.gastoVinculadoId && g.id === target.gastoVinculadoId)) {
              return {
                ...g,
                compartilhado: g.compartilhado ? {
                  ...g.compartilhado,
                  status: 'pendente' as const,
                  itemSaldoId: undefined
                } : undefined
              };
            }
            return g;
          });

          return {
            ...prev,
            gastos: updatedGastos,
            itensSaldo: updatedItens,
            saldoConta: newTotalSaldo
          };
        });
      }
    });
  };

  const handleRemoveAllItensSaldo = () => {
    const currentItens = state.itensSaldo || [];
    if (currentItens.length === 0) return;

    const countVinculados = currentItens.filter(it => it.gastoVinculadoId || it.rachaInfo).length;
    const msgVinculados = countVinculados > 0
      ? ` Os ${countVinculados} pedido(s) de delivery/racha vinculados voltarão ao status "Aguardando Pix".`
      : '';

    setConfirmDialog({
      message: `Tem certeza que deseja remover todas as ${currentItens.length} entradas de saldo bancário? O saldo da conta será zerado (R$ 0,00).${msgVinculados}`,
      onConfirm: () => {
        setState(prev => {
          // Reverter status dos gastos vinculados
          const updatedGastos = prev.gastos.map(g => {
            if (g.compartilhado?.status === 'recebido' && g.compartilhado?.itemSaldoId) {
              return {
                ...g,
                compartilhado: {
                  ...g.compartilhado,
                  status: 'pendente' as const,
                  itemSaldoId: undefined
                }
              };
            }
            return g;
          });

          return {
            ...prev,
            gastos: updatedGastos,
            itensSaldo: [],
            saldoConta: 0
          };
        });
      }
    });
  };

  const handleConfirmPixReceived = (gasto: Gasto) => {
    if (!gasto.compartilhado) return;
    const valorPix = gasto.compartilhado.valorParteOutro;
    const quem = gasto.compartilhado.comQuem || 'Marcelo';

    setConfirmDialog({
      message: `Confirmar recebimento do Pix de ${formatBRL(valorPix)} enviado por ${quem} referente ao pedido "${gasto.descricao}"? O valor será adicionado às entradas do seu Saldo em Conta.`,
      onConfirm: () => {
        const pixId = 'sal_pix_' + Math.random().toString(36).substr(2, 9);
        const novoItemSaldo: ItemSaldo = {
          id: pixId,
          descricao: `Pix ${quem} (Racha: ${gasto.descricao})`,
          valor: valorPix,
          origem: 'Racha / Reembolso',
          data: getTodayLocal(),
          gastoVinculadoId: gasto.id,
          rachaInfo: {
            comQuem: quem,
            gastoDescricao: gasto.descricao
          }
        };

        setState(prev => {
          const updatedGastos = prev.gastos.map(g => {
            if (g.id === gasto.id) {
              return {
                ...g,
                compartilhado: {
                  ...g.compartilhado!,
                  status: 'recebido' as const,
                  itemSaldoId: pixId
                }
              };
            }
            return g;
          });

          const currentItens = prev.itensSaldo || [];
          const updatedItens = [novoItemSaldo, ...currentItens];
          const newTotalSaldo = updatedItens.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

          return {
            ...prev,
            gastos: updatedGastos,
            itensSaldo: updatedItens,
            saldoConta: newTotalSaldo
          };
        });
      }
    });
  };

  // Category Management Handlers
  const handleAddCategory = (nome: string, tetoOpcional?: number) => {
    const trimmed = nome.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    setState(prev => {
      const currentCats = prev.categorias || DEFAULT_CATEGORIES;
      const alreadyExists = currentCats.some(c => c.toLowerCase() === formatted.toLowerCase());
      const updatedCats = alreadyExists ? currentCats : [...currentCats, formatted];

      let updatedTetos = prev.tetos || [];
      if (tetoOpcional && tetoOpcional > 0) {
        const existingIdx = updatedTetos.findIndex(t => t.categoria.toLowerCase() === formatted.toLowerCase());
        if (existingIdx >= 0) {
          updatedTetos = updatedTetos.map((t, i) => i === existingIdx ? { ...t, limite: tetoOpcional } : t);
        } else {
          updatedTetos = [...updatedTetos, { id: 't_' + Math.random().toString(36).substr(2, 7), categoria: formatted, limite: tetoOpcional }];
        }
      }

      return {
        ...prev,
        categorias: updatedCats,
        tetos: updatedTetos
      };
    });
  };

  const handleQuickCreateCategory = () => {
    if (!inlineCategoryInput.trim()) return;
    const formatted = inlineCategoryInput.trim().charAt(0).toUpperCase() + inlineCategoryInput.trim().slice(1);
    handleAddCategory(formatted);
    setNewExpenseCategory(formatted);
    setIsCategoryManual(true);
    setInlineCategoryInput('');
    setIsInlineAddingCategory(false);
  };

  const handleDeleteCategory = (catName: string) => {
    const expensesCount = state.gastos.filter(g => g.categoria.toLowerCase() === catName.toLowerCase()).length;
    if (expensesCount > 0) {
      setConfirmDialog({
        message: `Não é possível excluir a categoria "${catName}" porque ela possui ${expensesCount} gasto(s) vinculado(s). Reclassifique esses gastos antes de remover a categoria.`,
        onConfirm: () => {}
      });
      return;
    }

    setConfirmDialog({
      message: `Deseja remover a categoria "${catName}"?`,
      onConfirm: () => {
        setState(prev => ({
          ...prev,
          categorias: (prev.categorias || DEFAULT_CATEGORIES).filter(c => c.toLowerCase() !== catName.toLowerCase()),
          tetos: (prev.tetos || []).filter(t => t.categoria.toLowerCase() !== catName.toLowerCase())
        }));
      }
    });
  };

  const handleRemoveTeto = (tetoId: string) => {
    setConfirmDialog({
      message: "Deseja remover este teto de gastos?",
      onConfirm: () => {
        setState(prev => ({
          ...prev,
          tetos: prev.tetos.filter(t => t.id !== tetoId)
        }));
      }
    });
  };

  const getCategoryFromName = (name: string, availableCategories?: string[]) => {
    const n = name.toLowerCase();

    // Check custom or dynamic categories first
    if (availableCategories) {
      for (const cat of availableCategories) {
        if (cat.toLowerCase() !== 'outros' && n.includes(cat.toLowerCase())) {
          return cat;
        }
      }
    }

    if (n.includes('uber') || n.includes('99') || n.includes('corrida') || n.includes('taxi') || n.includes('táxi')) return 'Uber';
    if (n.includes('disco') || n.includes('vinil') || n.includes('cd') || n.includes('música') || n.includes('musica')) return 'Discos';
    if (n.includes('delivery') || n.includes('ifood') || n.includes('rappi') || n.includes('lanche')) return 'Delivery';
    if (n.includes('mercado') || n.includes('supermercado') || n.includes('assai') || n.includes('atacadão') || n.includes('feira') || n.includes('compras') || n.includes('sacolão') || n.includes('hortifruti')) return 'Mercado';
    if (n.includes('restaurante') || n.includes('almoço') || n.includes('almoco') || n.includes('jantar') || n.includes('café') || n.includes('cafe') || n.includes('padaria') || n.includes('pizza') || n.includes('hambúrguer') || n.includes('bar ') || n.includes('churrasco') || n.includes('comida') || n.includes('marmita') || n.includes('esfiha') || n.includes('sushi') || n.includes('alimentação') || n.includes('alimentacao')) return 'Alimentação';
    if (n.includes('farmácia') || n.includes('farmacia') || n.includes('droga') || n.includes('médico') || n.includes('medico') || n.includes('saúde') || n.includes('saude') || n.includes('remedio') || n.includes('remédio') || n.includes('exame') || n.includes('dentista') || n.includes('hospital') || n.includes('consulta') || n.includes('óptica') || n.includes('optica') || n.includes('academia') || n.includes('ginástica') || n.includes('ginastica') || n.includes('musculação') || n.includes('musculacao') || n.includes('crossfit') || n.includes('pilates')) return 'Saúde';
    if (n.includes('posto') || n.includes('gasolina') || n.includes('combustível') || n.includes('combustivel') || n.includes('etanol') || n.includes('ônibus') || n.includes('onibus') || n.includes('metro') || n.includes('metrô') || n.includes('passagem') || n.includes('pedágio') || n.includes('estacionamento') || n.includes('transporte') || n.includes('bilhete')) return 'Transporte';
    if (n.includes('aluguel') || n.includes('condomínio') || n.includes('condominio') || n.includes('iptu') || n.includes('luz') || n.includes('água') || n.includes('agua') || n.includes('gás') || n.includes('gas') || n.includes('moradia') || n.includes('reforma') || n.includes('móveis') || n.includes('moveis') || n.includes('casa') || n.includes('leroy')) return 'Moradia';
    if (n.includes('curso') || n.includes('faculdade') || n.includes('escola') || n.includes('livro') || n.includes('udemy') || n.includes('educação') || n.includes('educacao') || n.includes('mensalidade') || n.includes('estudo') || n.includes('partner')) return 'Educação';
    if (n.includes('roupa') || n.includes('calçado') || n.includes('calcado') || n.includes('tenis') || n.includes('tênis') || n.includes('sapato') || n.includes('vestuário') || n.includes('vestuario') || n.includes('camisa') || n.includes('calça') || n.includes('zara') || n.includes('renner') || n.includes('c&a')) return 'Vestuário';
    if (n.includes('netflix') || n.includes('spotify') || n.includes('amazon') || n.includes('prime') || n.includes('disney') || n.includes('hbo') || n.includes('youtube') || n.includes('assinatura') || n.includes('software') || n.includes('streaming') || n.includes('apple') || n.includes('icloud') || n.includes('openai') || n.includes('chatgpt') || n.includes('globoplay') || n.includes('globo')) return 'Assinaturas';
    if (n.includes('barbearia') || n.includes('cabelo') || n.includes('salão') || n.includes('salao') || n.includes('manicure') || n.includes('cosmético') || n.includes('perfume') || n.includes('beleza') || n.includes('cuidados') || n.includes('depilação') || n.includes('estética') || n.includes('estetica') || n.includes('skincare')) return 'Cuidados Pessoais';
    if (n.includes('pet') || n.includes('veterinário') || n.includes('veterinario') || n.includes('ração') || n.includes('racao') || n.includes('cachorro') || n.includes('gato') || n.includes('petshop') || n.includes('cobasi') || n.includes('petz')) return 'Pet';
    if (n.includes('viagem') || n.includes('hotel') || n.includes('pousada') || n.includes('airbnb') || n.includes('passagens') || n.includes('voo') || n.includes('mala') || n.includes('turismo') || n.includes('booking')) return 'Viagem';
    if (n.includes('cinema') || n.includes('show') || n.includes('teatro') || n.includes('festa') || n.includes('lazer') || n.includes('jogo') || n.includes('game') || n.includes('shopping') || n.includes('ingresso') || n.includes('parque') || n.includes('balada')) return 'Lazer';
    return 'Outros';
  };

  const handleOpenAddModal = (
    defaultType: 'Fixo' | 'Parcela' | 'Variável' = 'Variável',
    defaultShared = false,
    defaultSharedName = 'Marcelo'
  ) => {
    setEditingGastoId(null);
    setEditingContaId(null);
    setNewExpenseName('');
    setNewExpenseValue('');
    setNewExpenseDate(getTodayLocal());
    setNewExpenseType(defaultType);
    setParcelasTotal(10);
    setParcelaAtual(1);
    setTipoValorParcela('parcela');
    setNewExpenseCategory(defaultShared ? 'Delivery' : 'Outros');
    setIsCategoryManual(defaultShared);
    setNewExpenseForma(defaultType === 'Parcela' ? 'credito' : defaultType === 'Fixo' ? 'debito' : 'credito');
    setIsInlineAddingCategory(false);
    setInlineCategoryInput('');
    setIsExpenseShared(defaultShared);
    setSharedWith(defaultSharedName);
    setSharedSplitType('50%');
    setSharedCustomValue('');
    setSharedStatus('pendente');
    setSharedAutoCreatePix(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEditGasto = (gasto: Gasto) => {
    setEditingContaId(null);
    setEditingGastoId(gasto.id);
    setNewExpenseName(gasto.descricao);
    setNewExpenseValue(gasto.valor ? gasto.valor.toFixed(2).replace('.', ',') : '');
    setNewExpenseDate(gasto.data || getTodayLocal());
    setNewExpenseType('Variável');
    setNewExpenseCategory(gasto.categoria || 'Outros');
    setIsCategoryManual(true);
    setNewExpenseForma(gasto.formaPagamento || 'credito');
    setIsInlineAddingCategory(false);
    setInlineCategoryInput('');

    if (gasto.compartilhado) {
      setIsExpenseShared(true);
      setSharedWith(gasto.compartilhado.comQuem || 'Marcelo');
      const valParte = Number(gasto.compartilhado.valorParteOutro) || 0;
      setSharedCustomValue(valParte > 0 ? valParte.toFixed(2).replace('.', ',') : '');
      const half = Number(((Number(gasto.valor) || 0) / 2).toFixed(2));
      if (Math.abs(valParte - half) < 0.05) {
        setSharedSplitType('50%');
      } else {
        setSharedSplitType('valor');
      }
      setSharedStatus(gasto.compartilhado.status || 'pendente');
      setSharedAutoCreatePix(false);
    } else {
      setIsExpenseShared(false);
      setSharedWith('Marcelo');
      setSharedSplitType('50%');
      setSharedCustomValue('');
      setSharedStatus('pendente');
      setSharedAutoCreatePix(true);
    }

    setIsAddModalOpen(true);
  };

  const handleOpenEditConta = (conta: Conta) => {
    setEditingGastoId(null);
    setEditingContaId(conta.id);

    // Se for parcela, extrai o nome base e as parcelas
    const matchParcela = conta.nome.match(/^(.*?)\s*\((\d+)[\/de\s]+(\d+)\)$/i);
    if (matchParcela && conta.grupo === 'Parcelamentos') {
      setNewExpenseName(matchParcela[1].trim());
      setParcelaAtual(Number(matchParcela[2]) || 1);
      setParcelasTotal(Number(matchParcela[3]) || 10);
    } else {
      setNewExpenseName(conta.nome);
      setParcelaAtual(conta.parcelaAtual || 1);
      setParcelasTotal(conta.parcelasTotal || 10);
    }

    setNewExpenseValue(conta.valor ? conta.valor.toFixed(2).replace('.', ',') : '');

    // Formata a data com o dia de vencimento
    const diaNum = Math.max(1, Math.min(31, Number(conta.diaVencimento) || 1));
    const now = new Date();
    const yearMonth = state.mesAtual || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setNewExpenseDate(`${yearMonth}-${String(diaNum).padStart(2, '0')}`);

    setNewExpenseType(conta.grupo === 'Parcelamentos' ? 'Parcela' : 'Fixo');
    setTipoValorParcela('parcela');

    const activeCats = state.categorias || DEFAULT_CATEGORIES;
    const cat = conta.categoria || getCategoryFromName(conta.nome, activeCats) || 'Outros';
    setNewExpenseCategory(cat);
    setIsCategoryManual(true);
    setNewExpenseForma(conta.formaPagamento || (conta.grupo === 'Parcelamentos' ? 'credito' : 'debito'));
    setIsInlineAddingCategory(false);
    setInlineCategoryInput('');
    setIsAddModalOpen(true);
  };

  const handleToggleFormaPagamento = (gastoId: string) => {
    setState(prev => ({
      ...prev,
      gastos: prev.gastos.map(g => {
        if (g.id === gastoId) {
          const atual = g.formaPagamento || 'credito';
          const next: FormaPagamento = atual === 'credito' ? 'debito' : atual === 'debito' ? 'pix' : atual === 'pix' ? 'boleto' : 'credito';
          return {
            ...g,
            formaPagamento: next
          };
        }
        return g;
      })
    }));
  };

  const handleToggleContaForma = (id: string) => {
    setState(prev => ({
      ...prev,
      contas: prev.contas.map(c => {
        if (c.id === id) {
          const current = c.formaPagamento || (c.grupo === 'Parcelamentos' ? 'credito' : 'debito');
          const next: FormaPagamento = current === 'credito' ? 'debito' : current === 'debito' ? 'boleto' : current === 'boleto' ? 'pix' : 'credito';
          return { ...c, formaPagamento: next };
        }
        return c;
      })
    }));
  };

  const handleSaveNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseValue) return;
    const val = parseCurrency(newExpenseValue);
    if (isNaN(val) || val <= 0) return;
    
    const finalDate = newExpenseDate || getTodayLocal();
    const activeCats = state.categorias || DEFAULT_CATEGORIES;
    const finalCat = isCategoryManual && newExpenseCategory 
      ? newExpenseCategory 
      : (getCategoryFromName(newExpenseName, activeCats) || 'Outros');

    if (editingContaId) {
      const dia = Number(finalDate.split('-')[2]) || new Date().getDate();

      if (newExpenseType === 'Parcela') {
        const totalP = Math.max(1, Math.min(99, Number(parcelasTotal) || 1));
        const atualP = Math.max(1, Math.min(totalP, Number(parcelaAtual) || 1));
        const valorFinal = tipoValorParcela === 'total'
          ? Number((val / totalP).toFixed(2))
          : val;

        const cleanName = newExpenseName.replace(/\s*\(\d+[\/de\s]+\d+\)/i, '').trim();
        const nomeFormatado = `${cleanName} (${String(atualP).padStart(2, '0')}/${String(totalP).padStart(2, '0')})`;

        setState(prev => ({
          ...prev,
          contas: prev.contas.map(c => c.id === editingContaId ? {
            ...c,
            nome: nomeFormatado,
            valor: valorFinal,
            diaVencimento: dia,
            grupo: 'Parcelamentos' as const,
            categoria: finalCat,
            formaPagamento: newExpenseForma,
            parcelaAtual: atualP,
            parcelasTotal: totalP,
            valorTotal: tipoValorParcela === 'total' ? val : valorFinal * totalP
          } : c)
        }));
      } else if (newExpenseType === 'Fixo') {
        setState(prev => ({
          ...prev,
          contas: prev.contas.map(c => c.id === editingContaId ? {
            ...c,
            nome: newExpenseName.trim(),
            valor: val,
            diaVencimento: dia,
            grupo: 'Gastos Fixos' as const,
            categoria: finalCat,
            formaPagamento: newExpenseForma,
            parcelaAtual: undefined,
            parcelasTotal: undefined,
            valorTotal: undefined
          } : c)
        }));
      } else {
        // Usuário converteu de Conta para Gasto Variável
        setState(prev => ({
          ...prev,
          contas: prev.contas.filter(c => c.id !== editingContaId),
          gastos: [{
            id: editingContaId,
            descricao: newExpenseName.trim(),
            valor: val,
            data: finalDate,
            categoria: finalCat,
            formaPagamento: newExpenseForma
          }, ...prev.gastos]
        }));
      }
    } else if (editingGastoId) {
      if (newExpenseType === 'Variável') {
        const valParteOutro = sharedSplitType === '50%'
          ? Number((val / 2).toFixed(2))
          : (parseCurrency(sharedCustomValue) || Number((val / 2).toFixed(2)));
        const quem = (sharedWith || 'Marcelo').trim();

        setState(prev => {
          const existingGasto = prev.gastos.find(g => g.id === editingGastoId);
          const currentShared = existingGasto?.compartilhado;

          let updatedShared: GastoCompartilhado | undefined = undefined;
          if (isExpenseShared) {
            updatedShared = {
              comQuem: quem,
              valorParteOutro: valParteOutro,
              status: sharedStatus,
              itemSaldoId: currentShared?.itemSaldoId
            };
          }

          // Se já existia um itemSaldo vinculado, sincroniza a descrição e valor
          let updatedItens = prev.itensSaldo || [];
          if (updatedShared?.itemSaldoId && updatedItens.length > 0) {
            updatedItens = updatedItens.map(it => {
              if (it.id === updatedShared?.itemSaldoId) {
                return {
                  ...it,
                  descricao: `Pix ${quem} (Racha: ${newExpenseName.trim()})`,
                  valor: valParteOutro,
                  rachaInfo: { comQuem: quem, gastoDescricao: newExpenseName.trim() }
                };
              }
              return it;
            });
          }

          const newTotalSaldo = updatedItens.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

          return {
            ...prev,
            gastos: prev.gastos.map(g => g.id === editingGastoId ? {
              ...g,
              descricao: newExpenseName.trim(),
              valor: val,
              data: finalDate,
              categoria: finalCat,
              formaPagamento: newExpenseForma,
              compartilhado: updatedShared
            } : g),
            itensSaldo: updatedItens,
            saldoConta: newTotalSaldo
          };
        });
      } else if (newExpenseType === 'Parcela') {
        const dia = Number(finalDate.split('-')[2]) || new Date().getDate();
        const totalP = Math.max(1, Math.min(99, Number(parcelasTotal) || 1));
        const atualP = Math.max(1, Math.min(totalP, Number(parcelaAtual) || 1));
        const valorFinal = tipoValorParcela === 'total'
          ? Number((val / totalP).toFixed(2))
          : val;
        const cleanName = newExpenseName.replace(/\s*\(\d+[\/de\s]+\d+\)/i, '').trim();
        const nomeFormatado = `${cleanName} (${String(atualP).padStart(2, '0')}/${String(totalP).padStart(2, '0')})`;

        setState(prev => ({
          ...prev,
          gastos: prev.gastos.filter(g => g.id !== editingGastoId),
          contas: [...prev.contas, {
            id: editingGastoId,
            nome: nomeFormatado,
            valor: valorFinal,
            diaVencimento: dia,
            grupo: 'Parcelamentos' as const,
            categoria: finalCat,
            formaPagamento: newExpenseForma,
            parcelaAtual: atualP,
            parcelasTotal: totalP,
            valorTotal: tipoValorParcela === 'total' ? val : valorFinal * totalP
          }]
        }));
      } else {
        const dia = Number(finalDate.split('-')[2]) || new Date().getDate();
        setState(prev => ({
          ...prev,
          gastos: prev.gastos.filter(g => g.id !== editingGastoId),
          contas: [...prev.contas, {
            id: editingGastoId,
            nome: newExpenseName.trim(),
            valor: val,
            diaVencimento: dia,
            grupo: 'Gastos Fixos' as const,
            categoria: finalCat,
            formaPagamento: newExpenseForma
          }]
        }));
      }
    } else if (newExpenseType === 'Variável') {
      const valParteOutro = sharedSplitType === '50%'
        ? Number((val / 2).toFixed(2))
        : (parseCurrency(sharedCustomValue) || Number((val / 2).toFixed(2)));
      const quem = (sharedWith || 'Marcelo').trim();
      const novoGastoId = Math.random().toString(36).substr(2, 9);

      let pixIdToLink: string | undefined = undefined;
      let novoItemSaldoToAdd: ItemSaldo | undefined = undefined;

      if (isExpenseShared && sharedStatus === 'recebido' && sharedAutoCreatePix) {
        pixIdToLink = 'sal_pix_' + Math.random().toString(36).substr(2, 9);
        novoItemSaldoToAdd = {
          id: pixIdToLink,
          descricao: `Pix ${quem} (Racha: ${newExpenseName.trim()})`,
          valor: valParteOutro,
          origem: 'Racha / Reembolso',
          data: finalDate,
          gastoVinculadoId: novoGastoId,
          rachaInfo: {
            comQuem: quem,
            gastoDescricao: newExpenseName.trim()
          }
        };
      }

      const novoGasto: Gasto = {
        id: novoGastoId,
        descricao: newExpenseName.trim(),
        valor: val,
        data: finalDate,
        categoria: finalCat,
        formaPagamento: newExpenseForma,
        compartilhado: isExpenseShared ? {
          comQuem: quem,
          valorParteOutro: valParteOutro,
          status: sharedStatus,
          itemSaldoId: pixIdToLink
        } : undefined
      };

      setState(prev => {
        const currentItens = prev.itensSaldo || [];
        const updatedItens = novoItemSaldoToAdd ? [novoItemSaldoToAdd, ...currentItens] : currentItens;
        const newTotalSaldo = novoItemSaldoToAdd
          ? updatedItens.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0)
          : prev.saldoConta;

        return {
          ...prev,
          gastos: [novoGasto, ...prev.gastos],
          itensSaldo: updatedItens,
          saldoConta: newTotalSaldo
        };
      });
    } else if (newExpenseType === 'Parcela') {
      const dia = Number(finalDate.split('-')[2]) || new Date().getDate();
      const totalP = Math.max(1, Math.min(99, Number(parcelasTotal) || 1));
      const atualP = Math.max(1, Math.min(totalP, Number(parcelaAtual) || 1));
      const valorFinal = tipoValorParcela === 'total'
        ? Number((val / totalP).toFixed(2))
        : val;

      const cleanName = newExpenseName.replace(/\s*\(\d+[\/de\s]+\d+\)/i, '').trim();
      const nomeFormatado = `${cleanName} (${String(atualP).padStart(2, '0')}/${String(totalP).padStart(2, '0')})`;

      setState(prev => ({
        ...prev,
        contas: [...prev.contas, {
          id: Math.random().toString(36).substr(2, 9),
          nome: nomeFormatado,
          valor: valorFinal,
          diaVencimento: dia,
          grupo: 'Parcelamentos' as const,
          categoria: finalCat,
          formaPagamento: newExpenseForma,
          parcelaAtual: atualP,
          parcelasTotal: totalP,
          valorTotal: tipoValorParcela === 'total' ? val : valorFinal * totalP
        }]
      }));
    } else {
      const dia = Number(finalDate.split('-')[2]) || new Date().getDate();
      setState(prev => ({
        ...prev,
        contas: [...prev.contas, {
          id: Math.random().toString(36).substr(2, 9),
          nome: newExpenseName.trim(),
          valor: val,
          diaVencimento: dia,
          grupo: 'Gastos Fixos' as const,
          categoria: finalCat,
          formaPagamento: newExpenseForma
        }]
      }));
    }
    
    setIsAddModalOpen(false);
    setEditingGastoId(null);
    setEditingContaId(null);
    setNewExpenseName('');
    setNewExpenseValue('');
    setNewExpenseDate(getTodayLocal());
    setNewExpenseType('Variável');
    setParcelasTotal(10);
    setParcelaAtual(1);
    setTipoValorParcela('parcela');
    setNewExpenseCategory('Outros');
    setIsCategoryManual(false);
    setIsInlineAddingCategory(false);
    setInlineCategoryInput('');
    setIsExpenseShared(false);
    setSharedWith('Marcelo');
    setSharedSplitType('50%');
    setSharedCustomValue('');
    setSharedStatus('pendente');
    setSharedAutoCreatePix(true);
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('fin_auth') === 'true');
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Load state on mount
  useEffect(() => {
    async function loadData() {
      try {
        const docRef = doc(db, 'finances', 'bruno');
        const docSnap = await getDoc(docRef);
        
        let parsedState = INITIAL_STATE;
        if (docSnap.exists()) {
          parsedState = docSnap.data() as AppState;
          
          if (!parsedState.rendaMensal) parsedState.rendaMensal = INITIAL_STATE.rendaMensal;
          if (!parsedState.mesAtual) parsedState.mesAtual = INITIAL_STATE.mesAtual;
        } else {
          // If no data in firebase yet, fallback to localStorage if available
          const saved = localStorage.getItem('qpg_simple_state_v5');
          if (saved) {
            try {
              parsedState = JSON.parse(saved);
              if (!parsedState.rendaMensal) parsedState.rendaMensal = INITIAL_STATE.rendaMensal;
              if (!parsedState.mesAtual) parsedState.mesAtual = INITIAL_STATE.mesAtual;
            } catch (e) {}
          }
        }

        const currentMonth = new Date().toISOString().substring(0, 7);
        
        // Ensure tetos contains Uber
        if (!parsedState.tetos || parsedState.tetos.length === 0) {
          parsedState.tetos = INITIAL_STATE.tetos;
        } else {
          if (!parsedState.tetos.some(t => t.categoria.toLowerCase() === 'uber')) {
            parsedState.tetos.push({ id: 't4', categoria: 'Uber', limite: 300 });
          }
        }

        // Ensure any past Uber expenses are tagged under Uber category
        if (parsedState.gastos) {
          parsedState.gastos = parsedState.gastos.map(g => {
            if ((g.categoria === 'Transporte' || g.categoria === 'Outros') && g.descricao.toLowerCase().includes('uber')) {
              return { ...g, categoria: 'Uber' };
            }
            return g;
          });
        }

        // Ensure metasEconomia is present
        if (!parsedState.metasEconomia || parsedState.metasEconomia.length === 0) {
          const baseMeta = (parsedState as any).metaPoupanca || 500;
          parsedState.metasEconomia = [
            { id: 'm1', titulo: 'Poupança Mensal', valorAlvo: baseMeta, valorAtual: Math.round(baseMeta * 0.7) },
            { id: 'm2', titulo: 'Reserva de Emergência', valorAlvo: 300, valorAtual: 150 },
          ];
        }

        // Ensure itensSaldo is present
        if (parsedState.itensSaldo === undefined) {
          parsedState.itensSaldo = [
            { id: 'sal-1', descricao: 'Salário Mensal', valor: parsedState.saldoConta || parsedState.rendaMensal || 7914.00, origem: 'Salário' }
          ];
        }

        // Ensure categorias has default and custom categories merged
        const loadedCats = parsedState.categorias || [];
        const usedCats = [
          ...(parsedState.gastos || []).map(g => g.categoria),
          ...(parsedState.tetos || []).map(t => t.categoria)
        ];
        const allUniqueCats = Array.from(new Set([...DEFAULT_CATEGORIES, ...loadedCats, ...usedCats])).filter(Boolean);
        parsedState.categorias = allUniqueCats;
        
        const advanceInstallments = (contas: Conta[]) => {
          return contas.map(c => {
            if (c.grupo === 'Parcelamentos') {
              const match = c.nome.match(/(\d+)\/(\d+)/);
              if (match) {
                let current = parseInt(match[1], 10);
                let total = parseInt(match[2], 10);
                if (current < total) {
                  return { ...c, nome: c.nome.replace(`${match[1]}/${match[2]}`, `${current + 1}/${total}`) };
                }
              }
              
              const matchDe = c.nome.match(/(\d+)\s+de\s+(\d+)/);
              if (matchDe) {
                let current = parseInt(matchDe[1], 10);
                let total = parseInt(matchDe[2], 10);
                if (current < total) {
                  return { ...c, nome: c.nome.replace(`${matchDe[1]} de ${matchDe[2]}`, `${current + 1} de ${total}`) };
                }
              }
            }
            return c;
          });
        };

        if (parsedState.contas) {
          parsedState.contas = parsedState.contas.map(c => {
            let defaultFp: FormaPagamento = c.grupo === 'Parcelamentos' ? 'credito' : 'debito';
            const nl = c.nome.toLowerCase();
            if (nl.includes('boleto') || nl.includes('neoenergia') || nl.includes('das') || nl.includes('receita') || nl.includes('aluguel') || nl.includes('iptu')) {
              defaultFp = 'boleto';
            } else if (nl.includes('google') || nl.includes('apple') || nl.includes('hbo') || nl.includes('ifood') || nl.includes('netflix') || nl.includes('spotify') || nl.includes('globoplay')) {
              defaultFp = 'credito';
            }
            return {
              ...c,
              categoria: c.categoria || getCategoryFromName(c.nome, allUniqueCats) || 'Outros',
              formaPagamento: c.formaPagamento || defaultFp
            };
          });
        }

        if (parsedState.mesAtual !== currentMonth) {
          parsedState = {
            ...parsedState,
            mesAtual: currentMonth,
            saldoConta: parsedState.saldoConta + parsedState.rendaMensal,
            contas: advanceInstallments(parsedState.contas)
          };
        }

        setState(parsedState);
      } catch (err) {
        console.error("Failed to load from firebase", err);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // Save state on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('qpg_simple_state_v5', JSON.stringify(state));
      
      // Save to Firebase
      const saveData = async () => {
        try {
          await setDoc(doc(db, 'finances', 'bruno'), state);
        } catch (err) {
          console.error("Failed to save to firebase", err);
        }
      };
      saveData();
    }
  }, [state, isLoaded]);

  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const mesAtual = hoje.toISOString().substring(0, 7); // YYYY-MM

  // Metas de Economia Mensal & Progresso Global
  const metasEconomia = state.metasEconomia || [];
  const totalMetaEconomiaAlvo = metasEconomia.reduce((acc, m) => acc + (Number(m.valorAlvo) || 0), 0);
  const totalEconomizado = metasEconomia.reduce((acc, m) => acc + (Number(m.valorAtual) || 0), 0);
  const progressoEconomiaGlobal = totalMetaEconomiaAlvo > 0 
    ? Math.min(100, Math.round((totalEconomizado / totalMetaEconomiaAlvo) * 100)) 
    : 0;
  const faltaEconomizarGlobal = Math.max(0, totalMetaEconomiaAlvo - totalEconomizado);

  // Totais separados por tipo de despesa
  const totalGastosFixos = state.contas
    .filter(c => c.grupo === 'Gastos Fixos')
    .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

  const totalParcelamentos = state.contas
    .filter(c => c.grupo === 'Parcelamentos')
    .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

  const totalGastosVariaveis = state.gastos
    .reduce((acc, g) => acc + (Number(g.valor) || 0), 0);

  // Helper de detecção de forma de pagamento
  const getContaForma = (c: Conta) => (c.formaPagamento || (c.grupo === 'Parcelamentos' ? 'credito' : 'debito')).toLowerCase();
  const isContaCredito = (c: Conta) => getContaForma(c) === 'credito';
  const isGastoCredito = (g: Gasto) => (g.formaPagamento || 'credito').toLowerCase() === 'credito';

  // ITENS NO CARTÃO DE CRÉDITO (FATURA DO CARTÃO)
  const fixosCredito = state.contas.filter(c => c.grupo === 'Gastos Fixos' && isContaCredito(c));
  const totalFixosCredito = fixosCredito.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

  const parcelasCredito = state.contas.filter(c => c.grupo === 'Parcelamentos' && isContaCredito(c));
  const totalParcelasCredito = parcelasCredito.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

  const variaveisCredito = state.gastos.filter(g => isGastoCredito(g));
  const totalVariaveisCredito = variaveisCredito.reduce((acc, g) => acc + (Number(g.valor) || 0), 0);

  // SOMA TOTAL DA FATURA DO CARTÃO DE CRÉDITO
  const totalFaturaCartao = totalFixosCredito + totalParcelasCredito + totalVariaveisCredito;
  const countItensFatura = fixosCredito.length + parcelasCredito.length + variaveisCredito.length;

  // OUTROS PAGAMENTOS (DÉBITO / BOLETO / PIX / DINHEIRO)
  const fixosOutros = state.contas.filter(c => c.grupo === 'Gastos Fixos' && !isContaCredito(c));
  const totalFixosOutros = fixosOutros.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

  const parcelasOutros = state.contas.filter(c => c.grupo === 'Parcelamentos' && !isContaCredito(c));
  const totalParcelasOutros = parcelasOutros.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

  const variaveisOutros = state.gastos.filter(g => !isGastoCredito(g));
  const totalVariaveisOutros = variaveisOutros.reduce((acc, g) => acc + (Number(g.valor) || 0), 0);

  const totalOutrosPagamentos = totalFixosOutros + totalParcelasOutros + totalVariaveisOutros;
  const countItensOutros = fixosOutros.length + parcelasOutros.length + variaveisOutros.length;

  const totalGastosVariaveisCredito = totalVariaveisCredito;
  const totalGastosVariaveisDebito = state.gastos
    .filter(g => (g.formaPagamento || 'credito') === 'debito')
    .reduce((acc, g) => acc + (Number(g.valor) || 0), 0);

  const countCredito = variaveisCredito.length;
  const countDebito = state.gastos.filter(g => (g.formaPagamento || 'credito') === 'debito').length;

  const pctCredito = totalGastosVariaveis > 0 
    ? Math.round((totalGastosVariaveisCredito / totalGastosVariaveis) * 100) 
    : 0;
  const pctDebito = totalGastosVariaveis > 0 
    ? Math.round((totalGastosVariaveisDebito / totalGastosVariaveis) * 100) 
    : 0;

  const gastosFiltrados = state.gastos.filter(g => {
    if (filtroFormaPagamento === 'todos') return true;
    if (filtroFormaPagamento === 'compartilhados') return !!g.compartilhado;
    const forma = g.formaPagamento || 'credito';
    return forma === filtroFormaPagamento;
  });

  // Descritivo do Saldo: Entradas (Salário, Freela, Vendas, etc.)
  const listaItensSaldo: ItemSaldo[] = (state.itensSaldo !== undefined)
    ? state.itensSaldo
    : [{ id: 'sal-base', descricao: 'Salário Base', valor: state.saldoConta, origem: 'Salário' }];

  const totalItensSaldo = listaItensSaldo.reduce((acc, it) => acc + (Number(it.valor) || 0), 0);

  // Total do Gasto Mensal Global: Gastos Fixos + Gastos Variáveis + Parcelamentos
  const totalGastoNaFaturaMes = totalGastosFixos + totalGastosVariaveis + totalParcelamentos;

  // Total de contas agendadas (fixas e parceladas)
  const totalContas = totalGastosFixos + totalParcelamentos;
  const saldoLivre = state.saldoConta - totalGastoNaFaturaMes - totalMetaEconomiaAlvo;

  const totalDiasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diasRestantes = Math.max(1, totalDiasMes - diaAtual + 1); // Include today
  const limiteDiario = Math.max(0, saldoLivre / diasRestantes);

  const getContaCategory = (c: Conta) => {
    return c.categoria || getCategoryFromName(c.nome, state.categorias || DEFAULT_CATEGORIES) || 'Outros';
  };

  // Lista unificada e detalhada de lançamentos da fatura do cartão
  const itensFaturaCartao = useMemo(() => {
    const list: Array<{
      id: string;
      nome: string;
      valor: number;
      categoria: string;
      tipo: 'Parcela' | 'Fixo' | 'Variável';
      detalhe: string;
      dia?: number | string;
      compartilhado?: GastoCompartilhado;
    }> = [];

    parcelasCredito.forEach(c => {
      list.push({
        id: c.id,
        nome: c.nome,
        valor: Number(c.valor) || 0,
        categoria: getContaCategory(c),
        tipo: 'Parcela',
        detalhe: `Venc. dia ${c.diaVencimento} • ${c.parcelasTotal ? `${c.parcelaAtual || 1}ª de ${c.parcelasTotal} parcelas` : 'Parcela ativa'}`,
        dia: c.diaVencimento
      });
    });

    fixosCredito.forEach(c => {
      list.push({
        id: c.id,
        nome: c.nome,
        valor: Number(c.valor) || 0,
        categoria: getContaCategory(c),
        tipo: 'Fixo',
        detalhe: `Assinatura / Fixo • Venc. dia ${c.diaVencimento}`,
        dia: c.diaVencimento
      });
    });

    variaveisCredito.forEach(g => {
      list.push({
        id: g.id,
        nome: g.descricao,
        valor: Number(g.valor) || 0,
        categoria: g.categoria || 'Outros',
        tipo: 'Variável',
        compartilhado: g.compartilhado,
        detalhe: `Compra no cartão • ${formatDateBR(g.data)}${g.compartilhado ? ` • Racha c/ ${g.compartilhado.comQuem}: ${formatBRL(g.compartilhado.valorParteOutro)} (${g.compartilhado.status === 'recebido' ? 'Pix recebido ✓' : 'Aguardando Pix ⏳'})` : ''}`,
        dia: g.data
      });
    });

    return list.sort((a, b) => b.valor - a.valor);
  }, [parcelasCredito, fixosCredito, variaveisCredito, state.categorias]);

  // Helper central para discriminar e listar todos os lançamentos vinculados a uma categoria
  // Soma Gastos Variáveis + Gastos Fixos + Parcelamentos (todos contam para as metas)
  const getCategoryBreakdown = useCallback((categoria: string) => {
    const norm = (categoria || '').trim().toLowerCase();
    let total = 0;
    let variaveis = 0;
    let fixos = 0;
    let parcelas = 0;
    const itens: Array<{
      id: string;
      nome: string;
      valor: number;
      valorEfetivo?: number;
      reembolsado?: number;
      compartilhado?: GastoCompartilhado;
      categoria: string;
      tipo: 'Variável' | 'Fixo' | 'Parcela';
      formaPagamento?: string;
      detalhe: string;
    }> = [];

    (state.gastos || []).forEach(g => {
      const cat = (g.categoria || 'Outros').trim();
      if (cat.toLowerCase() === norm) {
        const valBruto = Number(g.valor) || 0;
        const reembolsado = (g.compartilhado && g.compartilhado.status === 'recebido')
          ? (Number(g.compartilhado.valorParteOutro) || 0)
          : 0;
        const valEfetivo = Math.max(0, valBruto - reembolsado);

        total += valEfetivo;
        variaveis += valEfetivo;
        itens.push({
          id: g.id,
          nome: g.descricao,
          valor: valBruto,
          valorEfetivo: valEfetivo,
          reembolsado: reembolsado,
          compartilhado: g.compartilhado,
          categoria: cat,
          tipo: 'Variável',
          formaPagamento: g.formaPagamento,
          detalhe: `Compra • ${formatDateBR(g.data)} • ${g.formaPagamento || 'crédito'}${g.compartilhado ? ` • Racha ${g.compartilhado.comQuem}: ${formatBRL(g.compartilhado.valorParteOutro)} (${g.compartilhado.status === 'recebido' ? 'Pix recebido ✓' : 'Aguardando Pix ⏳'})` : ''}`
        });
      }
    });

    (state.contas || []).forEach(c => {
      const cat = getContaCategory(c).trim();
      if (cat.toLowerCase() === norm) {
        const val = Number(c.valor) || 0;
        total += val;
        if (c.grupo === 'Parcelamentos') {
          parcelas += val;
          itens.push({
            id: c.id,
            nome: c.nome,
            valor: val,
            categoria: cat,
            tipo: 'Parcela',
            formaPagamento: c.formaPagamento,
            detalhe: `Parcela ativa • Vence dia ${c.diaVencimento} • ${c.formaPagamento || 'crédito'}`
          });
        } else {
          fixos += val;
          itens.push({
            id: c.id,
            nome: c.nome,
            valor: val,
            categoria: cat,
            tipo: 'Fixo',
            formaPagamento: c.formaPagamento,
            detalhe: `Gasto fixo • Vence dia ${c.diaVencimento} • ${c.formaPagamento || 'débito'}`
          });
        }
      }
    });

    return {
      total,
      variaveis,
      fixos,
      parcelas,
      itens: itens.sort((a, b) => b.valor - a.valor)
    };
  }, [state.gastos, state.contas, state.categorias]);

  // Montante de gastos mensais discriminado por categoria:
  // Combina Gastos Variáveis + Gastos Fixos + Parcelamentos (valor da parcela ativa no mês)
  const breakdownPorCategoria = useMemo(() => {
    const map: Record<string, { total: number; variaveis: number; fixos: number; parcelas: number }> = {};
    const allKnown = Array.from(new Set([
      ...(state.categorias || DEFAULT_CATEGORIES),
      ...(state.tetos || []).map(t => t.categoria),
      ...(state.gastos || []).map(g => g.categoria || 'Outros'),
      ...(state.contas || []).map(c => getContaCategory(c))
    ]));

    allKnown.forEach(cat => {
      const data = getCategoryBreakdown(cat);
      if (data.total > 0) {
        map[cat] = {
          total: data.total,
          variaveis: data.variaveis,
          fixos: data.fixos,
          parcelas: data.parcelas
        };
      }
    });

    return map;
  }, [getCategoryBreakdown, state.categorias, state.tetos, state.gastos, state.contas]);

  const gastosPorCategoria: Record<string, number> = useMemo(() => {
    const res: Record<string, number> = {};
    (state.categorias || DEFAULT_CATEGORIES).forEach(cat => {
      res[cat] = getCategoryBreakdown(cat).total;
    });
    (state.tetos || []).forEach(t => {
      res[t.categoria] = getCategoryBreakdown(t.categoria).total;
    });
    return res;
  }, [getCategoryBreakdown, state.categorias, state.tetos]);

  const pieChartData = useMemo(() => {
    return (Object.entries(breakdownPorCategoria) as [string, { total: number; variaveis: number; fixos: number; parcelas: number }][])
      .filter(([_, data]) => data.total > 0)
      .map(([categoria, data]) => ({
        name: categoria,
        value: data.total,
        breakdown: data,
        percentage: totalGastoNaFaturaMes > 0 ? ((data.total / totalGastoNaFaturaMes) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);
  }, [breakdownPorCategoria, totalGastoNaFaturaMes]);

  // Métricas de Rachas / Compartilhamento (ex: Marcelo e Delivery)
  const gastosCompartilhados = useMemo(() => {
    return state.gastos.filter(g => !!g.compartilhado);
  }, [state.gastos]);

  const totalReembolsadoRecebido = useMemo(() => {
    return state.gastos
      .filter(g => g.compartilhado && g.compartilhado.status === 'recebido')
      .reduce((acc, g) => acc + (Number(g.compartilhado?.valorParteOutro) || 0), 0);
  }, [state.gastos]);

  const totalReembolsoPendente = useMemo(() => {
    return state.gastos
      .filter(g => g.compartilhado && g.compartilhado.status === 'pendente')
      .reduce((acc, g) => acc + (Number(g.compartilhado?.valorParteOutro) || 0), 0);
  }, [state.gastos]);

  const countPendentesMarcelo = useMemo(() => {
    return state.gastos.filter(g => g.compartilhado && g.compartilhado.status === 'pendente').length;
  }, [state.gastos]);

  const handleResetGastos = () => {
    setConfirmDialog({
      message: "Tem certeza que deseja limpar todo o histórico de gastos variáveis?",
      onConfirm: () => {
        setState(prev => ({
          ...prev,
          gastos: []
        }));
      }
    });
  };

  const formatBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleUpdateConta = (id: string, field: 'nome' | 'valor' | 'categoria' | 'diaVencimento' | 'formaPagamento', value: string | number) => {
    setState(prev => ({
      ...prev,
      contas: prev.contas.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleUpdateGastoCategoria = (id: string, categoria: string) => {
    setState(prev => ({
      ...prev,
      gastos: prev.gastos.map(g => g.id === id ? { ...g, categoria } : g)
    }));
  };

  const handleRemoveConta = (id: string) => {
    setConfirmDialog({
      message: "Deseja realmente remover esta conta?",
      onConfirm: () => {
        setState(prev => ({
          ...prev,
          contas: prev.contas.filter(c => c.id !== id)
        }));
      }
    });
  };

  const handleRemoveGasto = (id: string) => {
    const target = state.gastos.find(g => g.id === id);
    if (!target) return;
    const hasPixLinked = target.compartilhado?.itemSaldoId;

    setConfirmDialog({
      message: hasPixLinked 
        ? `Deseja realmente remover este gasto? Há uma entrada de Pix de ${formatBRL(target.compartilhado?.valorParteOutro || 0)} vinculada às suas entradas de saldo bancário. A entrada permanecerá no saldo de forma independente.`
        : "Deseja realmente remover este gasto?",
      onConfirm: () => {
        setState(prev => ({
          ...prev,
          gastos: prev.gastos.filter(g => g.id !== id),
          itensSaldo: (prev.itensSaldo || []).map(it => it.gastoVinculadoId === id ? { ...it, gastoVinculadoId: undefined, rachaInfo: undefined } : it)
        }));
      }
    });
  };

  const handleUpdateTeto = (id: string, limite: number) => {
    setState(prev => ({
      ...prev,
      tetos: prev.tetos.map(t => t.id === id ? { ...t, limite } : t)
    }));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (btoa(authInput.toLowerCase().trim()) === 'ZGluZGlu') {
      setIsAuthenticated(true);
      sessionStorage.setItem('fin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 font-['Roboto',sans-serif]">
        <div className="bg-white p-8 rounded-[28px] shadow-sm border border-[#DADCE0] w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-[#E8F0FE] rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-[#0B57D0]" />
          </div>
          <h1 className="text-2xl font-medium text-[#202124] mb-2">Acesso Restrito</h1>
          <p className="text-[#5F6368] mb-6 text-sm">Por favor, insira a palavra-chave para acessar suas finanças.</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="password"
                value={authInput}
                onChange={e => setAuthInput(e.target.value)}
                placeholder="Palavra-chave"
                className={`w-full px-4 py-3 rounded-xl border ${authError ? 'border-[#B3261E] bg-[#F9DEDC]/30' : 'border-[#DADCE0]'} focus:outline-none focus:border-[#0B57D0] transition-colors`}
              />
              {authError && <p className="text-[#B3261E] text-xs mt-1 text-left">Palavra-chave incorreta</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#0B57D0] text-white py-3 rounded-full font-medium hover:bg-[#0842A0] transition-colors"
            >
              Acessar
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] pb-20 font-['Roboto',sans-serif]">
      {/* Header Profile */}
      <header className="bg-[#0B57D0] text-white pt-8 pb-14 px-4 sm:px-8 rounded-b-[36px] shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                {formatDateBR(getTodayLocal())} • Dia {diaAtual}
              </span>
              <span className="text-xs text-white/80">
                {diasRestantes} dias restantes no mês
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">Finanças Simples</h1>
            <p className="text-white/80 text-sm">Olá, Bruno! Acompanhe seu saldo livre, fatura e metas sem complicação.</p>
          </div>
          
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleOpenAddModal('Variável')}
              className="bg-white text-[#0B57D0] hover:bg-[#F1F3F4] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Gasto</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenAddItemSaldo('Freela')}
              className="bg-[#0F9D58] hover:bg-[#0B8043] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>+ Entrada</span>
            </button>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 px-3 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isEditing ? 'bg-[#146C2E] text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title="Modo de Edição Rápida"
            >
              {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              <span>{isEditing ? 'Concluir' : 'Editar'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-7 space-y-6">
        {/* Barra de Navegação por Abas */}
        <nav className="bg-white rounded-2xl p-1.5 shadow-sm border border-[#DADCE0] flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            type="button"
            onClick={() => setActiveTab('visao-geral')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'visao-geral'
                ? 'bg-[#0B57D0] text-white shadow-xs'
                : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Visão Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fatura')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'fatura'
                ? 'bg-[#0B57D0] text-white shadow-xs'
                : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fatura do Cartão</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'fatura' ? 'bg-white/20 text-white' : 'bg-[#E8F0FE] text-[#0B57D0]'
            }`}>
              {formatBRL(totalFaturaCartao)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contas')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'contas'
                ? 'bg-[#0B57D0] text-white shadow-xs'
                : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Contas do Mês</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === 'contas' ? 'bg-white/20 text-white' : 'bg-[#F1F3F4] text-[#5F6368]'
            }`}>
              {state.contas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gastos')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'gastos'
                ? 'bg-[#0B57D0] text-white shadow-xs'
                : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Gastos Diários</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === 'gastos' ? 'bg-white/20 text-white' : 'bg-[#F1F3F4] text-[#5F6368]'
            }`}>
              {state.gastos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metas')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'metas'
                ? 'bg-[#0B57D0] text-white shadow-xs'
                : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Metas & Tetos</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === 'metas' ? 'bg-white/20 text-white' : 'bg-[#F1F3F4] text-[#5F6368]'
            }`}>
              {state.tetos.length}
            </span>
          </button>
        </nav>
        

        {/* ABA: VISÃO GERAL */}
        {activeTab === 'visao-geral' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Banner de Rachas com Marcelo (quando houver pendências ou itens compartilhados) */}
            {countPendentesMarcelo > 0 && (
              <div className="p-4 sm:p-5 bg-[#EFF6FF] rounded-[24px] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#DBEAFE] flex items-center justify-center text-[#1D4ED8] shrink-0 shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-[#1E3A8A]">
                        Rachas de Pedidos com Marcelo
                      </h4>
                      <span className="text-[10px] bg-[#2563EB] text-white px-2 py-0.5 rounded-full font-extrabold tracking-wide">
                        {countPendentesMarcelo} Pix pendente{countPendentesMarcelo > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-[#3B82F6] mt-0.5">
                      Você tem <strong className="text-[#1E40AF] font-bold">{formatBRL(totalReembolsoPendente)}</strong> a receber de entregas/delivery compartilhados.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('gastos');
                      setFiltroFormaPagamento('compartilhados');
                    }}
                    className="text-xs font-bold text-[#1D4ED8] bg-white hover:bg-[#DBEAFE] border border-[#BFDBFE] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Ver Pedidos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddItemSaldo('Racha / Reembolso')}
                    className="text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Lançar Pix Recebido</span>
                  </button>
                </div>
              </div>
            )}

            {/* Grid dos 3 Cards Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Saldo Livre */}
              <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#DADCE0] shadow-xs flex flex-col justify-between hover:border-[#0B57D0]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-[#0B57D0]" />
                      Saldo Livre
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333]">
                      Disponível
                    </span>
                  </div>
                  
                  {isEditingSaldo ? (
                    <div className="my-2 space-y-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        autoFocus
                        value={tempSaldoInput}
                        onChange={e => setTempSaldoInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const val = parseCurrency(tempSaldoInput);
                            if (!isNaN(val)) setState(prev => ({ ...prev, saldoConta: val }));
                            setIsEditingSaldo(false);
                          } else if (e.key === 'Escape') {
                            setIsEditingSaldo(false);
                          }
                        }}
                        className="w-full bg-white border border-[#0B57D0] rounded-xl px-3 py-1.5 text-xl font-bold text-[#202124] focus:outline-none"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseCurrency(tempSaldoInput);
                            if (!isNaN(val)) setState(prev => ({ ...prev, saldoConta: val }));
                            setIsEditingSaldo(false);
                          }}
                          className="px-3 py-1 bg-[#0B57D0] text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingSaldo(false)}
                          className="px-2 py-1 text-[#5F6368] hover:bg-[#E8EAED] rounded-lg text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-black text-[#202124] tracking-tight">
                      {formatBRL(saldoLivre)}
                    </div>
                  )}

                  <p className="text-xs text-[#5F6368] mt-1">
                    Saldo total em conta: <strong className="text-[#202124]">{formatBRL(state.saldoConta)}</strong>
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-[#F1F3F4] flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setIsDescritivoSaldoExpanded(!isDescritivoSaldoExpanded)}
                    className="font-semibold text-[#0B57D0] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isDescritivoSaldoExpanded ? 'Ocultar entradas' : `Ver entradas (${listaItensSaldo.length})`}</span>
                    {isDescritivoSaldoExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempSaldoInput(state.saldoConta.toString());
                      setIsEditingSaldo(!isEditingSaldo);
                    }}
                    className="font-semibold text-[#5F6368] hover:text-[#202124] bg-[#F1F3F4] hover:bg-[#E8EAED] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Ajustar</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Fatura Atual do Cartão de Crédito */}
              <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#DADCE0] shadow-xs flex flex-col justify-between hover:border-[#0B57D0]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0B57D0] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      Fatura do Cartão
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F0FE] text-[#0B57D0]">
                      {countItensFatura} no crédito
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#041E49] tracking-tight">
                    {formatBRL(totalFaturaCartao)}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#5F6368] flex-wrap">
                    <span>Fixos: <strong className="text-[#202124]">{formatBRL(totalFixosCredito)}</strong></span>
                    <span>•</span>
                    <span>Parc: <strong className="text-[#202124]">{formatBRL(totalParcelasCredito)}</strong></span>
                    <span>•</span>
                    <span>Var: <strong className="text-[#202124]">{formatBRL(totalVariaveisCredito)}</strong></span>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-[#F1F3F4]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('fatura')}
                    className="w-full text-xs font-bold text-[#0B57D0] hover:text-[#0842A0] flex items-center justify-between py-1 transition-colors cursor-pointer group"
                  >
                    <span>Abrir Fatura Completa</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Card 3: Limite Diário Ideal */}
              <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#DADCE0] shadow-xs flex flex-col justify-between hover:border-[#146C2E]/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#146C2E] flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      Limite Diário
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#146C2E]">
                      {diasRestantes} dias rest.
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#146C2E] tracking-tight">
                    {formatBRL(limiteDiario)}
                    <span className="text-sm font-normal text-[#5F6368] ml-1">/ dia</span>
                  </div>
                  <p className="text-xs text-[#5F6368] mt-1">
                    Gasto diário seguro até fechar o mês no azul
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-[#F1F3F4]">
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal('Variável')}
                    className="w-full text-xs font-bold text-[#146C2E] hover:text-[#0F5323] flex items-center justify-between py-1 transition-colors cursor-pointer"
                  >
                    <span>+ Registrar Compra</span>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Painel Descritivo do Saldo em Conta (Quando aberto ou editando) */}
            {(isDescritivoSaldoExpanded || isEditing) && (
              <div className="p-5 bg-white rounded-[24px] border border-[#DADCE0] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#E8F0FE] flex items-center justify-center text-[#0B57D0] shrink-0">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#041E49] uppercase tracking-wider">
                        Fontes de Entrada & Saldo
                      </h3>
                      <p className="text-xs text-[#5F6368]">
                        Salário, freelas, vendas e outras rendas ativas ({listaItensSaldo.length})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {listaItensSaldo.length > 0 && (
                      <button
                        type="button"
                        onClick={handleRemoveAllItensSaldo}
                        className="text-[#B3261E] hover:bg-[#F9DEDC] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#F9DEDC]"
                        title="Remover todas as entradas de saldo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover Todas</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenAddItemSaldo('Freela')}
                      className="bg-[#0B57D0] text-white hover:bg-[#0842A0] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nova Entrada</span>
                    </button>
                  </div>
                </div>

                {listaItensSaldo.length === 0 ? (
                  <div className="text-center py-6 bg-[#F8F9FA] rounded-2xl border border-dashed border-[#DADCE0] p-4 animate-in fade-in duration-200">
                    <Coins className="w-8 h-8 text-[#9AA0A6] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#202124]">Nenhuma entrada cadastrada</p>
                    <p className="text-xs text-[#5F6368] mt-0.5">Seu saldo atual está zerado (R$ 0,00). Adicione seu salário, freelas ou Pix recebidos.</p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddItemSaldo('Salário')}
                      className="mt-3 bg-[#0B57D0] text-white hover:bg-[#0842A0] px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Salário / Entrada</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {listaItensSaldo.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 px-3 bg-[#F8F9FA] rounded-xl border border-[#E8EAED] hover:border-[#DADCE0] transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                          <div className="shrink-0 p-1.5 rounded-lg bg-white border border-[#E8EAED]">
                            {getOrigemIcon(item.origem)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-medium text-[#202124] truncate">{item.descricao}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getOrigemBadgeClass(item.origem)} shrink-0`}>
                                {item.origem || 'Entrada'}
                              </span>
                              {item.rachaInfo && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] shrink-0" title={`Vinculado ao pedido: ${item.rachaInfo.gastoDescricao}`}>
                                  <Users className="w-2.5 h-2.5" />
                                  Racha: {item.rachaInfo.gastoDescricao}
                                </span>
                              )}
                            </div>
                            {item.data && (
                              <span className="text-[11px] text-[#5F6368]">{formatDateBR(item.data)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-sm text-[#0F9D58] mr-1">
                            + {formatBRL(item.valor)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditItemSaldo(item)}
                            className="p-1.5 text-[#5F6368] hover:bg-[#E8F0FE] hover:text-[#0B57D0] rounded-lg transition-colors cursor-pointer"
                            title="Editar entrada"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemSaldo(item.id)}
                            className="p-1.5 text-[#5F6368] hover:bg-[#F9DEDC] hover:text-[#B3261E] rounded-lg transition-colors cursor-pointer"
                            title="Remover entrada"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-[#E8EAED] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-[#5F6368]">
                    Total das entradas: <strong className="text-[#041E49] font-bold">{formatBRL(totalItensSaldo)}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-[#5F6368] mr-0.5">Adicionar:</span>
                    <button
                      type="button"
                      onClick={() => handleOpenAddItemSaldo('Racha / Reembolso')}
                      className="px-2 py-1 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] hover:bg-[#BAE6FD] font-semibold transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Users className="w-3 h-3" />
                      + Pix Marcelo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAddItemSaldo('Freela')}
                      className="px-2 py-1 rounded-lg bg-[#F8F9FA] border border-[#E9D5FF] text-[#7C3AED] hover:bg-[#F3E8FF] font-semibold transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Laptop className="w-3 h-3" />
                      + Freela
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAddItemSaldo('Vendas')}
                      className="px-2 py-1 rounded-lg bg-[#F8F9FA] border border-[#FED7AA] text-[#A0460A] hover:bg-[#FFF8F3] font-semibold transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      + Venda
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAddItemSaldo('Outros')}
                      className="px-2 py-1 rounded-lg bg-[#F8F9FA] border border-[#DADCE0] text-[#5F6368] hover:bg-[#E8EAED] font-semibold transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      + Outro
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid 2 Colunas: Balanço Geral do Mês e Distribuição por Categoria */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Coluna 1: Balanço Financeiro do Mês */}
              <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#DADCE0] shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#0B57D0]" />
                      Balanço Resumido do Mês
                    </h3>
                    <span className="text-xs text-[#5F6368]">Mês Atual</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#E6F4EA]/50 border border-[#CEEAD6]">
                      <span className="font-semibold text-[#137333]">Entradas Totais (Rendas)</span>
                      <strong className="text-sm text-[#137333]">+{formatBRL(totalItensSaldo)}</strong>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAED]">
                      <span className="text-[#5F6368]">Total de Gastos Programados</span>
                      <strong className="text-sm text-[#B3261E]">-{formatBRL(totalGastoNaFaturaMes)}</strong>
                    </div>

                    <div className="pl-3 pr-1 py-1 space-y-1.5 text-[11px] text-[#5F6368]">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="w-3 h-3 text-[#0B57D0]" />
                          Fatura do Cartão (Fixos + Parc + Var):
                        </span>
                        <strong className="text-[#0B57D0]">{formatBRL(totalFaturaCartao)}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <Banknote className="w-3 h-3 text-[#0F9D58]" />
                          À vista / Débito / Boleto / Pix:
                        </span>
                        <strong className="text-[#202124]">{formatBRL(totalOutrosPagamentos)}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3 text-[#7C3AED]" />
                          Metas de Poupança / Reserva:
                        </span>
                        <strong className="text-[#7C3AED]">{formatBRL(totalMetaEconomiaAlvo)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8EAED] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#5F6368]">Saldo Final Previsto:</span>
                  <span className="text-base font-extrabold text-[#202124]">{formatBRL(saldoLivre)}</span>
                </div>
              </div>

              {/* Coluna 2: Gráfico de Pizza da Distribuição por Categoria */}
              <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#DADCE0] shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-[#0B57D0]" />
                    Distribuição por Categoria
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('metas')}
                    className="text-xs font-semibold text-[#0B57D0] hover:underline cursor-pointer"
                  >
                    Ver Metas & Tetos
                  </button>
                </div>

                {pieChartData.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[#5F6368] italic">
                    Nenhum gasto lançado para exibir distribuição.
                  </div>
                ) : (
                  <>
                    <div className="w-full h-44 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={42}
                            outerRadius={68}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-overview-${index}`} 
                                fill={getCategoryColor(entry.name, index)} 
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val, name, item) => [
                              `${formatBRL(Number(val))} (${item.payload.percentage}%)`,
                              name
                            ]}
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              borderRadius: '12px',
                              border: '1px solid #DADCE0',
                              fontSize: '12px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-xs max-h-24 overflow-y-auto pr-1">
                      {pieChartData.slice(0, 4).map((item, index) => (
                        <div key={item.name} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#F8F9FA] border border-[#E8EAED]">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(item.name, index) }} />
                          <span className="font-medium text-[#202124] truncate text-[11px]">{item.name}</span>
                          <span className="text-[#0B57D0] font-bold ml-auto text-[11px]">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Resumo Rápido de Metas de Economia & Acesso aos Tetos */}
            <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#DADCE0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FEF7E0] text-[#B06000] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#202124]">Metas de Economia & Tetos de Gastos</h4>
                  <p className="text-xs text-[#5F6368] mt-0.5">
                    Economizado: <strong>{formatBRL(totalEconomizado)}</strong> de {formatBRL(totalMetaEconomiaAlvo)} ({progressoEconomiaGlobal}%) • {state.tetos.length} tetos ativos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('metas')}
                className="px-4 py-2 bg-[#F8F9FA] hover:bg-[#E8F0FE] text-[#0B57D0] border border-[#DADCE0] hover:border-[#0B57D0] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>Acompanhar Tetos & Metas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Últimos Gastos Registrados */}
            <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#DADCE0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#0B57D0]" />
                  Últimos Gastos Registrados
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('gastos')}
                  className="text-xs font-semibold text-[#0B57D0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver todos ({state.gastos.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {state.gastos.length === 0 ? (
                <p className="text-xs text-[#5F6368] italic py-3 text-center">Nenhum gasto registrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {state.gastos.slice(0, 4).map(g => (
                    <div key={g.id} className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAED] flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#202124] truncate">{g.descricao}</p>
                        <div className="text-[11px] text-[#5F6368] flex items-center gap-2 mt-0.5">
                          <span className="font-medium" style={{ color: getCategoryColor(g.categoria) }}>{g.categoria}</span>
                          <span>•</span>
                          <span>{formatDateBR(g.data)}</span>
                          <span>•</span>
                          <span className="capitalize">{g.formaPagamento || 'crédito'}</span>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-[#202124]">{formatBRL(g.valor)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA: FATURA DO CARTÃO */}
        {activeTab === 'fatura' && (
          <div className="animate-in fade-in duration-200">
        {/* Seção Exclusiva: Fatura do Cartão de Crédito */}
        <section id="fatura-cartao" className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F0FE] flex items-center justify-center text-[#0B57D0]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#041E49] flex items-center gap-2">
                  Fatura do Cartão de Crédito
                </h2>
                <p className="text-xs text-[#5F6368]">
                  Soma de todas as compras, parcelas e assinaturas no crédito
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#0B57D0] bg-[#E8F0FE] px-3 py-1 rounded-full border border-[#D2E3FC]">
              {countItensFatura} no crédito
            </span>
          </div>

          {/* Valor Principal da Fatura */}
          <div className="bg-linear-to-br from-[#E8F0FE]/70 to-[#F8F9FA] p-5 rounded-2xl border border-[#D2E3FC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B57D0]">
                Total Atual da Fatura
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B57D0] tracking-tight mt-0.5">
                {formatBRL(totalFaturaCartao)}
              </div>
              <p className="text-[11px] text-[#5F6368] mt-1">
                Representa {totalGastoNaFaturaMes > 0 ? Math.round((totalFaturaCartao / totalGastoNaFaturaMes) * 100) : 0}% de todos os seus gastos deste mês
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenAddModal('Parcela')}
                className="px-3.5 py-2 bg-white border border-[#D2E3FC] text-[#0B57D0] hover:bg-[#E8F0FE] text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                + Parcela
              </button>
              <button
                type="button"
                onClick={() => setIsFaturaExpanded(!isFaturaExpanded)}
                className="px-3.5 py-2 bg-[#0B57D0] text-white hover:bg-[#0842A0] text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>{isFaturaExpanded ? 'Recolher' : 'Ver Lançamentos'}</span>
                {isFaturaExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Mini cards de decomposição da Fatura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E8EAED]">
              <div className="flex items-center justify-between text-xs text-[#5F6368] mb-1">
                <span className="font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#A0460A]" />
                  Parcelas Ativas
                </span>
                <span className="font-bold">{parcelasCredito.length}x</span>
              </div>
              <p className="text-base font-bold text-[#202124]">{formatBRL(totalParcelasCredito)}</p>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E8EAED]">
              <div className="flex items-center justify-between text-xs text-[#5F6368] mb-1">
                <span className="font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0B57D0]" />
                  Assinaturas / Fixos
                </span>
                <span className="font-bold">{fixosCredito.length}</span>
              </div>
              <p className="text-base font-bold text-[#202124]">{formatBRL(totalFixosCredito)}</p>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E8EAED]">
              <div className="flex items-center justify-between text-xs text-[#5F6368] mb-1">
                <span className="font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0F9D58]" />
                  Compras Variáveis
                </span>
                <span className="font-bold">{variaveisCredito.length}</span>
              </div>
              <p className="text-base font-bold text-[#202124]">{formatBRL(totalVariaveisCredito)}</p>
            </div>
          </div>

          {/* Lista detalhada e editável dos itens da Fatura */}
          {isFaturaExpanded && (
            <div className="pt-2 border-t border-[#E8EAED] space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-[#5F6368] pb-1">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  Todos os lançamentos somados nesta fatura ({itensFaturaCartao.length})
                </span>
                <span>Organizados do maior para o menor</span>
              </div>

              {itensFaturaCartao.length === 0 ? (
                <div className="text-center py-6 bg-[#F8F9FA] rounded-xl border border-dashed border-[#DADCE0]">
                  <p className="text-xs text-[#5F6368]">Nenhum gasto ou parcela marcado como Cartão de Crédito.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {itensFaturaCartao.map(item => {
                    const catColor = getCategoryColor(item.categoria);
                    const isConta = item.tipo === 'Parcela' || item.tipo === 'Fixo';
                    return (
                      <div 
                        key={`${item.tipo}-${item.id}`}
                        className="p-3 rounded-xl border border-[#E8EAED] bg-[#F8F9FA] hover:bg-white hover:border-[#0B57D0]/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#202124] truncate">
                              {item.nome}
                            </span>
                            <div className="relative inline-flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 mr-1" style={{ backgroundColor: catColor }} />
                              <select
                                value={item.categoria}
                                onChange={e => {
                                  if (isConta) {
                                    handleUpdateConta(item.id, 'categoria', e.target.value);
                                  } else {
                                    handleUpdateGastoCategoria(item.id, e.target.value);
                                  }
                                }}
                                className="appearance-none inline-flex items-center pl-1 pr-4 py-0.5 rounded-full text-[10px] font-semibold border bg-white cursor-pointer hover:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] focus:outline-none transition-all"
                                style={{ borderColor: catColor + '60', color: '#202124' }}
                                title="Clique para alterar a categoria deste lançamento"
                              >
                                {(state.categorias || DEFAULT_CATEGORIES).map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-2.5 h-2.5 text-[#5F6368] absolute right-1 pointer-events-none" />
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              item.tipo === 'Parcela' 
                                ? 'bg-[#FFF8F3] text-[#A0460A] border border-[#FED7AA]' 
                                : item.tipo === 'Fixo'
                                ? 'bg-[#E8F0FE] text-[#0B57D0] border border-[#D2E3FC]'
                                : 'bg-[#F1F3F4] text-[#5F6368]'
                            }`}>
                              {item.tipo}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5F6368] mt-0.5">
                            {item.detalhe}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-sm text-[#0B57D0]">
                            {formatBRL(item.valor)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (isConta) {
                                const conta = state.contas.find(c => c.id === item.id);
                                if (conta) handleOpenEditConta(conta);
                              } else {
                                const gasto = state.gastos.find(g => g.id === item.id);
                                if (gasto) handleOpenEditGasto(gasto);
                              }
                            }}
                            className="p-1.5 text-[#5F6368] hover:text-[#0B57D0] hover:bg-[#E8F0FE] rounded-lg transition-colors"
                            title="Editar gasto ou categoria"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
          </div>
        )}

        {/* ABA: CONTAS DO MÊS */}
        {activeTab === 'contas' && (
          <div className="animate-in fade-in duration-200">
        {/* Contas a Pagar (Fixos & Parcelados) */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-medium flex items-center gap-2 text-[#202124]">
                <Calendar className="w-5 h-5 text-[#0B57D0]" />
                Contas do Mês (Fixos & Parcelados)
              </h2>
              <p className="text-xs text-[#5F6368] mt-0.5">
                Total agendado no mês: <strong className="text-[#0B57D0]">{formatBRL(totalContas)}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenAddModal('Fixo')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F0FE] text-[#0B57D0] hover:bg-[#D2E3FC] rounded-full text-xs font-semibold transition-colors shadow-2xs"
                title="Adicionar gasto fixo (aluguel, internet, etc.)"
              >
                <Plus className="w-3.5 h-3.5" />
                Gasto Fixo
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddModal('Parcela')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8F3] text-[#A0460A] border border-[#FED7AA] hover:bg-[#FEEAD9] rounded-full text-xs font-semibold transition-colors shadow-2xs"
                title="Adicionar compra parcelada"
              >
                <Plus className="w-3.5 h-3.5" />
                Gasto Parcelado
              </button>
            </div>
          </div>

          {/* Filtro de Pagamento das Contas */}
          <div className="flex items-center gap-1.5 mb-5 flex-wrap">
            <span className="text-xs text-[#5F6368] font-medium mr-1">Filtrar:</span>
            <button
              type="button"
              onClick={() => setFiltroContasForma('todos')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                filtroContasForma === 'todos'
                  ? 'bg-[#202124] text-white shadow-2xs'
                  : 'bg-[#F1F3F4] text-[#5F6368] hover:bg-[#E8EAED]'
              }`}
            >
              Todas ({state.contas.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroContasForma('credito')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                filtroContasForma === 'credito'
                  ? 'bg-[#0B57D0] text-white shadow-2xs'
                  : 'bg-[#E8F0FE] text-[#0B57D0] hover:bg-[#D2E3FC]'
              }`}
            >
              <CreditCard className="w-3 h-3" />
              No Cartão ({state.contas.filter(isContaCredito).length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroContasForma('outros')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                filtroContasForma === 'outros'
                  ? 'bg-[#0F9D58] text-white shadow-2xs'
                  : 'bg-[#E6F4EA] text-[#0F9D58] hover:bg-[#CEEAD6]'
              }`}
            >
              <Banknote className="w-3 h-3" />
              À Vista / Débito / Boleto ({state.contas.filter(c => !isContaCredito(c)).length})
            </button>
          </div>

          <div className="space-y-8">
            {['Gastos Fixos', 'Parcelamentos'].map(grupoNome => {
              const contasGrupo = state.contas
                .filter(c => {
                  if (c.grupo !== grupoNome) return false;
                  if (filtroContasForma === 'credito') return isContaCredito(c);
                  if (filtroContasForma === 'outros') return !isContaCredito(c);
                  return true;
                })
                .sort((a, b) => a.diaVencimento - b.diaVencimento);
              if (contasGrupo.length === 0) return null;
              
              const totalGrupo = contasGrupo.reduce((acc, c) => acc + c.valor, 0);

              return (
                <div key={grupoNome} className="space-y-3">
                  <div className="flex justify-between items-end px-2 border-b border-[#E8EAED] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[#202124]">{grupoNome}</h3>
                      <span className="text-xs text-[#5F6368] bg-[#F1F3F4] px-2 py-0.5 rounded-full font-medium">
                        {contasGrupo.length} {contasGrupo.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-[#202124]">{formatBRL(totalGrupo)}</span>
                    </div>
                  </div>
                  {contasGrupo.map(conta => {
                    const contaCat = getContaCategory(conta);
                    const catColor = getCategoryColor(contaCat);
                    const formaInfo = getFormaPagamentoInfo(conta.formaPagamento || (conta.grupo === 'Parcelamentos' ? 'credito' : 'debito'));
                    const isCred = isContaCredito(conta);

                    return (
                      <div key={conta.id} className="p-4 rounded-[16px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors bg-[#F8F9FA] border border-[#DADCE0] hover:border-[#BDC1C6]">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-[15px] text-[#202124] truncate">
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  value={conta.nome} 
                                  onChange={e => handleUpdateConta(conta.id, 'nome', e.target.value)} 
                                  className="border border-[#DADCE0] rounded px-2 py-1 w-full bg-white text-[15px]" 
                                />
                              ) : (
                                conta.nome
                              )}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-xs text-[#5F6368] mt-1.5">
                            {/* Categoria Tag */}
                            {isEditing ? (
                              <select
                                value={contaCat}
                                onChange={e => handleUpdateConta(conta.id, 'categoria', e.target.value)}
                                className="border border-[#DADCE0] rounded px-2 py-0.5 text-xs bg-white text-[#202124]"
                              >
                                {(state.categorias || DEFAULT_CATEGORIES).map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            ) : (
                              <div className="relative inline-flex items-center">
                                <span className="w-2 h-2 rounded-full shrink-0 mr-1.5" style={{ backgroundColor: catColor }} />
                                <select
                                  value={contaCat}
                                  onChange={e => handleUpdateConta(conta.id, 'categoria', e.target.value)}
                                  className="appearance-none inline-flex items-center pl-1.5 pr-5 py-0.5 rounded-full text-[11px] font-semibold border bg-white shadow-2xs cursor-pointer hover:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] focus:outline-none transition-all"
                                  style={{ borderColor: catColor + '60', color: '#202124' }}
                                  title="Clique para alterar a categoria deste gasto e atualizar as metas"
                                >
                                  {(state.categorias || DEFAULT_CATEGORIES).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                                <ChevronDown className="w-3 h-3 text-[#5F6368] absolute right-1.5 pointer-events-none" />
                              </div>
                            )}

                            {/* Tag da Forma de Pagamento */}
                            {isEditing ? (
                              <select
                                value={conta.formaPagamento || (conta.grupo === 'Parcelamentos' ? 'credito' : 'debito')}
                                onChange={e => handleUpdateConta(conta.id, 'formaPagamento', e.target.value)}
                                className="border border-[#DADCE0] rounded px-2 py-0.5 text-xs bg-white text-[#202124]"
                              >
                                <option value="credito">Crédito (Fatura)</option>
                                <option value="debito">Débito</option>
                                <option value="boleto">Boleto</option>
                                <option value="pix">Pix</option>
                              </select>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleContaForma(conta.id)}
                                title="Clique para alternar a forma de pagamento (Crédito, Débito, Boleto, Pix)"
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer hover:opacity-85 ${formaInfo.badgeBg}`}
                              >
                                {React.createElement(formaInfo.icon, { className: 'w-3 h-3' })}
                                <span>{formaInfo.label}</span>
                                {isCred && <span className="text-[9px] opacity-80">(Fatura)</span>}
                              </button>
                            )}

                            <span>•</span>
                            <span>Vence dia {conta.diaVencimento}</span>

                            {conta.grupo === 'Parcelamentos' && (
                              <>
                                <span>•</span>
                                <span className="text-[#0B57D0] font-semibold bg-[#E8F0FE] px-2 py-0.5 rounded-md text-[10px]">
                                  Parcela ativa
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                value={conta.valor || ''} 
                                onChange={e => handleUpdateConta(conta.id, 'valor', Number(e.target.value))} 
                                className="border border-[#DADCE0] rounded px-2 py-1 w-24 text-right bg-white font-medium text-[15px]" 
                              />
                            </div>
                          ) : (
                            <div className="text-right">
                              <div className="font-semibold text-[15px] text-[#202124]">{formatBRL(conta.valor)}</div>
                              <span className="text-[10px] text-[#5F6368]">no mês</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <button 
                              type="button"
                              onClick={() => handleOpenEditConta(conta)} 
                              className="p-1.5 text-[#5F6368] hover:text-[#0B57D0] hover:bg-[#E8F0FE] rounded-lg transition-colors"
                              title="Editar gasto, parcelas, categoria ou forma de pagamento"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleRemoveConta(conta.id)} 
                              className="p-1.5 text-[#5F6368] hover:text-[#B3261E] hover:bg-[#F9DEDC] rounded-lg transition-colors"
                              title="Excluir conta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>
          </div>
        )}

        {/* ABA: GASTOS DIÁRIOS */}
        {activeTab === 'gastos' && (
          <div className="animate-in fade-in duration-200">
        {/* Gastos Variáveis */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-[#0B57D0]" />
              Gastos Variáveis
            </h2>
            {totalGastosVariaveis > 0 && (
              <span className="text-xs font-semibold text-[#5F6368] bg-[#F1F3F4] px-2.5 py-1 rounded-full">
                Total: {formatBRL(totalGastosVariaveis)}
              </span>
            )}
          </div>

          {/* Divisão Débito vs Crédito */}
          {state.gastos.length > 0 && (
            <div className="mb-6 p-4 bg-[#F8F9FA] rounded-[24px] border border-[#DADCE0]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#0B57D0]" />
                  Divisão Débito vs Crédito
                </h3>
                <span className="text-xs text-[#5F6368] font-medium">
                  {state.gastos.length} despesa(s)
                </span>
              </div>

              {/* Cards de Comparação */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {/* Card Crédito */}
                <button 
                  type="button"
                  onClick={() => setFiltroFormaPagamento(filtroFormaPagamento === 'credito' ? 'todos' : 'credito')}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    filtroFormaPagamento === 'credito' 
                      ? 'bg-[#E8F0FE] border-[#0B57D0] ring-2 ring-[#0B57D0]/20' 
                      : 'bg-white border-[#E8EAED] hover:border-[#0B57D0]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#0B57D0] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      Cartão de Crédito
                    </span>
                    <span className="text-xs font-bold text-[#0B57D0] bg-[#E8F0FE] px-2 py-0.5 rounded-full border border-[#D2E3FC]">
                      {pctCredito}%
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#041E49]">{formatBRL(totalGastosVariaveisCredito)}</p>
                  <p className="text-[11px] text-[#5F6368] mt-0.5">{countCredito} compra(s) na fatura</p>
                </button>

                {/* Card Débito */}
                <button 
                  type="button"
                  onClick={() => setFiltroFormaPagamento(filtroFormaPagamento === 'debito' ? 'todos' : 'debito')}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    filtroFormaPagamento === 'debito' 
                      ? 'bg-[#E6F4EA] border-[#0F9D58] ring-2 ring-[#0F9D58]/20' 
                      : 'bg-white border-[#E8EAED] hover:border-[#0F9D58]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#0F9D58] flex items-center gap-1.5">
                      <Banknote className="w-4 h-4" />
                      Débito / Pix
                    </span>
                    <span className="text-xs font-bold text-[#0F9D58] bg-[#E6F4EA] px-2 py-0.5 rounded-full border border-[#CEEAD6]">
                      {pctDebito}%
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#041E49]">{formatBRL(totalGastosVariaveisDebito)}</p>
                  <p className="text-[11px] text-[#5F6368] mt-0.5">{countDebito} compra(s) à vista</p>
                </button>

                {/* Card Rachas Marcelo */}
                <button 
                  type="button"
                  onClick={() => setFiltroFormaPagamento(filtroFormaPagamento === 'compartilhados' ? 'todos' : 'compartilhados')}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    filtroFormaPagamento === 'compartilhados' 
                      ? 'bg-[#E0F2FE] border-[#0284C7] ring-2 ring-[#0284C7]/20' 
                      : 'bg-white border-[#E8EAED] hover:border-[#0284C7]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#0369A1] flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      Rachas Marcelo
                    </span>
                    {countPendentesMarcelo > 0 ? (
                      <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                        {countPendentesMarcelo} pend.
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#059669] bg-[#D1FAE5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                        {gastosCompartilhados.length > 0 ? 'Em dia ✓' : '0'}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-[#041E49]">{formatBRL(totalReembolsadoRecebido + totalReembolsoPendente)}</p>
                  <p className="text-[11px] text-[#5F6368] mt-0.5">
                    {gastosCompartilhados.length} pedidos • {formatBRL(totalReembolsadoRecebido)} compensados
                  </p>
                </button>
              </div>

              {/* Barra visual de proporção */}
              {totalGastosVariaveis > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="w-full h-2.5 bg-[#E8EAED] rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${pctCredito}%` }} 
                      className="bg-[#0B57D0] h-full transition-all duration-300"
                      title={`Crédito: ${pctCredito}%`}
                    />
                    <div 
                      style={{ width: `${pctDebito}%` }} 
                      className="bg-[#0F9D58] h-full transition-all duration-300"
                      title={`Débito: ${pctDebito}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#5F6368]">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#0B57D0]" />
                      Crédito ({pctCredito}%)
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-2 h-2 rounded-full bg-[#0F9D58]" />
                      Débito ({pctDebito}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gráfico de Pizza de Distribuição Percentual */}
          {pieChartData.length > 0 ? (
            <div className="mb-6 p-4 bg-[#F8F9FA] rounded-[24px] border border-[#DADCE0]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider flex items-center gap-1.5">
                  <PieChartIcon className="w-3.5 h-3.5 text-[#0B57D0]" />
                  Distribuição por Categoria
                </h3>
                <span className="text-xs text-[#5F6368]">{pieChartData.length} categorias</span>
              </div>
              
              <div className="w-full h-52 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={74}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getCategoryColor(entry.name, index)} 
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${formatBRL(Number(val))} (${item.payload.percentage}%)`,
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #DADCE0',
                        fontSize: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda com percentuais */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {pieChartData.map((item, index) => {
                  const color = getCategoryColor(item.name, index);
                  return (
                    <div key={item.name} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#E8EAED] text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-medium text-[#202124] truncate">{item.name}</span>
                      <span className="text-[#0B57D0] font-bold ml-auto">{item.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {state.gastos.length === 0 ? (
            <p className="text-sm text-[#5F6368] text-center py-4">Nenhum gasto registrado ainda.</p>
          ) : (
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
                  Histórico de Gastos ({gastosFiltrados.length})
                </h3>
                {gastosFiltrados.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllGastos(!showAllGastos)}
                    className="text-xs font-semibold text-[#0B57D0] hover:underline"
                  >
                    {showAllGastos ? 'Mostrar menos' : `Ver todos (${gastosFiltrados.length})`}
                  </button>
                )}
              </div>

              {/* Filtros de Forma de Pagamento */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2">
                <button
                  type="button"
                  onClick={() => setFiltroFormaPagamento('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border shrink-0 ${
                    filtroFormaPagamento === 'todos'
                      ? 'bg-[#202124] text-white border-[#202124]'
                      : 'bg-white text-[#5F6368] border-[#DADCE0] hover:bg-[#F8F9FA]'
                  }`}
                >
                  Todos ({state.gastos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroFormaPagamento('credito')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border flex items-center gap-1.5 shrink-0 ${
                    filtroFormaPagamento === 'credito'
                      ? 'bg-[#0B57D0] text-white border-[#0B57D0]'
                      : 'bg-white text-[#0B57D0] border-[#D2E3FC] hover:bg-[#E8F0FE]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Crédito ({countCredito})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroFormaPagamento('debito')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border flex items-center gap-1.5 shrink-0 ${
                    filtroFormaPagamento === 'debito'
                      ? 'bg-[#0F9D58] text-white border-[#0F9D58]'
                      : 'bg-white text-[#0F9D58] border-[#CEEAD6] hover:bg-[#E6F4EA]'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  Débito ({countDebito})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroFormaPagamento('compartilhados')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border flex items-center gap-1.5 shrink-0 ${
                    filtroFormaPagamento === 'compartilhados'
                      ? 'bg-[#0284C7] text-white border-[#0284C7]'
                      : 'bg-white text-[#0369A1] border-[#BAE6FD] hover:bg-[#E0F2FE]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Rachas Marcelo ({gastosCompartilhados.length})
                  {countPendentesMarcelo > 0 && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-[#EF4444] inline-block" title={`${countPendentesMarcelo} Pix pendente`} />
                  )}
                </button>
              </div>

              {gastosFiltrados.length === 0 ? (
                <div className="text-center py-6 bg-[#F8F9FA] rounded-2xl border border-dashed border-[#DADCE0]">
                  <p className="text-sm text-[#5F6368]">
                    Nenhum gasto encontrado em {filtroFormaPagamento === 'compartilhados' ? 'Rachas com Marcelo' : filtroFormaPagamento === 'credito' ? 'Crédito' : 'Débito'}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFiltroFormaPagamento('todos')}
                    className="mt-2 text-xs font-semibold text-[#0B57D0] hover:underline"
                  >
                    Ver todos os gastos
                  </button>
                </div>
              ) : (
                <div className={`space-y-2 ${showAllGastos && gastosFiltrados.length > 6 ? 'max-h-96 overflow-y-auto pr-1' : ''}`}>
                  {(showAllGastos ? gastosFiltrados : gastosFiltrados.slice(0, 5)).map(g => {
                    const isDebito = (g.formaPagamento || 'credito') === 'debito';
                    const hasCompartilhado = !!g.compartilhado;
                    const isRecebido = g.compartilhado?.status === 'recebido';
                    const valorOutro = g.compartilhado?.valorParteOutro || 0;
                    const suaParte = Math.max(0, g.valor - valorOutro);

                    return (
                      <div key={g.id} className="flex justify-between items-center py-2.5 px-3 rounded-xl border border-[#F1F3F4] hover:bg-[#F8F9FA] transition-colors">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="font-medium text-sm text-[#202124] truncate">{g.descricao}</p>
                          <div className="text-xs text-[#5F6368] flex flex-wrap items-center gap-1.5 mt-0.5">
                            <div className="relative inline-flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 mr-1" style={{ backgroundColor: getCategoryColor(g.categoria) }} />
                              <select
                                value={g.categoria || 'Outros'}
                                onChange={e => handleUpdateGastoCategoria(g.id, e.target.value)}
                                className="appearance-none inline-flex items-center pl-1 pr-4 py-0.5 rounded-full text-[10px] font-semibold border bg-white cursor-pointer hover:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] focus:outline-none transition-all"
                                style={{ borderColor: getCategoryColor(g.categoria) + '60', color: '#202124' }}
                                title="Clique para alterar a categoria deste gasto e atualizar as metas"
                              >
                                {(state.categorias || DEFAULT_CATEGORIES).map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-2.5 h-2.5 text-[#5F6368] absolute right-1 pointer-events-none" />
                            </div>
                            <span>•</span>
                            <span>{formatDateBR(g.data)}</span>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => handleToggleFormaPagamento(g.id)}
                              title="Clique para alternar entre Crédito e Débito"
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                                isDebito
                                  ? 'bg-[#E6F4EA] text-[#0F9D58] border-[#CEEAD6] hover:bg-[#CEEAD6]'
                                  : 'bg-[#E8F0FE] text-[#0B57D0] border-[#D2E3FC] hover:bg-[#D2E3FC]'
                              }`}
                            >
                              {isDebito ? (
                                <>
                                  <Banknote className="w-3 h-3" />
                                  Débito
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-3 h-3" />
                                  Crédito
                                </>
                              )}
                            </button>

                            {/* Detalhes de Racha / Marcelo */}
                            {hasCompartilhado && (
                              <>
                                <span>•</span>
                                {isRecebido ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Pix {g.compartilhado?.comQuem || 'Marcelo'} recebido ({formatBRL(valorOutro)})
                                  </span>
                                ) : (
                                  <div className="inline-flex items-center gap-1">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                                      <Clock className="w-3 h-3" />
                                      Aguardando Pix {g.compartilhado?.comQuem || 'Marcelo'} ({formatBRL(valorOutro)})
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmPixReceived(g.id)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#16A34A] text-white hover:bg-[#15803D] transition-colors cursor-pointer shadow-2xs"
                                      title="Confirmar que recebeu o Pix deste pedido"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      Recebi Pix
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {hasCompartilhado ? (
                            <div className="text-right">
                              <span className="font-semibold text-sm text-[#202124] block">{formatBRL(g.valor)}</span>
                              <span className="text-[10px] text-[#15803D] font-bold block" title="Valor efetivo descontando a parte do Marcelo">
                                Sua parte: {formatBRL(suaParte)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold text-sm text-[#202124] mr-1">{formatBRL(g.valor)}</span>
                          )}
                          <button 
                            type="button"
                            onClick={() => handleOpenEditGasto(g)} 
                            className="p-1.5 text-[#5F6368] hover:bg-[#E8F0FE] hover:text-[#0B57D0] rounded-lg transition-colors"
                            title="Editar este gasto"
                            aria-label="Editar este gasto"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleRemoveGasto(g.id)} 
                            className="p-1.5 text-[#5F6368] hover:bg-[#F9DEDC] hover:text-[#B3261E] rounded-lg transition-colors"
                            title="Excluir este gasto"
                            aria-label="Excluir este gasto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-[#F1F3F4]">
            <button
              onClick={handleResetGastos}
              disabled={state.gastos.length === 0}
              className={`w-full font-medium py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors ${state.gastos.length === 0 ? 'bg-[#F1F3F4] text-[#9AA0A6] cursor-not-allowed' : 'bg-[#F9DEDC] text-[#B3261E] hover:bg-[#F2B8B5]'}`}
            >
              <Trash2 className="w-5 h-5" />
              Zerar Gastos do Mês
            </button>
          </div>
        </section>
          </div>
        )}

        {/* ABA: METAS & TETOS */}
        {activeTab === 'metas' && (
          <div className="space-y-6 animate-in fade-in duration-200">
        {/* Meus Tetos (Budgets) & Categorias */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-medium flex items-center gap-2 text-[#202124]">
                <Target className="w-5 h-5 text-[#0B57D0]" />
                Metas de Gastos por Categoria (Tetos)
              </h2>
              <p className="text-xs text-[#5F6368] mt-0.5">
                Todas as despesas (variáveis, fixas e parcelas) somam juntas na meta da sua categoria.
              </p>
            </div>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="self-start sm:self-auto bg-[#E8F0FE] text-[#0B57D0] hover:bg-[#D2E3FC] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Gerenciar Categorias & Metas</span>
            </button>
          </div>

          <div className="space-y-4">
            {state.tetos.map(t => {
              const breakdown = getCategoryBreakdown(t.categoria);
              const gasto = breakdown.total;
              const pct = Math.min(100, Math.max(0, (gasto / t.limite) * 100));
              const exceeds = gasto > t.limite;
              const almost = pct >= 80 && !exceeds;
              const barColor = exceeds ? 'bg-[#B3261E]' : almost ? 'bg-[#EA8600]' : 'bg-[#146C2E]';
              const catColor = getCategoryColor(t.categoria);
              const isExpanded = expandedTetoCategoria === t.categoria;

              return (
                <div key={t.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAED] transition-all hover:border-[#DADCE0]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                        <span className="font-bold text-[#202124] text-sm sm:text-base">{t.categoria}</span>
                        <span className="text-[11px] font-medium text-[#5F6368] bg-white border border-[#DADCE0] px-2 py-0.5 rounded-full">
                          {breakdown.itens.length} {breakdown.itens.length === 1 ? 'gasto' : 'gastos'}
                        </span>
                      </div>
                      
                      {/* Discriminador de componentes somados na meta */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
                        {breakdown.variaveis > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E8F0FE] text-[#0B57D0] font-medium">
                            Variáveis: {formatBRL(breakdown.variaveis)}
                          </span>
                        )}
                        {breakdown.fixos > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F3F4] text-[#202124] font-medium">
                            Fixos: {formatBRL(breakdown.fixos)}
                          </span>
                        )}
                        {breakdown.parcelas > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF8F3] text-[#A0460A] font-medium">
                            Parcelas: {formatBRL(breakdown.parcelas)}
                          </span>
                        )}
                        {gasto === 0 && (
                          <span className="text-[#9AA0A6] italic">Nenhum gasto nesta categoria</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm flex items-center justify-end">
                        <span className={`font-bold ${exceeds ? "text-[#B3261E]" : "text-[#202124]"}`}>{formatBRL(gasto)}</span>
                        <span className="text-[#5F6368] flex items-center gap-1">
                          &nbsp;/&nbsp;
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                value={t.limite || ''} 
                                onChange={e => handleUpdateTeto(t.id, Number(e.target.value))} 
                                className="border border-[#DADCE0] rounded px-2 py-0.5 w-24 text-right bg-white text-xs" 
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveTeto(t.id)}
                                className="p-1 text-[#5F6368] hover:text-[#B3261E] hover:bg-[#F9DEDC] rounded transition-colors"
                                title="Remover meta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-semibold">{formatBRL(t.limite)}</span>
                          )}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold block mt-0.5 ${exceeds ? 'text-[#B3261E]' : almost ? 'text-[#EA8600]' : 'text-[#146C2E]'}`}>
                        {exceeds ? `Passou ${formatBRL(gasto - t.limite)}` : `Faltam ${formatBRL(t.limite - gasto)}`}
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 bg-[#E8EAED] rounded-full overflow-hidden my-2">
                    <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>

                  {/* Botão para ver detalhes de cada gasto somado nesta meta */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setExpandedTetoCategoria(isExpanded ? null : t.categoria)}
                      className="text-[#0B57D0] hover:text-[#0842A0] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Ocultar gastos somados' : `Ver o que está somando aqui (${breakdown.itens.length})`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <span className="text-[11px] text-[#5F6368]">
                      {Math.round(pct)}% do teto
                    </span>
                  </div>

                  {/* Lista detalhada dos lançamentos nesta categoria */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[#E8EAED] space-y-2 animate-in fade-in duration-150">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#5F6368]">
                        Lançamentos somados nesta meta ({breakdown.itens.length}):
                      </p>
                      {breakdown.itens.length === 0 ? (
                        <p className="text-xs text-[#5F6368] italic py-1">Nenhum gasto fixo, parcelado ou variável nesta categoria até o momento.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                          {breakdown.itens.map(item => (
                            <div 
                              key={`${item.tipo}-${item.id}`}
                              className="p-2.5 rounded-xl bg-white border border-[#E8EAED] flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-[#202124] truncate">{item.nome}</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    item.tipo === 'Parcela' ? 'bg-[#FFF8F3] text-[#A0460A] border border-[#FED7AA]' :
                                    item.tipo === 'Fixo' ? 'bg-[#F1F3F4] text-[#202124]' :
                                    'bg-[#E8F0FE] text-[#0B57D0]'
                                  }`}>
                                    {item.tipo}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#5F6368] mt-0.5">{item.detalhe}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-bold text-[#202124]">{formatBRL(item.valor)}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.tipo === 'Parcela' || item.tipo === 'Fixo') {
                                      const conta = state.contas.find(c => c.id === item.id);
                                      if (conta) handleOpenEditConta(conta);
                                    } else {
                                      const gasto = state.gastos.find(g => g.id === item.id);
                                      if (gasto) handleOpenEditGasto(gasto);
                                    }
                                  }}
                                  className="p-1 text-[#5F6368] hover:text-[#0B57D0] hover:bg-[#E8F0FE] rounded transition-colors"
                                  title="Editar gasto ou categoria"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {state.tetos.length === 0 && (
              <div className="text-center py-6 bg-[#F8F9FA] rounded-2xl border border-dashed border-[#DADCE0]">
                <p className="text-sm font-medium text-[#202124] mb-1">Você ainda não definiu metas para nenhuma categoria.</p>
                <p className="text-xs text-[#5F6368] mb-4">Defina tetos mensais para acompanhar e limitar quanto gasta em Mercado, Uber, Lazer, etc.</p>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B57D0] text-white rounded-full text-xs font-semibold hover:bg-[#0842A0] transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Criar Meta por Categoria
                </button>
              </div>
            )}
          </div>
        </section>
        {/* Metas de Economia Mensal com Barra de Progresso Global */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2 text-[#202124]">
              <TrendingUp className="w-5 h-5 text-[#0B57D0]" />
              Metas de Economia Mensal
            </h2>
            <button
              onClick={handleOpenNewMeta}
              className="bg-[#E8F0FE] text-[#0B57D0] hover:bg-[#D2E3FC] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Meta</span>
            </button>
          </div>

          {/* Barra de Progresso Global */}
          <div className="p-5 bg-[#F8F9FA] rounded-[24px] border border-[#DADCE0] mb-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider block">
                  Progresso Global de Economia
                </span>
                <div className="text-2xl font-bold text-[#202124] mt-0.5">
                  {formatBRL(totalEconomizado)}{' '}
                  <span className="text-sm font-normal text-[#5F6368]">
                    de {formatBRL(totalMetaEconomiaAlvo)}
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                progressoEconomiaGlobal >= 100 
                  ? 'bg-[#E6F4EA] text-[#137333]' 
                  : progressoEconomiaGlobal >= 50 
                  ? 'bg-[#E8F0FE] text-[#0B57D0]' 
                  : 'bg-[#FEF7E0] text-[#B06000]'
              }`}>
                <Coins className="w-3.5 h-3.5" />
                <span>{progressoEconomiaGlobal}% atingido</span>
              </div>
            </div>

            {/* Barra de Progresso Visual Global */}
            <div className="w-full h-4 bg-[#E8EAED] rounded-full overflow-hidden relative mt-3">
              <div 
                className={`h-full transition-all duration-700 rounded-full ${
                  progressoEconomiaGlobal >= 100 
                    ? 'bg-[#146C2E]' 
                    : progressoEconomiaGlobal >= 70 
                    ? 'bg-[#0B57D0]' 
                    : 'bg-[#0EA5E9]'
                }`}
                style={{ width: `${progressoEconomiaGlobal}%` }}
              />
            </div>

            <div className="flex justify-between items-center mt-2.5 text-xs">
              <div className="text-[#5F6368]">
                {progressoEconomiaGlobal >= 100 ? (
                  <span className="text-[#137333] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Parabéns! Você atingiu sua meta global mensal!
                  </span>
                ) : (
                  <span>
                    Faltam <strong className="text-[#202124]">{formatBRL(faltaEconomizarGlobal)}</strong> para bater o objetivo deste mês.
                  </span>
                )}
              </div>
              <span className="font-semibold text-[#202124] text-[11px]">
                {metasEconomia.length} {metasEconomia.length === 1 ? 'meta ativa' : 'metas ativas'}
              </span>
            </div>
          </div>

          {/* Lista de Metas Individuais */}
          {metasEconomia.length === 0 ? (
            <div className="text-center py-6 text-sm text-[#5F6368]">
              <PiggyBank className="w-8 h-8 text-[#BDC1C6] mx-auto mb-2" />
              <p>Nenhuma meta de economia cadastrada ainda.</p>
              <button
                onClick={handleOpenNewMeta}
                className="mt-2 text-xs text-[#0B57D0] font-bold hover:underline"
              >
                + Criar primeira meta mensal
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {metasEconomia.map(meta => {
                const pctIndividual = meta.valorAlvo > 0 ? Math.min(100, Math.round((meta.valorAtual / meta.valorAlvo) * 100)) : 0;
                const concluida = meta.valorAtual >= meta.valorAlvo;

                return (
                  <div key={meta.id} className="p-4 rounded-[20px] bg-[#F8F9FA] border border-[#E8EAED] hover:border-[#DADCE0] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-[#202124] text-sm flex items-center gap-1.5">
                          {meta.titulo}
                          {concluida && <CheckCircle2 className="w-4 h-4 text-[#137333]" />}
                        </h4>
                        <p className="text-xs text-[#5F6368] mt-0.5">
                          Guardado: <strong className="text-[#202124]">{formatBRL(meta.valorAtual)}</strong> de {formatBRL(meta.valorAlvo)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditMeta(meta)}
                          className="p-1.5 text-[#5F6368] hover:text-[#0B57D0] hover:bg-[#E8F0FE] rounded-lg transition-colors"
                          title="Editar meta"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMeta(meta.id)}
                          className="p-1.5 text-[#5F6368] hover:text-[#B3261E] hover:bg-[#FCE8E6] rounded-lg transition-colors"
                          title="Excluir meta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Barra individual */}
                    <div className="w-full h-2.5 bg-[#E8EAED] rounded-full overflow-hidden mb-2.5">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          concluida ? 'bg-[#146C2E]' : 'bg-[#0B57D0]'
                        }`}
                        style={{ width: `${pctIndividual}%` }}
                      />
                    </div>

                    {/* Ações rápidas */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-medium text-[#5F6368]">
                        {concluida ? 'Objetivo alcançado!' : `${pctIndividual}% economizado`}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#5F6368] mr-1 hidden sm:inline">Aporte rápido:</span>
                        <button
                          onClick={() => handleQuickAddEconomia(meta.id, 50)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#DADCE0] text-[11px] font-semibold text-[#202124] hover:bg-[#F1F3F4] transition-colors"
                        >
                          + R$ 50
                        </button>
                        <button
                          onClick={() => handleQuickAddEconomia(meta.id, 100)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#DADCE0] text-[11px] font-semibold text-[#202124] hover:bg-[#F1F3F4] transition-colors"
                        >
                          + R$ 100
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
          </div>
        )}


      </main>

      <footer className="max-w-md mx-auto px-4 pb-12 text-center">
        <a
          href="/quanto-posso-gastar.zip"
          download="quanto-posso-gastar.zip"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#DADCE0] text-[#0B57D0] text-xs font-semibold hover:bg-[#F8F9FA] hover:border-[#0B57D0] transition-colors shadow-2xs"
          title="Baixar todo o código-fonte em formato ZIP"
        >
          <Download className="w-3.5 h-3.5" />
          Baixar Código Completo (.ZIP)
        </a>
      </footer>

      {/* Modal Adicionar Gasto */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#041E49] flex items-center gap-2">
                {editingContaId ? (
                  <>
                    <Pencil className="w-6 h-6 text-[#0B57D0]" />
                    {newExpenseType === 'Parcela' ? 'Editar Gasto Parcelado' : 'Editar Gasto Fixo'}
                  </>
                ) : editingGastoId ? (
                  <>
                    <Pencil className="w-6 h-6 text-[#0B57D0]" />
                    Editar Gasto Variável
                  </>
                ) : (
                  'Adicionar Novo Gasto'
                )}
              </h2>
              <button 
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingGastoId(null);
                  setEditingContaId(null);
                }} 
                className="p-2 bg-[#F1F3F4] rounded-full text-[#5F6368] hover:bg-[#E8EAED] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveNewExpense} className="space-y-5">
              <div>
                <label className="block text-[#041E49] font-bold mb-1.5">O que você comprou ou pagou?</label>
                <input 
                  type="text" 
                  required
                  value={newExpenseName}
                  onChange={e => {
                    const val = e.target.value;
                    setNewExpenseName(val);
                    if (!isCategoryManual && !editingGastoId && !editingContaId) {
                      setNewExpenseCategory(getCategoryFromName(val, state.categorias || DEFAULT_CATEGORIES));
                    }
                  }}
                  placeholder="Ex: Uber Centro, Mercado, TV Samsung, Aluguel..."
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#041E49] font-bold mb-1.5">Que tipo de gasto é esse?</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    onClick={() => setNewExpenseType('Fixo')}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-colors ${newExpenseType === 'Fixo' ? 'border-[#0B57D0] bg-[#E8F0FE] ring-1 ring-[#0B57D0]' : 'border-[#DADCE0] bg-white'}`}
                  >
                    <span className={`font-bold ${newExpenseType === 'Fixo' ? 'text-[#0B57D0]' : 'text-[#041E49]'}`}>Fixo</span>
                    <span className="text-[10px] sm:text-xs text-[#5F6368] mt-0.5">Ex: Luz, Aluguel</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewExpenseType('Parcela')}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-colors ${newExpenseType === 'Parcela' ? 'border-[#0B57D0] bg-[#E8F0FE] ring-1 ring-[#0B57D0]' : 'border-[#DADCE0] bg-white'}`}
                  >
                    <span className={`font-bold ${newExpenseType === 'Parcela' ? 'text-[#0B57D0]' : 'text-[#041E49]'}`}>Parcela</span>
                    <span className="text-[10px] sm:text-xs text-[#5F6368] mt-0.5">Ex: TV em 10x</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewExpenseType('Variável')}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-colors ${newExpenseType === 'Variável' ? 'border-[#0B57D0] bg-[#E8F0FE] ring-1 ring-[#0B57D0]' : 'border-[#DADCE0] bg-white'}`}
                  >
                    <span className={`font-bold ${newExpenseType === 'Variável' ? 'text-[#0B57D0]' : 'text-[#041E49]'}`}>Variável</span>
                    <span className="text-[10px] sm:text-xs text-[#5F6368] mt-0.5">Ex: Padaria, Uber</span>
                  </button>
                </div>
              </div>

              {/* Forma de Pagamento - Disponível para TODOS os tipos de gastos (Fixo, Parcela e Variável) */}
              <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-[#DADCE0]">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#041E49] uppercase tracking-wider">
                    Forma de Pagamento
                  </label>
                  {newExpenseForma === 'credito' ? (
                    <span className="text-[11px] font-bold text-[#0B57D0] bg-[#E8F0FE] border border-[#D2E3FC] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      Soma na Fatura do Cartão
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#5F6368] bg-white border border-[#DADCE0] px-2 py-0.5 rounded-full">
                      À vista / Saldo em Conta
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewExpenseForma('credito')}
                    className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-center ${
                      newExpenseForma === 'credito'
                        ? 'border-[#0B57D0] bg-[#E8F0FE] text-[#0B57D0] font-bold shadow-xs ring-1 ring-[#0B57D0]'
                        : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-[#F1F3F4]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#0B57D0]" />
                    <span className="text-xs font-bold">Crédito</span>
                    <span className="text-[10px] opacity-80">Fatura Cartão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewExpenseForma('debito')}
                    className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-center ${
                      newExpenseForma === 'debito'
                        ? 'border-[#0F9D58] bg-[#E6F4EA] text-[#0F9D58] font-bold shadow-xs ring-1 ring-[#0F9D58]'
                        : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-[#F1F3F4]'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-[#0F9D58]" />
                    <span className="text-xs font-bold">Débito</span>
                    <span className="text-[10px] opacity-80">Conta Bancária</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewExpenseForma('boleto')}
                    className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-center ${
                      newExpenseForma === 'boleto'
                        ? 'border-[#E37400] bg-[#FEF7E0] text-[#B06000] font-bold shadow-xs ring-1 ring-[#E37400]'
                        : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-[#F1F3F4]'
                    }`}
                  >
                    <Receipt className="w-4 h-4 text-[#E37400]" />
                    <span className="text-xs font-bold">Boleto</span>
                    <span className="text-[10px] opacity-80">Boleto / Guia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewExpenseForma('pix')}
                    className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-center ${
                      newExpenseForma === 'pix'
                        ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED] font-bold shadow-xs ring-1 ring-[#7C3AED]'
                        : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-[#F1F3F4]'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-[#7C3AED]" />
                    <span className="text-xs font-bold">Pix</span>
                    <span className="text-[10px] opacity-80">Transferência</span>
                  </button>
                </div>

                <p className="text-[11px] text-[#5F6368] mt-2.5 pt-2 border-t border-[#DADCE0]">
                  {newExpenseForma === 'credito' ? (
                    <span className="text-[#0B57D0] font-semibold flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      Este gasto entrará na <strong>Fatura do Cartão de Crédito</strong> deste mês.
                    </span>
                  ) : (
                    <span>
                      Gasto pago à vista ou debitado na conta corrente (não acumula na fatura de crédito).
                    </span>
                  )}
                </p>
              </div>

              {/* Seção detalhada para Parcelamentos */}
              {newExpenseType === 'Parcela' && (
                <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#DADCE0] space-y-4 animate-in fade-in duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-[#041E49] uppercase tracking-wider">
                        Número de Parcelas
                      </label>
                      <span className="text-xs font-bold text-[#0B57D0] bg-[#E8F0FE] px-2.5 py-0.5 rounded-full">
                        {parcelasTotal} parcelas ({parcelasTotal}x)
                      </span>
                    </div>

                    {/* Botões rápidos de parcelamento */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {[2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setParcelasTotal(num);
                            if (parcelaAtual > num) setParcelaAtual(num);
                          }}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border ${
                            parcelasTotal === num
                              ? 'bg-[#0B57D0] text-white border-[#0B57D0] shadow-xs'
                              : 'bg-white text-[#202124] border-[#DADCE0] hover:bg-[#E8EAED]'
                          }`}
                        >
                          {num}x
                        </button>
                      ))}
                    </div>

                    {/* Input manual de parcelas */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#5F6368]">Ou digite o total:</span>
                      <div className="flex items-center border border-[#DADCE0] bg-white rounded-lg px-2 py-1 w-32 focus-within:border-[#0B57D0]">
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={parcelasTotal}
                          onChange={e => {
                            const valNum = Math.max(1, Math.min(99, Number(e.target.value) || 1));
                            setParcelasTotal(valNum);
                            if (parcelaAtual > valNum) setParcelaAtual(valNum);
                          }}
                          className="w-full text-center font-bold text-sm text-[#041E49] focus:outline-none"
                        />
                        <span className="text-xs font-medium text-[#5F6368] ml-1">vezes</span>
                      </div>
                    </div>
                  </div>

                  {/* Parcela inicial */}
                  <div className="pt-3 border-t border-[#E8EAED] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#041E49] block">Parcela atual:</span>
                      <span className="text-[11px] text-[#5F6368]">Começa em 1 para compras novas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#5F6368]">Parcela</span>
                      <input
                        type="number"
                        min={1}
                        max={parcelasTotal}
                        value={parcelaAtual}
                        onChange={e => {
                          const p = Math.max(1, Math.min(parcelasTotal, Number(e.target.value) || 1));
                          setParcelaAtual(p);
                        }}
                        className="w-12 text-center font-bold text-sm bg-white border border-[#DADCE0] rounded-lg px-1.5 py-1 text-[#041E49] focus:outline-none focus:border-[#0B57D0]"
                      />
                      <span className="text-xs font-bold text-[#5F6368]">de {parcelasTotal}</span>
                    </div>
                  </div>

                  {/* Como informar o valor */}
                  <div className="pt-3 border-t border-[#E8EAED]">
                    <span className="text-xs font-bold text-[#041E49] block mb-2">Como você vai informar o valor?</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTipoValorParcela('parcela')}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center text-center transition-colors ${
                          tipoValorParcela === 'parcela'
                            ? 'border-[#0B57D0] bg-[#E8F0FE] text-[#0B57D0] shadow-2xs font-bold'
                            : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-[#F1F3F4]'
                        }`}
                      >
                        <span>Valor de cada parcela</span>
                        <span className="text-[10px] font-normal opacity-80 mt-0.5">ex: R$ 100/mês</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipoValorParcela('total')}
                        className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center text-center transition-colors ${
                          tipoValorParcela === 'total'
                            ? 'border-[#0B57D0] bg-[#E8F0FE] text-[#0B57D0] shadow-2xs font-bold'
                            : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-[#F1F3F4]'
                        }`}
                      >
                        <span>Valor total da compra</span>
                        <span className="text-[10px] font-normal opacity-80 mt-0.5">dividir automático</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-[#041E49] font-bold mb-1.5">
                  {newExpenseType === 'Parcela'
                    ? (tipoValorParcela === 'total' ? 'Qual o valor TOTAL da compra? (R$)' : 'Qual o valor de CADA parcela? (R$)')
                    : 'Qual o valor? (R$)'}
                </label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  required
                  value={newExpenseValue}
                  onChange={e => setNewExpenseValue(e.target.value)}
                  placeholder="0,00"
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors"
                />

                {/* Resumo dinâmico em tempo real para Parcelamentos */}
                {newExpenseType === 'Parcela' && newExpenseValue && (
                  <div className="mt-2.5 p-3 bg-[#E8F0FE] rounded-xl border border-[#D2E3FC] text-xs text-[#041E49] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0B57D0]">Resumo do Parcelamento</span>
                      <span className="font-bold bg-[#0B57D0] text-white px-2 py-0.5 rounded-full text-[10px]">
                        {String(parcelaAtual).padStart(2, '0')}/{String(parcelasTotal).padStart(2, '0')}
                      </span>
                    </div>
                    {(() => {
                      const valNum = parseCurrency(newExpenseValue) || 0;
                      const valParcela = tipoValorParcela === 'total'
                        ? (valNum / Math.max(1, parcelasTotal))
                        : valNum;
                      const valTotal = tipoValorParcela === 'total'
                        ? valNum
                        : (valNum * parcelasTotal);

                      return (
                        <div className="space-y-0.5 text-[#202124]">
                          <p>
                            Fatura deste mês: <strong className="text-[#0B57D0] text-sm">{formatBRL(valParcela)}</strong>
                          </p>
                          <p className="text-[#5F6368]">
                            {parcelasTotal} parcelas • Total da compra: {formatBRL(valTotal)}
                          </p>
                          <p className="text-[11px] text-[#5F6368] pt-1 border-t border-[#D2E3FC]">
                            Nome no lançamento: <strong>{newExpenseName.trim() || 'Compra'} ({String(parcelaAtual).padStart(2, '0')}/{String(parcelasTotal).padStart(2, '0')})</strong>
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-[#041E49] font-bold mb-1.5">
                  {newExpenseType === 'Parcela' || newExpenseType === 'Fixo' 
                    ? 'Data da Compra ou Vencimento da Fatura' 
                    : 'Qual a Data? (Vencimento ou Compra)'}
                </label>
                <input 
                  type="date" 
                  required
                  value={newExpenseDate}
                  onChange={e => setNewExpenseDate(e.target.value)}
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors bg-white"
                />
              </div>

              {/* Categorias - exibidas e selecionáveis para TODOS os tipos de gastos (Fixo, Parcela e Variável) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className="block text-[#041E49] font-bold text-sm">
                      Categoria {newExpenseType === 'Parcela' ? 'da Parcela' : newExpenseType === 'Fixo' ? 'do Gasto Fixo' : 'do Gasto'}
                    </label>
                    <span className="text-[11px] text-[#5F6368]">
                      Soma na sua <strong>Meta & Teto</strong> por Categoria
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsInlineAddingCategory(!isInlineAddingCategory)} 
                    className="text-xs text-[#0B57D0] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nova Categoria
                  </button>
                </div>

                {isInlineAddingCategory && (
                  <div className="mb-3 p-2.5 bg-[#F8F9FA] rounded-xl border border-[#0B57D0]/40 flex items-center gap-2 animate-in fade-in duration-200">
                    <input
                      type="text"
                      placeholder="Nome da nova categoria (ex: Livros)"
                      value={inlineCategoryInput}
                      onChange={e => setInlineCategoryInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleQuickCreateCategory();
                        }
                      }}
                      autoFocus
                      className="flex-1 bg-white border border-[#DADCE0] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0B57D0]"
                    />
                    <button
                      type="button"
                      onClick={handleQuickCreateCategory}
                      className="bg-[#0B57D0] text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-[#0842A0] transition-colors"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsInlineAddingCategory(false);
                        setInlineCategoryInput('');
                      }}
                      className="text-[#5F6368] hover:text-[#202124] p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1 py-1 mb-2">
                  {(state.categorias || DEFAULT_CATEGORIES).map(cat => {
                    const currentCat = isCategoryManual 
                      ? newExpenseCategory 
                      : (getCategoryFromName(newExpenseName, state.categorias || DEFAULT_CATEGORIES) || 'Outros');
                    const isSelected = currentCat === cat;
                    const catColor = getCategoryColor(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setNewExpenseCategory(cat);
                          setIsCategoryManual(true);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#0B57D0] text-white border-[#0B57D0] shadow-xs font-semibold'
                            : 'bg-[#F1F3F4] text-[#202124] border-transparent hover:bg-[#E8EAED]'
                        }`}
                      >
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: isSelected ? '#FFFFFF' : catColor }} 
                        />
                        {cat}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setIsInlineAddingCategory(true)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-[#0B57D0] text-[#0B57D0] hover:bg-[#E8F0FE] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Criar nova
                  </button>
                </div>
                <p className="text-xs text-[#5F6368]">Detectada automaticamente pelo nome ou clique para escolher.</p>
              </div>

              {/* Seção de Racha de Conta / Reembolso (ex: Pedidos de delivery c/ Marcelo via Pix) */}
              {newExpenseType === 'Variável' && (
                <div className="p-4 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#15803D] shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#166534] block">Dividir / Racha com alguém?</span>
                        <span className="text-[11px] text-[#15803D]">Ex: Pedidos de delivery / iFood c/ Marcelo</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isExpenseShared}
                        onChange={e => setIsExpenseShared(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#16A34A]"></div>
                    </label>
                  </div>

                  {isExpenseShared && (
                    <div className="space-y-3 pt-3 border-t border-[#BBF7D0] animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-[#166534] mb-1">Com quem?</label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={sharedWith}
                              onChange={e => setSharedWith(e.target.value)}
                              placeholder="Nome (ex: Marcelo)"
                              className="w-full bg-white border border-[#86EFAC] rounded-xl px-3 py-2 text-xs font-semibold text-[#14532D] focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
                            />
                            {sharedWith !== 'Marcelo' && (
                              <button
                                type="button"
                                onClick={() => setSharedWith('Marcelo')}
                                className="shrink-0 px-2.5 py-2 bg-white hover:bg-[#DCFCE7] border border-[#86EFAC] rounded-xl text-[11px] font-bold text-[#166534] cursor-pointer transition-colors"
                              >
                                Marcelo
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#166534] mb-1">Como dividir?</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSharedSplitType('50%')}
                              className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                sharedSplitType === '50%'
                                  ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs'
                                  : 'bg-white text-[#166534] border-[#86EFAC] hover:bg-[#DCFCE7]'
                              }`}
                            >
                              Metade (50%)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSharedSplitType('valor')}
                              className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                sharedSplitType === 'valor'
                                  ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs'
                                  : 'bg-white text-[#166534] border-[#86EFAC] hover:bg-[#DCFCE7]'
                              }`}
                            >
                              Outro Valor
                            </button>
                          </div>
                        </div>
                      </div>

                      {sharedSplitType === 'valor' && (
                        <div>
                          <label className="block text-[11px] font-bold text-[#166534] mb-1">
                            Valor que {sharedWith || 'o outro'} deve te pagar via Pix (R$):
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={sharedCustomValue}
                            onChange={e => setSharedCustomValue(e.target.value)}
                            placeholder="Ex: 45,00"
                            className="w-full bg-white border border-[#86EFAC] rounded-xl px-3 py-2 text-xs font-bold text-[#14532D] focus:outline-none focus:ring-1 focus:ring-[#16A34A]"
                          />
                        </div>
                      )}

                      {/* Resumo da divisão calculada */}
                      {(() => {
                        const valTotal = parseCurrency(newExpenseValue) || 0;
                        const valParte = sharedSplitType === '50%'
                          ? Number((valTotal / 2).toFixed(2))
                          : (parseCurrency(sharedCustomValue) || 0);
                        const suaParte = Math.max(0, Number((valTotal - valParte).toFixed(2)));

                        return (
                          <div className="p-3 bg-white rounded-xl border border-[#86EFAC] text-xs text-[#14532D] flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#15803D] uppercase font-bold block">Sua parte real:</span>
                              <span className="font-extrabold text-base text-[#14532D]">{formatBRL(suaParte)}</span>
                              <span className="text-[10px] text-[#5F6368] block">Impacto na fatura/gastos</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-[#15803D] uppercase font-bold block">Pix de {sharedWith || 'Marcelo'}:</span>
                              <span className="font-extrabold text-base text-[#16A34A]">+{formatBRL(valParte)}</span>
                              <span className="text-[10px] text-[#5F6368] block">Reembolso</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Status do Pix / Pagamento */}
                      <div>
                        <label className="block text-[11px] font-bold text-[#166534] mb-1.5">Status do Pix:</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSharedStatus('pendente')}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              sharedStatus === 'pendente'
                                ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B] shadow-xs'
                                : 'bg-white text-[#5F6368] border-[#86EFAC] hover:bg-[#DCFCE7]'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Aguardando Pix
                          </button>
                          <button
                            type="button"
                            onClick={() => setSharedStatus('recebido')}
                            className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              sharedStatus === 'recebido'
                                ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs'
                                : 'bg-white text-[#5F6368] border-[#86EFAC] hover:bg-[#DCFCE7]'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Já recebi o Pix!
                          </button>
                        </div>
                      </div>

                      {sharedStatus === 'recebido' && !editingGastoId && (
                        <div className="flex items-center gap-2 p-2 bg-[#DCFCE7] rounded-xl text-[11px] text-[#14532D]">
                          <input
                            type="checkbox"
                            id="autoPixCheckbox"
                            checked={sharedAutoCreatePix}
                            onChange={e => setSharedAutoCreatePix(e.target.checked)}
                            className="rounded border-[#16A34A] text-[#16A34A] focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="autoPixCheckbox" className="cursor-pointer font-medium">
                            Lançar automaticamente como <strong>Entrada no Saldo da Conta</strong> (Pix {sharedWith || 'Marcelo'})
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold py-4 rounded-xl transition-colors mt-2 text-lg shadow-sm cursor-pointer"
              >
                {editingContaId || editingGastoId ? 'Salvar Alterações' : 'Salvar Gasto'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Categorias & Limites */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-[32px] sm:rounded-[32px] p-6 shadow-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-[#F1F3F4] shrink-0">
              <h2 className="text-xl font-bold text-[#041E49] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#0B57D0]" />
                Categorias & Limites de Gastos
              </h2>
              <button 
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCatName('');
                  setNewCatTeto('');
                }} 
                className="p-2 bg-[#F1F3F4] rounded-full text-[#5F6368] hover:bg-[#E8EAED] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-4 space-y-6 pr-1">
              {/* Form Nova Categoria */}
              <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#DADCE0]">
                <h3 className="text-xs font-bold text-[#041E49] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-[#0B57D0]" />
                  Adicionar Nova Categoria
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCatName.trim()) return;
                    const parsedTeto = newCatTeto ? parseCurrency(newCatTeto) : undefined;
                    handleAddCategory(newCatName, parsedTeto);
                    setNewCatName('');
                    setNewCatTeto('');
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#5F6368] mb-1">
                        Nome da Categoria
                      </label>
                      <input
                        type="text"
                        required
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        placeholder="Ex: Academia, Livros, Cursos..."
                        className="w-full border border-[#DADCE0] rounded-xl px-3.5 py-2.5 text-xs bg-white focus:outline-none focus:border-[#0B57D0]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#5F6368] mb-1">
                        Teto Mensal Opcional (R$)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={newCatTeto}
                        onChange={e => setNewCatTeto(e.target.value)}
                        placeholder="Ex: 300,00"
                        className="w-full border border-[#DADCE0] rounded-xl px-3.5 py-2.5 text-xs bg-white focus:outline-none focus:border-[#0B57D0]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0B57D0] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#0842A0] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Criar Categoria
                  </button>
                </form>
              </div>

              {/* Lista de Categorias Ativas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider">
                    Categorias Disponíveis ({(state.categorias || DEFAULT_CATEGORIES).length})
                  </h3>
                  <span className="text-[11px] text-[#5F6368]">
                    {state.tetos.length} com limite definido
                  </span>
                </div>

                <div className="space-y-2">
                  {(state.categorias || DEFAULT_CATEGORIES).map(cat => {
                    const catColor = getCategoryColor(cat);
                    const catData = getCategoryBreakdown(cat);
                    const associatedTeto = state.tetos.find(t => t.categoria.toLowerCase() === cat.toLowerCase());
                    const isDefault = DEFAULT_CATEGORIES.includes(cat);

                    return (
                      <div 
                        key={cat}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FA] border border-[#E8EAED] hover:border-[#DADCE0] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: catColor }} 
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-[#202124] truncate">{cat}</span>
                              {isDefault ? (
                                <span className="text-[10px] bg-[#E8EAED] text-[#5F6368] px-1.5 py-0.5 rounded font-normal">Padrão</span>
                              ) : (
                                <span className="text-[10px] bg-[#E8F0FE] text-[#0B57D0] px-1.5 py-0.5 rounded font-medium">Personalizada</span>
                              )}
                            </div>
                            <p className="text-xs text-[#5F6368]">
                              {catData.itens.length > 0 ? (
                                <span>
                                  {catData.itens.length} item(ns) • Total <strong>{formatBRL(catData.total)}</strong>
                                  <span className="opacity-80 text-[11px] block sm:inline sm:ml-1">
                                    ({[
                                      catData.variaveis > 0 ? `Var: ${formatBRL(catData.variaveis)}` : null,
                                      catData.fixos > 0 ? `Fixo: ${formatBRL(catData.fixos)}` : null,
                                      catData.parcelas > 0 ? `Parc: ${formatBRL(catData.parcelas)}` : null,
                                    ].filter(Boolean).join(' • ')})
                                  </span>
                                </span>
                              ) : 'Sem gastos vinculados neste mês'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {associatedTeto ? (
                            <div className="flex items-center gap-1.5 bg-[#E6F4EA] text-[#137333] px-2.5 py-1 rounded-lg text-xs font-semibold">
                              <span>Teto: {formatBRL(associatedTeto.limite)}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTeto(associatedTeto.id)}
                                className="text-[#5F6368] hover:text-[#B3261E] ml-1"
                                title="Remover teto desta categoria"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                handleAddCategory(cat, 300);
                              }}
                              className="text-xs text-[#0B57D0] hover:bg-[#E8F0FE] px-2.5 py-1 rounded-lg border border-[#0B57D0]/30 font-medium transition-colors"
                            >
                              + Limite (R$ 300)
                            </button>
                          )}

                          {!isDefault && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-[#5F6368] hover:text-[#B3261E] hover:bg-[#F9DEDC] rounded-lg transition-colors ml-1"
                              title="Excluir categoria"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F1F3F4] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCatName('');
                  setNewCatTeto('');
                }}
                className="w-full bg-[#F1F3F4] text-[#202124] py-3 rounded-xl font-medium text-sm hover:bg-[#E8EAED] transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova / Editar Meta de Economia */}
      {isMetaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-[#041E49] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0B57D0]" />
                {editingMetaId ? 'Editar Meta de Economia' : 'Nova Meta de Economia'}
              </h2>
              <button 
                onClick={() => setIsMetaModalOpen(false)} 
                className="p-2 bg-[#F1F3F4] rounded-full text-[#5F6368] hover:bg-[#E8EAED] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeta} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#041E49] mb-1.5 uppercase tracking-wide">
                  Título da Meta
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={metaFormTitle}
                  onChange={e => setMetaFormTitle(e.target.value)}
                  placeholder="Ex: Reserva de Emergência, Viagem, Investimentos..."
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#041E49] mb-1.5 uppercase tracking-wide">
                  Objetivo / Meta Mensal (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={metaFormTarget}
                  onChange={e => setMetaFormTarget(e.target.value)}
                  placeholder="Ex: 500,00"
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#041E49] mb-1.5 uppercase tracking-wide">
                  Valor Já Guardado / Aporte Inicial (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={metaFormCurrent}
                  onChange={e => setMetaFormCurrent(e.target.value)}
                  placeholder="Ex: 150,00"
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors bg-white text-sm"
                />
                <p className="text-xs text-[#5F6368] mt-1.5">
                  Quanto você já guardou ou possui reservado para esta meta neste mês.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMetaModalOpen(false)}
                  className="flex-1 bg-[#F1F3F4] text-[#202124] py-3.5 rounded-xl font-medium text-sm hover:bg-[#E8EAED] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0B57D0] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#0842A0] transition-colors shadow-sm"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova / Editar Entrada de Saldo (Descritivo) */}
      {isItemSaldoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-[#041E49] flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#0F9D58]" />
                {editingItemSaldoId ? 'Editar Entrada de Saldo' : 'Nova Entrada de Saldo'}
              </h2>
              <button 
                onClick={() => setIsItemSaldoModalOpen(false)} 
                className="p-2 bg-[#F1F3F4] rounded-full text-[#5F6368] hover:bg-[#E8EAED] transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemSaldo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#041E49] mb-1.5 uppercase tracking-wide">
                  Origem do Recebimento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ORIGENS_ENTRADA.map(origem => {
                    const isSelected = itemSaldoOrigem === origem;
                    return (
                      <button
                        key={origem}
                        type="button"
                        onClick={() => {
                          setItemSaldoOrigem(origem);
                          if (!itemSaldoDescricao || ORIGENS_ENTRADA.includes(itemSaldoDescricao)) {
                            setItemSaldoDescricao(origem === 'Salário' ? 'Salário Mensal' : origem);
                          }
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          isSelected 
                            ? 'bg-[#0B57D0] text-white border-[#0B57D0] shadow-sm' 
                            : 'bg-[#F8F9FA] text-[#5F6368] border-[#DADCE0] hover:bg-[#E8EAED]'
                        }`}
                      >
                        {getOrigemIcon(origem)}
                        <span>{origem}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#041E49] mb-1.5 uppercase tracking-wide">
                  Descrição / Identificação
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={itemSaldoDescricao}
                  onChange={e => setItemSaldoDescricao(e.target.value)}
                  placeholder="Ex: Freela Landing Page, Venda Teclado, Bônus..."
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#041E49] mb-1.5 uppercase tracking-wide">
                    Valor Recebido (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={itemSaldoValor}
                    onChange={e => setItemSaldoValor(e.target.value)}
                    placeholder="Ex: 850,00"
                    className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors bg-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#041E49] mb-1.5 uppercase tracking-wide">
                    Data do Recebimento
                  </label>
                  <input
                    type="date"
                    value={itemSaldoData}
                    onChange={e => setItemSaldoData(e.target.value)}
                    className="w-full border border-[#DADCE0] rounded-xl px-3 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors bg-white text-sm"
                  />
                </div>
              </div>

              {/* Vincular Entrada de Pix a um Pedido / Gasto Compartilhado */}
              <div className="p-3.5 bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#166534] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#16A34A]" />
                    Vincular a um Pedido de Delivery / Racha?
                  </label>
                  {itemSaldoGastoVinculadoId && (
                    <button
                      type="button"
                      onClick={() => {
                        setItemSaldoGastoVinculadoId('');
                      }}
                      className="text-[11px] text-[#15803D] hover:underline font-semibold cursor-pointer"
                    >
                      Desvincular
                    </button>
                  )}
                </div>

                <select
                  value={itemSaldoGastoVinculadoId}
                  onChange={e => {
                    const selectedId = e.target.value;
                    setItemSaldoGastoVinculadoId(selectedId);
                    if (selectedId) {
                      const targetGasto = state.gastos.find(g => g.id === selectedId);
                      if (targetGasto) {
                        const valParte = targetGasto.compartilhado?.valorParteOutro || Number((targetGasto.valor / 2).toFixed(2));
                        setItemSaldoValor(valParte.toFixed(2).replace('.', ','));
                        setItemSaldoDescricao(`Pix ${targetGasto.compartilhado?.comQuem || 'Marcelo'} (Racha: ${targetGasto.descricao})`);
                        setItemSaldoOrigem('Racha / Reembolso');
                      }
                    }
                  }}
                  className="w-full bg-white border border-[#86EFAC] rounded-xl px-3 py-2 text-xs font-semibold text-[#14532D] focus:outline-none focus:ring-1 focus:ring-[#16A34A] cursor-pointer"
                >
                  <option value="">Nenhum (Entrada Avulsa / Renda Comum)</option>
                  {state.gastos
                    .filter(g => {
                      return g.compartilhado || g.categoria === 'Alimentação' || g.categoria === 'Delivery' || /delivery|ifood|lanche|pizza|marcelo/i.test(g.descricao) || g.id === itemSaldoGastoVinculadoId;
                    })
                    .map(g => {
                      const valorParte = g.compartilhado?.valorParteOutro || Number((g.valor / 2).toFixed(2));
                      const isPendente = g.compartilhado?.status === 'pendente';
                      const isVinculado = g.id === itemSaldoGastoVinculadoId;
                      return (
                        <option key={g.id} value={g.id}>
                          {g.descricao} ({formatBRL(g.valor)}) — Pix esperado: {formatBRL(valorParte)} {isPendente ? '• [Aguardando Pix]' : isVinculado ? '• [Vinculado]' : ''}
                        </option>
                      );
                    })}
                </select>

                {itemSaldoGastoVinculadoId ? (
                  <p className="text-[11px] text-[#15803D] pt-0.5">
                    ✓ Ao salvar, o pedido correspondente será marcado como <strong>"Pix Recebido"</strong> e compensará o gasto real da fatura.
                  </p>
                ) : (
                  <p className="text-[11px] text-[#15803D]/80">
                    Se este Pix for do Marcelo para pagar a parte dele de um delivery, selecione o pedido acima.
                  </p>
                )}
              </div>

              <div className="p-3 bg-[#E6F4EA] rounded-xl border border-[#CEEAD6] text-xs text-[#137333] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F9D58]" />
                <span>
                  O valor será somado ao seu Saldo em Conta e aumentará seu Saldo Livre e limite diário.
                </span>
              </div>

              <div className="flex gap-2.5 pt-2">
                {editingItemSaldoId && (
                  <button
                    type="button"
                    onClick={() => {
                      const idToRemove = editingItemSaldoId;
                      setIsItemSaldoModalOpen(false);
                      handleRemoveItemSaldo(idToRemove);
                    }}
                    className="px-4 py-3.5 bg-[#FCE8E6] text-[#C5221F] hover:bg-[#FAD2CF] rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    title="Excluir esta entrada"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsItemSaldoModalOpen(false)}
                  className="flex-1 bg-[#F1F3F4] text-[#202124] py-3.5 rounded-xl font-medium text-sm hover:bg-[#E8EAED] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0F9D58] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#0B8043] transition-colors shadow-sm cursor-pointer"
                >
                  {editingItemSaldoId ? 'Salvar Alterações' : 'Adicionar ao Saldo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[24px] p-6 shadow-xl animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-bold text-[#202124] mb-3">Confirmação</h3>
            <p className="text-sm text-[#5F6368] mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-5 py-2.5 rounded-full font-medium text-sm text-[#5F6368] hover:bg-[#F1F3F4] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-5 py-2.5 rounded-full font-bold text-sm bg-[#B3261E] text-white hover:bg-[#8C1D18] transition-colors shadow-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
