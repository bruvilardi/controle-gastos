import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Wallet, Calendar, PiggyBank, Target, Trash2, CheckCircle2, Pencil, X, CreditCard, Banknote, PieChart as PieChartIcon, TrendingUp, Coins, Tag, FolderPlus, Settings2, Download, Briefcase, Laptop, ShoppingBag, ChevronDown, ChevronUp, ArrowDownLeft } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { AppState, Conta, Gasto, Teto, MetaEconomia, ItemSaldo } from './types';
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

export const ORIGENS_ENTRADA = ['Salário', 'Freela', 'Vendas', 'Investimentos', 'Outros'];

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
    { id: 'f1', nome: 'Boleto Partner Instituição', valor: 510.50, diaVencimento: 5, grupo: 'Gastos Fixos' },
    { id: 'f2', nome: 'Neoenergia (Luz)', valor: 307.43, diaVencimento: 10, grupo: 'Gastos Fixos' },
    { id: 'f3', nome: 'Telefônica (Internet)', valor: 156.60, diaVencimento: 10, grupo: 'Gastos Fixos' },
    { id: 'f4', nome: 'DAS / Receita Federal', valor: 86.05, diaVencimento: 20, grupo: 'Gastos Fixos' },
    { id: 'f5', nome: 'Claro Celular', valor: 49.91, diaVencimento: 15, grupo: 'Gastos Fixos' },
    { id: 'f6', nome: 'Seguro Cartão Itaú', valor: 9.90, diaVencimento: 10, grupo: 'Gastos Fixos' },
    
    { id: 'c1', nome: 'Google One', valor: 119.98, diaVencimento: 12, grupo: 'Gastos Fixos' },
    { id: 'c3', nome: 'Apple.com/Bill (1)', valor: 42.90, diaVencimento: 12, grupo: 'Gastos Fixos' },
    { id: 'c5', nome: 'HBO Max', valor: 22.45, diaVencimento: 12, grupo: 'Gastos Fixos' },
    { id: 'c8', nome: 'iFood Club', valor: 12.90, diaVencimento: 12, grupo: 'Gastos Fixos' },
    
    { id: 'p1', nome: 'Academia Vasco (06/12)', valor: 253.49, diaVencimento: 12, grupo: 'Parcelamentos' },
    { id: 'p2', nome: 'Nuv Fanatiksao (01/08)', valor: 162.37, diaVencimento: 12, grupo: 'Parcelamentos' },
    { id: 'p3', nome: 'Globo Globoplay (07/12)', valor: 22.90, diaVencimento: 12, grupo: 'Parcelamentos' },
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
  const [newExpenseForma, setNewExpenseForma] = useState<'credito' | 'debito'>('credito');
  const [editingGastoId, setEditingGastoId] = useState<string | null>(null);
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState<'todos' | 'credito' | 'debito'>('todos');
  const [showAllGastos, setShowAllGastos] = useState(false);

  // Categorias management states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatTeto, setNewCatTeto] = useState('');
  const [isInlineAddingCategory, setIsInlineAddingCategory] = useState(false);
  const [inlineCategoryInput, setInlineCategoryInput] = useState('');

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

  const handleOpenAddItemSaldo = (origemDefault = 'Freela') => {
    setEditingItemSaldoId(null);
    setItemSaldoDescricao('');
    setItemSaldoValor('');
    setItemSaldoOrigem(origemDefault);
    setItemSaldoData(getTodayLocal());
    setIsItemSaldoModalOpen(true);
  };

  const handleOpenEditItemSaldo = (item: ItemSaldo) => {
    setEditingItemSaldoId(item.id);
    setItemSaldoDescricao(item.descricao);
    setItemSaldoValor(item.valor.toString());
    setItemSaldoOrigem(item.origem || 'Outros');
    setItemSaldoData(item.data || getTodayLocal());
    setIsItemSaldoModalOpen(true);
  };

  const handleSaveItemSaldo = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseCurrency(itemSaldoValor);
    if (isNaN(val) || val <= 0) return;

    setState(prev => {
      const currentItens: ItemSaldo[] = prev.itensSaldo && prev.itensSaldo.length > 0
        ? [...prev.itensSaldo]
        : [{ id: 'sal-base', descricao: 'Salário Base', valor: prev.saldoConta, origem: 'Salário' }];

      let updatedItens: ItemSaldo[];
      if (editingItemSaldoId) {
        updatedItens = currentItens.map(it =>
          it.id === editingItemSaldoId
            ? { ...it, descricao: itemSaldoDescricao.trim() || itemSaldoOrigem, valor: val, origem: itemSaldoOrigem, data: itemSaldoData }
            : it
        );
      } else {
        const newItem: ItemSaldo = {
          id: 'sal_' + Math.random().toString(36).substr(2, 9),
          descricao: itemSaldoDescricao.trim() || itemSaldoOrigem,
          valor: val,
          origem: itemSaldoOrigem,
          data: itemSaldoData
        };
        updatedItens = [newItem, ...currentItens];
      }

      const newTotalSaldo = updatedItens.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

      return {
        ...prev,
        itensSaldo: updatedItens,
        saldoConta: newTotalSaldo
      };
    });

    setIsItemSaldoModalOpen(false);
    setEditingItemSaldoId(null);
    setItemSaldoDescricao('');
    setItemSaldoValor('');
  };

  const handleRemoveItemSaldo = (id: string) => {
    const currentItens = state.itensSaldo || [];
    const target = currentItens.find(it => it.id === id);
    if (!target) return;

    setConfirmDialog({
      message: `Deseja remover "${target.descricao}" (${formatBRL(target.valor)}) das suas entradas de saldo?`,
      onConfirm: () => {
        setState(prev => {
          const updatedItens = (prev.itensSaldo || []).filter(it => it.id !== id);
          const newTotalSaldo = updatedItens.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
          return {
            ...prev,
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
    if (n.includes('farmácia') || n.includes('farmacia') || n.includes('droga') || n.includes('médico') || n.includes('medico') || n.includes('saúde') || n.includes('saude') || n.includes('remedio') || n.includes('remédio') || n.includes('exame') || n.includes('dentista') || n.includes('hospital') || n.includes('consulta') || n.includes('óptica') || n.includes('optica')) return 'Saúde';
    if (n.includes('posto') || n.includes('gasolina') || n.includes('combustível') || n.includes('combustivel') || n.includes('etanol') || n.includes('ônibus') || n.includes('onibus') || n.includes('metro') || n.includes('metrô') || n.includes('passagem') || n.includes('pedágio') || n.includes('estacionamento') || n.includes('transporte') || n.includes('bilhete')) return 'Transporte';
    if (n.includes('aluguel') || n.includes('condomínio') || n.includes('condominio') || n.includes('iptu') || n.includes('luz') || n.includes('água') || n.includes('agua') || n.includes('gás') || n.includes('gas') || n.includes('moradia') || n.includes('reforma') || n.includes('móveis') || n.includes('moveis') || n.includes('casa') || n.includes('leroy')) return 'Moradia';
    if (n.includes('curso') || n.includes('faculdade') || n.includes('escola') || n.includes('livro') || n.includes('udemy') || n.includes('educação') || n.includes('educacao') || n.includes('mensalidade') || n.includes('estudo')) return 'Educação';
    if (n.includes('roupa') || n.includes('calçado') || n.includes('calcado') || n.includes('tenis') || n.includes('tênis') || n.includes('sapato') || n.includes('vestuário') || n.includes('vestuario') || n.includes('camisa') || n.includes('calça') || n.includes('zara') || n.includes('renner') || n.includes('c&a')) return 'Vestuário';
    if (n.includes('netflix') || n.includes('spotify') || n.includes('amazon') || n.includes('prime') || n.includes('disney') || n.includes('hbo') || n.includes('youtube') || n.includes('assinatura') || n.includes('software') || n.includes('streaming') || n.includes('apple') || n.includes('icloud') || n.includes('openai') || n.includes('chatgpt')) return 'Assinaturas';
    if (n.includes('barbearia') || n.includes('cabelo') || n.includes('salão') || n.includes('salao') || n.includes('manicure') || n.includes('cosmético') || n.includes('perfume') || n.includes('beleza') || n.includes('cuidados') || n.includes('depilação') || n.includes('estética') || n.includes('estetica') || n.includes('skincare')) return 'Cuidados Pessoais';
    if (n.includes('pet') || n.includes('veterinário') || n.includes('veterinario') || n.includes('ração') || n.includes('racao') || n.includes('cachorro') || n.includes('gato') || n.includes('petshop') || n.includes('cobasi') || n.includes('petz')) return 'Pet';
    if (n.includes('viagem') || n.includes('hotel') || n.includes('pousada') || n.includes('airbnb') || n.includes('passagens') || n.includes('voo') || n.includes('mala') || n.includes('turismo') || n.includes('booking')) return 'Viagem';
    if (n.includes('cinema') || n.includes('show') || n.includes('teatro') || n.includes('festa') || n.includes('lazer') || n.includes('jogo') || n.includes('game') || n.includes('shopping') || n.includes('ingresso') || n.includes('parque') || n.includes('balada')) return 'Lazer';
    return 'Outros';
  };

  const handleOpenAddModal = () => {
    setEditingGastoId(null);
    setNewExpenseName('');
    setNewExpenseValue('');
    setNewExpenseDate(getTodayLocal());
    setNewExpenseType('Variável');
    setParcelasTotal(10);
    setParcelaAtual(1);
    setTipoValorParcela('parcela');
    setNewExpenseCategory('Outros');
    setIsCategoryManual(false);
    setNewExpenseForma('credito');
    setIsInlineAddingCategory(false);
    setInlineCategoryInput('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditGasto = (gasto: Gasto) => {
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
    setIsAddModalOpen(true);
  };

  const handleToggleFormaPagamento = (gastoId: string) => {
    setState(prev => ({
      ...prev,
      gastos: prev.gastos.map(g => {
        if (g.id === gastoId) {
          const atual = g.formaPagamento || 'credito';
          return {
            ...g,
            formaPagamento: atual === 'credito' ? 'debito' : 'credito'
          };
        }
        return g;
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

    if (editingGastoId) {
      setState(prev => ({
        ...prev,
        gastos: prev.gastos.map(g => g.id === editingGastoId ? {
          ...g,
          descricao: newExpenseName.trim(),
          valor: val,
          data: finalDate,
          categoria: finalCat,
          formaPagamento: newExpenseForma
        } : g)
      }));
    } else if (newExpenseType === 'Variável') {
      setState(prev => ({
        ...prev,
        gastos: [{
          id: Math.random().toString(36).substr(2, 9),
          descricao: newExpenseName.trim(),
          valor: val,
          data: finalDate,
          categoria: finalCat,
          formaPagamento: newExpenseForma
        }, ...prev.gastos]
      }));
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
          grupo: 'Parcelamentos'
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
          grupo: 'Gastos Fixos'
        }]
      }));
    }
    
    setIsAddModalOpen(false);
    setEditingGastoId(null);
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
        if (!parsedState.itensSaldo || parsedState.itensSaldo.length === 0) {
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

  const totalGastosVariaveisCredito = state.gastos
    .filter(g => (g.formaPagamento || 'credito') === 'credito')
    .reduce((acc, g) => acc + (Number(g.valor) || 0), 0);

  const totalGastosVariaveisDebito = state.gastos
    .filter(g => g.formaPagamento === 'debito')
    .reduce((acc, g) => acc + (Number(g.valor) || 0), 0);

  const countCredito = state.gastos.filter(g => (g.formaPagamento || 'credito') === 'credito').length;
  const countDebito = state.gastos.filter(g => g.formaPagamento === 'debito').length;

  const pctCredito = totalGastosVariaveis > 0 
    ? Math.round((totalGastosVariaveisCredito / totalGastosVariaveis) * 100) 
    : 0;
  const pctDebito = totalGastosVariaveis > 0 
    ? Math.round((totalGastosVariaveisDebito / totalGastosVariaveis) * 100) 
    : 0;

  const gastosFiltrados = state.gastos.filter(g => {
    if (filtroFormaPagamento === 'todos') return true;
    const forma = g.formaPagamento || 'credito';
    return forma === filtroFormaPagamento;
  });

  // Descritivo do Saldo: Entradas (Salário, Freela, Vendas, etc.)
  const listaItensSaldo: ItemSaldo[] = (state.itensSaldo && state.itensSaldo.length > 0)
    ? state.itensSaldo
    : [{ id: 'sal-base', descricao: 'Salário Base', valor: state.saldoConta, origem: 'Salário' }];

  const totalItensSaldo = listaItensSaldo.reduce((acc, it) => acc + (Number(it.valor) || 0), 0);

  // Total do Gasto na Fatura / Mês: Gastos Fixos + Gastos Variáveis + Parcelamentos (parcelas ativas no mês)
  const totalGastoNaFaturaMes = totalGastosFixos + totalGastosVariaveis + totalParcelamentos;

  // Total de contas agendadas (fixas e parceladas)
  const totalContas = totalGastosFixos + totalParcelamentos;
  const saldoLivre = state.saldoConta - totalGastoNaFaturaMes - totalMetaEconomiaAlvo;

  const totalDiasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diasRestantes = Math.max(1, totalDiasMes - diaAtual + 1); // Include today
  const limiteDiario = Math.max(0, saldoLivre / diasRestantes);

  const gastosPorCategoria = state.gastos.reduce((acc, g) => {
    const val = Number(g.valor) || 0;
    acc[g.categoria] = (acc[g.categoria] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = (Object.entries(gastosPorCategoria) as [string, number][])
    .filter(([_, valor]) => valor > 0)
    .map(([categoria, valor]) => ({
      name: categoria,
      value: valor,
      percentage: totalGastosVariaveis > 0 ? ((valor / totalGastosVariaveis) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.value - a.value);

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

  const handleUpdateConta = (id: string, field: 'nome' | 'valor', value: string | number) => {
    setState(prev => ({
      ...prev,
      contas: prev.contas.map(c => c.id === id ? { ...c, [field]: value } : c)
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
    setConfirmDialog({
      message: "Deseja realmente remover este gasto?",
      onConfirm: () => {
        setState(prev => ({
          ...prev,
          gastos: prev.gastos.filter(g => g.id !== id)
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
      <header className="bg-[#0B57D0] text-white pt-10 pb-16 px-6 rounded-b-[40px] shadow-sm">
        <div className="max-w-xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Finanças Simples</h1>
            <p className="opacity-90 mt-1 text-lg">Olá, Bruno! Dia {diaAtual}.</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`p-3 rounded-full transition-colors flex items-center gap-2 ${isEditing ? 'bg-white text-[#0B57D0]' : 'bg-white/20 hover:bg-white/30 text-white'}`}
          >
            {isEditing ? <CheckCircle2 className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 -mt-8 space-y-6">
        
        {/* Card Saldo Principal */}
        <section className="bg-white rounded-[28px] p-6 sm:p-8 shadow-sm border border-[#DADCE0]">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium text-[#5F6368] uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Saldo Livre
            </h2>
            <button
              onClick={() => {
                if (isEditingSaldo) {
                  const val = parseCurrency(tempSaldoInput);
                  if (!isNaN(val)) {
                    setState(prev => ({ ...prev, saldoConta: val }));
                  }
                  setIsEditingSaldo(false);
                } else {
                  setTempSaldoInput(state.saldoConta.toString());
                  setIsEditingSaldo(true);
                }
              }}
              className={`p-1.5 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isEditingSaldo 
                  ? 'bg-[#0B57D0] text-white hover:bg-[#0842A0]' 
                  : 'bg-[#F1F3F4] text-[#5F6368] hover:bg-[#E8EAED] hover:text-[#202124]'
              }`}
              title="Ajustar saldo em conta"
            >
              {isEditingSaldo ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </>
              ) : (
                <>
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Ajustar Saldo</span>
                </>
              )}
            </button>
          </div>

          {isEditingSaldo ? (
            <div className="my-3 p-4 bg-[#F8F9FA] rounded-2xl border border-[#0B57D0]/30 space-y-2 animate-in fade-in duration-200">
              <label className="block text-xs font-bold text-[#041E49]">
                Saldo Atual em Conta (R$):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  value={tempSaldoInput}
                  onChange={e => setTempSaldoInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = parseCurrency(tempSaldoInput);
                      if (!isNaN(val)) {
                        setState(prev => ({ ...prev, saldoConta: val }));
                      }
                      setIsEditingSaldo(false);
                    } else if (e.key === 'Escape') {
                      setIsEditingSaldo(false);
                    }
                  }}
                  placeholder="0,00"
                  className="flex-1 bg-white border border-[#DADCE0] rounded-xl px-3 py-2 text-xl font-medium text-[#202124] focus:outline-none focus:border-[#0B57D0]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = parseCurrency(tempSaldoInput);
                    if (!isNaN(val)) {
                      setState(prev => ({ ...prev, saldoConta: val }));
                    }
                    setIsEditingSaldo(false);
                  }}
                  className="bg-[#0B57D0] text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-[#0842A0] transition-colors"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSaldo(false)}
                  className="p-2.5 text-[#5F6368] hover:bg-[#E8EAED] rounded-xl transition-colors"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#5F6368]">
                Altere o saldo real do banco. O Saldo Livre e o limite diário serão recalculados imediatamente.
              </p>
            </div>
          ) : (
            <div className="text-5xl font-medium tracking-tight mb-2">
              {formatBRL(saldoLivre)}
            </div>
          )}

          {/* Barra Resumo do Saldo em Conta & Toggle do Descritivo */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 pb-1 border-t border-[#F1F3F4] mt-3">
            <div className="text-xs text-[#5F6368] flex items-center flex-wrap gap-1.5">
              <span>Saldo em Conta:</span>
              <strong className="text-[#202124] font-semibold text-sm">{formatBRL(state.saldoConta)}</strong>
              <span className="text-[11px] bg-[#E8F0FE] text-[#0B57D0] px-2 py-0.5 rounded-full font-bold border border-[#D2E3FC]">
                {listaItensSaldo.length} {listaItensSaldo.length === 1 ? 'entrada' : 'entradas'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenAddItemSaldo('Freela')}
                className="text-xs font-semibold text-[#0B57D0] bg-[#E8F0FE] hover:bg-[#D2E3FC] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                title="Adicionar freela, venda ou outra renda"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Entrada</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDescritivoSaldoExpanded(!isDescritivoSaldoExpanded)}
                className="text-xs font-semibold text-[#5F6368] hover:text-[#202124] px-2 py-1 rounded-lg hover:bg-[#F1F3F4] transition-colors flex items-center gap-1"
              >
                <span>{isDescritivoSaldoExpanded ? 'Ocultar' : 'Descritivo'}</span>
                {isDescritivoSaldoExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Painel Descritivo do Saldo (Entradas / Freelas / Vendas / Salário) */}
          {isDescritivoSaldoExpanded && (
            <div className="mt-3 p-4 bg-[#F8F9FA] rounded-[24px] border border-[#DADCE0] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8F0FE] flex items-center justify-center text-[#0B57D0] shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#041E49] uppercase tracking-wider">
                      Descritivo do Saldo
                    </h3>
                    <p className="text-[11px] text-[#5F6368]">
                      Salário, freelas, vendas e outras rendas do mês
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddItemSaldo('Freela')}
                  className="bg-[#0B57D0] text-white hover:bg-[#0842A0] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Entrada</span>
                </button>
              </div>

              {/* Lista das Entradas */}
              <div className="space-y-2 pt-1">
                {listaItensSaldo.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-2.5 px-3 bg-white rounded-xl border border-[#E8EAED] hover:border-[#DADCE0] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <div className="shrink-0 p-1.5 rounded-lg bg-[#F8F9FA] border border-[#E8EAED]">
                        {getOrigemIcon(item.origem)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-medium text-[#202124] truncate">{item.descricao}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getOrigemBadgeClass(item.origem)} shrink-0`}>
                            {item.origem || 'Entrada'}
                          </span>
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
                        className="p-1.5 text-[#5F6368] hover:bg-[#E8F0FE] hover:text-[#0B57D0] rounded-lg transition-colors"
                        title="Editar entrada"
                        aria-label="Editar entrada"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemSaldo(item.id)}
                        className="p-1.5 text-[#5F6368] hover:bg-[#F9DEDC] hover:text-[#B3261E] rounded-lg transition-colors"
                        title="Remover entrada"
                        aria-label="Remover entrada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Barra de Ações Rápidas e Total */}
              <div className="pt-2 border-t border-[#E8EAED] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-[#5F6368]">
                  Total das entradas: <strong className="text-[#041E49] font-bold">{formatBRL(totalItensSaldo)}</strong>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#5F6368] mr-0.5">Adicionar:</span>
                  <button
                    type="button"
                    onClick={() => handleOpenAddItemSaldo('Freela')}
                    className="px-2 py-1 rounded-lg bg-white border border-[#E9D5FF] text-[#7C3AED] hover:bg-[#F3E8FF] font-semibold transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Laptop className="w-3 h-3" />
                    + Freela
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddItemSaldo('Vendas')}
                    className="px-2 py-1 rounded-lg bg-white border border-[#FED7AA] text-[#A0460A] hover:bg-[#FFF8F3] font-semibold transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    + Venda
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddItemSaldo('Outros')}
                    className="px-2 py-1 rounded-lg bg-white border border-[#DADCE0] text-[#5F6368] hover:bg-[#F1F3F4] font-semibold transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    + Outro
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {!isEditing && (
            <div className="mt-6 p-4 bg-[#F8F9FA] rounded-[20px] border border-[#E8EAED]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[#5F6368] text-sm">Gasto na Fatura / Mês</span>
                <span className="font-semibold text-lg text-[#B3261E]">{formatBRL(totalGastoNaFaturaMes)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#5F6368] mb-3">
                <span className="bg-white px-2 py-0.5 rounded-md border border-[#E8EAED]">Fixos: <strong>{formatBRL(totalGastosFixos)}</strong></span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-[#E8EAED]">Parcelas: <strong>{formatBRL(totalParcelamentos)}</strong></span>
                <span className="bg-white px-2 py-0.5 rounded-md border border-[#E8EAED]">
                  Variáveis: <strong>{formatBRL(totalGastosVariaveis)}</strong>
                  {totalGastosVariaveis > 0 && (
                    <span className="text-[10px] text-[#5F6368] ml-1">
                      (Crédito: <strong className="text-[#0B57D0]">{formatBRL(totalGastosVariaveisCredito)}</strong> • Débito: <strong className="text-[#0F9D58]">{formatBRL(totalGastosVariaveisDebito)}</strong>)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4 pt-2 border-t border-[#E8EAED]">
                <span className="text-[#5F6368] text-sm">Dias Restantes</span>
                <span className="font-medium text-[#202124]">{diasRestantes} dias</span>
              </div>
              <div className="pt-3 border-t border-[#DADCE0] flex justify-between items-center">
                <span className="font-medium text-[#202124]">Limite Diário Ideal</span>
                <span className="text-xl font-bold text-[#146C2E]">{formatBRL(limiteDiario)}</span>
              </div>
            </div>
          )}

          <div className="text-sm text-[#5F6368] leading-relaxed mt-4">
            {isEditing ? (
              <div className="space-y-3 bg-[#F8F9FA] p-4 rounded-xl">
                <label className="flex justify-between items-center">
                  <span className="font-medium text-[#202124]">Renda Mensal:</span>
                  <input 
                    type="number" 
                    value={state.rendaMensal || ''} 
                    onChange={e => setState({...state, rendaMensal: Number(e.target.value)})}
                    className="border border-[#DADCE0] rounded-lg px-3 py-1.5 w-32 text-right bg-white" 
                  />
                </label>
                <label className="flex justify-between items-center">
                  <span className="font-medium text-[#202124]">Ajustar Saldo Atual:</span>
                  <input 
                    type="number" 
                    value={state.saldoConta || ''} 
                    onChange={e => setState({...state, saldoConta: Number(e.target.value)})}
                    className="border border-[#DADCE0] rounded-lg px-3 py-1.5 w-32 text-right bg-white" 
                  />
                </label>
              </div>
            ) : (
              <>
                Saldo base: {formatBRL(state.saldoConta)} ({listaItensSaldo.length} {listaItensSaldo.length === 1 ? 'fonte de entrada' : 'fontes de entrada'}).<br/>
                Já descontados {formatBRL(totalGastoNaFaturaMes)} de fatura/mês (Fixos: {formatBRL(totalGastosFixos)}, Parcelas: {formatBRL(totalParcelamentos)}, Variáveis: {formatBRL(totalGastosVariaveis)}) e {formatBRL(totalMetaEconomiaAlvo)} de metas de economia.
              </>
            )}
          </div>
        </section>

        {/* Botões de Ação Principal: Gastos e Entradas */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0]">
          <h2 className="text-lg font-medium mb-1 text-[#202124]">Movimentações do Mês</h2>
          <p className="text-sm mb-4 text-[#5F6368]">Registre novas compras ou adicione novas entradas (freelas, vendas, salário).</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={handleOpenAddModal}
              className="w-full bg-[#0B57D0] text-white py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#0842A0] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar Gasto
            </button>
            <button 
              onClick={() => handleOpenAddItemSaldo('Freela')}
              className="w-full bg-[#0F9D58] text-white py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#0B8043] transition-colors"
            >
              <ArrowDownLeft className="w-5 h-5" />
              Adicionar Entrada / Freela
            </button>
          </div>
        </section>

        {/* Meus Tetos (Budgets) & Categorias */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2 text-[#202124]">
              <Target className="w-5 h-5 text-[#0B57D0]" />
              Meus Limites (Tetos)
            </h2>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-[#E8F0FE] text-[#0B57D0] hover:bg-[#D2E3FC] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Categorias & Limites</span>
            </button>
          </div>

          <div className="space-y-5">
            {state.tetos.map(t => {
              const gasto = gastosPorCategoria[t.categoria] || 0;
              const pct = Math.min(100, Math.max(0, (gasto / t.limite) * 100));
              const exceeds = gasto > t.limite;
              const almost = pct >= 80 && !exceeds;
              const barColor = exceeds ? 'bg-[#B3261E]' : almost ? 'bg-[#EA8600]' : 'bg-[#146C2E]';
              const catColor = getCategoryColor(t.categoria);

              return (
                <div key={t.id}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-medium flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                      {t.categoria}
                    </span>
                    <span className="text-sm flex items-center">
                      <span className={exceeds ? "text-[#B3261E] font-bold" : ""}>{formatBRL(gasto)}</span>
                      <span className="text-[#5F6368] flex items-center gap-1">
                        &nbsp;/&nbsp;
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              value={t.limite || ''} 
                              onChange={e => handleUpdateTeto(t.id, Number(e.target.value))} 
                              className="border border-[#DADCE0] rounded px-2 py-0.5 w-24 text-right bg-white" 
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveTeto(t.id)}
                              className="p-1 text-[#5F6368] hover:text-[#B3261E] hover:bg-[#F9DEDC] rounded transition-colors"
                              title="Remover teto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          formatBRL(t.limite)
                        )}
                      </span>
                    </span>
                  </div>
                  <div className="h-3 bg-[#F1F3F4] rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-[#5F6368] mt-1 text-right">
                    {exceeds ? `Passou ${formatBRL(gasto - t.limite)}` : `Faltam ${formatBRL(t.limite - gasto)}`}
                  </p>
                </div>
              );
            })}

            {state.tetos.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-[#5F6368] mb-3">Você ainda não definiu limites para nenhuma categoria.</p>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E8F0FE] text-[#0B57D0] rounded-full text-xs font-semibold hover:bg-[#D2E3FC] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Definir Teto para Categoria
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

        {/* Contas a Pagar */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0]">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0B57D0]" />
            Contas do Mês
          </h2>
          <div className="space-y-8">
            {['Gastos Fixos', 'Parcelamentos'].map(grupoNome => {
              const contasGrupo = state.contas
                .filter(c => c.grupo === grupoNome)
                .sort((a, b) => a.diaVencimento - b.diaVencimento);
              if (contasGrupo.length === 0) return null;
              
              const totalGrupo = contasGrupo.reduce((acc, c) => acc + c.valor, 0);

              return (
                <div key={grupoNome} className="space-y-3">
                  <div className="flex justify-between items-end px-2 border-b border-[#E8EAED] pb-2 mb-4">
                    <h3 className="font-medium text-[#202124]">{grupoNome}</h3>
                    <div className="text-right">
                      <span className="font-medium text-[#202124]">{formatBRL(totalGrupo)}</span>
                    </div>
                  </div>
                  {contasGrupo.map(conta => {
                    return (
                      <div key={conta.id} className="p-4 rounded-[16px] flex items-center justify-between transition-colors bg-[#F8F9FA] border border-[#DADCE0]">
                        <div className="flex-1 mr-4">
                          <h4 className="font-medium text-[15px] flex items-center gap-2">
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
                          {!isEditing && (
                            <p className="text-xs mt-0.5 opacity-90">
                              Vence dia {conta.diaVencimento} 
                            </p>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                value={conta.valor || ''} 
                                onChange={e => handleUpdateConta(conta.id, 'valor', Number(e.target.value))} 
                                className="border border-[#DADCE0] rounded px-2 py-1 w-24 text-right bg-white font-medium text-[15px]" 
                              />
                              <button onClick={() => handleRemoveConta(conta.id)} className="p-1.5 bg-[#F9DEDC] text-[#B3261E] rounded-md hover:bg-[#F2B8B5] transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="font-medium text-[15px]">{formatBRL(conta.valor)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
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
              </div>

              {gastosFiltrados.length === 0 ? (
                <div className="text-center py-6 bg-[#F8F9FA] rounded-2xl border border-dashed border-[#DADCE0]">
                  <p className="text-sm text-[#5F6368]">
                    Nenhum gasto encontrado no {filtroFormaPagamento === 'credito' ? 'Crédito' : 'Débito'}.
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
                    return (
                      <div key={g.id} className="flex justify-between items-center py-2.5 px-3 rounded-xl border border-[#F1F3F4] hover:bg-[#F8F9FA] transition-colors">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="font-medium text-sm text-[#202124] truncate">{g.descricao}</p>
                          <div className="text-xs text-[#5F6368] flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(g.categoria) }} />
                            <span>{g.categoria}</span>
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
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-semibold text-sm text-[#202124] mr-1">{formatBRL(g.valor)}</span>
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
                {editingGastoId ? (
                  <>
                    <Pencil className="w-6 h-6 text-[#0B57D0]" />
                    Editar Gasto
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
                    if (!isCategoryManual && !editingGastoId) {
                      setNewExpenseCategory(getCategoryFromName(val, state.categorias || DEFAULT_CATEGORIES));
                    }
                  }}
                  placeholder="Ex: Uber Centro, Mercado, TV Samsung..."
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors"
                />
              </div>

              {!editingGastoId && (
                <div>
                  <label className="block text-[#041E49] font-bold mb-1.5">Que tipo de gasto é esse?</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => setNewExpenseType('Fixo')}
                      className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-colors ${newExpenseType === 'Fixo' ? 'border-[#E67C3B] bg-[#FFF8F3]' : 'border-[#DADCE0] bg-white'}`}
                    >
                      <span className={`font-bold ${newExpenseType === 'Fixo' ? 'text-[#A0460A]' : 'text-[#041E49]'}`}>Fixo</span>
                      <span className="text-[10px] sm:text-xs text-[#5F6368] mt-0.5">Ex: Luz, Água</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewExpenseType('Parcela')}
                      className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-colors ${newExpenseType === 'Parcela' ? 'border-[#E67C3B] bg-[#FFF8F3]' : 'border-[#DADCE0] bg-white'}`}
                    >
                      <span className={`font-bold ${newExpenseType === 'Parcela' ? 'text-[#A0460A]' : 'text-[#041E49]'}`}>Parcela</span>
                      <span className="text-[10px] sm:text-xs text-[#5F6368] mt-0.5">Ex: TV em 10x</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewExpenseType('Variável')}
                      className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-colors ${newExpenseType === 'Variável' ? 'border-[#E67C3B] bg-[#FFF8F3]' : 'border-[#DADCE0] bg-white'}`}
                    >
                      <span className={`font-bold ${newExpenseType === 'Variável' ? 'text-[#A0460A]' : 'text-[#041E49]'}`}>Variável</span>
                      <span className="text-[10px] sm:text-xs text-[#5F6368] mt-0.5">Ex: Padaria</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Forma de Pagamento para Gastos Variáveis */}
              {(editingGastoId || newExpenseType === 'Variável') && (
                <div className="p-3.5 bg-[#F8F9FA] rounded-2xl border border-[#DADCE0] animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-[#041E49] uppercase tracking-wider mb-2">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewExpenseForma('credito')}
                      className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        newExpenseForma === 'credito'
                          ? 'border-[#0B57D0] bg-[#E8F0FE] text-[#0B57D0] font-bold shadow-xs ring-1 ring-[#0B57D0]'
                          : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-[#F1F3F4]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#0B57D0]" />
                      <span className="text-xs sm:text-sm">Cartão de Crédito</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExpenseForma('debito')}
                      className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        newExpenseForma === 'debito'
                          ? 'border-[#0F9D58] bg-[#E6F4EA] text-[#0F9D58] font-bold shadow-xs ring-1 ring-[#0F9D58]'
                          : 'border-[#DADCE0] bg-white text-[#5F6368] hover:bg-[#F1F3F4]'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-[#0F9D58]" />
                      <span className="text-xs sm:text-sm">Débito / Pix</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5F6368] mt-2 flex items-center gap-1">
                    {newExpenseForma === 'credito' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0B57D0] shrink-0" />
                        <span>Compra lançada na <strong>fatura do cartão</strong>.</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D58] shrink-0" />
                        <span>Saiu direto do <strong>saldo da conta</strong> (Débito ou Pix).</span>
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Seção detalhada para Parcelamentos */}
              {!editingGastoId && newExpenseType === 'Parcela' && (
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
                {!editingGastoId && newExpenseType === 'Parcela' && newExpenseValue && (
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
                            Nome na fatura: <strong>{newExpenseName.trim() || 'Compra'} ({String(parcelaAtual).padStart(2, '0')}/{String(parcelasTotal).padStart(2, '0')})</strong>
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

              {/* Categorias - exibidas para gastos variáveis ou edição de gasto */}
              {(editingGastoId || newExpenseType === 'Variável') && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[#041E49] font-bold text-sm">Categoria</label>
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
                  <p className="text-xs text-[#5F6368]">Detectada automaticamente pelo nome ou toque para escolher.</p>
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold py-4 rounded-xl transition-colors mt-2 text-lg shadow-sm"
              >
                {editingGastoId ? 'Salvar Alterações' : 'Salvar Gasto'}
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
                    const associatedTeto = state.tetos.find(t => t.categoria.toLowerCase() === cat.toLowerCase());
                    const gastosCount = state.gastos.filter(g => g.categoria.toLowerCase() === cat.toLowerCase()).length;
                    const gastosTotal = state.gastos
                      .filter(g => g.categoria.toLowerCase() === cat.toLowerCase())
                      .reduce((sum, g) => sum + (Number(g.valor) || 0), 0);
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
                              {gastosCount > 0 ? `${gastosCount} gasto(s) • Total ${formatBRL(gastosTotal)}` : 'Sem gastos neste mês'}
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

              <div className="p-3 bg-[#E6F4EA] rounded-xl border border-[#CEEAD6] text-xs text-[#137333] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F9D58]" />
                <span>
                  O valor será somado ao seu Saldo em Conta e aumentará seu Saldo Livre e limite diário.
                </span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsItemSaldoModalOpen(false)}
                  className="flex-1 bg-[#F1F3F4] text-[#202124] py-3.5 rounded-xl font-medium text-sm hover:bg-[#E8EAED] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0F9D58] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#0B8043] transition-colors shadow-sm"
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
