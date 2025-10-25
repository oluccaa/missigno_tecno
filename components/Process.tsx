import React from 'react';

const ProcessStep: React.FC<{ number: string; title: string; description: string; }> = ({ number, title, description }) => {
    return (
        <div className="relative pl-12 pb-12 border-l border-slate-300 dark:border-slate-700 last:border-l-transparent last:pb-0">
            <div className="absolute -left-5 top-0 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-secondary border-2 border-slate-300 dark:border-slate-700 text-accent font-bold">
                {number}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-light mb-2">{title}</h3>
            <p className="text-slate-500 dark:text-muted">{description}</p>
        </div>
    );
};


const Process: React.FC = () => {
    const processData = [
        { number: "01", title: "Discovery & Estratégia", description: "Iniciamos com uma imersão no seu negócio para entender seus objetivos e definir a melhor estratégia." },
        { number: "02", title: "Design & UX/UI", description: "Criamos interfaces intuitivas e visualmente impactantes, focadas na experiência do usuário." },
        { number: "03", title: "Desenvolvimento & Testes", description: "Codificamos com as tecnologias mais modernas e realizamos testes rigorosos para garantir a qualidade." },
        { number: "04", title: "Lançamento & Otimização", description: "Implementamos o projeto e continuamos monitorando para otimizar a performance e alcançar os melhores resultados." }
    ];

    return (
        <section id="processo" className="py-20 sm:py-28 bg-white dark:bg-secondary">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-light">
                        Nosso Caminho para o <span className="text-accent">Sucesso</span>
                    </h2>
                    <p className="mt-4 text-lg text-slate-500 dark:text-muted max-w-2xl mx-auto">
                        Um processo transparente e colaborativo, do início ao fim.
                    </p>
                </div>
                <div className="max-w-2xl mx-auto">
                    {processData.map((step, index) => (
                         <ProcessStep key={index} {...step} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Process;
