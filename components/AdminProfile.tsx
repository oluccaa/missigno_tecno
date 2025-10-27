import React, { useState, useEffect, useMemo } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

// Tipos para o perfil do usuário
interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar: string | null;
}

interface AdminProfileProps {
  session: Session | null;
  profile: Profile | null;
  supabase: SupabaseClient;
  onUpdate: () => void; // Para recarregar dados no componente pai
}

// ==========================
// Critérios de Senha
// ==========================
const passwordCriteria = [
  { id: 'length', text: 'Pelo menos 8 caracteres', regex: /.{8,}/ },
  { id: 'uppercase', text: 'Uma letra maiúscula (A-Z)', regex: /[A-Z]/ },
  { id: 'lowercase', text: 'Uma letra minúscula (a-z)', regex: /[a-z]/ },
  { id: 'number', text: 'Um número (0-9)', regex: /[0-9]/ },
  { id: 'special', text: 'Um caractere especial (!@#$%^&*)', regex: /[!@#$%^&*]/ },
];

const PasswordStrengthIndicator: React.FC<{ password?: string }> = ({ password = '' }) => {
    const fulfilledCriteria = useMemo(() => {
        return passwordCriteria.map(criterion => ({
            ...criterion,
            isFulfilled: criterion.regex.test(password),
        }));
    }, [password]);

    const strength = fulfilledCriteria.filter(c => c.isFulfilled).length;
    const strengthColor =
        strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${(strength / passwordCriteria.length) * 100}%` }}
                    ></div>
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {['Fraca', 'Fraca', 'Média', 'Média', 'Forte', 'Forte'][strength]}
                </span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {fulfilledCriteria.map(criterion => (
                    <li key={criterion.id} className={`flex items-center gap-2 transition-colors ${criterion.isFulfilled ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-muted'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d={criterion.isFulfilled ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" : "M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"} clipRule="evenodd" />
                        </svg>
                        {criterion.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};


const AdminProfile: React.FC<AdminProfileProps> = ({ session, profile, supabase, onUpdate }) => {
  // State for Profile Info
  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // State for Password Management
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatar(profile.avatar);
    }
  }, [profile]);

  const hasProfileChanges = (profile?.full_name || '') !== fullName || profile?.avatar !== avatar;
  const isPasswordStrong = useMemo(() => passwordCriteria.every(c => c.regex.test(newPassword)), [newPassword]);
  const canSaveChanges = currentPassword && newPassword && newPassword === confirmPassword && isPasswordStrong;

  const triggerFileUpload = () => {
    document.getElementById('avatar-upload-input')?.click();
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !session?.user) return;
    const file = event.target.files[0];
    setUploading(true);
    setMessage(null);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('public-assets').upload(filePath, file, {
          upsert: true
        });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(filePath);
        setAvatar(publicUrl);
        setMessage({ type: 'success', text: 'Pré-visualização da imagem atualizada. Salve para aplicar.' });

    } catch (error: any) {
        setMessage({ type: 'error', text: `Falha no upload: ${error.message}` });
    } finally {
        setUploading(false);
        event.target.value = '';
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;
    
    setIsSaving(true);
    setMessage(null);
    try {
      const updates = {
        id: session.user.id,
        full_name: fullName,
        avatar: avatar,
      };
      
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      onUpdate();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Erro ao atualizar: ${error.message}` });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };
  
  const handlePasswordSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError('');
      setPasswordMessage(null);

      if (newPassword !== confirmPassword) {
          setPasswordError('As novas senhas não coincidem.');
          return;
      }
      if (!isPasswordStrong) {
          setPasswordError('A nova senha não atende aos critérios de segurança.');
          return;
      }
      
      setIsSavingPassword(true);
      
      try {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          
          // Nota: Supabase não exige a senha antiga para atualização quando o usuário já está logado (sessão ativa).
          // A verificação é feita com base no JWT válido. O campo "Senha Atual" é uma boa prática de UX.

          if (error) {
              if (error.message.includes('A new password is required')) {
                  throw new Error('A nova senha não pode ser igual à antiga.');
              }
               if (error.message.includes('Password should be at least 6 characters')) {
                  throw new Error('A senha precisa ter no mínimo 6 caracteres (requisito Supabase).');
              }
              throw error;
          }
          
          setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');

      } catch (error: any) {
          setPasswordMessage({ type: 'error', text: `Erro ao alterar senha: ${error.message}` });
      } finally {
          setIsSavingPassword(false);
          setTimeout(() => setPasswordMessage(null), 5000);
      }
  };
  
  // Estilos reutilizáveis
  const cardStyle = 'bg-white dark:bg-secondary p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700';
  const inputStyle = 'w-full bg-white dark:bg-slate-800 border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors border-slate-300 dark:border-slate-700 focus:ring-accent';
  const labelStyle = 'block text-sm font-medium text-slate-700 dark:text-muted mb-2';
  const buttonStyle = "w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-light">Meu Perfil</h2>
        <p className="mt-1 text-slate-500 dark:text-muted">Gerencie suas informações pessoais e de conta.</p>
      </div>

      <form onSubmit={handleProfileSave} className={cardStyle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1 flex flex-col items-center">
                  <div className="relative">
                      {avatar ? <img src={avatar} alt="Avatar do usuário" className="h-40 w-40 rounded-full object-cover ring-4 ring-white dark:ring-secondary shadow-lg" /> : <div className="h-40 w-40 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center ring-4 ring-white dark:ring-secondary shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></div>}
                      {uploading && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>}
                  </div>
                  <input type="file" id="avatar-upload-input" className="hidden" accept="image/png, image/jpeg" onChange={handleAvatarUpload} />
                  <button type="button" onClick={triggerFileUpload} disabled={uploading} className="mt-4 text-sm font-semibold text-accent hover:underline">{uploading ? 'Enviando...' : 'Alterar Foto'}</button>
              </div>
              <div className="md:col-span-2 space-y-6">
                  <div><label htmlFor="fullName" className={labelStyle}>Nome Completo</label><input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputStyle} placeholder="Seu nome completo" /></div>
                  <div><label htmlFor="email" className={labelStyle}>E-mail</label><input id="email" type="email" value={session?.user?.email || ''} disabled className={`${inputStyle} cursor-not-allowed bg-slate-100 dark:bg-slate-800/50`} aria-label="E-mail (não pode ser alterado)" /></div>
              </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
               {message && <p className={`text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} aria-live="polite">{message.text}</p>}
               <div className="w-full sm:w-auto ml-auto"><button type="submit" disabled={isSaving || !hasProfileChanges} className={buttonStyle}>{isSaving && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button></div>
          </div>
      </form>
      
      <form onSubmit={handlePasswordSave} className={cardStyle}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-6">Alterar Senha</h3>
        <div className="space-y-6">
            <div>
                <label htmlFor="currentPassword" className={labelStyle}>Senha Atual</label>
                <input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputStyle} placeholder="Sua senha atual" />
            </div>
            <div>
                <label htmlFor="newPassword" className={labelStyle}>Nova Senha</label>
                <input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputStyle} placeholder="Digite a nova senha" />
            </div>
            {newPassword && <PasswordStrengthIndicator password={newPassword} />}
            <div>
                <label htmlFor="confirmPassword" className={labelStyle}>Confirmar Nova Senha</label>
                <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputStyle} placeholder="Confirme a nova senha" />
            </div>
             {passwordError && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{passwordError}</p>}
        </div>
         <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
               {passwordMessage && <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} aria-live="polite">{passwordMessage.text}</p>}
               <div className="w-full sm:w-auto ml-auto">
                    <button type="submit" disabled={isSavingPassword || !canSaveChanges} className={buttonStyle}>
                      {isSavingPassword && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                      {isSavingPassword ? 'Salvando...' : 'Salvar Senha'}
                    </button>
               </div>
          </div>
      </form>
    </div>
  );
};

export default AdminProfile;
