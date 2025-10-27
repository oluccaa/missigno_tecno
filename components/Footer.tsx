import React from "react";

interface FooterProps {
  theme: string;
  content: {
    logoType: 'text' | 'image';
    logoText: string;
    logoImageUrlLight: string;
    logoImageUrlDark: string;
  };
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
      return url;
  }

  return url;
};


const Footer: React.FC<FooterProps> = ({ theme, content }) => {
  const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.hash = "#login";
  };

  const logoSrc = theme === 'dark' 
    ? content.logoImageUrlDark || content.logoImageUrlLight 
    : content.logoImageUrlLight || content.logoImageUrlDark;

  const optimizedLogoSrc = optimizeImageUrl(logoSrc, { width: 300, quality: 90 });

  return (
    <footer className="bg-white dark:bg-secondary border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-muted">
            <p>
              &copy; {new Date().getFullYear()} MissigNo. Todos os direitos reservados.
            </p>
            <span className="hidden sm:inline">|</span>
            <a
              href="#login"
              onClick={handleLoginClick}
              className="hover:text-accent dark:hover:text-accent-hover transition-colors duration-300"
            >
              Acesso Restrito
            </a>
          </div>
          <div className="order-first md:order-last">
            <a href="#inicio" onClick={(e) => { e.preventDefault(); document.querySelector('#inicio')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex items-center">
                {content.logoType === 'image' && optimizedLogoSrc ? (
                    <img src={optimizedLogoSrc} alt="Logo da Agência Digital MissigNo" className="h-12 w-auto" />
                ) : (
                    <span className="text-2xl font-bold text-slate-900 dark:text-light">
                        {content.logoText}<span className="text-accent">.</span>
                    </span>
                )}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;