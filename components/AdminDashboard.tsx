import React, { useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import ThemeToggleButton from './ThemeToggleButton';
import ImagePreview from './ImagePreview';

// ==========================
// Tipos
// ==========================
interface Technology {
  name: string;
  icon: string; // SVG em string
}

interface PortfolioItem {
  id?: string; // uuid
  imageurl: string;
  title: string;
  category: string;
  technologies?: Technology[];
  desafio?: string;
  solucao?: string;
  resultados?: string;
  created_at?: string;
  position?: number;
}

interface WebsiteContent {
  header: {
    logoType: 'text' | 'image';
    logoText: string;
    logoImageUrlLight: string;
    logoImageUrlDark: string;
    contactButton: string;
  };
  about: {
    headline: string;
    paragraph1: string;
    paragraph2: string;
    buttonText: string;
    imageUrl: string;
  };
  portfolio: PortfolioItem[];
  site_meta: {
    faviconIcoUrl: string;
    faviconSvgUrl: string;
    appleTouchIconUrl: string;
  };
}

interface AdminDashboardProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  supabase: SupabaseClient;
  initialContent: WebsiteContent;
  onSaveSuccess: () => void;
}

type AdminTab = 'header' | 'about' | 'portfolio' | 'config';

type ErrorMap = { [key: string]: string };

// ==========================
// Helpers
// ==========================
const isValidUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (_) {
    return false;
  }
};

const isUUID = (id: string | undefined): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const emptyPortfolioErrors = (len: number) => Array.from({ length: len }, () => ({} as ErrorMap));

