import React from 'react';

interface AboutContent {
    headline: string;
    paragraph1: string;
    paragraph2: string;
    buttonText: string;
    imageUrl: string;
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

const About: React.FC<AboutProps> = ({ content }) => {
    const optimizedImageUrl = optimizeImageUrl(content.imageUrl, { width: 1200, quality: 80 });
    return (
        <section id="sobre" className="py-20 sm:py-28 bg-white dark:bg-secondary" data-aos="fade-up">
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
                        >
                        </h2>
                        <p className="text-slate-500 dark:text-muted text-lg mb-4">
                            {content.paragraph1}
                        </p>
                        <p className="text-slate-500 dark:text-muted text-lg mb-8">
                            {content.paragraph2}
                        </p>
                        <a href="#contato" onClick={(e) => { e.preventDefault(); document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-block bg-accent hover:bg-accent-hover text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                            {content.buttonText}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;