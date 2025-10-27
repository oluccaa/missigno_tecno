import React from 'react';

// New interface reflecting the expanded content
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

interface AboutProps {
    content: AboutContent;
}

const optimizeImageUrl = (url: string | undefined, options: { width: number; quality?: number; }) => {
  if (!url) return '';

  try {
    if (url.includes('supabase.co/storage/v1/object/public')) {
        const transformedUrl = new URL(url.replace('/object/public/', '/render/image/public/'));
        transformedUrl.searchParams.set('width', String(options.width));
        transformedUrl.searchParams.set('quality', String(options.quality || 75));
        transformedUrl.searchParams.set('resize', 'cover');
        return transformedUrl.toString();
    }

    if (url.includes('images.unsplash.com')) {
        const transformedUrl = new URL(url);
        transformedUrl.searchParams.set('w', String(options.width));
        transformedUrl.searchParams.set('q', String(options.quality || 75));
        transformedUrl.searchParams.set('auto', 'format');
        transformedUrl.searchParams.set('fit', 'crop');
        return transformedUrl.toString();
    }
  } catch (e) {
      console.error("Error optimizing image URL:", e);
      return url; // fallback to original if URL is malformed
  }

  return url;
};

const ValueIcon: React.FC<{ name: string }> = ({ name }) => {
    const icons: { [key: string]: React.ReactNode } = {
        handshake: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c2.375 0 4.5-1.125 5.875-3s2.125-4.125 2.125-6.375S19.25 8.25 17.875 6.875s-3.5-2.125-5.875-2.125-4.625.75-6.375 2.125S3.25 10.375 3.25 12.625s.75 4.625 2.125 6.375 3.5 3 6.625 3zM12 21.75c-2.375 0-4.5-1.125-5.875-3s-2.125-4.125-2.125-6.375S4.75 8.25 6.125 6.875s3.5-2.125 5.875-2.125" /></svg>,
        lightbulb: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.25 22.5l-.648-1.947a4.5 4.5 0 01-3.09-3.09L9.75 18l1.947-.648a4.5 4.5 0 013.09-3.09L16.25 12l.648 1.947a4.5 4.5 0 013.09 3.09L22.5 18l-1.947.648a4.5 4.5 0 01-3.09 3.09z" /></svg>,
        diamond: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>,
        chart: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
    };
    return <div className="mb-4 text-accent">{icons[name] || icons.handshake}</div>;
};

const ValueCard: React.FC<{ value: Value; delay: number }> = ({ value, delay }) => (
    <div className="bg-white dark:bg-secondary p-8 rounded-xl border border-slate-200 dark:border-slate-700 h-full" data-aos="fade-up" data-aos-delay={delay}>
        <ValueIcon name={value.icon} />
        <h3 className="text-2xl font-bold text-slate-900 dark:text-light mb-2">{value.title}</h3>
        <p className="text-slate-500 dark:text-muted">{value.text}</p>
    </div>
);

const TeamMemberCard: React.FC<{ member: TeamMember; delay: number }> = ({ member, delay }) => (
    <div className="text-center" data-aos="fade-up" data-aos-delay={delay}>
        <img 
            src={optimizeImageUrl(member.imageUrl, { width: 400, quality: 75 })} 
            alt={`Foto de ${member.name}`} 
            className="w-40 h-40 rounded-full mx-auto mb-4 object-cover shadow-lg border-4 border-white dark:border-secondary"
            loading="lazy"
        />
        <h4 className="text-xl font-bold text-slate-900 dark:text-light">{member.name}</h4>
        <p className="text-accent font-semibold">{member.role}</p>
    </div>
);

const About: React.FC<AboutProps> = ({ content }) => {
    const optimizedImageUrl = optimizeImageUrl(content.imageUrl, { width: 1200, quality: 80 });
    return (
        <section id="sobre" className="bg-white dark:bg-secondary overflow-hidden">
            {/* Parte 1: Introdução */}
            <div className="py-20 sm:py-28" data-aos="fade-up">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <img 
                                src={optimizedImageUrl} 
                                alt="Equipe MissigNo em colaboração" 
                                className="rounded-xl shadow-2xl w-full h-auto object-cover aspect-[4/3]"
                                loading="lazy"
                            />
                        </div>
                        <div>
                            <h2 
                                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-light mb-6"
                                dangerouslySetInnerHTML={{ __html: content.headline }}
                            />
                            <p className="text-slate-500 dark:text-muted text-lg mb-4">{content.paragraph1}</p>
                            <p className="text-slate-500 dark:text-muted text-lg mb-8">{content.paragraph2}</p>
                            <a href="#contato" onClick={(e) => { e.preventDefault(); document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-block bg-accent hover:bg-accent-hover text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                                {content.buttonText}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parte 2: Filosofia */}
            <div className="py-20 sm:py-28 bg-slate-50 dark:bg-primary">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="fade-up">
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-light">
                        {content.philosophyHeadline}
                    </h3>
                    <p className="mt-4 text-lg text-slate-500 dark:text-muted max-w-3xl mx-auto">
                        {content.philosophyText}
                    </p>
                </div>
            </div>

            {/* Parte 3: Valores */}
            <div className="py-20 sm:py-28 bg-white dark:bg-secondary">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-light">
                            {content.valuesHeadline}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {content.values.map((value, index) => (
                            <ValueCard key={index} value={value} delay={index * 100} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Parte 4: Equipe */}
            <div className="py-20 sm:py-28 bg-slate-50 dark:bg-primary">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-light">
                            {content.teamHeadline}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
                        {content.teamMembers.map((member, index) => (
                            <TeamMemberCard key={index} member={member} delay={index * 100} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
