import React, { useEffect, useMemo, useState, useCallback } from 'react';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import ThemeToggleButton from './ThemeToggleButton';
import AdminHome from './AdminHome';
import AdminSidebar from './AdminSidebar';
import AdminAppearance from './AdminAppearance';
import AdminHeader from './AdminHeader';
import AdminPortfolio from './AdminPortfolio'; // Importando o novo componente
import AdminProfile from './AdminProfile'; // Importando a nova tela de perfil
import AdminSaveBar from './AdminSaveBar';
import ImagePreview from './ImagePreview';
import AdminTechCarousel from './AdminTechCarousel';
import AdminHero from './AdminHero';
import AdminAbout from './AdminAbout';

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

interface ThemeSettings {
    primary: string;
    secondary: string;
    accent: string;
    accentHover: string;
    light: string;
    muted: string;
}

interface HeaderContent {
  logoType: 'text' | 'image';
  logoText: string;
  logoImageUrlLight: string;
  logoImageUrlDark: string;
  contactButton: string;
}

interface Value {
  icon: string;
  title: string;
  text: string;
}

interface TeamMember {
  imageUrl: string;
  name: string;
  role: string;
}

interface AboutContent {
    headline: string;
    paragraph1: string;
    paragraph2: string;
    buttonText: string;
    imageUrl: string;
    philosophyHeadline: string;
    philosophyText: string;
    valuesHeadline: string;
    values: Value[];
    teamHeadline: string;
    teamMembers: TeamMember[];
}

interface TechCarouselContent {
    headline: string;
    subheadline: string;
    technologies: Technology[];
}

interface HeroContent {
    headline: string;
    paragraph: string;
    ctaPrimary: string;
    ctaSecondary: string;
}


interface WebsiteContent {
  header: HeaderContent;
  hero: HeroContent;
  about: AboutContent;
  portfolio: PortfolioItem[];
  tech_carousel: TechCarouselContent;
  site_meta: {
    faviconIcoUrl: string;
    faviconSvgUrl: string;
    appleTouchIconUrl: string;
  };
  theme_settings: ThemeSettings;
}

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar: string | null;
}

interface AuditLog {
  id: number;
  created_at: string;
  user_email: string;
  action: string;
  description: string;
  old_value: any;
  new_value: any;
}

interface AdminDashboardProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  supabase: SupabaseClient;
  initialContent: WebsiteContent;
  onSaveSuccess: () => void;
  session: Session | null;
}

type AdminTab = 'home' | 'hero' | 'header' | 'about' | 'portfolio' | 'tecnologias' | 'appearance' | 'profile' | 'history';

type ErrorMap = { [key: string]: string };

