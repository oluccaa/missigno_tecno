import React from 'react';
import AdminSaveBar from './AdminSaveBar';
import ImagePreview from './ImagePreview';

interface HeroContent {
    headline: string;
    paragraph: string;
    ctaPrimary: string;
    ctaSecondary: string;
    backgroundImageUrl: string;
}

interface SaveBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
}

interface AdminHeroProps {
  content: HeroContent;
  handleInputChange: (section: 'hero', field: keyof HeroContent, value: string) => void;
  saveBarProps: SaveBarProps;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>, updateFunction: (url: string) => void, uploadIdentifier: string) => void;
  triggerFileUpload: (inputId: string) => void;
  uploading: string | null;
}

const AdminHero: React.FC<AdminHeroProps> = ({
  content,
  handleInputChange,
  saveBarProps,
  handleImageUpload,
  triggerFileUpload,
  uploading
}) => {
  const cardStyle = 'bg-white dark:bg-secondary p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700';
  const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-1';
  const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors border-slate-300 dark:border-slate-700 focus:ring-accent';
  const uploadButtonStyle = 'flex-shrink-0 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait whitespace-nowrap flex items-center gap-2';
  
  return (
    <div>
      <AdminSaveBar {...saveBarProps} />
      <div className="space-y-8">
        <div className={cardStyle}>
          <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Conteúdo da Seção Hero</h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="hero-headline" className={labelStyle}>Título (aceita HTML)</label>
              <textarea
                id="hero-headline"
                rows={3}
                value={content.headline}
                onChange={(e) => handleInputChange('hero', 'headline', e.target.value)}
                className={inputStyle}
                placeholder="Desbloqueie o Potencial..."
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-muted">Use <code>&lt;span class="text-accent"&gt;texto&lt;/span&gt;</code> para destacar palavras.</p>
            </div>
            <div>
              <label htmlFor="hero-paragraph" className={labelStyle}>Parágrafo de Apoio</label>
              <textarea
                id="hero-paragraph"
                rows={4}
                value={content.paragraph}
                onChange={(e) => handleInputChange('hero', 'paragraph', e.target.value)}
                className={inputStyle}
                placeholder="Criamos experiências digitais..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="hero-ctaPrimary" className={labelStyle}>Botão de Ação Principal (CTA)</label>
                <input
                  id="hero-ctaPrimary"
                  type="text"
                  value={content.ctaPrimary}
                  onChange={(e) => handleInputChange('hero', 'ctaPrimary', e.target.value)}
                  className={inputStyle}
                  placeholder="Inicie seu Projeto Agora"
                />
              </div>
              <div>
                <label htmlFor="hero-ctaSecondary" className={labelStyle}>Botão de Ação Secundário</label>
                <input
                  id="hero-ctaSecondary"
                  type="text"
                  value={content.ctaSecondary}
                  onChange={(e) => handleInputChange('hero', 'ctaSecondary', e.target.value)}
                  className={inputStyle}
                  placeholder="Veja nossos projetos →"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={cardStyle}>
            <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Imagem de Fundo</h3>
            <div className="p-4 bg-slate-50 dark:bg-primary/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Instruções:</p>
                <ul className="list-disc list-inside text-xs text-slate-500 dark:text-muted mt-2 space-y-1">
                    <li><strong>Resolução Ideal:</strong> 1920x1080 pixels (Full HD) para melhor qualidade.</li>
                    <li><strong>Formato:</strong> Use <code>.jpg</code> ou <code>.webp</code> para um bom balanço entre qualidade e tamanho.</li>
                    <li><strong>Otimização:</strong> Comprima a imagem antes do upload (ex: TinyPNG) para manter o site rápido.</li>
                </ul>
            </div>
            <div className="mt-4">
                <label htmlFor="hero-backgroundImageUrl" className={labelStyle}>URL da Imagem ou Upload</label>
                <div className="flex items-center gap-4">
                    <div className="flex-grow">
                        <input
                            id="hero-backgroundImageUrl"
                            type="text"
                            value={content.backgroundImageUrl}
                            onChange={(e) => handleInputChange('hero', 'backgroundImageUrl', e.target.value)}
                            className={inputStyle}
                            placeholder="https://exemplo.com/imagem.jpg"
                        />
                    </div>
                    <ImagePreview src={content.backgroundImageUrl} />
                    <input
                        type="file"
                        id="hero-bg-upload-input"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleImageUpload(e, (url) => handleInputChange('hero', 'backgroundImageUrl', url), 'hero-bg')}
                    />
                    <button
                        type="button"
                        onClick={() => triggerFileUpload('hero-bg-upload-input')}
                        disabled={uploading === 'hero-bg'}
                        className={uploadButtonStyle}
                    >
                        {uploading === 'hero-bg' ? 'Enviando...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminHero;