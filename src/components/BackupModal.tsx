import React, { useRef } from 'react';
import { X, Download, Upload, AlertCircle } from 'lucide-react';
import { ConfigFinancas, Gasto } from '../types';

const DATA_VERSION = 1.0;

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  cfg: ConfigFinancas;
  gastos: Gasto[];
  onRestore: (cfg: ConfigFinancas, gastos: Gasto[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  cfg,
  gastos,
  onRestore,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const data = {
      version: DATA_VERSION,
      cfg,
      gastos,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qpg-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.version && json.cfg && json.gastos) {
          onRestore(json.cfg, json.gastos);
          alert('Backup restaurado com sucesso!');
          onClose();
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white text-[#202124] w-full max-w-sm rounded-[28px] shadow-lg animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-xl font-medium">Backup de Dados</h2>
          <button onClick={onClose} className="p-2 text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 rounded-[16px] bg-[#FFF8E1] border border-[#FBE9E7] text-sm text-[#5D4037] flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#EA8600]" />
            <p>Os dados ficam salvos apenas neste navegador. Faça um backup regular para não perdê-los.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#F8F9FA] border border-[#DADCE0] hover:bg-[#F1F3F4] text-[#202124] rounded-full font-medium transition-colors"
            >
              <Download className="w-5 h-5 text-[#0B57D0]" />
              Exportar para arquivo .json
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-[#DADCE0] hover:bg-[#F1F3F4] text-[#202124] rounded-full font-medium transition-colors"
            >
              <Upload className="w-5 h-5 text-[#0B57D0]" />
              Restaurar de um arquivo
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
