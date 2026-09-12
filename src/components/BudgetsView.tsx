import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  Trash2,
  Disc,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ConfigFinancas, CalculoFinancas, Categoria } from '../types';
import { formatBRL, formatPercent } from '../data/initialData';
import { CategoryIcon } from './CategoryIcon';

interface BudgetsViewProps {
  cfg: ConfigFinancas;
  calc: CalculoFinancas;
  onUpdateCategoria: (id: string, updates: Partial<Categoria>) => void;
  onAddCategoria: () => void;
  onRemoveCategoria: (id: string) => void;
  onUpdateDisco: (key: keyof ConfigFinancas['disco'], value: number) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  cfg,
  calc,
  onUpdateCategoria,
  onAddCategoria,
  onRemoveCategoria,
  onUpdateDisco,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'categorias' | 'simulador-discos'>('categorias');

  const ok = Math.abs(calc.sobra) < 1;
  const sobraPositiva = calc.sobra > 0;

  return (
    <div className="space-y-6">
      <div className={`rounded-[24px] p-6 border shadow-sm transition-all ${
        ok ? 'bg-[#C4EED0] border-transparent text-[#072711]'
          : sobraPositiva ? 'bg-[#F1F3F4] border-transparent text-[#202124]'
          : 'bg-[#F9DEDC] border-transparent text-[#410E0B]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">
              Balanço do Orçamento Mensal
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-normal tracking-tight">
                {formatBRL(calc.tetos)}
              </span>
              <span className="text-sm opacity-80">soma dos tetos planejados</span>
            </div>
          </div>
          <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-black/10">
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">
              Verba Variável Livre
            </span>
            <p className="text-2xl font-medium mt-0.5">
              {formatBRL(calc.verba)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-black/10 text-sm flex items-start gap-2">
          {ok ? (
            <><CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> <span>Perfeito! A soma dos tetos fecha exatamente com a verba disponível do mês.</span></>
          ) : sobraPositiva ? (
            <><Info className="w-5 h-5 shrink-0 mt-0.5 text-[#0B57D0]" /> <span>Sobram <strong>{formatBRL(calc.sobra)}</strong> livres. Distribua entre categorias ou aumente a meta.</span></>
          ) : (
            <><AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> <span>Os tetos passam <strong>{formatBRL(-calc.sobra)}</strong> da verba disponível. Reduza alguma categoria.</span></>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[#DADCE0] pb-3">
        <button
          onClick={() => setActiveSubTab('categorias')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeSubTab === 'categorias' ? 'bg-[#D3E3FD] text-[#041E49]' : 'text-[#5F6368] hover:bg-[#F1F3F4]'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Tetos por Categoria</span>
        </button>
        <button
          onClick={() => setActiveSubTab('simulador-discos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeSubTab === 'simulador-discos' ? 'bg-[#F3E8FD] text-[#370B49]' : 'text-[#5F6368] hover:bg-[#F1F3F4]'
          }`}
        >
          <Disc className="w-4 h-4" />
          <span>Simulador de Discos</span>
        </button>
      </div>

      {activeSubTab === 'categorias' && (
        <div className="bg-white rounded-[24px] p-6 border border-[#DADCE0] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-medium text-[#202124]">Limites por Categoria</h3>
              <p className="text-sm text-[#5F6368]">Ajuste os tetos para manter sua meta sem aperto.</p>
            </div>
            <button
              onClick={onAddCategoria}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white transition-colors"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>

          <div className="divide-y divide-[#F1F3F4]">
            {cfg.categorias.map((c) => {
              const diff = c.hist > 0 ? (c.teto / c.hist) - 1 : 0;
              const reduziu = diff < 0;
              return (
                <div key={c.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-[#F8F9FA] border border-[#DADCE0] text-[#5F6368] flex items-center justify-center">
                        <CategoryIcon name={c.nome} className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={c.nome}
                        onChange={(e) => onUpdateCategoria(c.id, { nome: e.target.value })}
                        className="font-medium text-base text-[#202124] bg-transparent border-b border-transparent hover:border-[#DADCE0] focus:border-[#0B57D0] focus:outline-none py-1"
                      />
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#5F6368] uppercase font-medium">Teto:</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#5F6368]">R$</span>
                          <input
                            type="number"
                            step="any"
                            value={c.teto}
                            onChange={(e) => onUpdateCategoria(c.id, { teto: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-28 pl-9 pr-3 py-2 text-right text-sm font-medium bg-white border border-[#DADCE0] rounded-md focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveCategoria(c.id)}
                        className="p-2 text-[#5F6368] hover:text-[#B3261E] hover:bg-[#F9DEDC] rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pl-13">
                    <div className="flex items-center gap-2">
                      <span className="text-[#5F6368]">Média anterior: {formatBRL(c.hist)}</span>
                      {c.hist > 0 && (
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          reduziu ? 'bg-[#C4EED0] text-[#072711]' : diff > 0 ? 'bg-[#FFDF99] text-[#2E1500]' : 'bg-[#F1F3F4] text-[#202124]'
                        }`}>
                          {formatPercent(diff)} vs histórico
                        </span>
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-[#5F6368]">
                      <input
                        type="checkbox"
                        checked={Boolean(c.anual)}
                        onChange={(e) => onUpdateCategoria(c.id, { anual: e.target.checked })}
                        className="w-4 h-4 text-[#0B57D0] border-[#DADCE0] rounded focus:ring-[#0B57D0]"
                      />
                      <span>Reserva anual</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'simulador-discos' && (
        <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-[#DADCE0] shadow-sm space-y-6">
          <div>
            <h3 className="text-2xl font-medium text-[#202124]">Simulador de Importação</h3>
            <p className="text-sm text-[#5F6368] mt-1">Juntar discos num pedido dilui o frete e diminui o custo unitário.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Preço do Disco', key: 'preco', prefix: 'R$' },
              { label: 'Frete', key: 'frete', prefix: 'R$' },
              { label: 'Imposto (%)', key: 'imposto', suffix: '%' },
              { label: 'Qtd. na Remessa', key: 'porRemessa' }
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-[#5F6368] mb-1">{f.label}</label>
                <div className="relative">
                  {f.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#5F6368]">{f.prefix}</span>}
                  <input
                    type="number"
                    value={cfg.disco[f.key as keyof ConfigFinancas['disco']]}
                    onChange={(e) => onUpdateDisco(f.key as keyof ConfigFinancas['disco'], parseFloat(e.target.value) || 0)}
                    className={`w-full py-2.5 bg-white border border-[#DADCE0] rounded-md text-sm focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none ${f.prefix ? 'pl-9 pr-3' : f.suffix ? 'pl-3 pr-8' : 'px-3'}`}
                  />
                  {f.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#5F6368]">{f.suffix}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-[16px] bg-[#F8F9FA] border border-[#DADCE0]">
              <span className="text-sm text-[#5F6368]">Custo de 1 Remessa</span>
              <p className="text-2xl font-medium mt-1">{formatBRL(calc.custoRemessa)}</p>
            </div>
            <div className="p-5 rounded-[16px] bg-[#E8F0FE] border border-transparent">
              <span className="text-sm text-[#0B57D0] font-medium">Custo Real por Disco</span>
              <p className="text-2xl font-medium text-[#041E49] mt-1">{formatBRL(calc.custoDisco)}</p>
            </div>
            <div className="p-5 rounded-[16px] bg-[#F3E8FD] border border-transparent">
              <span className="text-sm text-[#4F378B] font-medium">Reserva Disponível</span>
              <p className="text-2xl font-medium text-[#370B49] mt-1">{formatBRL(Math.max(0, calc.reservaDisco - calc.gastoDisco))}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
