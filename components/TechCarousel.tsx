import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Technology {
    name: string;
    icon: string;
}

interface TechCarouselContent {
    headline: string;
    subheadline: string;
    technologies: Technology[];
}

interface TechCarouselProps {
    content: TechCarouselContent;
}

const TechItem: React.FC<{ name: string; icon: string }> = ({ name, icon }) => (
    <li className="flex flex-col items-center justify-center gap-2 text-center flex-shrink-0">
        <div 
            className="h-16 w-16 text-slate-600 dark:text-slate-400 transition-colors duration-300 group-hover:text-accent [&_svg]:w-full [&_svg]:h-full"
            dangerouslySetInnerHTML={{ __html: icon }}
        ></div>
        <span className="font-semibold text-slate-700 dark:text-slate-300">{name}</span>
    </li>
);

const TechCarousel: React.FC<TechCarouselProps> = ({ content }) => {
    const technologies = content.technologies || [];
    const [animatedItems, setAnimatedItems] = useState<Technology[]>([]);
    const [isReady, setIsReady] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const measurementListRef = useRef<HTMLUListElement>(null);

    const setupCarousel = useCallback(() => {
        if (technologies.length === 0) {
            setAnimatedItems([]);
            setIsReady(true);
            return;
        }

        if (measurementListRef.current && containerRef.current) {
            const baseWidth = measurementListRef.current.scrollWidth;
            const containerWidth = containerRef.current.offsetWidth;
            
            if (baseWidth > 0 && containerWidth > 0) {
                let baseChunk = [...technologies];
                // If the base list is narrower than the container, we need to duplicate it
                // enough times to fill the container, then duplicate that result for the loop.
                if (baseWidth < containerWidth) {
                    const repeatFactor = Math.ceil(containerWidth / baseWidth);
                    // We add +1 to be safe and ensure it always overflows
                    baseChunk = Array.from({ length: repeatFactor + 1 }).flatMap(() => technologies);
                }
                
                setAnimatedItems([...baseChunk, ...baseChunk]);
                setIsReady(true);
            }
        }
    }, [technologies]);

    useEffect(() => {
        // Run once after initial render to measure
        setupCarousel();

        // Re-run on window resize to adapt dynamically
        window.addEventListener('resize', setupCarousel);
        return () => window.removeEventListener('resize', setupCarousel);
    }, [setupCarousel]);

    return (
        <section id="tecnologias" className="py-20 sm:py-28 bg-slate-50 dark:bg-primary overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16" data-aos="fade-up">
                    <h2 
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-light"
                        dangerouslySetInnerHTML={{ __html: content.headline || '' }}
                    />
                    <p className="mt-4 text-lg text-slate-500 dark:text-muted max-w-2xl mx-auto">
                        {content.subheadline}
                    </p>
                </div>
                
                {/* 
                  This container is used for measurement. It's rendered with the base list,
                  but it's positioned off-screen and invisible so the user never sees it.
                  This allows us to get the true width of the content before deciding how many clones we need.
                */}
                <ul ref={measurementListRef} className="flex w-max absolute top-0 -left-[9999px] opacity-0 -z-10 [&_li]:mx-8">
                    {technologies.map((tech, index) => (
                        <TechItem key={`${tech.name}-${index}`} name={tech.name} icon={tech.icon} />
                    ))}
                </ul>

                {technologies.length > 0 ? (
                    <div
                        ref={containerRef}
                        className="group w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_48px,_black_calc(100%-48px),transparent_100%)]"
                        data-aos="fade-up"
                        data-aos-delay="200"
                        style={{ minHeight: '108px' }} // Prevents layout shift while calculating
                    >
                        {isReady && animatedItems.length > 0 && (
                            <ul className="flex w-max animate-scroll group-hover:[animation-play-state:paused] [&_li]:mx-8">
                                {animatedItems.map((tech, index) => (
                                    <TechItem key={`${tech.name}-${index}`} name={tech.name} icon={tech.icon} />
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-slate-500 dark:text-muted" data-aos="fade-up" data-aos-delay="200">
                        Nenhuma tecnologia cadastrada.
                    </div>
                )}
            </div>
        </section>
    );
};

export default TechCarousel;