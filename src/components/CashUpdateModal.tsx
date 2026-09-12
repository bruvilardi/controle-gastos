import React, { useState, useEffect } from 'react';
import { X, Wallet, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';
import { formatBRL } from '../data/initialData';

interface CashUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  saldoConta: number;
  faturaAberta: number;
  diaFechamento: number;
  onUpdate: (data: { saldoConta: number; faturaAberta: number; diaFechamento: number }) => void;
  onPayFatura: () => void;
}

export const CashUpdateModal: React.FC<CashUpdateModalProps> = ({
  isOpen,
  onClose,
  saldoConta,
  faturaAberta,
  diaFechamento,
  onUpdate,
  onPayFatura,
}) => {
  const [saldoStr, setSaldoStr] = useState(saldoConta.toString());
  const [faturaStr, setFaturaStr] = useState(faturaAberta.toString());
  const [diaFech, setDiaFech] = useState(diaFechamento.toString());

  useEffect(() => {
    if (isOpen) {
      setSaldoStr(saldoConta.toString());
      setFaturaStr(faturaAberta.toString());
      setDiaFech(diaFechamento.toString());
    }
  }, [isOpen, saldoConta, faturaAberta, diaFechamento]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      saldoConta: Math.max(0, parseFloat(saldoStr) || 0),
      faturaAberta: Math.max(0, parseFloat(faturaStr) || 0),
      diaFechamento: Math.max(1, Math.min(31, parseInt(diaFech) || 1)),
    });
    onClose();
  };

  const handlePay = () => {
    if (confirm(`Confirma o pagamento de ${formatBRL(faturaAberta)} com o saldo da conta?`)) {
      onPayFatura();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white text-[#202124] w-full max-w-md rounded-[28px] shadow-lg animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-xl font-medium">Ajustar Saldo e Fatura</h2>
          <button onClick={onClose} className="p-2 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5F6368]">
              <Wallet className="w-4 h-4 text-[#0B57D0]" /> Saldo na Conta (R$)
            </label>
            <input
              type="number"
              step="any"
              value={saldoStr}
              onChange={(e) => setSaldoStr(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#DADCE0] rounded-md text-base focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5F6368]">
              <CreditCard className="w-4 h-4 text-[#B3261E]" /> Fatura do Cartão (R$)
            </label>
            <input
              type="number"
              step="any"
              value={faturaStr}
              onChange={(e) => setFaturaStr(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#DADCE0] rounded-md text-base focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-[#5F6368]">
              <Calendar className="w-4 h-4 text-[#EA8600]" /> Dia Fechamento Fatura
            </label>
            <input
              type="number"
              min="1" max="31"
              value={diaFech}
              onChange={(e) => setDiaFech(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#DADCE0] rounded-md text-base focus:border-[#0B57D0] focus:ring-1 focus:ring-[#0B57D0] outline-none"
            />
          </div>

          {faturaAberta > 0 && (
            <div className="pt-2 pb-2">
              <button
                type="button"
                onClick={handlePay}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-[#DADCE0] text-[#146C2E] hover:bg-[#F8F9FA] rounded-full text-sm font-medium transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Paguei a fatura completa</span>
              </button>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#0B57D0] hover:bg-[#0842A0] text-white rounded-full font-medium transition-colors"
            >
              Salvar Ajustes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
