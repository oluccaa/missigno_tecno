import React from 'react';
import ImagePreview from './ImagePreview';
import AdminSaveBar from './AdminSaveBar';

// Tipos replicados para independência do componente
interface HeaderContent {
  logoType: 'text' | 'image';
  logoText: string;
  logoImageUrlLight: string;
  logoImageUrlDark: string;
  contactButton: string;
}

interface SaveBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
}

interface AdminHeaderProps {
  content: HeaderContent;
  handleInputChange: (section: 'header', field: string, value: string) => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>, updateFunction: (url: string) => void, uploadIdentifier: string) => void;
  triggerFileUpload: (inputId: string) => void;
  uploading: string | null;
  headerErrors: { [key: string]: string };
  handleBlur: (section: 'header', field: string) => void;
  saveBarProps: SaveBarProps;
}

// ==========================
// Componente
// ==========================
const AdminHeader: React.FC<AdminHeaderProps> = ({
  content,
  handleInputChange,
  handleImageUpload,
  triggerFileUpload,
  uploading,
  headerErrors,
  handleBlur,
  saveBarProps
}) => {

  const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors';
  const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-1';
  const cardStyle = 'bg-white dark:bg-secondary p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700';
  const uploadButtonStyle = 'flex-shrink-0 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait whitespace-nowrap flex items-center gap-2';
  const errorTextStyle = 'mt-2 text-sm text-red-600';

  return (
    <div>
      <AdminSaveBar {...saveBarProps} />
      <div className="space-y-8">
        {/* Card: Tipo de Logo */}
        <div className={cardStyle}>
          <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Tipo de Logo</h3>
          <div className="flex w-full max-w-xs bg-slate-100 dark:bg-primary p-1 rounded-xl">
              <label className="relative w-1/2 flex justify-center items-center cursor-pointer">
                  <input type="radio" name="logoType" value="text" checked={content.logoType === 'text'} onChange={(e) => handleInputChange('header', 'logoType', e.target.value)} className="peer sr-only" />
                  <span className="w-full text-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors text-slate-600 dark:text-muted peer-checked:bg-white dark:peer-checked:bg-accent peer-checked:text-accent dark:peer-checked:text-white peer-checked:shadow-md">Texto</span>
              </label>
              <label className="relative w-1/2 flex justify-center items-center cursor-pointer">
                  <input type="radio" name="logoType" value="image" checked={content.logoType === 'image'} onChange={(e) => handleInputChange('header', 'logoType', e.target.value)} className="peer sr-only" />
                  <span className="w-full text-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors text-slate-600 dark:text-muted peer-checked:bg-white dark:peer-checked:bg-accent peer-checked:text-accent dark:peer-checked:text-white peer-checked:shadow-md">Imagem</span>
              </label>
          </div>
        </div>

        {/* Card: Configuração do Logo (Dinâmico) */}
        <div className={cardStyle}>
          <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Configuração do Logo</h3>
          {content.logoType === 'text' ? (
            <div>
              <label htmlFor="logoText" className={labelStyle}>Texto do Logo</label>
              <input id="logoText" type="text" value={content.logoText} onChange={(e) => handleInputChange('header', 'logoText', e.target.value)} onBlur={() => handleBlur('header', 'logoText')} className={`${inputStyle} ${headerErrors.logoText ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
              {headerErrors.logoText && <p className={errorTextStyle}>{headerErrors.logoText}</p>}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="logoImageUrlLight" className={labelStyle}>Logo para Modo Claro</label>
                <p className="text-xs text-slate-500 dark:text-muted mb-2">Idealmente um logo escuro sobre fundo transparente.</p>
                <div className="flex items-center gap-4">
                  <div className="flex-grow">
                    <input id="logoImageUrlLight" type="text" value={content.logoImageUrlLight} onChange={(e) => handleInputChange('header', 'logoImageUrlLight', e.target.value)} onBlur={() => handleBlur('header', 'logoImageUrlLight')} className={`${inputStyle} ${headerErrors.logoImageUrlLight ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
                  </div>
                  <ImagePreview src={content.logoImageUrlLight} />
                  <input type="file" id="logo-image-upload-input-light" className="hidden" accept="image/*,.svg" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('header', 'logoImageUrlLight', url), 'logo-image-light')} />
                  <button type="button" onClick={() => triggerFileUpload('logo-image-upload-input-light')} disabled={uploading === 'logo-image-light'} className={uploadButtonStyle} aria-label="Fazer upload do logo (modo claro)">
                    {uploading === 'logo-image-light' ? 'Enviando...' : 'Upload'}
                  </button>
                </div>
                {headerErrors.logoImageUrlLight && <p className={errorTextStyle}>{headerErrors.logoImageUrlLight}</p>}
              </div>
              <div>
                <label htmlFor="logoImageUrlDark" className={labelStyle}>Logo para Modo Escuro</label>
                <p className="text-xs text-slate-500 dark:text-muted mb-2">Idealmente um logo claro sobre fundo transparente.</p>
                <div className="flex items-center gap-4">
                  <div className="flex-grow">
                    <input id="logoImageUrlDark" type="text" value={content.logoImageUrlDark} onChange={(e) => handleInputChange('header', 'logoImageUrlDark', e.target.value)} className={inputStyle} />
                  </div>
                  <ImagePreview src={content.logoImageUrlDark} />
                  <input type="file" id="logo-image-upload-input-dark" className="hidden" accept="image/*,.svg" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('header', 'logoImageUrlDark', url), 'logo-image-dark')} />
                  <button type="button" onClick={() => triggerFileUpload('logo-image-upload-input-dark')} disabled={uploading === 'logo-image-dark'} className={uploadButtonStyle} aria-label="Fazer upload do logo (modo escuro)">
                    {uploading === 'logo-image-dark' ? 'Enviando...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card: Botão de Ação */}
        <div className={cardStyle}>
          <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Botão de Ação (CTA)</h3>
           <div>
              <label htmlFor="contactButton" className={labelStyle}>Texto do Botão de Contato</label>
              <input id="contactButton" type="text" value={content.contactButton} onChange={(e) => handleInputChange('header', 'contactButton', e.target.value)} onBlur={() => handleBlur('header', 'contactButton')} className={`${inputStyle} max-w-xs ${headerErrors.contactButton ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`} />
              {headerErrors.contactButton && <p className={errorTextStyle}>{headerErrors.contactButton}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;