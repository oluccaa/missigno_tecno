import React, { useState } from 'react';
import AdminSaveBar from './AdminSaveBar';

// Tipos
interface ProcessStep {
    title: string;
    description: string;
    icon: string;
    deliverables: string[];
    tools: string[];
}

interface ProcessContent {
    headline: string;
    subheadline: string;
    steps: ProcessStep[];
}

interface WebsiteContent {
  header: any;
  hero: any;
  about: any;
  process: ProcessContent;
  portfolio: any[];
  tech_carousel: any;
  site_meta: any;
  theme_settings: any;
}

interface SaveBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
}

interface AdminProcessProps {
  content: ProcessContent;
  setContent: React.Dispatch<React.SetStateAction<WebsiteContent>>;
  saveBarProps: SaveBarProps;
}

const DynamicListEditor: React.FC<{ title: string; items: string[]; onItemsChange: (newItems: string[]) => void; }> = ({ title, items, onItemsChange }) => {
    const handleItemChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onItemsChange(newItems);
    };
    const addItem = () => onItemsChange([...items, '']);
    const removeItem = (index: number) => onItemsChange(items.filter((_, i) => i !== index));

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-muted mb-2">{title}</label>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={e => handleItemChange(index, e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-slate-900 dark:text-light focus:outline-none focus:ring-2 border-slate-300 dark:border-slate-700 focus:ring-accent"
                            placeholder={`Item ${index + 1}`}
                        />
                        <button onClick={() => removeItem(index)} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                    </div>
                ))}
            </div>
            <button onClick={addItem} className="mt-2 text-sm font-semibold text-accent hover:underline">+ Adicionar Item</button>
        </div>
    );
};


const AdminProcess: React.FC<AdminProcessProps> = ({ content, setContent, saveBarProps }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleInputChange = (field: keyof ProcessContent, value: any) => {
        setContent(prev => ({ ...prev, process: { ...prev.process, [field]: value } }));
    };

    const handleStepChange = (index: number, field: keyof ProcessStep, value: any) => {
        const newSteps = [...content.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        handleInputChange('steps', newSteps);
    };
    
    const addStep = () => {
        const newSteps = [...content.steps, { title: '', description: '', icon: 'default', deliverables: [], tools: [] }];
        handleInputChange('steps', newSteps);
        setOpenIndex(newSteps.length - 1);
    };
    const removeStep = (index: number) => {
        if (window.confirm(`Tem certeza que deseja remover a etapa "${content.steps[index].title || `Etapa ${index + 1}`}"?`)) {
            handleInputChange('steps', content.steps.filter((_, i) => i !== index));
        }
    };
    
    const moveStep = (index: number, direction: 'up' | 'down') => {
        const newSteps = [...content.steps];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newSteps.length) return;
        [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
        handleInputChange('steps', newSteps);
        setOpenIndex(newIndex);
    };

    const cardStyle = 'bg-white dark:bg-secondary p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700';
    const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors border-slate-300 dark:border-slate-700 focus:ring-accent';
    const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-1';

    return (
        <div className="space-y-8">
            <AdminSaveBar {...saveBarProps} />
            
            <div className={cardStyle}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Conteúdo Principal da Página</h3>
                <div className="space-y-4">
                    <div><label htmlFor="process-headline" className={labelStyle}>Título (aceita HTML)</label><input id="process-headline" type="text" value={content.headline} onChange={(e) => handleInputChange('headline', e.target.value)} className={inputStyle} /></div>
                    <div><label htmlFor="process-subheadline" className={labelStyle}>Subtítulo</label><textarea id="process-subheadline" rows={3} value={content.subheadline} onChange={(e) => handleInputChange('subheadline', e.target.value)} className={inputStyle}></textarea></div>
                </div>
            </div>

            <div className={cardStyle}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-light">Etapas do Processo</h3>
                    <button onClick={addStep} className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>Adicionar Etapa</button>
                </div>
                <div className="space-y-4">
                    {content.steps.map((step, index) => (
                         <div key={index} className="bg-slate-50 dark:bg-primary/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="flex items-center p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                               <div className="flex-grow flex items-center gap-4"><div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-accent font-bold rounded-full">{String(index + 1).padStart(2, '0')}</div><h4 className="font-bold text-lg text-slate-900 dark:text-light truncate">{step.title || `Nova Etapa ${index + 1}`}</h4></div>
                               <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); removeStep(index); }} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button><div className="flex flex-col"><button onClick={(e) => { e.stopPropagation(); moveStep(index, 'up'); }} disabled={index === 0} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg></button><button onClick={(e) => { e.stopPropagation(); moveStep(index, 'down'); }} disabled={index === content.steps.length - 1} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button></div><svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-400 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                            </div>
                            {openIndex === index && (
                                <div className="p-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className={labelStyle}>Título</label><input type="text" value={step.title} onChange={e => handleStepChange(index, 'title', e.target.value)} className={inputStyle} /></div>
                                        <div><label className={labelStyle}>Ícone</label><select value={step.icon} onChange={e => handleStepChange(index, 'icon', e.target.value)} className={inputStyle}><option value="search">Busca (search)</option><option value="design">Design (design)</option><option value="code">Código (code)</option><option value="launch">Lançamento (launch)</option><option value="default">Padrão (default)</option></select></div>
                                    </div>
                                    <div><label className={labelStyle}>Descrição</label><textarea rows={3} value={step.description} onChange={e => handleStepChange(index, 'description', e.target.value)} className={inputStyle}></textarea></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <DynamicListEditor title="Entregáveis" items={step.deliverables} onItemsChange={(newItems) => handleStepChange(index, 'deliverables', newItems)} />
                                        <DynamicListEditor title="Ferramentas" items={step.tools} onItemsChange={(newItems) => handleStepChange(index, 'tools', newItems)} />
                                    </div>
                                </div>
                            )}
                         </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminProcess;