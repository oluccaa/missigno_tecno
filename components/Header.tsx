import React, { useState } from 'react';
import ThemeToggleButton from './ThemeToggleButton';

const NavLink: React.FC<{ href: string; children: React.ReactNode; isPageLink?: boolean; onClick?: () => void; }> = ({ href, children, isPageLink, onClick }) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        // Special handling for the home link to ensure it always navigates home first.
        if (href === '#inicio') {
            window.location.hash = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (onClick) onClick();
            return;
        }
        
        if (isPageLink) {
            window.location.hash = href;
            window.scrollTo(0, 0); // Scroll to top for the new "page"
        } else {
            // Anchor link to a section on the main page
            const isHomePage = !window.location.hash || window.location.hash === '#inicio';
            
            if (isHomePage) {
                // We are on the home page, just scroll smoothly
                const element = document.querySelector(href);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // We are on a different page, need to navigate home first.
                // Store the target hash to scroll to after navigation.
                sessionStorage.setItem('scrollTo', href);
                window.location.hash = ''; // Go to home page
            }
        }

        if (onClick) {
            onClick();
        }
    };
    return (
        <a href={href} onClick={handleClick} className="text-slate-500 hover:text-slate-900 dark:text-muted dark:hover:text-light transition-colors duration-300 py-2">
            {children}
        </a>
    );
};


interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
    content: {
        logoType: 'text' | 'image';
        logoText: string;
        logoImageUrlLight: string;
        logoImageUrlDark: string;
        contactButton: string;
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
      return url; // fallback to original if URL is malformed
  }

  return url;
};

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, content }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const navLinks = [
        { href: '#inicio', label: 'Início' },
        { href: '#sobre-nos', label: 'Sobre', isPageLink: true },
        { href: '#solucoes', label: 'Soluções' },
        { href: '#portfolio', label: 'Portfolio' },
        { href: '#processo', label: 'Processo', isPageLink: true },
    ];

    const logoSrc = theme === 'dark' 
        ? content.logoImageUrlDark || content.logoImageUrlLight 
        : content.logoImageUrlLight || content.logoImageUrlDark;

    const optimizedLogoSrc = optimizeImageUrl(logoSrc, { width: 300, quality: 90 });

    return (
        <header className="bg-white/80 dark:bg-primary/80 backdrop-blur-sm sticky top-0 z-50 w-full transition-all duration-300 border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <a href="#inicio" onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center">
                        {content.logoType === 'image' && optimizedLogoSrc ? (
                            <img src={optimizedLogoSrc} alt="Logo da Agência Digital MissigNo" className="h-12 w-auto" />
                        ) : (
                            <span className="text-3xl font-bold text-slate-900 dark:text-light">
                                {content.logoText}<span className="text-accent">.</span>
                            </span>
                        )}
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <NavLink key={link.href} href={link.href} isPageLink={!!link.isPageLink}>{link.label}</NavLink>
                        ))}
                    </nav>
                     <div className="hidden md:flex items-center space-x-4">
                         <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
                         <a href="#contato" onClick={(e) => { e.preventDefault(); document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                            {content.contactButton}
                        </a>
                     </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-2">
                         <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
                        <button 
                            onClick={toggleMenu} 
                            className="text-slate-900 dark:text-light focus:outline-none p-2 -mr-2"
                            aria-controls="mobile-menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className="sr-only">Abrir menu</span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div id="mobile-menu" className="md:hidden bg-white dark:bg-secondary border-t border-slate-200 dark:border-slate-700">
                    <nav className="flex flex-col items-center space-y-4 px-4 py-6">
                        {navLinks.map(link => (
                            <NavLink key={link.href} href={link.href} isPageLink={!!link.isPageLink} onClick={closeMenu}>{link.label}</NavLink>
                        ))}
                        <a href="#contato" onClick={(e) => { e.preventDefault(); document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' }); closeMenu(); }} className="w-full text-center bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300">
                           {content.contactButton}
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;