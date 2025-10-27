import React from 'react';

interface AdminSaveBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
}

const AdminSaveBar: React.FC<AdminSaveBarProps> = ({
  hasChanges,
  onSave,
  onDiscard,
  isSaving,
  message,
}) => {
  if (!hasChanges) {
    return null;
  }

  return (
    <div className="sticky top-20 md:top-4 z-20 bg-white/80 dark:bg-secondary/80 backdrop-blur-sm p-3 rounded-b-lg md:rounded-lg shadow-lg border-b md:border border-slate-200 dark:border-slate-700 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-center sm:text-left">
        <p className="font-semibold text-slate-800 dark:text-slate-200">Você tem alterações não salvas.</p>
        {message && (
          <p className={`mt-1 text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {message.text}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <button
          onClick={onDiscard}
          disabled={isSaving}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          Descartar
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};

export default AdminSaveBar;
