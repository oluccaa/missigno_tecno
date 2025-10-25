import React from 'react';

const Hero: React.FC = () => {
    const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="inicio" className="relative text-center py-24 sm:py-32 lg:py-48 min-h-screen flex items-center justify-center overflow-hidden">
             {/* Layer 1: Background Image */}
             <img 
                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1920&q=70&auto=format&fit=crop" 
                alt="Fundo tecnológico abstrato"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-sm"
             />
             {/* Layer 2: Gradient Overlay */}
             <div className="absolute inset-0 bg-white/60 dark:bg-primary/70"></div>
            
             {/* Layer 3: Aurora Effect */}
             <div 
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(8,145,178,0.2)_0%,rgba(8,145,178,0)_60%)] 
                           opacity-70 animate-aurora [background-size:200%_200%]"
                aria-hidden="true"
              ></div>

            {/* Layer 4: Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-light tracking-tighter mb-4 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
                    Desbloqueie o Potencial <br className="hidden md:block" /> Digital da Sua Marca<span className="text-accent">.</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 dark:text-muted mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}>
                    Criamos experiências digitais autênticas que conectam, engajam e convertem. Da ideia ao lançamento, somos o parceiro que sua empresa precisa para decolar no mundo online.
                </p>
                <div className="animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0 }}>
                    <a href="#contato" onClick={handleCTAClick} className="inline-block bg-accent hover:bg-accent-hover text-white font-bold text-lg py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20">
                        Vamos Conversar
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;