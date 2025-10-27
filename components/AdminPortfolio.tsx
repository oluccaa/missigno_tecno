import React, { useState } from 'react';
import ImagePreview from './ImagePreview';
import AdminSaveBar from './AdminSaveBar';

// ==========================
// Tipos (replicados para independência do componente)
// ==========================
interface Technology {
  name: string;
  icon: string;
}

interface PortfolioItem {
  id?: string;
  imageurl: string;
  title: string;
  category: string;
  technologies?: Technology[];
  desafio?: string;
  solucao?: string;
  resultados?: string;
  position?: number;
}

interface ErrorMap {
  [key: string]: string;
}

interface SaveBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
}

interface AdminPortfolioProps {
  portfolio: PortfolioItem[];
  portfolioErrors: ErrorMap[];
  uploading: string | null;
  saveBarProps: SaveBarProps;
  handlePortfolioChange: (index: number, field: keyof Omit<PortfolioItem, 'technologies' | 'id' | 'position'>, value: string) => void;
  handlePortfolioTechChange: (itemIndex: number, techIndex: number, field: keyof Technology, value: string) => void;
  addPortfolioItem: () => void;
  addPortfolioTech: (itemIndex: number) => void;
  removePortfolioTech: (itemIndex: number, techIndex: number) => void;
  handleDeletePortfolioItem: (index: number) => void;
  handleMoveItemUp: (index: number) => void;
  handleMoveItemDown: (index: number) => void;
  triggerFileUpload: (inputId: string) => void;
  handleTechIconUpload: (event: React.ChangeEvent<HTMLInputElement>, itemIndex: number, techIndex: number) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>, updateFunction: (url: string) => void, uploadIdentifier: string) => void;
  handleBlur: (section: 'portfolio', field: string, index: number) => void;
}

// ==========================
// Componente
// ==========================
const AdminPortfolio: React.FC<AdminPortfolioProps> = ({
  portfolio,
  portfolioErrors,
  uploading,
  saveBarProps,
  handlePortfolioChange,
  handlePortfolioTechChange,
  addPortfolioItem,
  addPortfolioTech,
  removePortfolioTech,
  handleDeletePortfolioItem,
  handleMoveItemUp,
  handleMoveItemDown,
  triggerFileUpload,
  handleTechIconUpload,
  handleImageUpload,
  handleBlur
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(portfolio.length > 0 ? 0 : null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  // Estilos
  const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors';
  const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-1';
  const errorTextStyle = 'mt-2 text-sm text-red-600';
  const uploadButtonStyle = 'flex-shrink-0 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait whitespace-nowrap flex items-center gap-2';


  return (
    <div>
      <AdminSaveBar {...saveBarProps} />
      <div className="flex justify-end mb-4">
        <button onClick={addPortfolioItem} className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Adicionar Projeto
        </button>
      </div>

      <div className="space-y-4">
        {portfolio.map((item, index) => (
          <div key={String(item.id ?? `new-${index}`)} className="bg-white dark:bg-secondary rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
            <div
              className="flex items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
              onClick={() => toggleItem(index)}
              role="button"
              aria-expanded={openIndex === index}
              aria-controls={`portfolio-item-content-${index}`}
            >
              <div className="flex-grow flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-accent font-bold rounded-full">{index + 1}</div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-light truncate" title={item.title}>
                  {item.title || `Novo Projeto ${index + 1}`}
                </h3>
                {item.category && <span className="hidden sm:block text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">{item.category}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); handleDeletePortfolioItem(index); }} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 transition-colors" aria-label={`Excluir item ${index + 1}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                <div className="flex flex-col">
                   <button onClick={(e) => { e.stopPropagation(); handleMoveItemUp(index); }} disabled={index === 0} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label={`Mover item ${index + 1} para cima`}> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg> </button>
                   <button onClick={(e) => { e.stopPropagation(); handleMoveItemDown(index); }} disabled={index === portfolio.length - 1} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label={`Mover item ${index + 1} para baixo`}> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg> </button>
                </div>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {openIndex === index && (
              <div id={`portfolio-item-content-${index}`} className="p-6 border-t border-slate-200 dark:border-slate-700 space-y-6 bg-slate-50 dark:bg-primary/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor={`portfolio-title-${index}`} className={labelStyle}>Título do Projeto</label>
                          <input id={`portfolio-title-${index}`} type="text" value={item.title} onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)} onBlur={() => handleBlur('portfolio', 'title', index)} className={`${inputStyle} ${portfolioErrors[index]?.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
                          {portfolioErrors[index]?.title && <p className={errorTextStyle}>{portfolioErrors[index]?.title}</p>}
                      </div>
                      <div>
                          <label htmlFor={`portfolio-category-${index}`} className={labelStyle}>Categoria</label>
                          <input id={`portfolio-category-${index}`} type="text" value={item.category} onChange={(e) => handlePortfolioChange(index, 'category', e.target.value)} onBlur={() => handleBlur('portfolio', 'category', index)} className={`${inputStyle} ${portfolioErrors[index]?.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
                          {portfolioErrors[index]?.category && <p className={errorTextStyle}>{portfolioErrors[index]?.category}</p>}
                      </div>
                  </div>
                  <div>
                      <label htmlFor={`portfolio-imageurl-${index}`} className={labelStyle}>URL da Imagem de Capa</label>
                      <div className="flex items-center gap-4">
                          <div className="flex-grow">
                              <input id={`portfolio-imageurl-${index}`} type="text" value={item.imageurl} onChange={(e) => handlePortfolioChange(index, 'imageurl', e.target.value)} onBlur={() => handleBlur('portfolio', 'imageurl', index)} className={`${inputStyle} ${portfolioErrors[index]?.imageurl ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
                          </div>
                          <ImagePreview src={item.imageurl} />
                          <input type="file" id={`portfolio-image-upload-input-${index}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handlePortfolioChange(index, 'imageurl', url), `portfolio-image-${index}`)} />
                          <button type="button" onClick={() => triggerFileUpload(`portfolio-image-upload-input-${index}`)} disabled={uploading === `portfolio-image-${index}`} className={uploadButtonStyle}>
                              {uploading === `portfolio-image-${index}` ? 'Enviando...' : 'Upload'}
                          </button>
                      </div>
                      {portfolioErrors[index]?.imageurl && <p className={errorTextStyle}>{portfolioErrors[index]?.imageurl}</p>}
                  </div>
                  <div>
                      <label htmlFor={`portfolio-desafio-${index}`} className={labelStyle}>O Desafio</label>
                      <textarea id={`portfolio-desafio-${index}`} rows={3} value={item.desafio || ''} onChange={(e) => handlePortfolioChange(index, 'desafio', e.target.value)} className={inputStyle}></textarea>
                  </div>
                  <div>
                      <label htmlFor={`portfolio-solucao-${index}`} className={labelStyle}>A Solução</label>
                      <textarea id={`portfolio-solucao-${index}`} rows={3} value={item.solucao || ''} onChange={(e) => handlePortfolioChange(index, 'solucao', e.target.value)} className={inputStyle}></textarea>
                  </div>
                  <div>
                      <label htmlFor={`portfolio-resultados-${index}`} className={labelStyle}>Resultados</label>
                      <textarea id={`portfolio-resultados-${index}`} rows={3} value={item.resultados || ''} onChange={(e) => handlePortfolioChange(index, 'resultados', e.target.value)} className={inputStyle}></textarea>
                  </div>
                  <div>
                      <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-2">Tecnologias</h4>
                      <div className="space-y-3">
                          {(item.technologies || []).map((tech, techIndex) => (
                              <div key={techIndex} className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto] gap-3 items-center">
                                  {/* Col 1: Icon Preview */}
                                  <div className="w-10 h-10 p-1 border border-slate-300 dark:border-slate-600 rounded-md flex items-center justify-center bg-white dark:bg-slate-900 overflow-hidden" title="Pré-visualização do Ícone">
                                      <div className="w-full h-full text-slate-600 dark:text-slate-300 [&_svg]:w-full [&_svg]:h-full" dangerouslySetInnerHTML={{ __html: tech.icon || '' }} />
                                  </div>

                                  {/* Col 2: Name Input */}
                                  <input type="text" placeholder="Nome da Tecnologia" value={tech.name} onChange={(e) => handlePortfolioTechChange(index, techIndex, 'name', e.target.value)} className={`${inputStyle} py-2`} aria-label="Nome da tecnologia" />

                                  {/* Col 3: SVG Code Textarea */}
                                  <textarea placeholder="Cole o código SVG aqui..." value={tech.icon} onChange={(e) => handlePortfolioTechChange(index, techIndex, 'icon', e.target.value)} className={`${inputStyle} py-2 font-mono text-xs resize-y hidden md:block`} rows={1} aria-label="Código SVG do ícone" />

                                  {/* Col 4: Actions */}
                                  <div className="flex items-center gap-2">
                                    <input type="file" id={`tech-icon-upload-${index}-${techIndex}`} className="hidden" accept=".svg,image/svg+xml" onChange={(e) => handleTechIconUpload(e, index, techIndex)} />
                                    <button type="button" onClick={() => triggerFileUpload(`tech-icon-upload-${index}-${techIndex}`)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Fazer upload de SVG" title="Fazer upload de SVG">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    </button>
                                    <button type="button" onClick={() => removePortfolioTech(index, techIndex)} className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label={`Remover tecnologia ${tech.name}`} title="Remover Tecnologia">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                      <button type="button" onClick={() => addPortfolioTech(index)} className="mt-4 text-sm font-semibold text-accent hover:underline">
                          + Adicionar Tecnologia
                      </button>
                  </div>
              </div>
            )}
          </div>
        ))}
         {portfolio.length === 0 && (
            <div className="text-center py-12 px-6 bg-white dark:bg-secondary rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-light">Seu portfólio está vazio</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-muted">Comece adicionando seu primeiro projeto incrível.</p>
                <div className="mt-6">
                    <button onClick={addPortfolioItem} className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto shadow-md">
                        Adicionar Primeiro Projeto
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortfolio;