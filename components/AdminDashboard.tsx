import React, { useEffect, useMemo, useState, useCallback } from 'react';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
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

interface ThemeSettings {
    primary: string;
    secondary: string;
    accent: string;
    accentHover: string;
    light: string;
    muted: string;
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
  theme_settings: ThemeSettings;
}

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
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

type AdminTab = 'header' | 'about' | 'portfolio' | 'appearance' | 'config' | 'profile' | 'history';

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

const defaultThemeSettings: ThemeSettings = {
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#0891b2',
    accentHover: '#06b6d4',
    light: '#f8fafc',
    muted: '#94a3b8',
};

// ==========================
// Color Conversion Utilities
// ==========================
const parseColor = (color: string): [number, number, number] | null => {
    color = color.trim();
    if (color.startsWith('#')) {
        const hex = color.length === 4 ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : color;
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    }
    const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
    if (rgbMatch) {
        return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
    }
    return null;
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    } else {
      h = s = 0;
    }
    return [h * 360, s * 100, l * 100];
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
};

const rgbToHex = (r: number, g: number, b: number): string =>
    `#${[r, g, b].map(x => { const hex = x.toString(16); return hex.length === 1 ? '0' + hex : hex; }).join('')}`;

const diff = (obj1: any, obj2: any, path: string = ''): { path: string, old_value: any, new_value: any }[] => {
    const changes: { path: string, old_value: any, new_value: any }[] = [];
    if (Object.is(obj1, obj2)) return [];

    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
            changes.push({ path, old_value: obj1, new_value: obj2 });
        }
        return changes;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
        changes.push({ path, old_value: obj1, new_value: obj2 });
      }
      return changes;
    }

    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        const nestedChanges = diff(obj1[key], obj2[key], newPath);
        changes.push(...nestedChanges);
    }
    
    return changes;
};

