import React from 'react';
import { Target, Utensils } from 'lucide-react';
import { ConfigFinancas, CalculoFinancas } from '../types';
import { formatBRL } from '../data/initialData';

interface GoalsAndSimulatorsViewProps {
  cfg: ConfigFinancas;
  calc: CalculoFinancas;
  diasNoMes: number;
  onUpdateCfg: (updates: Partial<ConfigFinancas>) => void;
}

export const GoalsAndSimulatorsView: React.FC<GoalsAndSimulatorsViewProps> = ({
  cfg,
  calc,
  diasNoMes,
  onUpdateCfg,
}) => {
  const corte = calc.histTotal - calc.tetos;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#DADCE0] shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-medium text-[#202124]">Renda & Poupança</h3>
          <p className="text-sm text-[#5F6368] mt-1">Defina seus objetivos macro antes de distribuir o dinheiro.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#5F6368] mb-2">Renda Líquida do Mês</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#5F6368]">R$</span>
              <input
                type="number"
                step="any"
                value={cfg.renda}
                onChange={(e) => onUpdateCfg({ renda: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#DADCE0] rounded-md text-xl font-medium text-[#202124] focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#5F6368]">Meta de Economia</label>
              <span className="text-xl font-medium text-[#146C2E]">{formatBRL(cfg.meta)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={cfg.meta}
              onChange={(e) => onUpdateCfg({ meta: parseFloat(e.target.value) || 0 })}
              className="w-full accent-[#0B57D0] h-2 bg-[#F1F3F4] rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="p-5 rounded-[16px] bg-[#E8F0FE] text-[#041E49] border border-transparent">
          <span className="text-sm font-medium opacity-80">Verba Disponível para Variáveis</span>
          <div className="text-3xl font-medium mt-1">{formatBRL(calc.verba)}</div>
          <div className="text-sm mt-2 opacity-90">
            = {formatBRL(cfg.renda)} (Renda) - {formatBRL(cfg.meta)} (Meta) - {formatBRL(calc.fixos)} (Fixos)
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#DADCE0] shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-medium text-[#202124]">Simulador de Delivery</h3>
          <p className="text-sm text-[#5F6368] mt-1">Configure o ticket e divisão para ver quantos pedidos cabem no teto de delivery.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#5F6368] mb-1">Ticket Médio (R$)</label>
            <input
              type="number"
              step="any"
              value={cfg.ticketIfood}
              onChange={(e) => onUpdateCfg({ ticketIfood: Math.max(1, parseFloat(e.target.value) || 1) })}
              className="w-full px-3 py-2 border border-[#DADCE0] rounded-md text-sm focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#5F6368] mb-1">Devolução do Parceiro (%)</label>
            <input
              type="number"
              min="0" max="100"
              value={cfg.divideIfood}
              onChange={(e) => onUpdateCfg({ divideIfood: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
              className="w-full px-3 py-2 border border-[#DADCE0] rounded-md text-sm focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none"
            />
          </div>
        </div>

        <div className="p-5 rounded-[16px] bg-[#FDF0EC] border border-transparent flex gap-6 items-center">
          <div className="w-14 h-14 rounded-full bg-[#FCE8E6] text-[#D93025] flex items-center justify-center shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-medium text-[#410E0B]">{Math.floor(calc.pedidos)} pedidos</div>
            <p className="text-sm text-[#410E0B] opacity-80 mt-1">cabem por mês no teto de {formatBRL(calc.tetoDel)}, custando {formatBRL(calc.custoIfood)} para você.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
