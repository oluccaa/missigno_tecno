import React, { useState } from 'react';
import AdminSaveBar from './AdminSaveBar';
import ImagePreview from './ImagePreview';

// Tipos
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
  hero: any;
  about: any;
  portfolio: any[];
  tech_carousel: any;
  theme_settings: ThemeSettings;
  site_meta: SiteMeta;
}

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
  setMessage: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; text: string } | null>>;
  saveBarProps: SaveBarProps;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>, updateFunction: (url: string) => void, uploadIdentifier: string) => void;
  triggerFileUpload: (inputId: string) => void;
  uploading: string | null;
}

// ==========================
// Color Conversion Utilities
// ==========================
const hexToHsl = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);
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
        s = 0;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s,
          x = c * (1 - Math.abs((h / 60) % 2 - 1)),
          m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { [r, g, b] = [c, x, 0]; }
    else if (60 <= h && h < 120) { [r, g, b] = [x, c, 0]; }
    else if (120 <= h && h < 180) { [r, g, b] = [0, c, x]; }
    else if (180 <= h && h < 240) { [r, g, b] = [0, x, c]; }
    else if (240 <= h && h < 300) { [r, g, b] = [x, 0, c]; }
    else if (300 <= h && h < 360) { [r, g, b] = [c, 0, x]; }
    const toHex = (c: number) => ('0' + Math.round((c + m) * 255).toString(16)).slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};


const ColorInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-muted mb-1">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="p-1 h-10 w-10 block bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-slate-900 dark:text-light focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>
        </div>
    );
};

