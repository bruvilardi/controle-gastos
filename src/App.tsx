import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Wallet, Calendar, PiggyBank, Target, Trash2, CheckCircle2, Pencil } from 'lucide-react';
import { AppState, Conta, Gasto, Teto } from './types';

const INITIAL_STATE: AppState = {
  rendaMensal: 7914.00,
  saldoConta: 7914.00,
  metaPoupanca: 500,
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
  ],
  gastos: [],
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('fin_auth') === 'true');
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem('qpg_simple_state_v5');
    let parsedState = INITIAL_STATE;
    
    if (saved) {
      try {
        parsedState = JSON.parse(saved);
        // Fallbacks for older versions
        if (!parsedState.rendaMensal) parsedState.rendaMensal = INITIAL_STATE.rendaMensal;
        if (!parsedState.mesAtual) parsedState.mesAtual = INITIAL_STATE.mesAtual;
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }

    const currentMonth = new Date().toISOString().substring(0, 7);
    
    // Auto-update / Rollover when month changes
    if (parsedState.mesAtual !== currentMonth) {
      parsedState = {
        ...parsedState,
        mesAtual: currentMonth,
        saldoConta: parsedState.saldoConta + parsedState.rendaMensal // Add salary!
      };
    }

    setState(parsedState);
    setIsLoaded(true);
  }, []);

  // Save state on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('qpg_simple_state_v5', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const mesAtual = hoje.toISOString().substring(0, 7); // YYYY-MM

  // Calculations
  const totalContas = state.contas.reduce((acc, c) => acc + c.valor, 0);
  const saldoLivre = state.saldoConta - totalContas - state.metaPoupanca;

  // Filter current month expenses
  const gastosMes = state.gastos.filter(g => g.data.startsWith(mesAtual));
  const totalGastosFatura = gastosMes.reduce((acc, g) => acc + g.valor, 0);

  const totalDiasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diasRestantes = Math.max(1, totalDiasMes - diaAtual + 1); // Include today
  const limiteDiario = Math.max(0, saldoLivre / diasRestantes);

  const gastosPorCategoria = gastosMes.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.valor;
    return acc;
  }, {} as Record<string, number>);

  const handleAddGastoAuto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      
      const data = await res.json();
      
      if (data.valor && data.categoria) {
        const novoGasto: Gasto = {
          id: `g-${Date.now()}`,
          valor: data.valor,
          categoria: data.categoria,
          descricao: data.descricao || inputText,
          data: new Date().toISOString(),
        };

        setState(prev => ({
          ...prev,
          saldoConta: prev.saldoConta - novoGasto.valor, // Subtract from balance
          gastos: [novoGasto, ...prev.gastos]
        }));
        
        setInputText('');
      } else {
        alert("Não consegui entender o valor e a categoria. Tente escrever de forma mais clara, ex: 'Comprei um disco no Mercado Livre por 150'");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao processar o gasto automaticamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBRL = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleUpdateConta = (id: string, field: 'nome' | 'valor', value: string | number) => {
    setState(prev => ({
      ...prev,
      contas: prev.contas.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
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
          <h2 className="text-sm font-medium text-[#5F6368] uppercase tracking-wider mb-2 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Saldo Livre
          </h2>
          <div className="text-5xl font-medium tracking-tight mb-2">
            {formatBRL(saldoLivre)}
          </div>
          
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
                <label className="flex justify-between items-center">
                  <span className="font-medium text-[#202124]">Meta Poupança:</span>
                  <input 
                    type="number" 
                    value={state.metaPoupanca || ''} 
                    onChange={e => setState({...state, metaPoupanca: Number(e.target.value)})}
                    className="border border-[#DADCE0] rounded-lg px-3 py-1.5 w-32 text-right bg-white" 
                  />
                </label>
              </div>
            ) : (
              <>
                Seu saldo total é {formatBRL(state.saldoConta)}.<br/>
                Já descontamos os {formatBRL(totalContas)} de contas a pagar e os {formatBRL(state.metaPoupanca)} da poupança.
              </>
            )}
          </div>
        </section>

        {/* Input Mágico (Gemini) */}
        <section className="bg-[#D3E3FD] rounded-[28px] p-6 shadow-sm text-[#041E49]">
          <h2 className="text-lg font-medium mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0B57D0]" />
            Adicionar Gasto Inteligente
          </h2>
          <p className="text-sm mb-4 opacity-80">
            Escreva o que você gastou e eu organizo tudo sozinho.
          </p>
          <form onSubmit={handleAddGastoAuto} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ex: Pedi uma pizza por 75 no iFood"
              className="flex-1 bg-white border-0 rounded-[16px] px-4 py-3 text-[#202124] shadow-sm focus:ring-2 focus:ring-[#0B57D0] outline-none placeholder-[#5F6368]"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="bg-[#0B57D0] text-white p-3 rounded-[16px] shadow-sm hover:bg-[#0842A0] disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Plus className="w-6 h-6" />
            </button>
          </form>
          {isProcessing && (
            <p className="text-sm mt-3 animate-pulse opacity-80">Categorizando seu gasto...</p>
          )}
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

        {/* Contas a Pagar */}
        <section className="bg-white rounded-[28px] p-6 shadow-sm border border-[#DADCE0]">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0B57D0]" />
            Contas do Mês
          </h2>
          <div className="space-y-8">
            {['Gastos Fixos', 'Parcelamentos'].map(grupoNome => {
              const contasGrupo = state.contas.filter(c => c.grupo === grupoNome);
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
                            <input 
                              type="number" 
                              value={conta.valor || ''} 
                              onChange={e => handleUpdateConta(conta.id, 'valor', Number(e.target.value))} 
                              className="border border-[#DADCE0] rounded px-2 py-1 w-24 text-right bg-white font-medium text-[15px]" 
                            />
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
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-[#0B57D0]" />
            Últimos Gastos
          </h2>
          {state.gastos.length === 0 ? (
            <p className="text-sm text-[#5F6368] text-center py-4">Nenhum gasto registrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {state.gastos.slice(0, 5).map(g => (
                <div key={g.id} className="flex justify-between items-center py-2 border-b border-[#F1F3F4] last:border-0">
                  <div>
                    <p className="font-medium">{g.descricao}</p>
                    <p className="text-xs text-[#5F6368]">{g.categoria} • {new Date(g.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="font-medium">{formatBRL(g.valor)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
