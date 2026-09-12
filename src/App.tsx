import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  PieChart,
  Receipt,
  Target,
  Plus,
} from 'lucide-react';
import {
  ConfigFinancas,
  Gasto,
  TabKey,
  Categoria,
  ItemFixo
} from './types';
import {
  CONFIG_PADRAO,
  GASTOS_INICIAIS,
  calcularFinancas,
  loadSavedData,
  saveLocalData,
  getDiasNoMes
} from './data/initialData';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BudgetsView } from './components/BudgetsView';
import { FixedExpensesView } from './components/FixedExpensesView';
import { GoalsAndSimulatorsView } from './components/GoalsAndSimulatorsView';
import { ExpenseModal } from './components/ExpenseModal';
import { CashUpdateModal } from './components/CashUpdateModal';
import { BackupModal } from './components/BackupModal';

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [cfg, setCfg] = useState<ConfigFinancas>(CONFIG_PADRAO);
  const [gastos, setGastos] = useState<Gasto[]>(GASTOS_INICIAIS);
  const [activeTab, setActiveTab] = useState<TabKey>('painel');

  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isCashUpdateOpen, setIsCashUpdateOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  useEffect(() => {
    const saved = loadSavedData();
    setCfg(saved.cfg);
    setGastos(saved.gastos);
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      saveLocalData(cfg, gastos);
    }
  }, [cfg, gastos, dataLoaded]);

  const hoje = useMemo(() => new Date(), []);
  const diaAtual = hoje.getDate();
  const diasNoMes = useMemo(() => getDiasNoMes(hoje), [hoje]);

  const calc = useMemo(() => calcularFinancas(cfg, gastos, hoje), [cfg, gastos, hoje]);

  const handleAddGasto = (novoGasto: Omit<Gasto, 'id'>) => {
    const gastoCriado: Gasto = {
      ...novoGasto,
      id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setGastos((prev) => [gastoCriado, ...prev]);
    setCfg((prev) => ({
      ...prev,
      faturaAberta: Number((prev.faturaAberta + novoGasto.valor).toFixed(2)),
    }));
  };

  const handleDeleteGasto = (id: string) => {
    const alvo = gastos.find((g) => g.id === id);
    setGastos((prev) => prev.filter((g) => g.id !== id));
    if (alvo) {
      setCfg((prev) => ({
        ...prev,
        faturaAberta: Number(Math.max(0, prev.faturaAberta - alvo.valor).toFixed(2)),
      }));
    }
  };

  const handlePayFatura = () => {
    setCfg((prev) => ({
      ...prev,
      saldoConta: Number((prev.saldoConta - prev.faturaAberta).toFixed(2)),
      faturaAberta: 0,
    }));
  };

  const handleUpdateCash = (data: { saldoConta: number; faturaAberta: number; diaFechamento: number }) => {
    setCfg((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleUpdateCategoria = (id: string, updates: Partial<Categoria>) => {
    setCfg((prev) => ({
      ...prev,
      categorias: prev.categorias.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const handleAddCategoria = () => {
    const nova: Categoria = {
      id: `cat-${Date.now()}`,
      nome: 'Nova Categoria',
      hist: 0,
      teto: 200,
    };
    setCfg((prev) => ({
      ...prev,
      categorias: [...prev.categorias, nova],
    }));
  };

  const handleRemoveCategoria = (id: string) => {
    setCfg((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((c) => c.id !== id),
    }));
  };

  const handleUpdateDisco = (key: keyof ConfigFinancas['disco'], value: number) => {
    setCfg((prev) => ({
      ...prev,
      disco: {
        ...prev.disco,
        [key]: value,
      },
    }));
  };

  const handleUpdateItem = (listName: 'contas' | 'parcelas' | 'assinaturas', id: string, updates: Partial<ItemFixo>) => {
    setCfg((prev) => ({
      ...prev,
      [listName]: prev[listName].map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  };

  const handleAddItem = (listName: 'contas' | 'parcelas' | 'assinaturas') => {
    const novo: ItemFixo = {
      id: `${listName}-${Date.now()}`,
      nome: listName === 'parcelas' ? 'Nova Parcela' : listName === 'contas' ? 'Nova Conta' : 'Nova Assinatura',
      valor: 50,
      ...(listName === 'parcelas' ? { restantes: 3 } : {}),
    };
    setCfg((prev) => ({
      ...prev,
      [listName]: [...prev[listName], novo],
    }));
  };

  const handleRemoveItem = (listName: 'contas' | 'parcelas' | 'assinaturas', id: string) => {
    setCfg((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((item) => item.id !== id),
    }));
  };

  const handleRestoreBackup = (newCfg: ConfigFinancas, newGastos: Gasto[]) => {
    setCfg(newCfg);
    setGastos(newGastos);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#202124]">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        diaAtual={diaAtual}
        diasNoMes={diasNoMes}
        diaFechamento={cfg.diaFechamento}
        onOpenExpense={() => setIsExpenseOpen(true)}
        onOpenCashUpdate={() => setIsCashUpdateOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-12">
        {activeTab === 'painel' && (
          <DashboardView
            cfg={cfg}
            calc={calc}
            gastos={gastos}
            diaAtual={diaAtual}
            diasNoMes={diasNoMes}
            onOpenExpense={() => setIsExpenseOpen(true)}
            onOpenCashUpdate={() => setIsCashUpdateOpen(true)}
            onDeleteGasto={handleDeleteGasto}
          />
        )}

        {activeTab === 'tetos' && (
          <BudgetsView
            cfg={cfg}
            calc={calc}
            onUpdateCategoria={handleUpdateCategoria}
            onAddCategoria={handleAddCategoria}
            onRemoveCategoria={handleRemoveCategoria}
            onUpdateDisco={handleUpdateDisco}
          />
        )}

        {activeTab === 'fixos' && (
          <FixedExpensesView
            cfg={cfg}
            calc={calc}
            onUpdateItem={handleUpdateItem}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />
        )}

        {activeTab === 'metas' && (
          <GoalsAndSimulatorsView
            cfg={cfg}
            calc={calc}
            diasNoMes={diasNoMes}
            onUpdateCfg={(updates) => setCfg((prev) => ({ ...prev, ...updates }))}
          />
        )}

        <footer className="mt-12 pt-6 border-t border-[#DADCE0] text-center text-xs text-[#5F6368] space-y-1">
          <p className="font-medium text-[#444746]">
            Quanto Posso Gastar · Design System Workspace
          </p>
          <p>
            Persistência local ativa. Seu teto é o saldo em conta, não o limite.
          </p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation Bar - MD3 Style */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#DADCE0] px-2 py-2 flex items-center justify-around shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        {[
          { key: 'painel', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Painel' },
          { key: 'tetos', icon: <PieChart className="w-5 h-5" />, label: 'Tetos' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`flex flex-col items-center gap-1 p-2 w-16 transition-all ${
              activeTab === tab.key ? 'text-[#0B57D0]' : 'text-[#444746]'
            }`}
          >
            <div className={`px-4 py-1 rounded-full ${activeTab === tab.key ? 'bg-[#D3E3FD]' : 'bg-transparent'}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}

        {/* Floating Action Button (FAB) in center */}
        <button
          onClick={() => setIsExpenseOpen(true)}
          className="flex items-center justify-center -mt-8 w-14 h-14 rounded-[16px] bg-[#D3E3FD] text-[#041E49] shadow-md hover:bg-[#C2D7FA] transition-transform active:scale-95"
          title="Lançar gasto"
        >
          <Plus className="w-7 h-7" />
        </button>

        {[
          { key: 'fixos', icon: <Receipt className="w-5 h-5" />, label: 'Fixos' },
          { key: 'metas', icon: <Target className="w-5 h-5" />, label: 'Metas' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`flex flex-col items-center gap-1 p-2 w-16 transition-all ${
              activeTab === tab.key ? 'text-[#0B57D0]' : 'text-[#444746]'
            }`}
          >
            <div className={`px-4 py-1 rounded-full ${activeTab === tab.key ? 'bg-[#D3E3FD]' : 'bg-transparent'}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>

      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        categorias={cfg.categorias}
        onAddGasto={handleAddGasto}
        diaAtual={diaAtual}
        diasNoMes={diasNoMes}
      />
      <CashUpdateModal
        isOpen={isCashUpdateOpen}
        onClose={() => setIsCashUpdateOpen(false)}
        saldoConta={cfg.saldoConta}
        faturaAberta={cfg.faturaAberta}
        diaFechamento={cfg.diaFechamento}
        onUpdate={handleUpdateCash}
        onPayFatura={handlePayFatura}
      />
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        cfg={cfg}
        gastos={gastos}
        onRestore={handleRestoreBackup}
      />
    </div>
  );
}
