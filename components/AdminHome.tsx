import React from 'react';

// Re-defining types here to make the component self-contained for generation
// In a real project, these would be imported from a shared types file.
interface Technology {
  name: string;
  icon: string;
}

interface PortfolioItem {
  id?: string;
  imageurl: string;
  title: string;
  category: string;
  technologies?: Technology[];
  desafio?: string;
  solucao?: string;
  resultados?: string;
  position?: number;
}

interface AuditLog {
  id: number;
  created_at: string;
  user_email: string;
  action: string;
  description: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
}

type AdminTab = 'header' | 'about' | 'portfolio' | 'appearance' | 'config' | 'profile' | 'history' | 'home';


interface AdminHomeProps {
    setActiveTab: (tab: AdminTab) => void;
    auditLogs: AuditLog[];
    portfolio: PortfolioItem[];
    profile: Profile | null;
}

// Simple time ago function
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

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; onClick?: () => void; }> = ({ title, value, icon, onClick }) => {
    const cardClasses = "bg-white dark:bg-secondary p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-6 transition-all duration-300";
    const clickableClasses = "hover:border-accent hover:shadow-cyan-500/10 cursor-pointer";
    
    return (
        <div onClick={onClick} className={`${cardClasses} ${onClick ? clickableClasses : ''}`}>
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full text-accent">
                {icon}
            </div>
            <div>
                <dt className="text-sm font-medium text-slate-500 dark:text-muted">{title}</dt>
                <dd className="text-2xl font-bold text-slate-900 dark:text-light">{value}</dd>
            </div>
        </div>
    );
};

const QuickLink: React.FC<{ label: string; icon: React.ReactNode; onClick: () => void; }> = ({ label, icon, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-secondary rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:border-accent hover:text-accent dark:hover:text-accent transition-all duration-300"
    >
        <div className="text-slate-600 dark:text-slate-300 group-hover:text-accent">{icon}</div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
    </button>
);


const AdminHome: React.FC<AdminHomeProps> = ({ setActiveTab, auditLogs, portfolio, profile }) => {
    const cardStyle = "bg-white dark:bg-secondary p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700";
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentChangesCount = auditLogs.filter(log => new Date(log.created_at) > thirtyDaysAgo).length;

    const recentActivity = auditLogs.slice(0, 5);

    const quickLinks = [
        { label: 'Cabeçalho e Rodapé', tab: 'header' as AdminTab, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg> },
        { label: 'Sobre', tab: 'about' as AdminTab, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.5h-6a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25h6m-3 0a2.25 2.25 0 002.25-2.25V3a2.25 2.25 0 00-2.25-2.25H9A2.25 2.25 0 006.75 3v.75c0 1.242 1.008 2.25 2.25 2.25h3zm-3 8.25h3.375a2.25 2.25 0 002.25-2.25V9m-3.375 0c1.242 0 2.25-1.008 2.25-2.25V6.75" /></svg> },
        { label: 'Portfólio', tab: 'portfolio' as AdminTab, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg> },
        { label: 'Aparência', tab: 'appearance' as AdminTab, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402a3.75 3.75 0 00-.615-5.898L8.188 4.097a3.75 3.75 0 00-5.304 0l-1.932 1.931a3.75 3.75 0 000 5.304l3.143 3.144z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.867 15.75c1.012-1.012 1.012-2.659 0-3.672l-1.543-1.543c-1.012-1.012-2.659-1.012-3.672 0l-1.543 1.543c-1.012 1.012-1.012 2.659 0 3.672l1.543 1.543c1.012 1.012 2.659 1.012 3.672 0z" /></svg> },
    ];
    
    return (
        <div className="space-y-8">
            <div className={cardStyle}>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-light">
                    Bem-vindo(a) de volta, {profile?.full_name?.split(' ')[0] || 'Admin'}!
                </h2>
                <p className="mt-2 text-slate-500 dark:text-muted">Aqui está um resumo do seu site.</p>
            </div>
            
            {/* Stats */}
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard 
                    title="Alterações (30d)"
                    value={recentChangesCount}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                    onClick={() => setActiveTab('history')}
                 />
                 <StatCard 
                    title="Projetos no Portfólio"
                    value={portfolio.length}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>}
                    onClick={() => setActiveTab('portfolio')}
                 />
                 <StatCard 
                    title="Visitas (Analytics)"
                    value="Em breve"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                 />
            </dl>
            
            {/* Quick Links */}
            <div className={cardStyle}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Acesso Rápido</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickLinks.map(link => (
                        <QuickLink key={link.tab} label={link.label} icon={link.icon} onClick={() => setActiveTab(link.tab)} />
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className={cardStyle}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-4">Atividade Recente</h3>
                {recentActivity.length > 0 ? (
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {recentActivity.map(log => (
                            <li key={log.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{log.description}</p>
                                    <p className="text-xs text-slate-500 dark:text-muted">{log.user_email}</p>
                                </div>
                                <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(log.created_at)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-muted">Nenhuma atividade recente encontrada.</p>
                )}
                 <div className="mt-4 text-right">
                    <button onClick={() => setActiveTab('history')} className="text-sm font-semibold text-accent hover:underline">
                        Ver Histórico Completo &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;