// ==========================
// Componente
// ==========================
const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme, toggleTheme, supabase, initialContent, onSaveSuccess, session }) => {
  const [content, setContent] = useState<WebsiteContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('header');
  const [uploading, setUploading] = useState<string | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [headerErrors, setHeaderErrors] = useState<ErrorMap>({});
  const [aboutErrors, setAboutErrors] = useState<ErrorMap>({});
  const [portfolioErrors, setPortfolioErrors] = useState<ErrorMap[]>(emptyPortfolioErrors(initialContent.portfolio.length));
  const [baseColor, setBaseColor] = useState('#0891b2');

  // Profile & Audit state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileErrors, setProfileErrors] = useState<ErrorMap>({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logFilter, setLogFilter] = useState('');

  const fetchProfileAndLogs = useCallback(async () => {
    if (!session) return;
    try {
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116: No rows found, which is fine.
             throw profileError;
        }

        if (profileData) {
            setProfile(profileData);
        } else {
            // Profile doesn't exist. Initialize a default state for creation.
            setProfile({
                id: session.user.id,
                full_name: session.user.email?.split('@')[0] || '',
                phone: ''
            });
        }

        const { data: logsData, error: logsError } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false });
        if (logsError) throw logsError;
        setAuditLogs(logsData || []);
    } catch (error: any) {
        setMessage({ type: 'error', text: `Erro ao buscar dados do painel: ${error.message}` });
    }
  }, [session, supabase]);
  
  useEffect(() => {
    fetchProfileAndLogs();
  }, [fetchProfileAndLogs]);


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
      const newHeader: ErrorMap = {}; const newAbout: ErrorMap = {};
      const newPortfolio: ErrorMap[] = emptyPortfolioErrors(data.portfolio.length);
      if (data.header.logoType === 'text' && !data.header.logoText.trim()) newHeader.logoText = 'O texto do logo é obrigatório.';
      if (data.header.logoType === 'image' && !data.header.logoImageUrlLight.trim() && !data.header.logoImageUrlDark.trim()) newHeader.logoImageUrlLight = 'Pelo menos uma URL de imagem do logo é obrigatória.';
      if (!data.header.contactButton.trim()) newHeader.contactButton = 'O texto do botão de contato é obrigatório.';
      if (!data.about.headline.trim()) newAbout.headline = 'O título é obrigatório.';
      if (!data.about.imageUrl.trim()) newAbout.imageUrl = 'A URL da imagem é obrigatória.';
      data.portfolio.forEach((item, index) => {
        const errs: ErrorMap = {};
        if (!item.title.trim()) errs.title = 'O título é obrigatório.'; if (!item.category.trim()) errs.category = 'A categoria é obrigatória.'; if (!item.imageurl.trim()) errs.imageurl = 'A URL da imagem é obrigatória.';
        else if (!isValidUrl(item.imageurl)) errs.imageurl = 'Por favor, insira uma URL válida (ex: https://...).';
        newPortfolio[index] = errs;
      });
      const isValid = Object.keys(newHeader).length === 0 && Object.keys(newAbout).length === 0 && newPortfolio.every((m) => Object.keys(m).length === 0);
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
      if (section === 'portfolio' && index !== undefined) setPortfolioErrors((prev) => { const next = [...prev]; next[index] = { ...next[index], [field]: errorMsg }; return next; });
    }
  };

  const handleInputChange = (section: 'header' | 'about' | 'site_meta', field: string, value: string) => {
    setContent((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    if (section === 'header' && (headerErrors as any)[field]) setHeaderErrors((prev) => { const n: any = { ...prev }; delete n[field]; return n; });
    if (section === 'about' && (aboutErrors as any)[field]) setAboutErrors((prev) => { const n: any = { ...prev }; delete n[field]; return n; });
  };
  
  const handleThemeColorChange = (field: keyof ThemeSettings, value: string) => {
      setContent(prev => ({ ...prev, theme_settings: { ...prev.theme_settings, [field]: value } }));
  };
  
  const generatePalette = () => {
      const rgb = parseColor(baseColor);
      if (!rgb) {
          setMessage({ type: 'error', text: 'Formato de cor inválido. Use #RRGGBB ou rgb(r, g, b).' });
          setTimeout(() => setMessage(null), 3000);
          return;
      }

      const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);

      const newPalette: ThemeSettings = {
          accent: rgbToHex(...hslToRgb(h, s, l)),
          accentHover: rgbToHex(...hslToRgb(h, Math.min(100, s + 5), Math.min(100, l + 8))),
          primary: rgbToHex(...hslToRgb(h, Math.max(0, s - 30), 11)),
          secondary: rgbToHex(...hslToRgb(h, Math.max(0, s - 40), 17)),
          light: rgbToHex(...hslToRgb(h, Math.max(0, s - 70), 98)),
          muted: rgbToHex(...hslToRgb(h, Math.max(0, s - 60), 65)),
      };
      
      setContent(prev => ({...prev, theme_settings: newPalette }));
      setMessage({ type: 'success', text: 'Paleta gerada! Ajuste se necessário e salve.' });
      setTimeout(() => setMessage(null), 4000);
  };

  const handleResetColors = () => {
    if (window.confirm('Você tem certeza que deseja redefinir todas as cores para o padrão original? As alterações atuais no formulário serão perdidas.')) {
        setContent(prev => ({
            ...prev,
            // Criar uma nova cópia do objeto de tema padrão para garantir que o React detecte a mudança.
            theme_settings: { ...defaultThemeSettings } 
        }));
        setMessage({ type: 'success', text: 'Cores redefinidas. Clique em "Salvar Alterações" para aplicar no site.' });
        setTimeout(() => setMessage(null), 4000);
    }
  };


  const handlePortfolioChange = ( index: number, field: keyof Omit<PortfolioItem, 'technologies' | 'id' | 'created_at' | 'position'>, value: string ) => {
    const updated = [...content.portfolio];
    updated[index] = { ...updated[index], [field]: value } as PortfolioItem;
    setContent((prev) => ({ ...prev, portfolio: updated }));
    if (portfolioErrors[index]?.[field as string]) {
      setPortfolioErrors((prev) => { const next = [...prev]; const itemErr = { ...next[index] } as any; delete itemErr[field as string]; next[index] = itemErr; return next; });
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
    setContent((prev) => ({ ...prev, portfolio: [ ...prev.portfolio, { imageurl: '', title: '', category: '', technologies: [], desafio: '', solucao: '', resultados: '' },], }));
    setPortfolioErrors((prev) => [...prev, {}]);
  };

  const handleDeletePortfolioItem = (index: number) => {
  if (!window.confirm('Você tem certeza que deseja apagar este item do portfólio? Esta ação não pode ser desfeita.')) return;
  const itemToDelete = content.portfolio[index];
  if (isUUID(itemToDelete.id)) setIdsToDelete(prev => [...prev, itemToDelete.id!]);
  setContent(prev => ({ ...prev, portfolio: prev.portfolio.filter((_, i) => i !== index) }));
  setPortfolioErrors(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveItemUp = (index: number) => { if (index === 0) return; const updated = [...content.portfolio]; [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]; setContent((prev) => ({ ...prev, portfolio: updated })); };
  const handleMoveItemDown = (index: number) => { if (index === content.portfolio.length - 1) return; const updated = [...content.portfolio]; [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]]; setContent((prev) => ({ ...prev, portfolio: updated })); };
  const triggerFileUpload = (inputId: string) => { document.getElementById(inputId)?.click(); };

  const handleTechIconUpload = ( event: React.ChangeEvent<HTMLInputElement>, itemIndex: number, techIndex: number ) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (file.type !== 'image/svg+xml') { setMessage({ type: 'error', text: 'Por favor, selecione um arquivo SVG válido.' }); setTimeout(() => setMessage(null), 3000); return; }
    const reader = new FileReader();
    reader.onload = (e) => { const svgContent = (e.target?.result as string) || ''; handlePortfolioTechChange(itemIndex, techIndex, 'icon', svgContent.trim()); };
    reader.onerror = () => { setMessage({ type: 'error', text: 'Não foi possível ler o arquivo SVG.' }); setTimeout(() => setMessage(null), 3000); };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImageUpload = async ( event: React.ChangeEvent<HTMLInputElement>, updateFunction: (url: string) => void, uploadIdentifier: string ) => {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(uploadIdentifier); setMessage(null);
    try {
      const fileExt = file.name.split('.').pop(); const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`; const filePath = `public/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file); if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('images').getPublicUrl(filePath); if (!data?.publicUrl) throw new Error('Não foi possível obter a URL pública da imagem.');
      updateFunction(data.publicUrl); setMessage({ type: 'success', text: 'Imagem carregada com sucesso!' });
    } catch (error: any) {
      console.error('--- Erro Detalhado no Upload da Imagem ---', error);
      setMessage({ type: 'error', text: `Erro no upload: ${error.message || 'Ocorreu um erro inesperado.'}` });
    } finally {
      setUploading(null); event.target.value = '';
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile || !session) return;
    setSaving(true);
    setMessage(null);
    setProfileErrors({});
    try {
        const initialProfile = (await supabase.from('profiles').select().eq('id', session.user.id).single()).data;
        
        const { error } = await supabase.from('profiles').upsert({
            id: session.user.id,
            full_name: profile.full_name,
            phone: profile.phone
        });

        if (error) throw error;
        
        const changes = diff(initialProfile, profile);
        if (changes.length > 0) {
            const { error: logError } = await supabase.from('audit_logs').insert({
                user_email: session.user.email,
                action: 'PROFILE_UPDATE',
                description: `Atualizou o perfil: ${changes.map(c => c.path).join(', ')}`,
                old_value: initialProfile,
                new_value: profile
            });
            if (logError) throw logError;
        }

        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        fetchProfileAndLogs();
    } catch (error: any) {
        setMessage({ type: 'error', text: `Falha ao atualizar perfil: ${error.message}` });
    } finally {
        setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword.length < 6) {
        setPasswordMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
        return;
    }
    if (newPassword !== confirmPassword) {
        setPasswordMessage({ type: 'error', text: 'As senhas não coincidem.' });
        return;
    }
    setSaving(true);
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;

        const { error: logError } = await supabase.from('audit_logs').insert({
            user_email: session?.user.email,
            action: 'PASSWORD_UPDATE',
            description: 'Senha de acesso alterada.'
        });
        if (logError) throw logError;
        
        setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setNewPassword('');
        setConfirmPassword('');
        fetchProfileAndLogs();
    } catch (error: any) {
        setPasswordMessage({ type: 'error', text: `Falha ao alterar senha: ${error.message}` });
    } finally {
        setSaving(false);
    }
  };
  
    const filteredLogs = useMemo(() => {
        if (!logFilter) return auditLogs;
        const lowercasedFilter = logFilter.toLowerCase();
        return auditLogs.filter(log => 
            (log.user_email && log.user_email.toLowerCase().includes(lowercasedFilter)) ||
            (log.description && log.description.toLowerCase().includes(lowercasedFilter))
        );
    }, [auditLogs, logFilter]);


  const handleSave = async () => {
    if (!session?.user?.email) return;
    setMessage(null); setSaving(true);
    const validationResult = runValidation(content);
    setHeaderErrors(validationResult.header); setAboutErrors(validationResult.about); setPortfolioErrors(validationResult.portfolio);
    if (!validationResult.isValid) {
      setMessage({ type: 'error', text: 'Por favor, corrija os erros marcados em vermelho antes de salvar.' });
      if (Object.keys(validationResult.header).length > 0) setActiveTab('header');
      else if (Object.keys(validationResult.about).length > 0) setActiveTab('about');
      else if (validationResult.portfolio.some(p => Object.keys(p).length > 0)) setActiveTab('portfolio');
      setSaving(false); return;
    }
    
    try {
      const logsToCreate = [];
      const user_email = session.user.email;
      
      // Diff simple sections
      const sections: (keyof WebsiteContent)[] = ['header', 'about', 'site_meta', 'theme_settings'];
      for (const section of sections) {
        const changes = diff(initialContent[section], content[section]);
        for (const change of changes) {
            logsToCreate.push({ user_email, action: `UPDATE_${section.toUpperCase()}`, description: `Alterou campo '${change.path}' em '${section}'`, old_value: change.old_value, new_value: change.new_value });
        }
      }

      // Diff portfolio
      // 1. Deleted items
      for (const id of idsToDelete) {
        const deletedItem = initialContent.portfolio.find(p => p.id === id);
        if (deletedItem) {
          logsToCreate.push({ user_email, action: 'DELETE_PORTFOLIO', description: `Excluiu item do portfólio: '${deletedItem.title}'`, old_value: deletedItem, new_value: null });
        }
      }
      
      // 2. Added and Updated items
      const initialPortfolioMap = new Map(initialContent.portfolio.map(item => [item.id, item]));
      content.portfolio.forEach((item, index) => {
          if (!isUUID(item.id)) { // Added
              logsToCreate.push({ user_email, action: 'CREATE_PORTFOLIO', description: `Adicionou novo item: '${item.title}'`, old_value: null, new_value: item });
          } else { // Updated or Moved
              const originalItem = initialPortfolioMap.get(item.id);
              if (originalItem) {
                  const itemWithPosition = { ...item, position: index };
                  const changes = diff(originalItem, itemWithPosition);
                  for (const change of changes) {
                      logsToCreate.push({ user_email, action: 'UPDATE_PORTFOLIO', description: `Alterou '${change.path}' no item '${item.title}'`, old_value: change.old_value, new_value: change.new_value });
                  }
              }
          }
      });

      // DB Operations
      if (idsToDelete.length > 0) { const { error } = await supabase.from('portfolio').delete().in('id', idsToDelete); if (error) throw error; }
      const sectionsPromises = [
        supabase.from('sections').upsert({ id: 'header', content: content.header }),
        supabase.from('sections').upsert({ id: 'about', content: content.about }),
        supabase.from('sections').upsert({ id: 'site_meta', content: content.site_meta }),
        supabase.from('sections').upsert({ id: 'theme_settings', content: content.theme_settings }),
      ];
      const sectionsResults = await Promise.all(sectionsPromises);
      const sectionError = sectionsResults.find(res => res.error); if (sectionError) throw sectionError.error;
      const portfolioToUpsert = content.portfolio.map((item, index) => {
        const { created_at, id, ...rest } = item; const cleanItem = { ...rest, position: index };
        if (isUUID(id)) return { ...cleanItem, id };
        return cleanItem;
      });
      if (portfolioToUpsert.length > 0) { const { error } = await supabase.from('portfolio').upsert(portfolioToUpsert); if (error) throw error; }
      
      // Insert logs
      if (logsToCreate.length > 0) {
        const { error: logError } = await supabase.from('audit_logs').insert(logsToCreate);
        if (logError) throw logError;
      }

      setMessage({ type: 'success', text: 'Alterações salvas com sucesso!' }); 
      setIdsToDelete([]); 
      onSaveSuccess();
      fetchProfileAndLogs(); // Refresh logs
    } catch (error: any) {
        console.error('Erro ao salvar no Supabase:', error);
        const errorMessage = error.message || 'Ocorreu um erro desconhecido. Verifique o console para mais detalhes.';
        const errorDetails = error.details ? `Detalhes: ${error.details}` : '';
        const errorHint = error.hint ? `Dica: ${error.hint}` : '';
        
        if (errorMessage.includes('violates row-level security policy')) {
            setMessage({
                type: 'error',
                text: `Falha ao salvar: Permissão negada. Verifique se as políticas de segurança (RLS) no Supabase estão configuradas para permitir a operação (INSERT/UPDATE/DELETE) para usuários autenticados.`
            });
        } else {
            setMessage({ type: 'error', text: `Falha ao salvar: ${errorMessage} ${errorDetails} ${errorHint}`.trim() });
        }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.hash = ''; };

  // ==========================
  // UI
  // ==========================
  const TabButton: React.FC<{ tab: AdminTab; label: string }> = ({ tab, label }) => (
    <button id={`tab-${tab}`} role="tab" aria-selected={activeTab === tab} aria-controls={`tabpanel-${tab}`} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${ activeTab === tab ? 'border-b-2 border-accent text-accent bg-slate-100 dark:bg-slate-800' : 'text-slate-500 dark:text-muted hover:text-slate-800 dark:hover:text-light' }`}>
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
              <span className="text-sm text-slate-500 dark:text-muted hidden sm:block">{session?.user?.email}</span>
              <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Sair</button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        <div className="max-w-4xl mx-auto">
          <div className="border-b border-slate-300 dark:border-slate-700 mb-6">
            <div role="tablist" className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Seções do site">
              <TabButton tab="header" label="Cabeçalho" />
              <TabButton tab="about" label="Sobre" />
              <TabButton tab="portfolio" label="Portfólio" />
              <TabButton tab="appearance" label="Aparência" />
              <TabButton tab="config" label="Configurações" />
              <TabButton tab="profile" label="Meu Perfil" />
              <TabButton tab="history" label="Histórico" />
            </div>
          </div>

          {/* Header */}
          <div id="tabpanel-header" role="tabpanel" tabIndex={0} aria-labelledby="tab-header" hidden={activeTab !== 'header'} className={sectionStyle}>
              <h2 className="text-2xl font-bold mb-4">Cabeçalho</h2>
              <div className="space-y-6">
                <div>
                  <label className={labelStyle}>Tipo de Logo</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="logoType" value="text" checked={content.header.logoType === 'text'} onChange={(e) => handleInputChange('header', 'logoType', e.target.value)} className="form-radio text-accent focus:ring-accent" /><span>Logo de Texto</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="logoType" value="image" checked={content.header.logoType === 'image'} onChange={(e) => handleInputChange('header', 'logoType', e.target.value)} className="form-radio text-accent focus:ring-accent" /><span>Logo de Imagem</span></label>
                  </div>
                </div>
                {content.header.logoType === 'text' ? ( <div> <label htmlFor="logoText" className={labelStyle}>Texto do Logo</label> <input id="logoText" type="text" value={content.header.logoText} onChange={(e) => handleInputChange('header', 'logoText', e.target.value)} onBlur={() => handleBlur('header', 'logoText')} className={`${inputStyle} ${headerErrors.logoText ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} /> {headerErrors.logoText && <p className={errorTextStyle}>{headerErrors.logoText}</p>} </div> ) : ( <div className="space-y-4"> <div> <label htmlFor="logoImageUrlLight" className={labelStyle}>URL da Imagem do Logo (Modo Claro)</label> <div className="flex items-center gap-4"> <div className="flex-grow"> <input id="logoImageUrlLight" type="text" value={content.header.logoImageUrlLight} onChange={(e) => handleInputChange('header', 'logoImageUrlLight', e.target.value)} className={`${inputStyle} ${headerErrors.logoImageUrlLight ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} /> </div> <ImagePreview src={content.header.logoImageUrlLight} /> <input type="file" id="logo-image-upload-input-light" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('header', 'logoImageUrlLight', url), 'logo-image-light')} /> <button type="button" onClick={() => triggerFileUpload('logo-image-upload-input-light')} disabled={uploading === 'logo-image-light'} className={uploadButtonStyle} aria-label="Fazer upload de nova imagem para o logo (modo claro)"> {uploading === 'logo-image-light' ? 'Enviando...' : 'Upload'} </button> </div> {headerErrors.logoImageUrlLight && <p className={errorTextStyle}>{headerErrors.logoImageUrlLight}</p>} </div> <div> <label htmlFor="logoImageUrlDark" className={labelStyle}>URL da Imagem do Logo (Modo Escuro)</label> <div className="flex items-center gap-4"> <div className="flex-grow"> <input id="logoImageUrlDark" type="text" value={content.header.logoImageUrlDark} onChange={(e) => handleInputChange('header', 'logoImageUrlDark', e.target.value)} className={inputStyle} /> </div> <ImagePreview src={content.header.logoImageUrlDark} /> <input type="file" id="logo-image-upload-input-dark" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('header', 'logoImageUrlDark', url), 'logo-image-dark')} /> <button type="button" onClick={() => triggerFileUpload('logo-image-upload-input-dark')} disabled={uploading === 'logo-image-dark'} className={uploadButtonStyle} aria-label="Fazer upload de nova imagem para o logo (modo escuro)"> {uploading === 'logo-image-dark' ? 'Enviando...' : 'Upload'} </button> </div> </div> </div> )}
                <div> <label htmlFor="contactButton" className={labelStyle}>Texto Botão de Contato</label> <input id="contactButton" type="text" value={content.header.contactButton} onChange={(e) => handleInputChange('header', 'contactButton', e.target.value)} onBlur={() => handleBlur('header', 'contactButton')} className={`${inputStyle} ${headerErrors.contactButton ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} /> {headerErrors.contactButton && <p className={errorTextStyle}>{headerErrors.contactButton}</p>} </div>
              </div>
          </div>
          {/* About */}
          <div id="tabpanel-about" role="tabpanel" tabIndex={0} aria-labelledby="tab-about" hidden={activeTab !== 'about'} className={sectionStyle}>
              <h2 className="text-2xl font-bold mb-4">Seção "Sobre"</h2>
              <div className="space-y-4">
                <div> <label htmlFor="aboutHeadline" className={labelStyle}>Título (pode usar HTML)</label> <textarea id="aboutHeadline" rows={2} value={content.about.headline} onChange={(e) => handleInputChange('about', 'headline', e.target.value)} onBlur={() => handleBlur('about', 'headline')} className={`${inputStyle} ${aboutErrors.headline ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`}></textarea> {aboutErrors.headline && <p className={errorTextStyle}>{aboutErrors.headline}</p>} </div>
                <div> <label htmlFor="aboutP1" className={labelStyle}>Parágrafo 1</label> <textarea id="aboutP1" rows={4} value={content.about.paragraph1} onChange={(e) => handleInputChange('about', 'paragraph1', e.target.value)} className={inputStyle}></textarea> </div>
                <div> <label htmlFor="aboutP2" className={labelStyle}>Parágrafo 2</label> <textarea id="aboutP2" rows={4} value={content.about.paragraph2} onChange={(e) => handleInputChange('about', 'paragraph2', e.target.value)} className={inputStyle}></textarea> </div>
                <div> <label htmlFor="aboutButton" className={labelStyle}>Texto do Botão</label> <input id="aboutButton" type="text" value={content.about.buttonText} onChange={(e) => handleInputChange('about', 'buttonText', e.target.value)} className={inputStyle} /> </div>
                <div> <label htmlFor="aboutImage" className={labelStyle}>URL da Imagem</label> <div className="flex items-center gap-4"> <div className="flex-grow"> <input id="aboutImage" type="text" value={content.about.imageUrl} onChange={(e) => handleInputChange('about', 'imageUrl', e.target.value)} onBlur={() => handleBlur('about', 'imageUrl')} className={`${inputStyle} ${aboutErrors.imageUrl ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} /> </div> <ImagePreview src={content.about.imageUrl} /> <input type="file" id="about-image-upload-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('about', 'imageUrl', url), 'about-image')} /> <button type="button" onClick={() => triggerFileUpload('about-image-upload-input')} disabled={uploading === 'about-image'} className={uploadButtonStyle} aria-label="Fazer upload de nova imagem para a seção Sobre"> {uploading === 'about-image' ? 'Enviando...' : 'Upload'} </button> </div> {aboutErrors.imageUrl && <p className={errorTextStyle}>{aboutErrors.imageUrl}</p>} </div>
              </div>
          </div>
          {/* Portfolio */}
          <div id="tabpanel-portfolio" role="tabpanel" tabIndex={0} aria-labelledby="tab-portfolio" hidden={activeTab !== 'portfolio'} className={sectionStyle}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Portfólio</h2>
                <button onClick={addPortfolioItem} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg> Adicionar Item </button>
              </div>
              <div className="space-y-6">
                {content.portfolio.map((item, index) => (
                  <div key={String(item.id ?? `new-${index}`)} className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg space-y-3 relative bg-slate-50 dark:bg-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Item {index + 1}</h3>
                        <div className="flex items-center">
                          <button onClick={() => handleMoveItemUp(index)} disabled={index === 0} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label={`Mover item ${index + 1} para cima`}> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg> </button>
                          <button onClick={() => handleMoveItemDown(index)} disabled={index === content.portfolio.length - 1} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label={`Mover item ${index + 1} para baixo`}> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg> </button>
                        </div>
                      </div>
                      <button onClick={() => handleDeletePortfolioItem(index)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label={`Excluir item ${index + 1}`}> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg> </button>
                    </div>
                    <div> <label htmlFor={`portfolio-imageurl-${index}`} className={labelStyle}>URL da Imagem</label> <div className="flex items-center gap-4"> <div className="flex-grow"> <input id={`portfolio-imageurl-${index}`} type="text" value={item.imageurl} onChange={(e) => handlePortfolioChange(index, 'imageurl', e.target.value)} onBlur={() => handleBlur('portfolio', 'imageurl', index)} className={`${inputStyle} ${portfolioErrors[index]?.imageurl ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} placeholder="https://images.unsplash.com/..." aria-invalid={!!portfolioErrors[index]?.imageurl} aria-describedby={`portfolio-imageurl-error-${index}`} /> </div> <ImagePreview src={item.imageurl} /> <input type="file" id={`portfolio-image-upload-input-${index}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handlePortfolioChange(index, 'imageurl', url), `portfolio-image-${index}`)} /> <button type="button" onClick={() => triggerFileUpload(`portfolio-image-upload-input-${index}`)} disabled={uploading === `portfolio-image-${index}`} className={uploadButtonStyle} aria-label={`Fazer upload de imagem para o item ${index + 1}`}> {uploading === `portfolio-image-${index}` ? 'Enviando...' : 'Upload'} </button> </div> {portfolioErrors[index]?.imageurl && ( <p id={`portfolio-imageurl-error-${index}`} className={errorTextStyle} role="alert"> {portfolioErrors[index].imageurl} </p> )} </div>
                    <div> <label htmlFor={`portfolio-title-${index}`} className={labelStyle}>Título</label> <input id={`portfolio-title-${index}`} type="text" value={item.title} onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)} onBlur={() => handleBlur('portfolio', 'title', index)} className={`${inputStyle} ${portfolioErrors[index]?.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} placeholder="Ex: Análise de Dados Corp" /> {portfolioErrors[index]?.title && <p className={errorTextStyle}>{portfolioErrors[index].title}</p>} </div>
                    <div> <label htmlFor={`portfolio-category-${index}`} className={labelStyle}>Categoria</label> <input id={`portfolio-category-${index}`} type="text" value={item.category} onChange={(e) => handlePortfolioChange(index, 'category', e.target.value)} onBlur={() => handleBlur('portfolio', 'category', index)} className={`${inputStyle} ${portfolioErrors[index]?.category ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} placeholder="Ex: Web Design" /> {portfolioErrors[index]?.category && <p className={errorTextStyle}>{portfolioErrors[index].category}</p>} </div>
                    <div className="pt-3 space-y-3">
                      <div> <label htmlFor={`portfolio-desafio-${index}`} className={labelStyle}>O Desafio</label> <textarea id={`portfolio-desafio-${index}`} value={item.desafio || ''} onChange={(e) => handlePortfolioChange(index, 'desafio', e.target.value)} className={inputStyle} rows={3} placeholder="Descreva o desafio que o cliente enfrentava..."></textarea> </div>
                      <div> <label htmlFor={`portfolio-solucao-${index}`} className={labelStyle}>A Solução</label> <textarea id={`portfolio-solucao-${index}`} value={item.solucao || ''} onChange={(e) => handlePortfolioChange(index, 'solucao', e.target.value)} className={inputStyle} rows={3} placeholder="Explique a solução que foi implementada..."></textarea> </div>
                      <div> <label htmlFor={`portfolio-resultados-${index}`} className={labelStyle}>Resultados</label> <textarea id={`portfolio-resultados-${index}`} value={item.resultados || ''} onChange={(e) => handlePortfolioChange(index, 'resultados', e.target.value)} className={inputStyle} rows={3} placeholder="Apresente os resultados e o impacto do projeto..."></textarea> </div>
                    </div>
                    <div className="pt-3 border-t border-slate-300 dark:border-slate-600">
                      <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Tecnologias</h4>
                      <div className="space-y-2"> {(item.technologies || []).map((tech, techIndex) => ( <div key={techIndex} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded"> <input type="text" value={tech.name} onChange={(e) => handlePortfolioTechChange(index, techIndex, 'name', e.target.value)} placeholder="Nome da Tecnologia" className="w-1/3 bg-transparent focus:outline-none text-sm" /> <div className="flex-grow flex items-center gap-2"> <textarea value={tech.icon} onChange={(e) => handlePortfolioTechChange(index, techIndex, 'icon', e.target.value)} placeholder="Cole o código SVG ou faça upload" rows={1} className="w-full bg-transparent focus:outline-none text-sm font-mono text-slate-500" /> <input type="file" id={`tech-icon-upload-${index}-${techIndex}`} className="hidden" accept="image/svg+xml" onChange={(e) => handleTechIconUpload(e, index, techIndex)} /> <button type="button" onClick={() => triggerFileUpload(`tech-icon-upload-${index}-${techIndex}`)} className="flex-shrink-0 text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label={`Fazer upload do ícone SVG para ${tech.name || 'nova tecnologia'}`}> Upload SVG </button> </div> <button onClick={() => removePortfolioTech(index, techIndex)} className="text-red-500 hover:text-red-700 p-1 rounded-full" aria-label={`Remover tecnologia ${tech.name || ''}`}> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> </button> </div> ))} </div>
                      <button onClick={() => addPortfolioTech(index)} className="mt-2 text-sm text-accent hover:text-accent-hover font-semibold"> + Adicionar Tecnologia </button>
                    </div>
                  </div>
                ))}
                {content.portfolio.length === 0 && ( <p className="text-center text-slate-500 dark:text-muted py-8">Nenhum item no portfólio. Clique em "Adicionar Item" para começar.</p> )}
              </div>
          </div>
          
           {/* Appearance */}
          <div id="tabpanel-appearance" role="tabpanel" tabIndex={0} aria-labelledby="tab-appearance" hidden={activeTab !== 'appearance'} className={sectionStyle}>
              <h2 className="text-2xl font-bold mb-4">Aparência do Site</h2>
              
              <div className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg space-y-3 bg-slate-50 dark:bg-primary mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Gerador de Paleta</h3>
                <p className="text-sm text-slate-500 dark:text-muted">Insira uma cor base para gerar uma paleta de cores harmoniosa para todo o site.</p>
                <div className="flex items-center gap-4">
                  <div className="flex-grow">
                    <label htmlFor="base-color-input" className={labelStyle}>Cor Base (Hex ou RGB)</label>
                    <input id="base-color-input" type="text" value={baseColor} onChange={e => setBaseColor(e.target.value)} className={inputStyle} placeholder="#3498db"/>
                  </div>
                  <button onClick={generatePalette} className="self-end bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors">Gerar Paleta</button>
                </div>
              </div>

              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Paleta de Cores Manual</h3>
                    <button onClick={handleResetColors} className="text-sm font-semibold text-slate-500 hover:text-accent dark:hover:text-accent-hover transition-colors px-3 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                      Resetar para Padrão
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(Object.keys(content.theme_settings) as Array<keyof ThemeSettings>).map((key) => (
                          <div key={key}>
                              <label htmlFor={`color-${key}`} className={`${labelStyle} capitalize`}>{key.replace(/([A-Z])/g, ' $1')}</label>
                              <div className="flex items-center gap-2">
                                  <input 
                                      id={`color-picker-${key}`}
                                      type="color" 
                                      value={content.theme_settings[key]} 
                                      onChange={(e) => handleThemeColorChange(key, e.target.value)}
                                      className="p-1 h-12 w-12 block bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 cursor-pointer rounded-lg"
                                      aria-label={`Selecionar cor para ${key}`}
                                  />
                                  <input 
                                      id={`color-${key}`} 
                                      type="text" 
                                      value={content.theme_settings[key]}
                                      onChange={(e) => handleThemeColorChange(key, e.target.value)}
                                      className={inputStyle}
                                  />
                              </div>
                          </div>
                      ))}
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
                                    <div className="flex-grow"> <input id="faviconIcoUrl" type="text" value={content.site_meta?.faviconIcoUrl || ''} onChange={(e) => handleInputChange('site_meta', 'faviconIcoUrl', e.target.value)} className={inputStyle} placeholder="URL para o arquivo .ico"/> </div>
                                    <ImagePreview src={content.site_meta?.faviconIcoUrl} /> <input type="file" id="favicon-ico-upload" className="hidden" accept=".ico,image/x-icon" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('site_meta', 'faviconIcoUrl', url), 'favicon-ico')} />
                                    <button type="button" onClick={() => triggerFileUpload('favicon-ico-upload')} disabled={uploading === 'favicon-ico'} className={uploadButtonStyle}> {uploading === 'favicon-ico' ? 'Enviando...' : 'Upload'} </button>
                                </div>
                            </div>
                           <div>
                                <label htmlFor="faviconSvgUrl" className={labelStyle}>Favicon SVG (.svg)</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow"> <input id="faviconSvgUrl" type="text" value={content.site_meta?.faviconSvgUrl || ''} onChange={(e) => handleInputChange('site_meta', 'faviconSvgUrl', e.target.value)} className={inputStyle} placeholder="URL para o arquivo .svg"/> </div>
                                    <ImagePreview src={content.site_meta?.faviconSvgUrl} /> <input type="file" id="favicon-svg-upload" className="hidden" accept=".svg,image/svg+xml" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('site_meta', 'faviconSvgUrl', url), 'favicon-svg')} />
                                    <button type="button" onClick={() => triggerFileUpload('favicon-svg-upload')} disabled={uploading === 'favicon-svg'} className={uploadButtonStyle}> {uploading === 'favicon-svg' ? 'Enviando...' : 'Upload'} </button>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="appleTouchIconUrl" className={labelStyle}>Apple Touch Icon (.png)</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow"> <input id="appleTouchIconUrl" type="text" value={content.site_meta?.appleTouchIconUrl || ''} onChange={(e) => handleInputChange('site_meta', 'appleTouchIconUrl', e.target.value)} className={inputStyle} placeholder="URL para o arquivo .png (180x180px)"/> </div>
                                    <ImagePreview src={content.site_meta?.appleTouchIconUrl} /> <input type="file" id="apple-touch-icon-upload" className="hidden" accept=".png,image/png" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('site_meta', 'appleTouchIconUrl', url), 'apple-touch-icon')} />
                                    <button type="button" onClick={() => triggerFileUpload('apple-touch-icon-upload')} disabled={uploading === 'apple-touch-icon'} className={uploadButtonStyle}> {uploading === 'apple-touch-icon' ? 'Enviando...' : 'Upload'} </button>
                                </div>
                            </div>
                      </div>
                  </div>
              </div>
          </div>
          
           {/* Profile */}
          <div id="tabpanel-profile" role="tabpanel" tabIndex={0} aria-labelledby="tab-profile" hidden={activeTab !== 'profile'} className="space-y-6">
            <div className={sectionStyle}>
              <h2 className="text-2xl font-bold mb-4">Meu Perfil</h2>
              {profile ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="profile-email" className={labelStyle}>E-mail</label>
                    <input id="profile-email" type="email" value={session?.user?.email || ''} readOnly disabled className={`${inputStyle} bg-slate-100 dark:bg-slate-800 cursor-not-allowed`} />
                  </div>
                  <div>
                    <label htmlFor="profile-fullname" className={labelStyle}>Nome Completo</label>
                    <input id="profile-fullname" type="text" value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className={`${inputStyle} ${profileErrors.full_name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
                  </div>
                  <div>
                    <label htmlFor="profile-phone" className={labelStyle}>Telefone</label>
                    <input id="profile-phone" type="tel" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={`${inputStyle} ${profileErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
                  </div>
                  <div>
                    <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50">
                      {saving ? 'Salvando...' : 'Salvar Perfil'}
                    </button>
                  </div>
                </form>
              ) : <p>Carregando perfil...</p>}
            </div>
             <div className={sectionStyle}>
                <h2 className="text-2xl font-bold mb-4">Alterar Senha</h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-sm">
                   <div>
                    <label htmlFor="new-password" className={labelStyle}>Nova Senha</label>
                    <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputStyle} border-slate-300 dark:border-slate-700 focus:ring-accent`} required />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className={labelStyle}>Confirmar Nova Senha</label>
                    <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputStyle} border-slate-300 dark:border-slate-700 focus:ring-accent`} required />
                  </div>
                  {passwordMessage && ( <p aria-live="polite" className={`text-sm font-medium ${passwordMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{passwordMessage.text}</p> )}
                  <div>
                     <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50">
                        {saving ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                  </div>
                </form>
             </div>
          </div>
          
           {/* History */}
          <div id="tabpanel-history" role="tabpanel" tabIndex={0} aria-labelledby="tab-history" hidden={activeTab !== 'history'} className={sectionStyle}>
             <h2 className="text-2xl font-bold mb-4">Histórico de Alterações</h2>
             <div className="mb-4">
                <label htmlFor="log-filter" className={labelStyle}>Filtrar por e-mail ou ação:</label>
                <input id="log-filter" type="text" value={logFilter} onChange={(e) => setLogFilter(e.target.value)} placeholder="Digite para filtrar..." className={`${inputStyle} border-slate-300 dark:border-slate-700 focus:ring-accent`}/>
             </div>
             <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 dark:text-muted uppercase bg-slate-100 dark:bg-slate-800 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Data</th>
                            <th scope="col" className="px-6 py-3">Usuário</th>
                            <th scope="col" className="px-6 py-3">Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                                <td className="px-6 py-4">{log.user_email}</td>
                                <td className="px-6 py-4">{log.description}</td>
                            </tr>
                        ))}
                         {filteredLogs.length === 0 && (
                            <tr><td colSpan={3} className="text-center py-8 text-slate-500 dark:text-muted">Nenhum registro encontrado.</td></tr>
                        )}
                    </tbody>
                </table>
             </div>
          </div>

        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-primary/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-20 space-x-4">
            {message && ( <p aria-live="polite" className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{message.text}</p> )}
            <button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent-hover text-white font-bold text-lg py-3 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px]">
              {saving ? ( <> <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Salvando... </> ) : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;