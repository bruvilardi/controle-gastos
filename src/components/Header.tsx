import React from 'react';
import {
  LayoutDashboard,
  PieChart,
  Receipt,
  Target,
  Plus,
  Wallet,
  Settings2,
  Sparkles
} from 'lucide-react';
import { TabKey } from '../types';

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  diaAtual: number;
  diasNoMes: number;
  diaFechamento: number;
  onOpenExpense: () => void;
  onOpenCashUpdate: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  diaAtual,
  diasNoMes,
  onOpenExpense,
  onOpenCashUpdate,
  onOpenBackup,
}) => {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'painel', label: 'Painel Diário', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'tetos', label: 'Tetos & Orçamento', icon: <PieChart className="w-4 h-4" /> },
    { key: 'fixos', label: 'Custos Fixos', icon: <Receipt className="w-4 h-4" /> },
    { key: 'metas', label: 'Metas & Simuladores', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F8F9FA]/95 backdrop-blur-md border-b border-[#DADCE0] transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-0">
        {/* Top bar: title + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#202124]">
                Quanto Posso Gastar
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E8F0FE] text-[#1A73E8]">
                <Sparkles className="w-3 h-3" />
                Anti-Dívida
              </span>
            </div>
            <p className="text-sm text-[#5F6368] mt-1">
              Dia {diaAtual} de {diasNoMes} · Seu teto é o saldo em conta
            </p>
          </div>

          {/* Quick Action Buttons - MD3 Style */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCashUpdate}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-[#DADCE0] bg-white hover:bg-[#F1F3F4] text-[#202124] transition-all"
              title="Ajustar Saldo ou Fatura"
            >
              <Wallet className="w-4 h-4 text-[#5F6368]" />
              <span className="hidden md:inline">Ajustar Caixa</span>
            </button>

            <button
              onClick={onOpenBackup}
              className="p-2 text-sm font-medium rounded-full border border-[#DADCE0] bg-white hover:bg-[#F1F3F4] text-[#5F6368] transition-all"
              title="Backup e Configurações"
            >
              <Settings2 className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenExpense}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Gasto</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs - MD3 style pill tabs */}
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#D3E3FD] text-[#041E49]'
                    : 'text-[#444746] hover:bg-[#F1F3F4]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
