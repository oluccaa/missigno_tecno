import React from 'react';

const ServiceCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => {
    return (
        <div className="bg-white dark:bg-secondary p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-accent transition-all duration-300 transform hover:-translate-y-2 h-full">
            <div className="mb-4 text-accent">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-light mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-muted">{description}</p>
        </div>
    );
};

const Services: React.FC = () => {
    const servicesData = [
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
            title: "Desenvolvimento Web",
            description: "Construímos sites e aplicações web de alta performance, focados na experiência do usuário e otimizados para conversão."
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
            title: "Otimização SEO",
            description: "Colocamos sua marca no topo dos resultados de busca, atraindo tráfego orgânico qualificado e aumentando sua visibilidade."
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.875 9.168-4.992" /></svg>,
            title: "Marketing Digital",
            description: "Criamos estratégias de marketing digital integradas que geram leads, fortalecem sua marca e impulsionam suas vendas."
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
            title: "Identidade Visual",
            description: "Desenvolvemos marcas memoráveis, desde o logo até o manual da marca, que comunicam seus valores e se destacam no mercado."
        }
    ];

    return (
        <section id="solucoes" className="py-20 sm:py-28 bg-slate-50 dark:bg-primary overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-light animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                        Nossas Soluções para <span className="text-accent">Impulsionar</span> seu Negócio
                    </h2>
                    <p className="mt-4 text-lg text-slate-500 dark:text-muted max-w-2xl mx-auto animate-fade-in-up" style={{ opacity: 0, animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        Oferecemos um leque completo de serviços para garantir a presença digital de sua empresa.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {servicesData.map((service, index) => (
                        <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${0.4 + index * 0.1}s`, animationFillMode: 'forwards', opacity: 0 }}>
                            <ServiceCard icon={service.icon} title={service.title} description={service.description} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;