// ==========================
// Helpers
// ==========================
const isValidUrl = (url: string): boolean => {
  if (!url) return true;
  try {
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

const diff = (obj1: any, obj2: any): { path: string, old_value: any, new_value: any }[] => {
    const changes: { path: string, old_value: any, new_value: any }[] = [];
    const internalDiff = (o1: any, o2: any, path: string) => {
        if (Object.is(o1, o2) || JSON.stringify(o1) === JSON.stringify(o2)) return;

        if (typeof o1 !== 'object' || o1 === null || typeof o2 !== 'object' || o2 === null || Array.isArray(o1) || Array.isArray(o2)) {
            changes.push({ path, old_value: o1, new_value: o2 });
            return;
        }

        const allKeys = new Set([...Object.keys(o1), ...Object.keys(o2)]);
        for (const key of allKeys) {
            const newPath = path ? `${path}.${key}` : key;
            internalDiff(o1[key], o2[key], newPath);
        }
    }
    internalDiff(obj1, obj2, '');
    return changes;
};

// ==========================
// Main Component
// ==========================
const AdminDashboard: React.FC<AdminDashboardProps> = ({
  theme,
  toggleTheme,
  supabase,
  initialContent,
  onSaveSuccess,
  session,
}) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('home');
    const [content, setContent] = useState<WebsiteContent>(initialContent);
    const [originalContent, setOriginalContent] = useState<WebsiteContent>(initialContent);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [errors, setErrors] = useState<{ header: ErrorMap, about: ErrorMap, portfolio: ErrorMap[] }>({
        header: {},
        about: {},
        portfolio: emptyPortfolioErrors(initialContent.portfolio.length)
    });
    const [uploading, setUploading] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    useEffect(() => {
        setOriginalContent(initialContent);
        setContent(initialContent);
    }, [initialContent]);

    const hasChanges = useMemo(() => {
        return JSON.stringify(content) !== JSON.stringify(originalContent);
    }, [content, originalContent]);
    
    const fetchProfileAndLogs = useCallback(async () => {
        if (!session?.user.id) return;
        try {
            const { data: profileData, error: profileError } = await supabase.from('profiles').select('id, full_name, phone, avatar').eq('id', session.user.id).maybeSingle();
            if (profileError) throw profileError;
            setProfile(profileData);

            const { data: logsData, error: logsError } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
            if (logsError) throw logsError;
            setAuditLogs(logsData || []);
        } catch (error: any) {
            console.error("Error fetching admin data:", error.message);
        }
    }, [supabase, session]);

    useEffect(() => { fetchProfileAndLogs(); }, [fetchProfileAndLogs]);

    const handleLogout = async () => { await supabase.auth.signOut(); window.location.hash = ''; };

    const handleDiscard = () => {
        if (window.confirm("Você tem certeza que quer descartar todas as alterações não salvas?")) {
            setContent(originalContent);
            setErrors({ header: {}, about: {}, portfolio: emptyPortfolioErrors(originalContent.portfolio.length) });
            setMessage(null);
        }
    };

    const handleInputChange = (section: keyof WebsiteContent, field: string, value: any) => {
        setContent(prev => ({
            ...prev,
            [section]: { ...(prev as any)[section], [field]: value }
        }));
    };
    
    const handlePortfolioChange = (index: number, field: keyof Omit<PortfolioItem, 'technologies' | 'id' | 'position'>, value: string) => {
        const newPortfolio = [...content.portfolio];
        newPortfolio[index] = { ...newPortfolio[index], [field]: value };
        setContent(prev => ({ ...prev, portfolio: newPortfolio }));
    };

    const addPortfolioItem = () => {
        const newItem: PortfolioItem = { title: '', category: '', imageurl: '', technologies: [] };
        setContent(prev => ({ ...prev, portfolio: [...prev.portfolio, newItem] }));
        setErrors(prev => ({ ...prev, portfolio: [...prev.portfolio, {}]}));
    };

    const handleDeletePortfolioItem = (index: number) => {
        if (window.confirm(`Tem certeza de que deseja excluir o projeto "${content.portfolio[index].title || 'Novo Projeto'}"?`)) {
            setContent(prev => ({ ...prev, portfolio: prev.portfolio.filter((_, i) => i !== index) }));
            setErrors(prev => ({ ...prev, portfolio: prev.portfolio.filter((_, i) => i !== index)}));
        }
    };
    
     const handleMoveItem = (index: number, direction: 'up' | 'down') => {
        const newPortfolio = [...content.portfolio];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newPortfolio.length) return;
        [newPortfolio[index], newPortfolio[newIndex]] = [newPortfolio[newIndex], newPortfolio[index]];
        setContent(prev => ({ ...prev, portfolio: newPortfolio }));
    };

    const addPortfolioTech = (itemIndex: number) => {
        const newPortfolio = [...content.portfolio];
        const technologies = newPortfolio[itemIndex].technologies || [];
        newPortfolio[itemIndex].technologies = [...technologies, { name: '', icon: '' }];
        setContent(prev => ({ ...prev, portfolio: newPortfolio }));
    };

    const removePortfolioTech = (itemIndex: number, techIndex: number) => {
        const newPortfolio = [...content.portfolio];
        newPortfolio[itemIndex].technologies = (newPortfolio[itemIndex].technologies || []).filter((_, i) => i !== techIndex);
        setContent(prev => ({ ...prev, portfolio: newPortfolio }));
    };

    const handlePortfolioTechChange = (itemIndex: number, techIndex: number, field: keyof Technology, value: string) => {
        const newPortfolio = [...content.portfolio];
        const newTechnologies = [...(newPortfolio[itemIndex].technologies || [])];
        newTechnologies[techIndex] = { ...newTechnologies[techIndex], [field]: value };
        newPortfolio[itemIndex].technologies = newTechnologies;
        setContent(prev => ({ ...prev, portfolio: newPortfolio }));
    };
    
    const triggerFileUpload = (inputId: string) => document.getElementById(inputId)?.click();
    
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, updateFunction: (url: string) => void, uploadIdentifier: string) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        setUploading(uploadIdentifier);
        setMessage(null);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
            const { data, error } = await supabase.storage.from('public-assets').upload(fileName, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(data.path);
            updateFunction(publicUrl);
            setMessage({ type: 'success', text: 'Upload realizado com sucesso!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: `Falha no upload: ${error.message}` });
        } finally {
            setUploading(null);
            event.target.value = '';
        }
    };

    const handleTechIconUpload = async (event: React.ChangeEvent<HTMLInputElement>, updateFunction: (svgContent: string) => void) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        if (file.type !== 'image/svg+xml') {
            setMessage({ type: 'error', text: 'Apenas arquivos SVG são permitidos para ícones.' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const svgContent = e.target?.result as string;
            updateFunction(svgContent);
        };
        reader.readAsText(file);
    };

    const validate = () => { /* ... Validation logic could be added here ... */ return true; };

    const handleSave = async () => {
        if (!validate()) {
            setMessage({ type: 'error', text: 'Por favor, corrija os erros antes de salvar.' });
            return;
        }
        setIsSaving(true);
        setMessage(null);
        try {
            const updates = [];
            
            // Sections update (header, about, site_meta, theme_settings, tech_carousel)
            const changedSections = (['header', 'hero', 'about', 'tech_carousel', 'site_meta', 'theme_settings'] as const)
                .filter(key => JSON.stringify(content[key]) !== JSON.stringify(originalContent[key]));

            for (const sectionId of changedSections) {
                updates.push(supabase.from('sections').update({ content: content[sectionId] }).eq('id', sectionId));
            }
            
            // Portfolio update
            if (JSON.stringify(content.portfolio) !== JSON.stringify(originalContent.portfolio)) {
                // Delete items that are in original but not in current
                const deletedItems = originalContent.portfolio.filter(p_orig => isUUID(p_orig.id) && !content.portfolio.some(p_curr => p_curr.id === p_orig.id));
                if (deletedItems.length > 0) {
                    updates.push(supabase.from('portfolio').delete().in('id', deletedItems.map(p => p.id)));
                }
                
                // Upsert current items
                const portfolioToUpsert = content.portfolio.map((item, index) => ({
                    ...item,
                    position: index // Ensure position is always updated
                }));
                updates.push(supabase.from('portfolio').upsert(portfolioToUpsert));
            }

            const results = await Promise.all(updates);
            results.forEach(res => { if (res.error) throw res.error; });
            
            // Audit Log
            const changes = diff(originalContent, content);
            for (const change of changes) {
                const { error: logError } = await supabase.from('audit_logs').insert({
                    user_email: session?.user?.email || 'unknown',
                    action: 'UPDATE',
                    description: `Campo '${change.path}' foi atualizado.`,
                    old_value: change.old_value,
                    new_value: change.new_value
                });
                if (logError) console.error("Error logging audit trail:", logError);
            }

            setMessage({ type: 'success', text: 'Alterações salvas com sucesso!' });
            onSaveSuccess(); // This will refetch and update originalContent
        } catch (error: any) {
            setMessage({ type: 'error', text: `Erro ao salvar: ${error.message}` });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };
    
    const renderContent = () => {
        const saveBarProps = { hasChanges, onSave: handleSave, onDiscard: handleDiscard, isSaving, message };
        const cardStyle = 'bg-white dark:bg-secondary p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700';
        
        switch (activeTab) {
            case 'home': return <AdminHome setActiveTab={setActiveTab} auditLogs={auditLogs} portfolio={content.portfolio} profile={profile} />;
            case 'header': return <AdminHeader content={content.header} handleInputChange={handleInputChange} handleImageUpload={handleImageUpload} triggerFileUpload={triggerFileUpload} uploading={uploading} headerErrors={errors.header} handleBlur={() => {}} saveBarProps={saveBarProps} />;
            case 'hero': return <AdminHero content={content.hero} handleInputChange={handleInputChange} saveBarProps={saveBarProps} />;
            case 'about': return <AdminAbout content={content.about} setContent={setContent} saveBarProps={saveBarProps} handleImageUpload={handleImageUpload} triggerFileUpload={triggerFileUpload} uploading={uploading} />;
            case 'portfolio': return <AdminPortfolio portfolio={content.portfolio} portfolioErrors={errors.portfolio} uploading={uploading} saveBarProps={saveBarProps} handlePortfolioChange={handlePortfolioChange} handlePortfolioTechChange={handlePortfolioTechChange} addPortfolioItem={addPortfolioItem} addPortfolioTech={addPortfolioTech} removePortfolioTech={removePortfolioTech} handleDeletePortfolioItem={handleDeletePortfolioItem} handleMoveItemUp={(i) => handleMoveItem(i, 'up')} handleMoveItemDown={(i) => handleMoveItem(i, 'down')} triggerFileUpload={triggerFileUpload} handleTechIconUpload={(e, itemIndex, techIndex) => handleTechIconUpload(e, (svg) => handlePortfolioTechChange(itemIndex, techIndex, 'icon', svg))} handleImageUpload={handleImageUpload} handleBlur={() => {}} />;
            case 'tecnologias': return <AdminTechCarousel content={content.tech_carousel} setContent={setContent} saveBarProps={saveBarProps} triggerFileUpload={triggerFileUpload} handleTechIconUpload={handleTechIconUpload} />;
            case 'appearance': return <AdminAppearance themeSettings={content.theme_settings} siteMeta={content.site_meta} setContent={setContent} setMessage={setMessage} saveBarProps={saveBarProps} handleImageUpload={handleImageUpload} triggerFileUpload={triggerFileUpload} uploading={uploading} />;
            case 'profile':
                 return <AdminProfile session={session} profile={profile} supabase={supabase} onUpdate={fetchProfileAndLogs} />;
            case 'history':
                const timeAgo = (dateString: string): string => {
                    const date = new Date(dateString);
                    const now = new Date();
                    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
                    let interval = seconds / 31536000;
                    if (interval > 1) return `${Math.floor(interval)} anos atrás`;
                    interval = seconds / 2592000;
                    if (interval > 1) return `${Math.floor(interval)} meses atrás`;
                    interval = seconds / 86400;
                    if (interval > 1) return `há ${Math.floor(interval)} dias`;
                    interval = seconds / 3600;
                    if (interval > 1) return `há ${Math.floor(interval)} horas`;
                    interval = seconds / 60;
                    if (interval > 1) return `há ${Math.floor(interval)} minutos`;
                    return `há segundos`;
                };
                return (
                    <div className={cardStyle}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Histórico de Alterações</h3>
                        {auditLogs.length > 0 ? (
                            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                {auditLogs.map(log => (
                                    <li key={log.id} className="py-3">
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{log.description}</p>
                                        <p className="text-xs text-slate-500 dark:text-muted">{log.user_email} &bull; {timeAgo(log.created_at)}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-muted">Nenhuma atividade recente encontrada.</p>
                        )}
                    </div>
                );
            default: return <AdminHome setActiveTab={setActiveTab} auditLogs={auditLogs} portfolio={content.portfolio} profile={profile} />;
        }
    };
    
    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-primary text-slate-900 dark:text-light">
            <AdminSidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              session={session}
              profile={profile}
              handleLogout={handleLogout} 
              isOpen={isSidebarOpen} 
              setIsOpen={setIsSidebarOpen} 
            />
            <div className="flex-1 flex flex-col md:ml-64">
                <header className="md:hidden flex items-center justify-between h-20 px-4 bg-white dark:bg-secondary border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                     <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                     </button>
                     <h2 className="text-lg font-bold capitalize">{activeTab === 'home' ? 'Início' : activeTab}</h2>
                     <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;