import React, { useState } from 'react';
import AdminSaveBar from './AdminSaveBar';

// ==========================
// Tipos
// ==========================
interface Technology {
  name: string;
  icon: string;
}

interface TechCarouselContent {
    headline: string;
    subheadline: string;
    technologies: Technology[];
}

interface WebsiteContent {
  header: any;
  about: any;
  portfolio: any[];
  tech_carousel: TechCarouselContent;
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

interface AdminTechCarouselProps {
  content: TechCarouselContent;
  setContent: React.Dispatch<React.SetStateAction<WebsiteContent>>;
  saveBarProps: SaveBarProps;
  triggerFileUpload: (inputId: string) => void;
  handleTechIconUpload: (event: React.ChangeEvent<HTMLInputElement>, updateFunction: (svgContent: string) => void) => void;
}

// ==========================
// Componente
// ==========================
const AdminTechCarousel: React.FC<AdminTechCarouselProps> = ({
  content,
  setContent,
  saveBarProps,
  triggerFileUpload,
  handleTechIconUpload
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(content.technologies.length > 0 ? 0 : null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleInputChange = (field: keyof TechCarouselContent, value: any) => {
      setContent(prev => ({
          ...prev,
          tech_carousel: { ...prev.tech_carousel, [field]: value }
      }));
  };

  const handleTechChange = (index: number, field: keyof Technology, value: string) => {
      const newTechnologies = [...content.technologies];
      newTechnologies[index] = { ...newTechnologies[index], [field]: value };
      handleInputChange('technologies', newTechnologies);
  };
  
  const addTechnology = () => {
      const newTechnologies = [...content.technologies, { name: '', icon: '' }];
      handleInputChange('technologies', newTechnologies);
      setOpenIndex(newTechnologies.length - 1); // Open the newly added item
  };

  const removeTechnology = (index: number) => {
      if (window.confirm(`Tem certeza que deseja remover "${content.technologies[index].name || 'Nova Tecnologia'}"?`)) {
          const newTechnologies = content.technologies.filter((_, i) => i !== index);
          handleInputChange('technologies', newTechnologies);
      }
  };
  
  const moveTechnology = (index: number, direction: 'up' | 'down') => {
      const newTechnologies = [...content.technologies];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newTechnologies.length) return;
      [newTechnologies[index], newTechnologies[newIndex]] = [newTechnologies[newIndex], newTechnologies[index]];
      handleInputChange('technologies', newTechnologies);
      setOpenIndex(newIndex);
  };

  // Estilos
  const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors border-slate-300 dark:border-slate-700 focus:ring-accent';
  const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-1';
  const cardStyle = 'bg-white dark:bg-secondary p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700';

  return (
    <div className="space-y-8">
      <AdminSaveBar {...saveBarProps} />
      
      <div className={cardStyle}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Conteúdo da Seção</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="tech-headline" className={labelStyle}>Título (aceita HTML)</label>
            <input
              id="tech-headline"
              type="text"
              value={content.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
              className={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="tech-subheadline" className={labelStyle}>Subtítulo</label>
            <textarea
              id="tech-subheadline"
              rows={2}
              value={content.subheadline}
              onChange={(e) => handleInputChange('subheadline', e.target.value)}
              className={inputStyle}
            ></textarea>
          </div>
        </div>
      </div>

      <div className={cardStyle}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-light">Tecnologias</h3>
            <button onClick={addTechnology} className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Adicionar
            </button>
          </div>
          
          <div className="space-y-4">
            {content.technologies.map((tech, index) => (
              <div key={index} className="bg-slate-50 dark:bg-primary/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div
                  className="flex items-center p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  onClick={() => toggleItem(index)}
                  role="button"
                >
                  <div className="flex-grow flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-accent font-bold rounded-full">{index + 1}</div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-light truncate" title={tech.name}>
                      {tech.name || `Nova Tecnologia ${index + 1}`}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); removeTechnology(index); }} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                    <div className="flex flex-col"><button onClick={(e) => { e.stopPropagation(); moveTechnology(index, 'up'); }} disabled={index === 0} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg></button><button onClick={(e) => { e.stopPropagation(); moveTechnology(index, 'down'); }} disabled={index === content.technologies.length - 1} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-400 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {openIndex === index && (
                  <div className="p-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                    <div>
                      <label htmlFor={`tech-name-${index}`} className={labelStyle}>Nome da Tecnologia</label>
                      <input id={`tech-name-${index}`} type="text" value={tech.name} onChange={(e) => handleTechChange(index, 'name', e.target.value)} className={inputStyle} />
                    </div>
                    <div>
                      <label htmlFor={`tech-icon-svg-${index}`} className={labelStyle}>Código do Ícone (SVG)</label>
                      <div className="flex items-start gap-4">
                         <div className="w-16 h-16 p-2 border border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center bg-white dark:bg-slate-900 flex-shrink-0">
                            <div className="w-full h-full text-slate-600 dark:text-slate-300 [&_svg]:w-full [&_svg]:h-full" dangerouslySetInnerHTML={{ __html: tech.icon || '' }} />
                         </div>
                         <div className="flex-grow">
                             <textarea id={`tech-icon-svg-${index}`} rows={4} value={tech.icon} onChange={(e) => handleTechChange(index, 'icon', e.target.value)} className={`${inputStyle} font-mono text-xs`} placeholder="<svg>...</svg>"></textarea>
                             <input type="file" id={`tech-icon-upload-${index}`} className="hidden" accept=".svg,image/svg+xml" onChange={(e) => handleTechIconUpload(e, (svg) => handleTechChange(index, 'icon', svg))} />
                             <button type="button" onClick={() => triggerFileUpload(`tech-icon-upload-${index}`)} className="mt-2 text-sm font-semibold text-accent hover:underline">Ou clique para fazer upload de um arquivo .svg</button>
                         </div>
                      </div>
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

export default AdminTechCarousel;