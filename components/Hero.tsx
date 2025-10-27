import React from 'react';

interface HeroContent {
    headline: string;
    paragraph: string;
    ctaPrimary: string;
    ctaSecondary: string;
    backgroundImageUrl: string;
}

interface HeroProps {
    content: HeroContent;
}

const Hero: React.FC<HeroProps> = ({ content }) => {
    const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePortfolioClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="inicio" className="relative text-center py-24 sm:py-32 lg:py-48 min-h-screen flex items-center justify-center overflow-hidden">
             {/* Layer 1: Background Image */}
             <img 
                src={content.backgroundImageUrl}
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
                <h1 
                  data-aos="fade-up" 
                  className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-light tracking-tighter mb-4"
                  dangerouslySetInnerHTML={{ __html: content.headline }}
                />
                <p data-aos="fade-up" data-aos-delay="200" className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 dark:text-muted mb-8">
                    {content.paragraph}
                </p>
                <div data-aos="fade-up" data-aos-delay="400" className="flex flex-col items-center gap-4">
                    <a href="#contato" onClick={handleCTAClick} className="inline-block bg-accent hover:bg-accent-hover text-white font-bold text-lg py-4 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20">
                        {content.ctaPrimary}
                    </a>
                    <a href="#portfolio" onClick={handlePortfolioClick} className="text-slate-500 dark:text-muted font-semibold hover:text-accent dark:hover:text-light transition-colors">
                        {content.ctaSecondary}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;