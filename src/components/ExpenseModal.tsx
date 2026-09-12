import React, { useState } from 'react';
import { X, Plus, Calendar as CalendarIcon, Tag, AlignLeft, Calculator } from 'lucide-react';
import { Categoria, Gasto } from '../types';
import { formatBRL } from '../data/initialData';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: Categoria[];
  onAddGasto: (gasto: Omit<Gasto, 'id'>) => void;
  diaAtual: number;
  diasNoMes: number;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  categorias,
  onAddGasto,
  diaAtual,
  diasNoMes,
}) => {
  const [valorStr, setValorStr] = useState('');
  const [cat, setCat] = useState<string>(categorias[0]?.nome || '');
  const [desc, setDesc] = useState('');
  const [dia, setDia] = useState<number>(diaAtual);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valorStr);
    if (!val || val <= 0 || !cat) return;
    
    const hoje = new Date();
    const mesChave = `${hoje.getFullYear()}-${hoje.getMonth()}`;

    onAddGasto({ valor: val, cat, descricao: desc, mes: mesChave, dia });
    
    setValorStr('');
    setDesc('');
    setDia(diaAtual);
    onClose();
  };

  const addQuick = (amt: number) => {
    const cur = parseFloat(valorStr) || 0;
    setValorStr((cur + amt).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white text-[#202124] w-full max-w-md rounded-[28px] shadow-lg animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-xl font-medium">Registrar Novo Gasto</h2>
          <button onClick={onClose} className="p-2 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5F6368]">
              <Calculator className="w-4 h-4" /> Valor
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#5F6368]">R$</span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                value={valorStr}
                onChange={(e) => setValorStr(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#DADCE0] rounded-md text-2xl font-medium focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            
            {/* Quick amount buttons */}
            <div className="flex items-center gap-2 pt-2">
              {[10, 25, 50, 100].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => addQuick(amt)}
                  className="flex-1 py-1.5 px-1 rounded-full bg-[#F1F3F4] hover:bg-[#E8EAED] text-sm font-medium text-[#202124] transition-colors"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5F6368]">
              <Tag className="w-4 h-4" /> Categoria
            </label>
            <select
              required
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#DADCE0] rounded-md text-base focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none"
            >
              {categorias.map(c => (
                <option key={c.id} value={c.nome}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5F6368]">
              <AlignLeft className="w-4 h-4" /> Descrição <span className="opacity-70 text-xs font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#DADCE0] rounded-md text-base focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none"
              placeholder="Ex: Almoço com amigos"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5F6368]">
              <CalendarIcon className="w-4 h-4" /> Dia da Compra
            </label>
            <select
              value={dia}
              onChange={(e) => setDia(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-white border border-[#DADCE0] rounded-md text-base focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none"
            >
              {Array.from({ length: diasNoMes }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Dia {d} {d === diaAtual ? '(Hoje)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0B57D0] hover:bg-[#0842A0] text-white rounded-full font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Gasto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
