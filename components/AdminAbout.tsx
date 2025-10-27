import React, { useState } from 'react';
import AdminSaveBar from './AdminSaveBar';
import ImagePreview from './ImagePreview';

// Tipos
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

interface WebsiteContent {
  header: any;
  about: AboutContent;
  portfolio: any[];
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

interface AdminAboutProps {
  content: AboutContent;
  setContent: React.Dispatch<React.SetStateAction<WebsiteContent>>;
  saveBarProps: SaveBarProps;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>, updateFunction: (url: string) => void, uploadIdentifier: string) => void;
  triggerFileUpload: (inputId: string) => void;
  uploading: string | null;
}

const AdminAbout: React.FC<AdminAboutProps> = ({
  content,
  setContent,
  saveBarProps,
  handleImageUpload,
  triggerFileUpload,
  uploading
}) => {
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
        intro: true,
        philosophy: false,
        values: false,
        team: false
    });
    
    // Handlers
    const handleInputChange = (field: keyof AboutContent, value: any) => {
        setContent(prev => ({ ...prev, about: { ...prev.about, [field]: value } }));
    };

    const handleValueChange = (index: number, field: keyof Value, value: string) => {
        const newValues = [...content.values];
        newValues[index] = { ...newValues[index], [field]: value };
        handleInputChange('values', newValues);
    };
    const addValue = () => handleInputChange('values', [...content.values, { icon: 'handshake', title: '', text: '' }]);
    const removeValue = (index: number) => handleInputChange('values', content.values.filter((_, i) => i !== index));

    const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
        const newTeamMembers = [...content.teamMembers];
        newTeamMembers[index] = { ...newTeamMembers[index], [field]: value };
        handleInputChange('teamMembers', newTeamMembers);
    };
    const addTeamMember = () => handleInputChange('teamMembers', [...content.teamMembers, { imageUrl: '', name: '', role: '' }]);
    const removeTeamMember = (index: number) => handleInputChange('teamMembers', content.teamMembers.filter((_, i) => i !== index));

    // Estilos
    const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors border-slate-300 dark:border-slate-700 focus:ring-accent';
    const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-1';
    const uploadButtonStyle = 'flex-shrink-0 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait whitespace-nowrap flex items-center gap-2';
    
    // Accordion Component
    const Accordion: React.FC<{ title: string; sectionKey: string; children: React.ReactNode; onAdd?: () => void; addLabel?: string }> = ({ title, sectionKey, children, onAdd, addLabel }) => (
        <div className="bg-white dark:bg-secondary rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
           <div className="flex items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))}>
               <h3 className="flex-grow font-bold text-lg text-slate-900 dark:text-light truncate">{title}</h3>
               <div className="flex items-center gap-2">
                   {onAdd && <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="text-sm font-semibold text-accent hover:underline pr-2">{addLabel}</button>}
                   <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${openSections[sectionKey] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </div>
           </div>
           {openSections[sectionKey] && <div className="p-6 border-t border-slate-200 dark:border-slate-700 space-y-6 bg-slate-50 dark:bg-primary/50">{children}</div>}
        </div>
    );
    
    return (
        <div>
            <AdminSaveBar {...saveBarProps} />
            <div className="space-y-4">
                <Accordion title="Seção de Introdução" sectionKey="intro">
                   <div><label htmlFor="about-headline" className={labelStyle}>Título (aceita HTML)</label><input id="about-headline" type="text" value={content.headline} onChange={(e) => handleInputChange('headline', e.target.value)} className={inputStyle} /></div>
                   <div><label htmlFor="about-p1" className={labelStyle}>Primeiro Parágrafo</label><textarea id="about-p1" rows={3} value={content.paragraph1} onChange={(e) => handleInputChange('paragraph1', e.target.value)} className={inputStyle}></textarea></div>
                   <div><label htmlFor="about-p2" className={labelStyle}>Segundo Parágrafo</label><textarea id="about-p2" rows={3} value={content.paragraph2} onChange={(e) => handleInputChange('paragraph2', e.target.value)} className={inputStyle}></textarea></div>
                   <div><label htmlFor="about-button" className={labelStyle}>Texto do Botão</label><input id="about-button" type="text" value={content.buttonText} onChange={(e) => handleInputChange('buttonText', e.target.value)} className={`${inputStyle} max-w-xs`} /></div>
                   <div><label className={labelStyle}>Imagem Principal</label><div className="flex items-center gap-4"><div className="flex-grow"><input type="text" value={content.imageUrl} onChange={(e) => handleInputChange('imageUrl', e.target.value)} className={inputStyle} /></div><ImagePreview src={content.imageUrl} /><input type="file" id="about-image-upload" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handleInputChange('imageUrl', url), 'about-image')} /><button type="button" onClick={() => triggerFileUpload('about-image-upload')} disabled={uploading === 'about-image'} className={uploadButtonStyle}>{uploading === 'about-image' ? 'Enviando...' : 'Upload'}</button></div></div>
                </Accordion>

                <Accordion title="Seção de Filosofia" sectionKey="philosophy">
                   <div><label htmlFor="about-philosophy-headline" className={labelStyle}>Título da Filosofia</label><input id="about-philosophy-headline" type="text" value={content.philosophyHeadline} onChange={(e) => handleInputChange('philosophyHeadline', e.target.value)} className={inputStyle} /></div>
                   <div><label htmlFor="about-philosophy-text" className={labelStyle}>Texto da Filosofia</label><textarea id="about-philosophy-text" rows={3} value={content.philosophyText} onChange={(e) => handleInputChange('philosophyText', e.target.value)} className={inputStyle}></textarea></div>
                </Accordion>

                <Accordion title="Seção de Valores" sectionKey="values" onAdd={addValue} addLabel="Adicionar Valor">
                   <div><label htmlFor="about-values-headline" className={labelStyle}>Título dos Valores</label><input id="about-values-headline" type="text" value={content.valuesHeadline} onChange={(e) => handleInputChange('valuesHeadline', e.target.value)} className={inputStyle} /></div>
                   {content.values.map((val, index) => (
                    <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 bg-white dark:bg-secondary">
                        <div className="flex justify-between items-center"><h4 className="font-semibold text-slate-800 dark:text-slate-200">Valor #{index + 1}</h4><button onClick={() => removeValue(index)} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button></div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div><label className={labelStyle}>Título</label><input type="text" value={val.title} onChange={e => handleValueChange(index, 'title', e.target.value)} className={inputStyle} /></div>
                            <div><label className={labelStyle}>Ícone</label><select value={val.icon} onChange={e => handleValueChange(index, 'icon', e.target.value)} className={inputStyle}><option value="handshake">handshake</option><option value="lightbulb">lightbulb</option><option value="diamond">diamond</option><option value="chart">chart</option></select></div>
                        </div>
                        <div><label className={labelStyle}>Descrição</label><textarea rows={2} value={val.text} onChange={e => handleValueChange(index, 'text', e.target.value)} className={inputStyle}></textarea></div>
                    </div>
                   ))}
                </Accordion>

                <Accordion title="Seção da Equipe" sectionKey="team" onAdd={addTeamMember} addLabel="Adicionar Membro">
                    <div><label className={labelStyle}>Título da Equipe</label><input type="text" value={content.teamHeadline} onChange={(e) => handleInputChange('teamHeadline', e.target.value)} className={inputStyle} /></div>
                    {content.teamMembers.map((member, index) => (
                        <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 bg-white dark:bg-secondary">
                            <div className="flex justify-between items-center"><h4 className="font-semibold">Membro #{index + 1}</h4><button onClick={() => removeTeamMember(index)} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button></div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><label className={labelStyle}>Nome</label><input type="text" value={member.name} onChange={e => handleTeamMemberChange(index, 'name', e.target.value)} className={inputStyle} /></div>
                                <div><label className={labelStyle}>Cargo</label><input type="text" value={member.role} onChange={e => handleTeamMemberChange(index, 'role', e.target.value)} className={inputStyle} /></div>
                            </div>
                            <div><label className={labelStyle}>URL da Foto</label><div className="flex items-center gap-4"><div className="flex-grow"><input type="text" value={member.imageUrl} onChange={e => handleTeamMemberChange(index, 'imageUrl', e.target.value)} className={inputStyle} /></div><ImagePreview src={member.imageUrl} /><input type="file" id={`member-image-upload-${index}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, (url) => handleTeamMemberChange(index, 'imageUrl', url), `member-image-${index}`)} /><button type="button" onClick={() => triggerFileUpload(`member-image-upload-${index}`)} disabled={uploading === `member-image-${index}`} className={uploadButtonStyle}>{uploading === `member-image-${index}` ? 'Enviando...' : 'Upload'}</button></div></div>
                        </div>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};

export default AdminAbout;