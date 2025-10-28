import React from 'react';

// Tipos
interface ProcessStep {
    title: string;
    description: string;
    icon: string;
    deliverables: string[];
    tools: string[];
}

interface ProcessContent {
    headline: string;
    subheadline: string;
    steps: ProcessStep[];
}

interface ProcessPageProps {
    content: ProcessContent;
}

const iconMap: { [key: string]: React.ReactNode } = {
    search: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
    ),
    design: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3H3v6.75M21 14.25V21h-6.75M3 21l6.75-6.75M21 3l-6.75 6.75" />
        </svg>
    ),
    code: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    launch: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 2.18c-2.35 1.48-3.96 4.06-3.96 7.02v6.16M15.59 14.37A14.926 14.926 0 0112 21.75c-2.676 0-5.14-1-7.02-2.73m11.04-11.04a14.926 14.926 0 00-11.04 2.73c-2.35 1.48-3.96 4.06-3.96 7.02" />
        </svg>
    ),
    default: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l6.293-6.293a1 1 0 011.414 0z" />
        </svg>
    )
};

const ProcessPage: React.FC<ProcessPageProps> = ({ content }) => {
    return (
        <div id="processo" className="bg-white dark:bg-secondary overflow-hidden">
            {/* Hero Section */}
            <section className="relative text-center py-24 sm:py-32 lg:py-40 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-primary"></div>
                <div 
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.2)_0%,rgba(8,145,178,0)_60%)] 
                               opacity-70 animate-aurora [background-size:200%_200%]"
                    aria-hidden="true"
                ></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10" data-aos="fade-up">
                    <h1 
                      className="text-4xl sm:text-5xl lg:text-7xl font-black text-light tracking-tighter mb-4"
                      dangerouslySetInnerHTML={{ __html: content.headline }}
                    />
                    <p className="max-w-3xl mx-auto text-lg sm:text-xl text-muted">
                        {content.subheadline}
                    </p>
                </div>
            </section>
            
            {/* Main Timeline Section */}
            <section className="py-20 sm:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="relative">
                        {/* A linha vertical da timeline */}
                        <div className="absolute left-9 top-0 h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div>

                        {content.steps.map((step, index) => (
                            <div key={index} className="relative pl-20 pb-16 last:pb-0" data-aos="fade-up" data-aos-delay={index * 150}>
                                {/* O Círculo na linha */}
                                <div className="absolute left-0 top-1.5 flex items-center justify-center">
                                    <div className="h-18 w-18 rounded-full bg-white dark:bg-secondary flex items-center justify-center ring-4 ring-white dark:ring-secondary">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-primary text-accent">
                                            {iconMap[step.icon] || iconMap.default}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* O conteúdo do card */}
                                <div className="bg-slate-50 dark:bg-primary p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm font-bold text-accent mb-1">Passo {String(index + 1).padStart(2, '0')}</p>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-light mb-4">{step.title}</h3>
                                    <p className="text-slate-500 dark:text-muted mb-6">{step.description}</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                        <div>
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Entregáveis Chave</h4>
                                            <ul className="space-y-2">
                                                {step.deliverables.map(item => (
                                                    <li key={item} className="flex items-center gap-2 text-slate-500 dark:text-muted text-sm">
                                                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Ferramentas Utilizadas</h4>
                                             <div className="flex flex-wrap gap-2">
                                                {step.tools.map(tool => (
                                                    <span key={tool} className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                                                        {tool}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Final CTA Section */}
            <section className="bg-slate-50 dark:bg-primary">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center" data-aos="zoom-in">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-light mb-4">Veja nossa metodologia em ação.</h2>
                    <p className="text-slate-500 dark:text-muted text-lg max-w-2xl mx-auto mb-8">Cada projeto é uma prova do nosso processo. Explore nosso trabalho e veja os resultados que entregamos.</p>
                    <a href="#portfolio" onClick={(e) => { e.preventDefault(); sessionStorage.setItem('scrollTo', '#portfolio'); window.location.hash = ''; }} className="inline-block bg-accent hover:bg-accent-hover text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20">
                        Nossos Projetos
                    </a>
                </div>
            </section>
        </div>
    );
};

export default ProcessPage;