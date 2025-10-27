import React from 'react';
import type { Session } from '@supabase/supabase-js';

type AdminTab = 'home' | 'header' | 'about' | 'portfolio' | 'appearance' | 'profile' | 'history';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar: string | null;
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  session: Session | null;
  profile: Profile | null;
  handleLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-accent text-white shadow-lg shadow-cyan-500/30'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
    </a>
  );
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, session, profile, handleLogout, isOpen, setIsOpen }) => {
  
  const handleNavClick = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsOpen(false); // Fecha o menu no mobile após o clique
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-secondary border-r border-slate-700 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between h-20 px-4 border-b border-slate-700 flex-shrink-0">
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} className="text-2xl font-bold text-light">
            MissigNo<span className="text-accent">.</span>
          </a>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Geral</h3>
            <NavLink
              label="Início"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
              isActive={activeTab === 'home'}
              onClick={() => handleNavClick('home')}
            />
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Conteúdo</h3>
            <div className="space-y-1">
              <NavLink label="Cabeçalho e Rodapé" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14M5 9h14M5 13h14M5 17h14" /></svg>} isActive={activeTab === 'header'} onClick={() => handleNavClick('header')} />
              <NavLink label="Sobre" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} isActive={activeTab === 'about'} onClick={() => handleNavClick('about')} />
              <NavLink label="Portfólio" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} isActive={activeTab === 'portfolio'} onClick={() => handleNavClick('portfolio')} />
            </div>
          </div>
          
          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Aparência</h3>
             <NavLink label="Aparência" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>} isActive={activeTab === 'appearance'} onClick={() => handleNavClick('appearance')} />
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sistema</h3>
            <div className="space-y-1">
              <NavLink label="Meu Perfil" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} isActive={activeTab === 'profile'} onClick={() => handleNavClick('profile')} />
              <NavLink label="Histórico" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} isActive={activeTab === 'history'} onClick={() => handleNavClick('history')} />
            </div>
          </div>
        </nav>

        <div className="mt-auto p-4 border-t border-slate-700">
           <div className="flex items-center gap-3">
              {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar do usuário" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                  </div>
              )}
               <div className="flex-1 overflow-hidden">
                 <span className="text-sm text-slate-300 font-medium truncate block">{profile?.full_name || session?.user?.email}</span>
                 <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-400 transition-colors">Sair</button>
               </div>
           </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;