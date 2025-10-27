import React from 'react';
import AdminSaveBar from './AdminSaveBar';

interface HeroContent {
    headline: string;
    paragraph: string;
    ctaPrimary: string;
    ctaSecondary: string;
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
}

const AdminHero: React.FC<AdminHeroProps> = ({
  content,
  handleInputChange,
  saveBarProps
}) => {
  const cardStyle = 'bg-white dark:bg-secondary p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700';
  const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-1';
  const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors border-slate-300 dark:border-slate-700 focus:ring-accent';
  
  return (
    <div>
      <AdminSaveBar {...saveBarProps} />
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
    </div>
  );
};

export default AdminHero;