// ==========================
// Componente
// ==========================
const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme, toggleTheme, supabase, initialContent, onSaveSuccess }) => {
  const [content, setContent] = useState<WebsiteContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('header');
  const [uploading, setUploading] = useState<string | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const [headerErrors, setHeaderErrors] = useState<ErrorMap>({});
  const [aboutErrors, setAboutErrors] = useState<ErrorMap>({});
  const [portfolioErrors, setPortfolioErrors] = useState<ErrorMap[]>(emptyPortfolioErrors(initialContent.portfolio.length));

  useEffect(() => {
    setContent(initialContent);
    setHeaderErrors({});
    setAboutErrors({});
    setPortfolioErrors(emptyPortfolioErrors(initialContent.portfolio.length));
    setIdsToDelete([]);
  }, [initialContent]);

  // -------- Validação (pura) --------
  const runValidation = useMemo(() => {
    return (data: WebsiteContent) => {
      const newHeader: ErrorMap = {};
      const newAbout: ErrorMap = {};
      const newPortfolio: ErrorMap[] = emptyPortfolioErrors(data.portfolio.length);

      if (data.header.logoType === 'text' && !data.header.logoText.trim()) newHeader.logoText = 'O texto do logo é obrigatório.';
      if (data.header.logoType === 'image' && !data.header.logoImageUrlLight.trim() && !data.header.logoImageUrlDark.trim()) newHeader.logoImageUrlLight = 'Pelo menos uma URL de imagem do logo é obrigatória.';
      if (!data.header.contactButton.trim()) newHeader.contactButton = 'O texto do botão de contato é obrigatório.';

      if (!data.about.headline.trim()) newAbout.headline = 'O título é obrigatório.';
      if (!data.about.imageUrl.trim()) newAbout.imageUrl = 'A URL da imagem é obrigatória.';

      data.portfolio.forEach((item, index) => {
        const errs: ErrorMap = {};
        if (!item.title.trim()) errs.title = 'O título é obrigatório.';
        if (!item.category.trim()) errs.category = 'A categoria é obrigatória.';
        if (!item.imageurl.trim()) errs.imageurl = 'A URL da imagem é obrigatória.';
        else if (!isValidUrl(item.imageurl)) errs.imageurl = 'Por favor, insira uma URL válida (ex: https://...).';
        newPortfolio[index] = errs;
      });

      const isValid =
        Object.keys(newHeader).length === 0 &&
        Object.keys(newAbout).length === 0 &&
        newPortfolio.every((m) => Object.keys(m).length === 0);

      return { isValid, header: newHeader, about: newAbout, portfolio: newPortfolio };
    };
  }, []);

  // -------- Handlers de campo --------
  const handleBlur = (section: 'header' | 'about' | 'portfolio', field: string, index?: number) => {
    let value: unknown;
    if (section === 'portfolio' && index !== undefined) value = (content.portfolio[index] as any)[field];
    else value = (content[section] as any)[field];

    if (typeof value === 'string' && !value.trim()) {
      const errorMsg = 'Este campo é obrigatório.';
      if (section === 'header') setHeaderErrors((prev) => ({ ...prev, [field]: errorMsg }));
      if (section === 'about') setAboutErrors((prev) => ({ ...prev, [field]: errorMsg }));
      if (section === 'portfolio' && index !== undefined) {
        setPortfolioErrors((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], [field]: errorMsg };
          return next;
        });
      }
    }
  };

  const handleInputChange = (section: 'header' | 'about' | 'site_meta', field: string, value: string) => {
    setContent((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

    if (section === 'header' && (headerErrors as any)[field]) setHeaderErrors((prev) => { const n: any = { ...prev }; delete n[field]; return n; });
    if (section === 'about' && (aboutErrors as any)[field]) setAboutErrors((prev) => { const n: any = { ...prev }; delete n[field]; return n; });
  };

  const handlePortfolioChange = (
    index: number,
    field: keyof Omit<PortfolioItem, 'technologies' | 'id' | 'created_at' | 'position'>,
    value: string,
  ) => {
    const updated = [...content.portfolio];
    updated[index] = { ...updated[index], [field]: value } as PortfolioItem;
    setContent((prev) => ({ ...prev, portfolio: updated }));

    if (portfolioErrors[index]?.[field as string]) {
      setPortfolioErrors((prev) => {
        const next = [...prev];
        const itemErr = { ...next[index] } as any;
        delete itemErr[field as string];
        next[index] = itemErr;
        return next;
      });
    }
  };

  const handlePortfolioTechChange = (itemIndex: number, techIndex: number, field: keyof Technology, value: string) => {
    const updated = [...content.portfolio];
    const technologies = [...(updated[itemIndex].technologies || [])];
    technologies[techIndex] = { ...technologies[techIndex], [field]: value } as Technology;
    updated[itemIndex] = { ...updated[itemIndex], technologies };
    setContent((prev) => ({ ...prev, portfolio: updated }));
  };

  const addPortfolioTech = (itemIndex: number) => {
    const updated = [...content.portfolio];
    const technologies = [...(updated[itemIndex].technologies || [])];
    technologies.push({ name: '', icon: '' });
    updated[itemIndex] = { ...updated[itemIndex], technologies };
    setContent((prev) => ({ ...prev, portfolio: updated }));
  };

  const removePortfolioTech = (itemIndex: number, techIndex: number) => {
    if (!window.confirm('Você tem certeza que deseja excluir esta tecnologia?')) return;
    const updated = [...content.portfolio];
    const technologies = (updated[itemIndex].technologies || []).filter((_, i) => i !== techIndex);
    updated[itemIndex] = { ...updated[itemIndex], technologies };
    setContent((prev) => ({ ...prev, portfolio: updated }));
  };

  const addPortfolioItem = () => {
    setContent((prev) => ({
      ...prev,
      portfolio: [
        ...prev.portfolio,
        { imageurl: '', title: '', category: '', technologies: [], desafio: '', solucao: '', resultados: '' },
      ],
    }));
    setPortfolioErrors((prev) => [...prev, {}]);
  };

  const handleDeletePortfolioItem = (index: number) => {
  if (!window.confirm('Você tem certeza que deseja apagar este item do portfólio? Esta ação não pode ser desfeita.')) return;

  const itemToDelete = content.portfolio[index];
  if (isUUID(itemToDelete.id)) {
    setIdsToDelete(prev => [...prev, itemToDelete.id!]);
  }

    setContent(prev => ({ ...prev, portfolio: prev.portfolio.filter((_, i) => i !== index) }));
    setPortfolioErrors(prev => prev.filter((_, i) => i !== index));
  };


  const handleMoveItemUp = (index: number) => {
    if (index === 0) return;
    const updated = [...content.portfolio];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setContent((prev) => ({ ...prev, portfolio: updated }));
  };

  const handleMoveItemDown = (index: number) => {
    if (index === content.portfolio.length - 1) return;
    const updated = [...content.portfolio];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    setContent((prev) => ({ ...prev, portfolio: updated }));
  };

  const triggerFileUpload = (inputId: string) => {
    document.getElementById(inputId)?.click();
  };

  const handleTechIconUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    itemIndex: number,
    techIndex: number,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/svg+xml') {
      setMessage({ type: 'error', text: 'Por favor, selecione um arquivo SVG válido.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgContent = (e.target?.result as string) || '';
      handlePortfolioTechChange(itemIndex, techIndex, 'icon', svgContent.trim());
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Não foi possível ler o arquivo SVG.' });
      setTimeout(() => setMessage(null), 3000);
    };
    reader.readAsText(file);

    event.target.value = '';
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    updateFunction: (url: string) => void,
    uploadIdentifier: string,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(uploadIdentifier);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error('Não foi possível obter a URL pública da imagem.');

      updateFunction(data.publicUrl);
      setMessage({ type: 'success', text: 'Imagem carregada com sucesso!' });
    } catch (error: any) {
      console.error('--- Erro Detalhado no Upload da Imagem ---');
      console.error(error);

      let detailedMessage = 'Ocorreu um erro inesperado.';
      if (error && typeof error === 'object') {
        if (error.message) {
          detailedMessage = error.message;
          if (error.details) detailedMessage += ` | Detalhes: ${error.details}`;
          if (error.hint) detailedMessage += ` | Dica: ${error.hint}`;
          if (error.code) detailedMessage += ` | Código: ${error.code}`;
        } else {
          try {
            detailedMessage = `Objeto de erro não padrão: ${JSON.stringify(error)}`;
          } catch {
            detailedMessage = 'Ocorreu um erro de upload que não pôde ser serializado. Verifique o console.';
          }
        }
      } else detailedMessage = String(error);

      setMessage({ type: 'error', text: `Erro no upload: ${detailedMessage}` });
    } finally {
      setUploading(null);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    setMessage(null);
    setSaving(true);

    // 1. Valida o estado atual da UI antes de qualquer operação de DB.
    const validationResult = runValidation(content);
    setHeaderErrors(validationResult.header);
    setAboutErrors(validationResult.about);
    setPortfolioErrors(validationResult.portfolio);
    
    if (!validationResult.isValid) {
        setMessage({ type: 'error', text: 'Por favor, corrija os erros marcados em vermelho antes de salvar.' });
        
        // Foca na primeira aba com erro para ajudar o usuário
        if (Object.keys(validationResult.header).length > 0) setActiveTab('header');
        else if (Object.keys(validationResult.about).length > 0) setActiveTab('about');
        else if (validationResult.portfolio.some(p => Object.keys(p).length > 0)) setActiveTab('portfolio');

        setSaving(false);
        return; // Interrompe a execução se houver erros.
    }

    try {
        // As operações são executadas em sequência para garantir a ordem (ex: deletar antes de atualizar).

        // ETAPA A: Deletar itens do portfólio marcados para exclusão.
        if (idsToDelete.length > 0) {
            const { error } = await supabase.from('portfolio').delete().in('id', idsToDelete);
            if (error) throw error;
        }

        // ETAPA B: Salvar (upsert) as seções 'header', 'about' e 'site_meta'.
        const sectionsPromises = [
            supabase.from('sections').upsert({ id: 'header', content: content.header }),
            supabase.from('sections').upsert({ id: 'about', content: content.about }),
            supabase.from('sections').upsert({ id: 'site_meta', content: content.site_meta })
        ];
        const sectionsResults = await Promise.all(sectionsPromises);
        const sectionError = sectionsResults.find(res => res.error);
        if (sectionError) throw sectionError.error;

        // ETAPA C: Salvar (upsert) os itens do portfólio.
        const portfolioToUpsert = content.portfolio.map((item, index) => {
            const { created_at, id, ...rest } = item;
            const cleanItem = { ...rest, position: index }; // Garante a ordem da UI
            if (isUUID(id)) {
                return { ...cleanItem, id }; // Mantém o ID para itens existentes (UPDATE)
            }
            return cleanItem; // Remove o ID para itens novos (INSERT)
        });

        if (portfolioToUpsert.length > 0) {
            const { error } = await supabase.from('portfolio').upsert(portfolioToUpsert);
            if (error) throw error;
        }
        
        // ETAPA D: Sucesso! Todas as operações foram concluídas.
        setMessage({ type: 'success', text: 'Alterações salvas com sucesso!' });
        setIdsToDelete([]); // Limpa a fila de exclusão apenas após o sucesso total.
        onSaveSuccess(); // Notifica o componente pai para recarregar os dados.

    } catch (error: any) {
        console.error('Erro ao salvar no Supabase:', error);
        setMessage({ type: 'error', text: `Falha ao salvar: ${error.message}` });
        // A lista idsToDelete NÃO é limpa aqui, permitindo que o usuário tente salvar novamente.
    } finally {
        setSaving(false);
    }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '';
  };

  // ==========================
  // UI
  // ==========================
  const TabButton: React.FC<{ tab: AdminTab; label: string }> = ({ tab, label }) => (
    <button
      id={`tab-${tab}`}
      role="tab"
      aria-selected={activeTab === tab}
      aria-controls={`tabpanel-${tab}`}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        activeTab === tab
          ? 'border-b-2 border-accent text-accent bg-slate-100 dark:bg-slate-800'
          : 'text-slate-500 dark:text-muted hover:text-slate-800 dark:hover:text-light'
      }`}
    >
      {label}
    </button>
  );

  const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors';
  const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-1';
  const sectionStyle = 'bg-white dark:bg-secondary p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 focus:outline-none';
  const uploadButtonStyle = 'flex-shrink-0 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait whitespace-nowrap flex items-center gap-2';
  const errorTextStyle = 'mt-2 text-sm text-red-600';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-primary text-slate-800 dark:text-light">
      <header className="bg-white/80 dark:bg-primary/80 backdrop-blur-sm sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-light">Painel de Controle</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Sair</button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <div className="max-w-4xl mx-auto">
          <div className="border-b border-slate-300 dark:border-slate-700 mb-6">
            <div role="tablist" className="-mb-px flex space-x-4" aria-label="Seções do site">
              <TabButton tab="header" label="Cabeçalho" />
              <TabButton tab="about" label="Sobre" />
              <TabButton tab="portfolio" label="Portfólio" />
              <TabButton tab="config" label="Configurações" />
            </div>
          </div>

          {/* Header */}
          <div id="tabpanel-header" role="tabpanel" tabIndex={0} aria-labelledby="tab-header" hidden={activeTab !== 'header'} className={sectionStyle}>
            <div>
              <h2 className="text-2xl font-bold mb-4">Cabeçalho</h2>
              <div className="space-y-6">
                <div>
                  <label className={labelStyle}>Tipo de Logo</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="logoType" value="text" checked={content.header.logoType === 'text'} onChange={(e) => handleInputChange('header', 'logoType', e.target.value)} className="form-radio text-accent focus:ring-accent" />
                      <span>Logo de Texto</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="logoType" value="image" checked={content.header.logoType === 'image'} onChange={(e) => handleInputChange('header', 'logoType', e.target.value)} className="form-radio text-accent focus:ring-accent" />
                      <span>Logo de Imagem</span>
                    </label>
                  </div>
                </div>

                {content.header.logoType === 'text' ? (
                  <div>
                    <label htmlFor="logoText" className={labelStyle}>Texto do Logo</label>
                    <input id="logoText" type="text" value={content.header.logoText} onChange={(e) => handleInputChange('header', 'logoText', e.target.value)} onBlur={() => handleBlur('header', 'logoText')} className={`${inputStyle} ${headerErrors.logoText ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
                    {headerErrors.logoText && <p className={errorTextStyle}>{headerErrors.logoText}</p>}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="logoImageUrlLight" className={labelStyle}>URL da Imagem do Logo (Modo Claro)</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-grow">
                          <input id="logoImageUrlLight" type="text" value={content.header.logoImageUrlLight} onChange={(e) => handleInputChange('header', 'logoImageUrlLight', e.target.value)} className={`${inputStyle} ${headerErrors.logoImageUrlLight ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
                        </div>
                        <ImagePreview src={content.header.logoImageUrlLight} />
                        <input type="file" id="logo-image-upload-input-light" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('header', 'logoImageUrlLight', url), 'logo-image-light')} />
                        <button type="button" onClick={() => triggerFileUpload('logo-image-upload-input-light')} disabled={uploading === 'logo-image-light'} className={uploadButtonStyle} aria-label="Fazer upload de nova imagem para o logo (modo claro)">
                          {uploading === 'logo-image-light' ? 'Enviando...' : 'Upload'}
                        </button>
                      </div>
                      {headerErrors.logoImageUrlLight && <p className={errorTextStyle}>{headerErrors.logoImageUrlLight}</p>}
                    </div>
                    <div>
                      <label htmlFor="logoImageUrlDark" className={labelStyle}>URL da Imagem do Logo (Modo Escuro)</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-grow">
                          <input id="logoImageUrlDark" type="text" value={content.header.logoImageUrlDark} onChange={(e) => handleInputChange('header', 'logoImageUrlDark', e.target.value)} className={inputStyle} />
                        </div>
                        <ImagePreview src={content.header.logoImageUrlDark} />
                        <input type="file" id="logo-image-upload-input-dark" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('header', 'logoImageUrlDark', url), 'logo-image-dark')} />
                        <button type="button" onClick={() => triggerFileUpload('logo-image-upload-input-dark')} disabled={uploading === 'logo-image-dark'} className={uploadButtonStyle} aria-label="Fazer upload de nova imagem para o logo (modo escuro)">
                          {uploading === 'logo-image-dark' ? 'Enviando...' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="contactButton" className={labelStyle}>Texto Botão de Contato</label>
                  <input id="contactButton" type="text" value={content.header.contactButton} onChange={(e) => handleInputChange('header', 'contactButton', e.target.value)} onBlur={() => handleBlur('header', 'contactButton')} className={`${inputStyle} ${headerErrors.contactButton ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
                  {headerErrors.contactButton && <p className={errorTextStyle}>{headerErrors.contactButton}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div id="tabpanel-about" role="tabpanel" tabIndex={0} aria-labelledby="tab-about" hidden={activeTab !== 'about'} className={sectionStyle}>
            <div>
              <h2 className="text-2xl font-bold mb-4">Seção "Sobre"</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="aboutHeadline" className={labelStyle}>Título (pode usar HTML)</label>
                  <textarea id="aboutHeadline" rows={2} value={content.about.headline} onChange={(e) => handleInputChange('about', 'headline', e.target.value)} onBlur={() => handleBlur('about', 'headline')} className={`${inputStyle} ${aboutErrors.headline ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`}></textarea>
                  {aboutErrors.headline && <p className={errorTextStyle}>{aboutErrors.headline}</p>}
                </div>
                <div>
                  <label htmlFor="aboutP1" className={labelStyle}>Parágrafo 1</label>
                  <textarea id="aboutP1" rows={4} value={content.about.paragraph1} onChange={(e) => handleInputChange('about', 'paragraph1', e.target.value)} className={inputStyle}></textarea>
                </div>
                <div>
                  <label htmlFor="aboutP2" className={labelStyle}>Parágrafo 2</label>
                  <textarea id="aboutP2" rows={4} value={content.about.paragraph2} onChange={(e) => handleInputChange('about', 'paragraph2', e.target.value)} className={inputStyle}></textarea>
                </div>
                <div>
                  <label htmlFor="aboutButton" className={labelStyle}>Texto do Botão</label>
                  <input id="aboutButton" type="text" value={content.about.buttonText} onChange={(e) => handleInputChange('about', 'buttonText', e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label htmlFor="aboutImage" className={labelStyle}>URL da Imagem</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-grow">
                      <input id="aboutImage" type="text" value={content.about.imageUrl} onChange={(e) => handleInputChange('about', 'imageUrl', e.target.value)} onBlur={() => handleBlur('about', 'imageUrl')} className={`${inputStyle} ${aboutErrors.imageUrl ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
                    </div>
                    <ImagePreview src={content.about.imageUrl} />
                    <input type="file" id="about-image-upload-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('about', 'imageUrl', url), 'about-image')} />
                    <button type="button" onClick={() => triggerFileUpload('about-image-upload-input')} disabled={uploading === 'about-image'} className={uploadButtonStyle} aria-label="Fazer upload de nova imagem para a seção Sobre">
                      {uploading === 'about-image' ? 'Enviando...' : 'Upload'}
                    </button>
                  </div>
                  {aboutErrors.imageUrl && <p className={errorTextStyle}>{aboutErrors.imageUrl}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio */}
          <div id="tabpanel-portfolio" role="tabpanel" tabIndex={0} aria-labelledby="tab-portfolio" hidden={activeTab !== 'portfolio'} className={sectionStyle}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Portfólio</h2>
                <button onClick={addPortfolioItem} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  Adicionar Item
                </button>
              </div>
              <div className="space-y-6">
                {content.portfolio.map((item, index) => (
                  <div key={String(item.id ?? `new-${index}`)} className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg space-y-3 relative bg-slate-50 dark:bg-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Item {index + 1}</h3>
                        <div className="flex items-center">
                          <button onClick={() => handleMoveItemUp(index)} disabled={index === 0} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label={`Mover item ${index + 1} para cima`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                          </button>
                          <button onClick={() => handleMoveItemDown(index)} disabled={index === content.portfolio.length - 1} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label={`Mover item ${index + 1} para baixo`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                      </div>
                      <button onClick={() => handleDeletePortfolioItem(index)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label={`Excluir item ${index + 1}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div>
                      <label htmlFor={`portfolio-imageurl-${index}`} className={labelStyle}>URL da Imagem</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-grow">
                          <input id={`portfolio-imageurl-${index}`} type="text" value={item.imageurl} onChange={(e) => handlePortfolioChange(index, 'imageurl', e.target.value)} onBlur={() => handleBlur('portfolio', 'imageurl', index)} className={`${inputStyle} ${portfolioErrors[index]?.imageurl ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} placeholder="https://images.unsplash.com/..." aria-invalid={!!portfolioErrors[index]?.imageurl} aria-describedby={`portfolio-imageurl-error-${index}`} />
                        </div>
                        <ImagePreview src={item.imageurl} />
                        <input type="file" id={`portfolio-image-upload-input-${index}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handlePortfolioChange(index, 'imageurl', url), `portfolio-image-${index}`)} />
                        <button type="button" onClick={() => triggerFileUpload(`portfolio-image-upload-input-${index}`)} disabled={uploading === `portfolio-image-${index}`} className={uploadButtonStyle} aria-label={`Fazer upload de imagem para o item ${index + 1}`}>
                          {uploading === `portfolio-image-${index}` ? 'Enviando...' : 'Upload'}
                        </button>
                      </div>
                      {portfolioErrors[index]?.imageurl && (
                        <p id={`portfolio-imageurl-error-${index}`} className={errorTextStyle} role="alert">
                          {portfolioErrors[index].imageurl}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor={`portfolio-title-${index}`} className={labelStyle}>Título</label>
                      <input id={`portfolio-title-${index}`} type="text" value={item.title} onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)} onBlur={() => handleBlur('portfolio', 'title', index)} className={`${inputStyle} ${portfolioErrors[index]?.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} placeholder="Ex: Análise de Dados Corp" />
                      {portfolioErrors[index]?.title && <p className={errorTextStyle}>{portfolioErrors[index].title}</p>}
                    </div>

                    <div>
                      <label htmlFor={`portfolio-category-${index}`} className={labelStyle}>Categoria</label>
                      <input id={`portfolio-category-${index}`} type="text" value={item.category} onChange={(e) => handlePortfolioChange(index, 'category', e.target.value)} onBlur={() => handleBlur('portfolio', 'category', index)} className={`${inputStyle} ${portfolioErrors[index]?.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} placeholder="Ex: Web Design" />
                      {portfolioErrors[index]?.category && <p className={errorTextStyle}>{portfolioErrors[index].category}</p>}
                    </div>

                    <div className="pt-3 space-y-3">
                      <div>
                        <label htmlFor={`portfolio-desafio-${index}`} className={labelStyle}>O Desafio</label>
                        <textarea id={`portfolio-desafio-${index}`} value={item.desafio || ''} onChange={(e) => handlePortfolioChange(index, 'desafio', e.target.value)} className={inputStyle} rows={3} placeholder="Descreva o desafio que o cliente enfrentava..."></textarea>
                      </div>
                      <div>
                        <label htmlFor={`portfolio-solucao-${index}`} className={labelStyle}>A Solução</label>
                        <textarea id={`portfolio-solucao-${index}`} value={item.solucao || ''} onChange={(e) => handlePortfolioChange(index, 'solucao', e.target.value)} className={inputStyle} rows={3} placeholder="Explique a solução que foi implementada..."></textarea>
                      </div>
                      <div>
                        <label htmlFor={`portfolio-resultados-${index}`} className={labelStyle}>Resultados</label>
                        <textarea id={`portfolio-resultados-${index}`} value={item.resultados || ''} onChange={(e) => handlePortfolioChange(index, 'resultados', e.target.value)} className={inputStyle} rows={3} placeholder="Apresente os resultados e o impacto do projeto..."></textarea>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-300 dark:border-slate-600">
                      <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Tecnologias</h4>
                      <div className="space-y-2">
                        {(item.technologies || []).map((tech, techIndex) => (
                          <div key={techIndex} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded">
                            <input type="text" value={tech.name} onChange={(e) => handlePortfolioTechChange(index, techIndex, 'name', e.target.value)} placeholder="Nome da Tecnologia" className="w-1/3 bg-transparent focus:outline-none text-sm" />
                            <div className="flex-grow flex items-center gap-2">
                              <textarea value={tech.icon} onChange={(e) => handlePortfolioTechChange(index, techIndex, 'icon', e.target.value)} placeholder="Cole o código SVG ou faça upload" rows={1} className="w-full bg-transparent focus:outline-none text-sm font-mono text-slate-500" />
                              <input type="file" id={`tech-icon-upload-${index}-${techIndex}`} className="hidden" accept="image/svg+xml" onChange={(e) => handleTechIconUpload(e, index, techIndex)} />
                              <button type="button" onClick={() => triggerFileUpload(`tech-icon-upload-${index}-${techIndex}`)} className="flex-shrink-0 text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label={`Fazer upload do ícone SVG para ${tech.name || 'nova tecnologia'}`}>
                                Upload SVG
                              </button>
                            </div>
                            <button onClick={() => removePortfolioTech(index, techIndex)} className="text-red-500 hover:text-red-700 p-1 rounded-full" aria-label={`Remover tecnologia ${tech.name || ''}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => addPortfolioTech(index)} className="mt-2 text-sm text-accent hover:text-accent-hover font-semibold">
                        + Adicionar Tecnologia
                      </button>
                    </div>
                  </div>
                ))}
                {content.portfolio.length === 0 && (
                  <p className="text-center text-slate-500 dark:text-muted py-8">Nenhum item no portfólio. Clique em "Adicionar Item" para começar.</p>
                )}
              </div>
            </div>
          </div>
           {/* Configurações */}
          <div id="tabpanel-config" role="tabpanel" tabIndex={0} aria-labelledby="tab-config" hidden={activeTab !== 'config'} className={sectionStyle}>
              <h2 className="text-2xl font-bold mb-4">Configurações do Site</h2>
              <div className="space-y-6">
                  <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Favicons</h3>
                      <p className="text-sm text-slate-500 dark:text-muted mb-4">Faça o upload dos ícones do seu site. Recomenda-se usar os três formatos para máxima compatibilidade.</p>
                      <div className="space-y-4">
                           <div>
                                <label htmlFor="faviconIcoUrl" className={labelStyle}>Favicon (.ico)</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow">
                                    <input id="faviconIcoUrl" type="text" value={content.site_meta?.faviconIcoUrl || ''} onChange={(e) => handleInputChange('site_meta', 'faviconIcoUrl', e.target.value)} className={inputStyle} placeholder="URL para o arquivo .ico"/>
                                    </div>
                                    <ImagePreview src={content.site_meta?.faviconIcoUrl} />
                                    <input type="file" id="favicon-ico-upload" className="hidden" accept=".ico,image/x-icon" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('site_meta', 'faviconIcoUrl', url), 'favicon-ico')} />
                                    <button type="button" onClick={() => triggerFileUpload('favicon-ico-upload')} disabled={uploading === 'favicon-ico'} className={uploadButtonStyle}>
                                    {uploading === 'favicon-ico' ? 'Enviando...' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                           <div>
                                <label htmlFor="faviconSvgUrl" className={labelStyle}>Favicon SVG (.svg)</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow">
                                    <input id="faviconSvgUrl" type="text" value={content.site_meta?.faviconSvgUrl || ''} onChange={(e) => handleInputChange('site_meta', 'faviconSvgUrl', e.target.value)} className={inputStyle} placeholder="URL para o arquivo .svg"/>
                                    </div>
                                    <ImagePreview src={content.site_meta?.faviconSvgUrl} />
                                    <input type="file" id="favicon-svg-upload" className="hidden" accept=".svg,image/svg+xml" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('site_meta', 'faviconSvgUrl', url), 'favicon-svg')} />
                                    <button type="button" onClick={() => triggerFileUpload('favicon-svg-upload')} disabled={uploading === 'favicon-svg'} className={uploadButtonStyle}>
                                    {uploading === 'favicon-svg' ? 'Enviando...' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="appleTouchIconUrl" className={labelStyle}>Apple Touch Icon (.png)</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow">
                                    <input id="appleTouchIconUrl" type="text" value={content.site_meta?.appleTouchIconUrl || ''} onChange={(e) => handleInputChange('site_meta', 'appleTouchIconUrl', e.target.value)} className={inputStyle} placeholder="URL para o arquivo .png (180x180px)"/>
                                    </div>
                                    <ImagePreview src={content.site_meta?.appleTouchIconUrl} />
                                    <input type="file" id="apple-touch-icon-upload" className="hidden" accept=".png,image/png" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('site_meta', 'appleTouchIconUrl', url), 'apple-touch-icon')} />
                                    <button type="button" onClick={() => triggerFileUpload('apple-touch-icon-upload')} disabled={uploading === 'apple-touch-icon'} className={uploadButtonStyle}>
                                    {uploading === 'apple-touch-icon' ? 'Enviando...' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                      </div>
                  </div>
              </div>
          </div>

        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-primary/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-20 space-x-4">
            {message && (
              <p aria-live="polite" className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{message.text}</p>
            )}
            <button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-bold text-lg py-3 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px]">
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;