const AdminAppearance: React.FC<AdminAppearanceProps> = ({
  themeSettings,
  siteMeta,
  setContent,
  setMessage,
  saveBarProps,
  handleImageUpload,
  triggerFileUpload,
  uploading,
}) => {
    const [baseColor, setBaseColor] = useState(themeSettings.accent);

    const handleThemeChange = (field: keyof ThemeSettings, value: string) => {
        setContent(prev => ({
            ...prev,
            theme_settings: { ...prev.theme_settings, [field]: value }
        }));
    };

    const handleMetaChange = (field: keyof SiteMeta, value: string) => {
        setContent(prev => ({
            ...prev,
            site_meta: { ...prev.site_meta, [field]: value }
        }));
    };
    
    const generatePalette = () => {
        const hsl = hexToHsl(baseColor);
        if (!hsl) {
            setMessage({ type: 'error', text: 'Formato de cor base inválido. Use o formato #RRGGBB.' });
            return;
        }
        const [h, s, l] = hsl;

        const newPalette: ThemeSettings = {
            accent: hslToHex(h, Math.max(s, 60), Math.max(45, Math.min(l, 55))),
            accentHover: hslToHex(h, Math.max(s, 65), Math.max(50, Math.min(l + 5, 60))),
            primary: hslToHex(h, Math.max(15, Math.min(s, 25)), 11),
            secondary: hslToHex(h, Math.max(15, Math.min(s, 30)), 17),
            light: hslToHex(h, Math.max(10, Math.min(s, 20)), 98),
            muted: hslToHex(h, Math.max(8, Math.min(s, 15)), 65),
        };
        
        setContent(prev => ({ ...prev, theme_settings: newPalette }));
        setMessage({ type: 'success', text: 'Nova paleta de cores gerada!' });
        setTimeout(() => setMessage(null), 3000);
    };
    
    // Estilos
    const cardStyle = 'bg-white dark:bg-secondary p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700';
    const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-1';
    const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors border-slate-300 dark:border-slate-700 focus:ring-accent';
    const uploadButtonStyle = 'flex-shrink-0 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait whitespace-nowrap flex items-center gap-2';


    const themeFields: { key: keyof ThemeSettings; label: string }[] = [
        { key: 'primary', label: 'Cor Primária (Fundo Escuro)' },
        { key: 'secondary', label: 'Cor Secundária (Cards Escuros)' },
        { key: 'accent', label: 'Cor de Destaque' },
        { key: 'accentHover', label: 'Destaque (Hover)' },
        { key: 'light', label: 'Cor Clara (Texto Escuro)' },
        { key: 'muted', label: 'Cor Suave (Texto Secundário)' },
    ];
    
    return (
        <div>
            <AdminSaveBar {...saveBarProps} />
            <div className="space-y-8">
                <div className={cardStyle}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Gerador de Paleta</h3>
                    <div className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-slate-50 dark:bg-primary/50 rounded-lg">
                        <div className="w-full sm:w-auto flex-grow">
                             <label htmlFor="baseColor" className={labelStyle}>Cor Base</label>
                             <ColorInput label="" value={baseColor} onChange={setBaseColor} />
                        </div>
                        <button onClick={generatePalette} className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1-1v-.5a1.5 1.5 0 01-3 0V16a1 1 0 00-1-1H4a1 1 0 01-1-1v-3a1 1 0 011-1h.5a1.5 1.5 0 000-3H4a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1v-.5z" /></svg>
                            Gerar Paleta
                        </button>
                    </div>
                     <hr className="my-6 border-slate-200 dark:border-slate-700" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Paleta de Cores do Site</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {themeFields.map(({ key, label }) => (
                            <ColorInput key={key} label={label} value={themeSettings[key]} onChange={(value) => handleThemeChange(key, value)} />
                        ))}
                    </div>
                </div>
                
                <div className={cardStyle}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Favicons e Ícones do Site</h3>
                    <div className="space-y-6">
                        {/* Favicon .ico */}
                        <div>
                            <label htmlFor="faviconIcoUrl" className={labelStyle}>Favicon (.ico)</label>
                             <p className="text-xs text-slate-500 dark:text-muted mb-2">Formato tradicional, para navegadores mais antigos.</p>
                            <div className="flex items-center gap-4">
                                <div className="flex-grow"><input id="faviconIcoUrl" type="text" value={siteMeta.faviconIcoUrl} onChange={(e) => handleMetaChange('faviconIcoUrl', e.target.value)} className={inputStyle} /></div>
                                <ImagePreview src={siteMeta.faviconIcoUrl} />
                                <input type="file" id="favicon-ico-upload" className="hidden" accept=".ico,image/x-icon" onChange={(e) => handleImageUpload(e, (url) => handleMetaChange('faviconIcoUrl', url), 'favicon-ico')} />
                                <button type="button" onClick={() => triggerFileUpload('favicon-ico-upload')} disabled={uploading === 'favicon-ico'} className={uploadButtonStyle}>{uploading === 'favicon-ico' ? 'Enviando...' : 'Upload'}</button>
                            </div>
                        </div>
                         {/* Favicon .svg */}
                        <div>
                            <label htmlFor="faviconSvgUrl" className={labelStyle}>Favicon Vetorial (.svg)</label>
                             <p className="text-xs text-slate-500 dark:text-muted mb-2">Formato moderno, preferido para temas claro/escuro.</p>
                            <div className="flex items-center gap-4">
                                <div className="flex-grow"><input id="faviconSvgUrl" type="text" value={siteMeta.faviconSvgUrl} onChange={(e) => handleMetaChange('faviconSvgUrl', e.target.value)} className={inputStyle} /></div>
                                <ImagePreview src={siteMeta.faviconSvgUrl} />
                                <input type="file" id="favicon-svg-upload" className="hidden" accept=".svg,image/svg+xml" onChange={(e) => handleImageUpload(e, (url) => handleMetaChange('faviconSvgUrl', url), 'favicon-svg')} />
                                <button type="button" onClick={() => triggerFileUpload('favicon-svg-upload')} disabled={uploading === 'favicon-svg'} className={uploadButtonStyle}>{uploading === 'favicon-svg' ? 'Enviando...' : 'Upload'}</button>
                            </div>
                        </div>
                         {/* Apple Touch Icon */}
                        <div>
                            <label htmlFor="appleTouchIconUrl" className={labelStyle}>Apple Touch Icon (.png)</label>
                             <p className="text-xs text-slate-500 dark:text-muted mb-2">Ícone para iOS (180x180px recomendado).</p>
                            <div className="flex items-center gap-4">
                                <div className="flex-grow"><input id="appleTouchIconUrl" type="text" value={siteMeta.appleTouchIconUrl} onChange={(e) => handleMetaChange('appleTouchIconUrl', e.target.value)} className={inputStyle} /></div>
                                <ImagePreview src={siteMeta.appleTouchIconUrl} />
                                <input type="file" id="apple-touch-icon-upload" className="hidden" accept=".png,image/png" onChange={(e) => handleImageUpload(e, (url) => handleMetaChange('appleTouchIconUrl', url), 'apple-touch-icon')} />
                                <button type="button" onClick={() => triggerFileUpload('apple-touch-icon-upload')} disabled={uploading === 'apple-touch-icon'} className={uploadButtonStyle}>{uploading === 'apple-touch-icon' ? 'Enviando...' : 'Upload'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAppearance;