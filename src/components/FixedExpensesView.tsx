import React from 'react';
import { Receipt, CreditCard, Tv, Plus, Trash2, Sparkles } from 'lucide-react';
import { ConfigFinancas, CalculoFinancas, ItemFixo } from '../types';
import { formatBRL } from '../data/initialData';
import { CategoryIcon } from './CategoryIcon';

interface FixedExpensesViewProps {
  cfg: ConfigFinancas;
  calc: CalculoFinancas;
  onUpdateItem: (listName: 'contas' | 'parcelas' | 'assinaturas', id: string, updates: Partial<ItemFixo>) => void;
  onAddItem: (listName: 'contas' | 'parcelas' | 'assinaturas') => void;
  onRemoveItem: (listName: 'contas' | 'parcelas' | 'assinaturas', id: string) => void;
}

export const FixedExpensesView: React.FC<FixedExpensesViewProps> = ({
  cfg,
  calc,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
}) => {
  const sections = [
    {
      key: 'contas' as const,
      title: 'Débito em Conta',
      items: cfg.contas,
      total: calc.contas,
      hasRemaining: false,
      icon: <Receipt className="w-5 h-5 text-[#1A73E8]" />,
      bg: 'bg-[#E8F0FE]',
    },
    {
      key: 'parcelas' as const,
      title: 'Parcelas no Cartão',
      items: cfg.parcelas,
      total: calc.parcelas,
      hasRemaining: true,
      icon: <CreditCard className="w-5 h-5 text-[#E37400]" />,
      bg: 'bg-[#FEF7E0]',
    },
    {
      key: 'assinaturas' as const,
      title: 'Assinaturas',
      items: cfg.assinaturas,
      total: calc.assin,
      hasRemaining: false,
      icon: <Tv className="w-5 h-5 text-[#D93025]" />,
      bg: 'bg-[#FCE8E6]',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#DADCE0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-[#5F6368]">
              Total de Custos Fixos
            </span>
            <div className="mt-1">
              <h2 className="text-4xl font-normal text-[#202124]">{formatBRL(calc.fixos)}</h2>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-[16px] bg-[#E8F0FE] text-[#041E49] flex items-start gap-3">
          <Sparkles className="w-5 h-5 shrink-0 text-[#1A73E8] mt-0.5" />
          <div className="text-sm">
            <strong>Alívio futuro:</strong> Quando as compras parceladas acabarem, você terá <strong>+{formatBRL(calc.parcelas)} livres</strong> no orçamento mensal.
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((sec) => (
          <div key={sec.key} className="bg-white rounded-[24px] p-6 border border-[#DADCE0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${sec.bg}`}>{sec.icon}</div>
                <div>
                  <h3 className="text-lg font-medium text-[#202124]">{sec.title}</h3>
                  <p className="text-sm text-[#5F6368]">{formatBRL(sec.total)} comprometidos</p>
                </div>
              </div>
              <button
                onClick={() => onAddItem(sec.key)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full border border-[#DADCE0] text-[#202124] hover:bg-[#F8F9FA] transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            <div className="divide-y divide-[#F1F3F4]">
              {sec.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <CategoryIcon name={item.nome} className="w-5 h-5 text-[#5F6368]" />
                    <input
                      type="text"
                      value={item.nome}
                      onChange={(e) => onUpdateItem(sec.key, item.id, { nome: e.target.value })}
                      className="font-medium text-sm text-[#202124] bg-transparent border-b border-transparent hover:border-[#DADCE0] focus:border-[#0B57D0] outline-none py-1 w-full max-w-[200px]"
                    />
                  </div>

                  {sec.hasRemaining && (
                    <div className="flex items-center gap-1 bg-[#F8F9FA] border border-[#DADCE0] px-2 py-1 rounded-md">
                      <span className="text-xs text-[#5F6368] mr-1">Restam:</span>
                      <button onClick={() => onUpdateItem(sec.key, item.id, { restantes: Math.max(0, (item.restantes || 1) - 1) })} className="px-1.5 hover:bg-[#E8EAED] rounded text-[#202124]">-</button>
                      <span className="text-sm font-medium text-[#202124] min-w-[2ch] text-center">{item.restantes ?? 1}</span>
                      <button onClick={() => onUpdateItem(sec.key, item.id, { restantes: (item.restantes || 1) + 1 })} className="px-1.5 hover:bg-[#E8EAED] rounded text-[#202124]">+</button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#5F6368]">R$</span>
                      <input
                        type="number"
                        step="any"
                        value={item.valor}
                        onChange={(e) => onUpdateItem(sec.key, item.id, { valor: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-28 pl-9 pr-3 py-1.5 text-right text-sm font-medium bg-white border border-[#DADCE0] rounded-md focus:border-[#0B57D0] focus:ring-1 outline-none"
                      />
                    </div>
                    <button
                      onClick={() => onRemoveItem(sec.key, item.id)}
                      className="p-2 text-[#5F6368] hover:text-[#B3261E] hover:bg-[#F9DEDC] rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
