import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Wallet, Calendar, PiggyBank, Target, Trash2, CheckCircle2, Pencil, X, CreditCard, PieChart as PieChartIcon, TrendingUp, Coins } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { AppState, Conta, Gasto, Teto, MetaEconomia } from './types';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CATEGORY_COLORS: Record<string, string> = {
  'Uber': '#1F2937',       // Dark Charcoal
  'Delivery': '#EA4335',   // Coral Red
  'Mercado': '#FBBC04',    // Gold Yellow
  'Discos': '#4285F4',     // Google Blue
  'Saúde': '#34A853',      // Emerald Green
  'Transporte': '#0EA5E9', // Sky Blue
  'Lazer': '#A855F7',      // Purple
  'Outros': '#9AA0A6',     // Gray
};

const PALETTE_FALLBACK = ['#0B57D0', '#12B5CB', '#7C3AED', '#E65100', '#D93025', '#188038'];

const INITIAL_STATE: AppState = {
  rendaMensal: 7914.00,
  saldoConta: 7914.00,
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
  const [newExpenseCategory, setNewExpenseCategory] = useState('Outros');
  const [isCategoryManual, setIsCategoryManual] = useState(false);

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

  const getCategoryFromName = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('uber') || n.includes('99') || n.includes('corrida') || n.includes('taxi') || n.includes('táxi')) return 'Uber';
    if (n.includes('disco') || n.includes('vinil') || n.includes('cd') || n.includes('música') || n.includes('musica')) return 'Discos';
    if (n.includes('delivery') || n.includes('ifood') || n.includes('rappi') || n.includes('pizza') || n.includes('hambúrguer') || n.includes('lanche')) return 'Delivery';
    if (n.includes('mercado') || n.includes('padaria') || n.includes('supermercado') || n.includes('assai') || n.includes('atacadão') || n.includes('feira') || n.includes('compras')) return 'Mercado';
    if (n.includes('farmácia') || n.includes('farmacia') || n.includes('droga') || n.includes('médico') || n.includes('medico') || n.includes('saúde') || n.includes('saude') || n.includes('remedio') || n.includes('remédio')) return 'Saúde';
    if (n.includes('posto') || n.includes('gasolina') || n.includes('combustível') || n.includes('combustivel') || n.includes('ônibus') || n.includes('metro') || n.includes('transporte')) return 'Transporte';
    if (n.includes('roupa') || n.includes('shopping') || n.includes('cinema') || n.includes('lazer')) return 'Lazer';
    return 'Outros';
  };

  const handleOpenAddModal = () => {
    setNewExpenseName('');
    setNewExpenseValue('');
    setNewExpenseDate(getTodayLocal());
    setNewExpenseType('Variável');
    setNewExpenseCategory('Outros');
    setIsCategoryManual(false);
    setIsAddModalOpen(true);
  };

  const handleSaveNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseName || !newExpenseValue) return;
    const val = parseCurrency(newExpenseValue);
    if (isNaN(val) || val <= 0) return;
    
    const finalDate = newExpenseDate || getTodayLocal();

    if (newExpenseType === 'Variável') {
      const finalCat = isCategoryManual && newExpenseCategory 
        ? newExpenseCategory 
        : (getCategoryFromName(newExpenseName) || 'Outros');

      setState(prev => ({
        ...prev,
        gastos: [{
          id: Math.random().toString(36).substr(2, 9),
          descricao: newExpenseName,
          valor: val,
          data: finalDate,
          categoria: finalCat
        }, ...prev.gastos]
      }));
    } else {
      const dia = Number(finalDate.split('-')[2]) || new Date().getDate();
      setState(prev => ({
        ...prev,
        contas: [...prev.contas, {
          id: Math.random().toString(36).substr(2, 9),
          nome: newExpenseName,
          valor: val,
          diaVencimento: dia,
          grupo: newExpenseType === 'Fixo' ? 'Gastos Fixos' : 'Parcelamentos'
        }]
      }));
    }
    
    setIsAddModalOpen(false);
    setNewExpenseName('');
    setNewExpenseValue('');
    setNewExpenseDate(getTodayLocal());
    setNewExpenseType('Variável');
    setNewExpenseCategory('Outros');
    setIsCategoryManual(false);
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

  // Total de gastos variáveis registrados na fatura/mês
  const totalGastosFatura = state.gastos.reduce((acc, g) => acc + (Number(g.valor) || 0), 0);

  // Contas fixas e parceladas
  const totalContas = state.contas.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
  const saldoLivre = state.saldoConta - totalContas - totalMetaEconomiaAlvo - totalGastosFatura;

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
      percentage: totalGastosFatura > 0 ? ((valor / totalGastosFatura) * 100).toFixed(1) : '0',
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
          
          {!isEditing && (
            <div className="mt-6 p-4 bg-[#F8F9FA] rounded-[20px] border border-[#E8EAED]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#5F6368] text-sm">Gasto na Fatura / Mês</span>
                <span className="font-medium text-[#B3261E]">{formatBRL(totalGastosFatura)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
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
                Saldo base: {formatBRL(state.saldoConta)}.<br/>
                Já descontados {formatBRL(totalContas)} de contas a pagar, {formatBRL(totalMetaEconomiaAlvo)} de metas de economia e {formatBRL(totalGastosFatura)} em gastos variáveis deste mês.
              </>
            )}
          </div>
        </section>

        {/* Botão Adicionar Gasto Principal */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0] text-center">
          <h2 className="text-lg font-medium mb-1 text-[#202124]">Adicionar Nova Despesa</h2>
          <p className="text-sm mb-4 text-[#5F6368]">Registre compras variáveis, parcelamentos ou novas contas fixas.</p>
          <button 
            onClick={handleOpenAddModal}
            className="w-full bg-[#0B57D0] text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#0842A0] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Gasto
          </button>
        </section>

        {/* Meus Tetos (Budgets) */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0]">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#0B57D0]" />
            Meus Limites (Tetos)
          </h2>
          <div className="space-y-5">
            {state.tetos.map(t => {
              const gasto = gastosPorCategoria[t.categoria] || 0;
              const pct = Math.min(100, Math.max(0, (gasto / t.limite) * 100));
              const exceeds = gasto > t.limite;
              const almost = pct >= 80 && !exceeds;
              const barColor = exceeds ? 'bg-[#B3261E]' : almost ? 'bg-[#EA8600]' : 'bg-[#146C2E]';

              return (
                <div key={t.id}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-medium">{t.categoria}</span>
                    <span className="text-sm flex items-center">
                      <span className={exceeds ? "text-[#B3261E] font-bold" : ""}>{formatBRL(gasto)}</span>
                      <span className="text-[#5F6368] flex items-center gap-1">
                        &nbsp;/&nbsp;
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={t.limite || ''} 
                            onChange={e => handleUpdateTeto(t.id, Number(e.target.value))} 
                            className="border border-[#DADCE0] rounded px-2 py-0.5 w-24 text-right bg-white" 
                          />
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

        {/* Últimos Gastos */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-[#0B57D0]" />
              Últimos Gastos
            </h2>
            {totalGastosFatura > 0 && (
              <span className="text-xs font-semibold text-[#5F6368] bg-[#F1F3F4] px-2.5 py-1 rounded-full">
                Total: {formatBRL(totalGastosFatura)}
              </span>
            )}
          </div>

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
                          fill={CATEGORY_COLORS[entry.name] || PALETTE_FALLBACK[index % PALETTE_FALLBACK.length]} 
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
                  const color = CATEGORY_COLORS[item.name] || PALETTE_FALLBACK[index % PALETTE_FALLBACK.length];
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
              <h3 className="text-xs font-bold text-[#5F6368] uppercase tracking-wider mb-2">
                Histórico Recente
              </h3>
              {state.gastos.slice(0, 5).map(g => (
                <div key={g.id} className="flex justify-between items-center py-2 border-b border-[#F1F3F4] last:border-0">
                  <div>
                    <p className="font-medium">{g.descricao}</p>
                    <p className="text-xs text-[#5F6368]">{g.categoria} • {formatDateBR(g.data)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatBRL(g.valor)}</span>
                    <button onClick={() => handleRemoveGasto(g.id)} className="p-1.5 text-[#5F6368] hover:bg-[#F9DEDC] hover:text-[#B3261E] rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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

      {/* Modal Adicionar Gasto */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#041E49]">Adicionar Novo Gasto</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-[#F1F3F4] rounded-full text-[#5F6368] hover:bg-[#E8EAED] transition-colors">
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
                    if (!isCategoryManual) {
                      setNewExpenseCategory(getCategoryFromName(val));
                    }
                  }}
                  placeholder="Ex: Uber Centro, Mercado, Padaria..."
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[#041E49] font-bold mb-1.5">Qual o valor? (R$)</label>
                <input 
                  type="text"
                  inputMode="decimal"
                  required
                  value={newExpenseValue}
                  onChange={e => setNewExpenseValue(e.target.value)}
                  placeholder="0,00"
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[#041E49] font-bold mb-1.5">Qual a Data? (Vencimento ou Compra)</label>
                <input 
                  type="date"
                  required
                  value={newExpenseDate}
                  onChange={e => setNewExpenseDate(e.target.value)}
                  className="w-full border border-[#DADCE0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] transition-colors bg-white"
                />
              </div>
              
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
              
              <div>
                <label className="block text-[#041E49] font-bold mb-1.5">Categoria</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Uber', 'Delivery', 'Mercado', 'Discos', 'Saúde', 'Transporte', 'Lazer', 'Outros'].map(cat => {
                    const currentCat = isCategoryManual ? newExpenseCategory : (getCategoryFromName(newExpenseName) || 'Outros');
                    const isSelected = currentCat === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setNewExpenseCategory(cat);
                          setIsCategoryManual(true);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-[#0B57D0] text-white border-[#0B57D0] shadow-xs'
                            : 'bg-[#F1F3F4] text-[#202124] border-transparent hover:bg-[#E8EAED]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#5F6368]">Detectada automaticamente ou toque para escolher.</p>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold py-4 rounded-xl transition-colors mt-2 text-lg shadow-sm"
              >
                Salvar Gasto
              </button>
            </form>
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
