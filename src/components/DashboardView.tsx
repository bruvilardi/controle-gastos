import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  Wallet,
  CreditCard,
  Receipt,
  PiggyBank,
  Plus,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ConfigFinancas, CalculoFinancas, Gasto } from '../types';
import { formatBRL } from '../data/initialData';
import { CategoryIcon } from './CategoryIcon';

interface DashboardViewProps {
  cfg: ConfigFinancas;
  calc: CalculoFinancas;
  gastos: Gasto[];
  diaAtual: number;
  diasNoMes: number;
  onOpenExpense: () => void;
  onOpenCashUpdate: () => void;
  onDeleteGasto: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cfg,
  calc,
  gastos,
  diaAtual,
  diasNoMes,
  onOpenExpense,
  onDeleteGasto,
}) => {
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('todos');
  const [showLedgerDetails, setShowLedgerDetails] = useState<boolean>(true);

  const hoje = new Date();
  const mesChave = `${hoje.getFullYear()}-${hoje.getMonth()}`;
  const gastosDoMes = gastos.filter((g) => g.mes === mesChave);

  const gastosFiltrados = selectedCatFilter === 'todos'
    ? gastosDoMes
    : gastosDoMes.filter((g) => g.cat === selectedCatFilter);

  const isDanger = calc.folgaComMeta < 0;
  const isWarning = !isDanger && calc.cobertura < 1.25;
  
  // MD3 Status Colors
  const heroBg = isDanger ? 'bg-[#F9DEDC]' : isWarning ? 'bg-[#FFDF99]' : 'bg-[#D3E3FD]';
  const heroText = isDanger ? 'text-[#410E0B]' : isWarning ? 'text-[#2E1500]' : 'text-[#041E49]';
  const heroIconBg = isDanger ? 'bg-[#F2B8B5]' : isWarning ? 'bg-[#F2C05A]' : 'bg-[#A8C7FA]';

  const barProgress = calc.cobertura > 0 ? Math.min(100, Math.max(5, (1 / calc.cobertura) * 100)) : 100;
  const barColor = calc.cobertura < 1 ? 'bg-[#B3261E]' : calc.cobertura < 1.3 ? 'bg-[#EA8600]' : 'bg-[#146C2E]';

  return (
    <div className="space-y-6">
      {/* Top Hero Card - MD3 Primary Container Style */}
      <div className={`rounded-[24px] p-6 sm:p-8 shadow-sm transition-colors ${heroBg} ${heroText}`}>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">
              Limite Diário no Cartão (Fatura dia {calc.fech})
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${heroIconBg}`}>
              <Calendar className="w-3.5 h-3.5" />
              Restam {calc.diasRestantes} dias
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-2">
            <h2 className="text-5xl sm:text-6xl font-normal tracking-tight">
              {formatBRL(calc.porDia)}
            </h2>
            <span className="text-sm font-medium opacity-80">/ dia</span>
          </div>

          {/* Coverage Bar */}
          <div className="mt-6 pt-5 border-t border-black/10">
            <div className="flex items-center justify-between text-sm font-medium mb-2">
              <span className="flex items-center gap-1.5 opacity-90">
                <CreditCard className="w-4 h-4" />
                Fatura aberta vs. Saldo em conta
              </span>
              <span className="font-medium">
                {Math.round(calc.cobertura * 100)}% coberta
              </span>
            </div>

            <div className="h-2 bg-black/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${barProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs opacity-75 mt-2">
              <span>Fatura: {formatBRL(cfg.faturaAberta)}</span>
              <span>Saldo: {formatBRL(cfg.saldoConta)}</span>
            </div>
          </div>

          {/* Intelligent Narrative Note */}
          <div className="mt-5 p-4 rounded-[16px] bg-white/40 border border-white/20 text-sm leading-relaxed">
            {calc.folgaComMeta >= 0 ? (
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  <strong>Tudo sob controle:</strong> Sobram <strong>{formatBRL(calc.folgaComMeta)}</strong> para os próximos {calc.diasRestantes} dias, mantendo as contas pagas e sem tocar na meta de <strong>{formatBRL(cfg.meta)}</strong>.
                </p>
              </div>
            ) : calc.folgaCrua >= 0 ? (
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  <strong>Atenção à meta:</strong> Pela regra pura (não dever mais que o saldo), cabem <strong>{formatBRL(calc.folgaCrua)}</strong>. Porém, ao gastar isso, a meta de {formatBRL(cfg.meta)} ou contas fixas ficarão sem cobertura.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2.5">
                <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  <strong>Fatura acima do saldo:</strong> As despesas ultrapassaram o dinheiro em conta em <strong>{formatBRL(-calc.folgaCrua)}</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Ledger Breakdown Toggle */}
          <div className="mt-5 pt-4 border-t border-black/10">
            <button
              onClick={() => setShowLedgerDetails(!showLedgerDetails)}
              className="flex items-center justify-between w-full text-xs font-medium uppercase tracking-wider hover:opacity-75 transition-opacity py-1"
            >
              <span>Equação do Caixa Livre</span>
              <span className="flex items-center gap-1 normal-case text-xs">
                {showLedgerDetails ? 'Ocultar' : 'Ver detalhes'}
                {showLedgerDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {showLedgerDetails && (
              <div className="mt-3 space-y-2 text-sm animate-in fade-in duration-200">
                <div className="flex items-center justify-between py-1.5 border-b border-black/5">
                  <span className="flex items-center gap-2 opacity-90"><Wallet className="w-4 h-4" />Saldo atual em conta</span>
                  <span className="font-medium">{formatBRL(cfg.saldoConta)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-black/5">
                  <span className="flex items-center gap-2 opacity-90"><CreditCard className="w-4 h-4" />(-) Fatura aberta</span>
                  <span className="font-medium text-[#B3261E]">-{formatBRL(cfg.faturaAberta)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-black/5">
                  <span className="flex items-center gap-2 opacity-90"><Receipt className="w-4 h-4" />(-) Contas a debitar</span>
                  <span className="font-medium text-[#B3261E]">-{formatBRL(calc.contas)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-black/5">
                  <span className="flex items-center gap-2 opacity-90"><PiggyBank className="w-4 h-4" />(-) Meta de poupança</span>
                  <span className="font-medium text-[#E37400]">-{formatBRL(cfg.meta)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 text-base font-medium">
                  <span>Total livre para gastar:</span>
                  <span>{formatBRL(calc.folgaComMeta)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Tetos do Mês */}
        <div className="lg:col-span-7 bg-white rounded-[24px] p-6 border border-[#DADCE0] shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-[#202124]">Progresso dos Tetos</h3>
              <p className="text-sm text-[#5F6368]">Consumo dos limites mensais planejados</p>
            </div>
            <span className="text-xs font-medium text-[#0B57D0] bg-[#E8F0FE] px-3 py-1 rounded-full">
              {formatBRL(calc.gastoMes)} gastos
            </span>
          </div>

          <div className="space-y-4">
            {cfg.categorias.map((c) => {
              const info = calc.porCat[c.nome] || { mes: 0, anoTodo: 0 };
              const usado = c.anual ? info.anoTodo : info.mes;
              const limite = c.anual ? c.teto * 12 : c.teto;
              const pct = limite > 0 ? (usado / limite) * 100 : 0;
              const estourou = pct > 100;
              const quase = pct > 80 && !estourou;

              const pColor = estourou ? 'bg-[#B3261E]' : quase ? 'bg-[#EA8600]' : 'bg-[#0B57D0]';

              return (
                <div key={c.id} className="p-4 rounded-[16px] bg-white border border-[#DADCE0] hover:bg-[#F8F9FA] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E8F0FE] text-[#0B57D0] flex items-center justify-center">
                        <CategoryIcon name={c.nome} className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-[#202124]">{c.nome}</span>
                      {c.anual && (
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-[#F3E8FD] text-[#4F378B] rounded-full">
                          Anual
                        </span>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className={estourou ? 'text-[#B3261E] font-medium' : 'text-[#202124]'}>
                        {formatBRL(usado)}
                      </span>
                      <span className="text-[#5F6368]"> / {formatBRL(limite)}</span>
                    </div>
                  </div>

                  <div className="h-1.5 bg-[#F1F3F4] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${pColor}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5F6368] mt-2">
                    <span>{pct.toFixed(0)}% consumido</span>
                    <span>
                      {limite - usado >= 0
                        ? `Resta ${formatBRL(limite - usado)}`
                        : `Estourou ${formatBRL(usado - limite)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Recent Expenses */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#D3E3FD] text-[#041E49] rounded-[24px] p-6 shadow-sm">
            <h4 className="text-xl font-medium mb-1">Registrar Despesa</h4>
            <p className="text-sm opacity-80 mb-5 leading-relaxed">
              Cada gasto altera sua fatura e recalcula o teto diário automaticamente.
            </p>
            <button
              onClick={onOpenExpense}
              className="w-full py-2.5 px-4 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Gasto Agora</span>
            </button>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-[#DADCE0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-[#202124]">Últimos Gastos</h3>
                <p className="text-sm text-[#5F6368]">Neste ciclo ({gastosDoMes.length})</p>
              </div>
              {gastosDoMes.length > 0 && (
                <div className="flex items-center gap-1">
                  <Filter className="w-4 h-4 text-[#5F6368]" />
                  <select
                    value={selectedCatFilter}
                    onChange={(e) => setSelectedCatFilter(e.target.value)}
                    className="text-sm py-1.5 px-2 rounded-md border border-[#DADCE0] bg-white text-[#202124] focus:outline-none focus:border-[#0B57D0]"
                  >
                    <option value="todos">Todos</option>
                    {cfg.categorias.map((c) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {gastosFiltrados.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#5F6368] border-2 border-dashed border-[#DADCE0] rounded-[16px]">
                <Receipt className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>Nenhum gasto lançado.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {gastosFiltrados.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-3 rounded-[16px] border border-[#DADCE0] hover:bg-[#F8F9FA] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#F1F3F4] text-[#5F6368] flex items-center justify-center shrink-0">
                        <CategoryIcon name={g.cat} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#202124] truncate">
                          {g.cat}
                          {g.descricao && <span className="font-normal text-[#5F6368]"> · {g.descricao}</span>}
                        </p>
                        <p className="text-[11px] text-[#5F6368]">Dia {g.dia}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium text-[#202124]">{formatBRL(g.valor)}</span>
                      <button
                        onClick={() => onDeleteGasto(g.id)}
                        className="p-1.5 rounded-full text-[#5F6368] hover:text-[#B3261E] hover:bg-[#F9DEDC] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
