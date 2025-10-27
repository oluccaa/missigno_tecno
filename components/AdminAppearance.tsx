import React, { useState } from 'react';
import AdminSaveBar from './AdminSaveBar'; // Importando a barra de ações
import ImagePreview from './ImagePreview';

// ==========================
// Tipos (replicados para independência do componente)
// ==========================
interface ThemeSettings {
    primary: string;
    secondary: string;
    accent: string;
    accentHover: string;
    light: string;
    muted: string;
}

interface SiteMeta {
    faviconIcoUrl: string;
    faviconSvgUrl: string;
    appleTouchIconUrl: string;
}

interface WebsiteContent {
  header: any;
  about: any;
  portfolio: any[];
  site_meta: SiteMeta;
  theme_settings: ThemeSettings;
}

// Props para a barra de ações
interface SaveBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
}

interface AdminAppearanceProps {
  themeSettings: ThemeSettings;
  siteMeta: SiteMeta;
  setContent: React.Dispatch<React.SetStateAction<WebsiteContent>>;
  setMessage: (message: { type: 'success' | 'error'; text: string } | null) => void;
  saveBarProps: SaveBarProps;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>, updateFunction: (url: string) => void, uploadIdentifier: string) => void;
  triggerFileUpload: (inputId: string) => void;
  uploading: string | null;
}

// ==========================
// Utilitários de Cor
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
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
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

const defaultThemeSettings: ThemeSettings = {
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#0891b2',
    accentHover: '#06b6d4',
    light: '#f8fafc',
    muted: '#94a3b8',
};

const colorOrder: Array<keyof ThemeSettings> = ['accent', 'accentHover', 'primary', 'secondary', 'light', 'muted'];
const colorRoles: Record<keyof ThemeSettings, string> = {
    accent: 'Destaque (Principal)',
    accentHover: 'Destaque (Hover)',
    primary: 'Fundo Escuro (Principal)',
    secondary: 'Fundo Escuro (Secundário)',
    light: 'Fundo Claro / Texto no Escuro',
    muted: 'Texto Secundário / Bordas'
};


// ==========================
// Componente
// ==========================
const AdminAppearance: React.FC<AdminAppearanceProps> = ({ 
    themeSettings,
    siteMeta,
    setContent,
    setMessage,
    saveBarProps,
    handleImageUpload,
    triggerFileUpload,
    uploading 
}) => {
    const [baseColor, setBaseColor] = useState('#0891b2');

    const handleThemeColorChange = (field: keyof ThemeSettings, value: string) => {
        setContent(prev => ({ ...prev, theme_settings: { ...prev.theme_settings, [field]: value } }));
    };
    
    const handleFaviconChange = (field: keyof SiteMeta, value: string) => {
        setContent(prev => ({ ...prev, site_meta: { ...prev.site_meta, [field]: value } }));
    };

    const generatePalette = () => {
        const rgb = parseColor(baseColor);
        if (!rgb) {
            setMessage({ type: 'error', text: 'Formato de cor inválido. Use #RRGGBB ou rgb(r, g, b).' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);

        const safeSaturation = s < 30 ? 30 : s;
        let safeLightness = l;
        if (l > 85) safeLightness = 85;
        if (l < 25) safeLightness = 25;

        const newPalette: ThemeSettings = {
            accent: rgbToHex(...hslToRgb(h, safeSaturation, safeLightness)),
            accentHover: rgbToHex(...hslToRgb(h, safeSaturation, safeLightness + 5)),
            primary: rgbToHex(...hslToRgb(h, 15, 10)),
            secondary: rgbToHex(...hslToRgb(h, 20, 17)),
            light: rgbToHex(...hslToRgb(h, 10, 98)),
            muted: rgbToHex(...hslToRgb(h, 10, 65)),
        };
      
        setContent(prev => ({...prev, theme_settings: newPalette }));
        setMessage({ type: 'success', text: 'Paleta de alto contraste gerada! Ajuste e salve.' });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleResetColors = () => {
        if (window.confirm('Você tem certeza que deseja redefinir todas as cores para o padrão original? As alterações atuais no formulário serão perdidas.')) {
            setContent(prev => ({
                ...prev,
                theme_settings: { ...defaultThemeSettings } 
            }));
            setMessage({ type: 'success', text: 'Cores redefinidas. Clique em "Salvar Alterações" para aplicar no site.' });
            setTimeout(() => setMessage(null), 4000);
        }
    };

    // Estilos para reutilização
    const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors border-slate-300 dark:border-slate-700 focus:ring-accent';
    const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-1 capitalize';
    const cardStyle = 'bg-white dark:bg-secondary p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700';
    const uploadButtonStyle = 'flex-shrink-0 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait whitespace-nowrap flex items-center gap-2';

    return (
        <div className="space-y-8">
            <AdminSaveBar {...saveBarProps} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`${cardStyle} self-start`}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-2">Gerador de Paleta</h3>
                    <p className="text-sm text-slate-500 dark:text-muted mb-4">
                        Insira uma cor base para gerar uma paleta de cores harmoniosa e de alto contraste.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="base-color-input" className={labelStyle}>Cor Base</label>
                            <div className="flex items-center gap-2">
                                <input id="base-color-picker" type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)} className="p-1 h-12 w-12 block bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 cursor-pointer rounded-lg" aria-label="Selecionar cor base" />
                                <input id="base-color-input" type="text" value={baseColor} onChange={e => setBaseColor(e.target.value)} className={inputStyle} placeholder="#0891b2" />
                            </div>
                        </div>
                        <button onClick={generatePalette} className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                            Gerar Paleta
                        </button>
                    </div>
                </div>

                <div className={`${cardStyle} self-start`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-light">Paleta de Cores Manual</h3>
                        <button onClick={handleResetColors} className="text-sm font-semibold text-slate-500 hover:text-accent dark:hover:text-accent-hover transition-colors px-3 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0">
                            Resetar para Padrão
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {colorOrder.map((key) => (
                            <div key={key}>
                                <label htmlFor={`color-${key}`} className={labelStyle}>{colorRoles[key]}</label>
                                <div className="flex items-center gap-2">
                                    <input id={`color-picker-${key}`} type="color" value={themeSettings[key]} onChange={(e) => handleThemeColorChange(key, e.target.value)} className="p-1 h-12 w-12 block bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 cursor-pointer rounded-lg" aria-label={`Selecionar cor para ${colorRoles[key]}`} />
                                    <input id={`color-${key}`} type="text" value={themeSettings[key]} onChange={(e) => handleThemeColorChange(key, e.target.value)} className={inputStyle} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={cardStyle}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Favicons do Site</h3>
                <div className="space-y-6">
                    {/* Favicon.ico */}
                    <div>
                        <label htmlFor="faviconIcoUrl" className={labelStyle}>Favicon Padrão (.ico)</label>
                        <p className="text-xs text-slate-500 dark:text-muted mb-2">Ícone principal para navegadores. Formato .ico</p>
                        <div className="flex items-center gap-4">
                            <div className="flex-grow">
                                <input id="faviconIcoUrl" type="text" value={siteMeta.faviconIcoUrl} onChange={(e) => handleFaviconChange('faviconIcoUrl', e.target.value)} className={inputStyle} />
                            </div>
                            <ImagePreview src={siteMeta.faviconIcoUrl} />
                            <input type="file" id="favicon-ico-upload" className="hidden" accept=".ico,image/x-icon" onChange={(e) => handleImageUpload(e, (url) => handleFaviconChange('faviconIcoUrl', url), 'favicon-ico')} />
                            <button type="button" onClick={() => triggerFileUpload('favicon-ico-upload')} disabled={uploading === 'favicon-ico'} className={uploadButtonStyle}>
                                {uploading === 'favicon-ico' ? 'Enviando...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                    {/* Favicon.svg */}
                    <div>
                        <label htmlFor="faviconSvgUrl" className={labelStyle}>Favicon Moderno (.svg)</label>
                        <p className="text-xs text-slate-500 dark:text-muted mb-2">Ícone vetorial para navegadores modernos. Formato .svg</p>
                        <div className="flex items-center gap-4">
                            <div className="flex-grow">
                                <input id="faviconSvgUrl" type="text" value={siteMeta.faviconSvgUrl} onChange={(e) => handleFaviconChange('faviconSvgUrl', e.target.value)} className={inputStyle} />
                            </div>
                            <ImagePreview src={siteMeta.faviconSvgUrl} />
                            <input type="file" id="favicon-svg-upload" className="hidden" accept=".svg,image/svg+xml" onChange={(e) => handleImageUpload(e, (url) => handleFaviconChange('faviconSvgUrl', url), 'favicon-svg')} />
                            <button type="button" onClick={() => triggerFileUpload('favicon-svg-upload')} disabled={uploading === 'favicon-svg'} className={uploadButtonStyle}>
                                {uploading === 'favicon-svg' ? 'Enviando...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                    {/* Apple Touch Icon */}
                    <div>
                        <label htmlFor="appleTouchIconUrl" className={labelStyle}>Apple Touch Icon (.png)</label>
                        <p className="text-xs text-slate-500 dark:text-muted mb-2">Ícone para iOS (180x180px). Formato .png</p>
                        <div className="flex items-center gap-4">
                            <div className="flex-grow">
                                <input id="appleTouchIconUrl" type="text" value={siteMeta.appleTouchIconUrl} onChange={(e) => handleFaviconChange('appleTouchIconUrl', e.target.value)} className={inputStyle} />
                            </div>
                            <ImagePreview src={siteMeta.appleTouchIconUrl} />
                            <input type="file" id="apple-touch-icon-upload" className="hidden" accept=".png,image/png" onChange={(e) => handleImageUpload(e, (url) => handleFaviconChange('appleTouchIconUrl', url), 'apple-touch-icon')} />
                            <button type="button" onClick={() => triggerFileUpload('apple-touch-icon-upload')} disabled={uploading === 'apple-touch-icon'} className={uploadButtonStyle}>
                                {uploading === 'apple-touch-icon' ? 'Enviando...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAppearance;