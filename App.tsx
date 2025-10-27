import React, { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

// Component imports
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Process from './components/Process';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import BackToTopButton from './components/BackToTopButton';
import WhatsAppButton from './components/WhatsAppButton';
import SkeletonLoader from './components/SkeletonLoader'; // Importando o Skeleton Loader

// ==========================
// Color Conversion Utilities
// ==========================
const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};


// Define types for content
interface Technology {
  name: string;
  icon: string;
}

interface PortfolioItem {
  id?: string;
  imageurl: string; 
  title: string;
  category: string;
  technologies?: Technology[];
  desafio?: string;
  solucao?: string;
  resultados?: string;
  position?: number;
}

interface ThemeSettings {
    primary: string;
    secondary: string;
    accent: string;
    accentHover: string;
    light: string;
    muted: string;
}

interface WebsiteContent {
  header: {
    logoType: 'text' | 'image';
    logoText: string;
    logoImageUrlLight: string;
    logoImageUrlDark: string;
    contactButton: string;
  };
  about: {
    headline: string;
    paragraph1: string;
    paragraph2: string;
    buttonText: string;
    imageUrl: string;
  };
  portfolio: PortfolioItem[];
  site_meta: {
      faviconIcoUrl: string;
      faviconSvgUrl: string;
      appleTouchIconUrl: string;
  };
  theme_settings: ThemeSettings;
}

// Default content in case of fetch error or for initial render
const defaultContent: WebsiteContent = {
    header: {
        logoType: 'text',
        logoText: "MissigNo",
        logoImageUrlLight: "",
        logoImageUrlDark: "",
        contactButton: "Contato"
    },
    about: {
        headline: "Somos mais que uma agência, somos seu parceiro de <span class=\"text-accent\">crescimento</span>.",
        paragraph1: "Acreditamos que cada marca tem uma história única para contar. Nossa paixão é transformar essa história em experiências digitais que não só pareçam incríveis, mas que também funcionem perfeitamente, gerando resultados reais e duradouros.",
        paragraph2: "Combinamos design, tecnologia e estratégia para criar soluções sob medida que elevam sua presença online e conectam você ao seu público de maneira autêntica.",
        buttonText: "Vamos nos conectar",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
    },
    portfolio: [
        { 
          id: '1', 
          imageurl: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop", 
          title: "Plataforma SaaS de Gestão", 
          category: "Aplicação Web",
          desafio: "O cliente precisava de uma plataforma centralizada para gerenciar processos internos complexos, que antes eram feitos em planilhas desconexas, resultando em perda de tempo e erros frequentes.",
          solucao: "Desenvolvemos uma aplicação web robusta com dashboards intuitivos, automação de tarefas e um sistema de relatórios em tempo real, permitindo uma visão 360º da operação.",
          resultados: "Redução de 40% no tempo gasto em tarefas administrativas, aumento da precisão dos dados e uma melhoria significativa na tomada de decisões estratégicas baseadas nos relatórios gerados.",
          technologies: [
            { name: "React", icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348" fill="currentColor" class="w-6 h-6 text-cyan-400"><title>React Logo</title><circle cx="0" cy="0" r="2.05" fill="currentColor"/><g stroke="currentColor" stroke-width="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>`},
            { name: "TypeScript", icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-6 h-6 text-blue-500" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11.6,18.5H9.3V10.3H11.6V18.5M17.4,12.5C17.4,14.1 16.5,15.1 15.2,15.1C14,15.1 13.3,14.3 13.1,13.5L14.1,13.1C14.2,13.6 14.6,14.1 15.1,14.1C15.8,14.1 16.3,13.6 16.3,12.6V10.2H15.2V9.1H16.3V8C16.3,7.3 16.7,6.8 17.4,6.8V7.8C17.1,7.8 16.8,8 16.8,8.4L16.9,9.1H18V10.2H16.9V12.2C16.9,12.4 17.1,12.5 17.4,12.5Z" /></svg>`},
            { name: "PostgreSQL", icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="currentColor" class="w-6 h-6 text-blue-800 dark:text-blue-400"><path fill="#336791" d="M24,42c-9.9,0-18-8.1-18-18S14.1,6,24,6s18,8.1,18,18S33.9,42,24,42z"/><path fill="#fff" d="M25.7,34.2h-3.9V21.1h-3.8v-3.3h11.5v3.3h-3.8V34.2z M27,16.5c0-1.2-0.9-2-2.3-2s-2.3,0.9-2.3,2 c0,1.2,0.9,2,2.3,2S27,17.7,27,16.5z"/></svg>`}
          ]
        },
        { 
          id: '2', 
          imageurl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop", 
          title: "E-commerce de Alta Conversão", 
          category: "Loja Virtual",
          technologies: [
            { name: "Tailwind CSS", icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-cyan-500"><path d="M12.001,4.529c-0.45,0-0.886,0.179-1.207,0.488L9.92,5.884C9.39,5.354,8.736,5.001,8,5 c-1.222,0-2.27,0.706-2.787,1.748L4,7.462C4,7.462,4,4.529,4,4.529s0-1.748,0-1.748c0-0.276-0.224-0.5-0.5-0.5S3,2.505,3,2.781 v18.438C3,21.495,3.224,21.719,3.5,21.719S4,21.495,4,21.219V11.569c0.396-0.784,1.239-1.32,2.188-1.32c0.45,0,0.886,0.179,1.207,0.488 l0.874,0.868c0.531-0.53,1.184-0.879,1.943-0.879c1.222,0,2.27,0.706,2.787,1.748L14,13.228c0,0,0-2.933,0-2.933s0-1.748,0-1.748 c0-0.276-0.224-0.5-0.5-0.5s-0.5,0.224-0.5,0.5v10.688c-0.396,0.784-1.239,1.32-2.188-1.32c-0.45,0-0.886-0.179-1.207-0.488 l-0.874-0.868c-0.531,0.53-1.184-0.879-1.943,0.879c-1.222,0-2.27-0.706-2.787-1.748L7,19.228V8.538c0.396,0.784,1.239,1.32,2.188,1.32 c0.45,0,0.886,0.179,1.207,0.488l0.874,0.868c0.531-0.53,1.184-0.879,1.943-0.879c1.222,0,2.27,0.706,2.787,1.748L17,13.228 v-2.933c-0.396-0.784-1.239-1.32-2.188-1.32c-0.45,0-0.886-0.179-1.207-0.488l-0.874-0.868 c-0.531-0.53-1.184-0.879-1.943-0.879c-1.222,0-2.27-0.706-2.787-1.748L7,5.744V4.529c0-0.276,0.224-0.5,0.5-0.5 c0.276,0,0.5,0.224,0.5,0.5v1.214c0.396,0.784,1.239,1.32,2.188,1.32c0.45,0,0.886,0.179,1.207-0.488l0.874-0.868 c-0.531-0.53-1.184-0.879-1.943-0.879c-0.759,0-1.412,0.353-1.943,0.879L6.08,5.884C5.759,5.595,5.323,5.416,4.873,5.416 c-1.222,0-2.27,0.706-2.787,1.748L1,7.88v12.338C1,20.495,1.224,20.719,1.5,20.719S2,20.495,2,20.219V7.88 C2,7.88,2,4.947,2,4.947s0-1.748,0-1.748c0-0.276,0.224-0.5,0.5-0.5S3,2.923,3,3.199v1.33c0.396-0.784,1.239-1.32,2.188-1.32 c0.45,0,0.886,0.179,1.207,0.488l0.874,0.868c0.531-0.53,1.184-0.879,1.943-0.879C10.158,4.529,11.088,5.135,12.001,4.529z M21,3.199c0,0.276-0.224,0.5-0.5,0.5S20,3.475,20,3.199V2.781c0-0.276,0.224-0.5,0.5-0.5s0.5,0.224,0.5,0.5V3.199z M19,4.947v1.214 c-0.396-0.784-1.239-1.32-2.188-1.32c-0.45,0-0.886,0.179-1.207,0.488l-0.874-0.868C14.199,3.923,13.546,3.574,12.8,3.574 c-1.222,0-2.27,0.706-2.787,1.748L9,6.038v10.688c0.396,0.784,1.239,1.32,2.188,1.32c0.45,0,0.886,0.179,1.207,0.488l0.874,0.868 c0.531-0.53,1.184-0.879,1.943-0.879c1.222,0,2.27,0.706,2.787,1.748l1.126-0.716V4.947z M20,11.569v8.65 c-0.396-0.784-1.239-1.32-2.188-1.32c-0.45,0-0.886,0.179-1.207,0.488l-0.874-0.868c-0.531,0.53-1.184-0.879-1.943,0.879 c-1.222,0-2.27-0.706-2.787-1.748l-1.126,0.716V11.569c0.396-0.784,1.239-1.32,2.188-1.32c0.45,0,0.886,0.179,1.207,0.488 l0.874,0.868c0.531,0.53,1.184-0.879,1.943,0.879c1.222,0,2.27,0.706,2.787,1.748L20,13.228V11.569z M20,20.219 c0-0.276-0.224-0.5-0.5-0.5s-0.5,0.224-0.5,0.5v1.001c0,0.276,0.224,0.5,0.5,0.5s0.5-0.224,0.5-0.5V20.219z"/></svg>`},
            { name: "Supabase", icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-green-500"><path d="M22.512 10.45a.5.5 0 00-.433-.25H18.75V5.564a.5.5 0 00-.734-.442l-9.25 5.25a.5.5 0 000 .85l9.25 5.25a.5.5 0 00.734-.442V13.7h3.329a.5.5 0 00.433-.75l-2.75-5.25zM17.25 12.2h-3.375v4.29L5.438 12 13.875 7.42v4.28h3.375l2.188 4.16-2.188-3.66zM1.5 21.75a.75.75 0 00.75.75h9a.75.75 0 000-1.5H3v-18h7.5a.75.75 0 000-1.5H2.25a.75.75 0 00-.75.75v19.5z"/></svg>`}
          ]
        },
        { id: '3', imageurl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop", title: "Sistema de Agendamento Online", category: "Desenvolvimento Web" },
        { id: '4', imageurl: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2070&auto=format&fit=crop", title: "Website para Startup de IA", category: "Web Design & Branding" },
        { id: '5', imageurl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop", title: "Portal Imobiliário Inteligente", category: "Aplicação Web" },
        { id: '6', imageurl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974&auto=format&fit=crop", title: "Plataforma de Cursos EAD", category: "Desenvolvimento Web" },
        { id: '7', imageurl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop", title: "Dashboard de Business Intelligence", category: "Data-Viz" },
        { id: '8', imageurl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2231&auto=format&fit=crop", title: "Aplicativo de Delivery", category: "Mobile App" },
        { id: '9', imageurl: "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070&auto=format&fit=crop", title: "CRM para Vendas", category: "Sistema Web" }
    ],
    site_meta: {
        faviconIcoUrl: "",
        faviconSvgUrl: "",
        appleTouchIconUrl: ""
    },
    theme_settings: {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#0891b2',
        accentHover: '#06b6d4',
        light: '#f8fafc',
        muted: '#94a3b8',
    }
};

// Supabase setup
const supabaseUrl = 'https://vvonilfxdxzgydrqjser.supabase.co';
const supabaseKey = 'sb_publishable_PT_t-om6yeIs-MFPa9mDqA_SlrDWviy';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to determine the initial theme based on user preference and system settings.
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'light';
  }
  const storedTheme = window.localStorage.getItem('theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
    const [session, setSession] = useState<Session | null>(null);
    const [content, setContent] = useState<WebsiteContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [hash, setHash] = useState(window.location.hash);

    const fetchContent = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch sections
            const { data: sectionsData, error: sectionsError } = await supabase
                .from('sections')
                .select('id, content');
            
            if (sectionsError) throw sectionsError;

            // Fetch portfolio items ordered by position
            const { data: portfolioData, error: portfolioError } = await supabase
                .from('portfolio')
                .select('*')
                .order('position', { ascending: true });

            if (portfolioError) throw portfolioError;
            
            const fetchedContent: Partial<WebsiteContent> = {};

            sectionsData.forEach(section => {
              if (section.id && section.content) {
                  (fetchedContent as any)[section.id] = section.content;
              }
            });
            
            fetchedContent.portfolio = portfolioData || defaultContent.portfolio;
            
            // Merge with default to ensure all keys are present
            const finalContent = {
                header: { ...defaultContent.header, ...fetchedContent.header },
                about: { ...defaultContent.about, ...fetchedContent.about },
                portfolio: fetchedContent.portfolio.length > 0 ? fetchedContent.portfolio : defaultContent.portfolio,
                site_meta: { ...defaultContent.site_meta, ...fetchedContent.site_meta },
                theme_settings: { ...defaultContent.theme_settings, ...fetchedContent.theme_settings },
            };

            setContent(finalContent as WebsiteContent);
        } catch (error: any) {
            console.error("Error fetching content:", error.message);
            setContent(defaultContent);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            // If user logs out, redirect to home
            if (_event === 'SIGNED_OUT') {
                window.location.hash = '';
            }
        });
        
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        });

        const handleHashChange = () => setHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    // Apply theme colors from DB
    useEffect(() => {
        if (content?.theme_settings) {
            const settings = content.theme_settings;
            const root = document.documentElement;
            
            const applyColor = (cssVar: string, hex: string) => {
                const rgb = hexToRgb(hex);
                if (rgb) {
                    const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
                    root.style.setProperty(cssVar, `${h} ${s}% ${l}%`);
                }
            };
            
            applyColor('--color-primary-hsl', settings.primary);
            applyColor('--color-secondary-hsl', settings.secondary);
            applyColor('--color-accent-hsl', settings.accent);
            applyColor('--color-accent-hover-hsl', settings.accentHover);
            applyColor('--color-light-hsl', settings.light);
            applyColor('--color-muted-hsl', settings.muted);
        }
    }, [content?.theme_settings]);

    // Update Favicons
    useEffect(() => {
        if (content?.site_meta) {
            const { faviconIcoUrl, faviconSvgUrl, appleTouchIconUrl } = content.site_meta;
            (document.getElementById('favicon-ico') as HTMLLinkElement).href = faviconIcoUrl || '/favicon.ico';
            (document.getElementById('favicon-svg') as HTMLLinkElement).href = faviconSvgUrl || '/favicon.svg';
            (document.getElementById('apple-touch-icon') as HTMLLinkElement).href = appleTouchIconUrl || '/apple-touch-icon.png';
        }
    }, [content?.site_meta]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    if (loading || !content) {
        return <SkeletonLoader />;
    }

    if (hash === '#login' && !session) {
      return <Login theme={theme} toggleTheme={toggleTheme} supabase={supabase} />;
    }

    if (session && (hash === '#admin' || hash === '')) {
      return (
        <AdminDashboard
          theme={theme}
          toggleTheme={toggleTheme}
          supabase={supabase}
          initialContent={content}
          onSaveSuccess={fetchContent}
          session={session}
        />
      );
    }
    
    return (
        <div id="inicio" className="bg-white dark:bg-primary transition-colors duration-300">
            <Header theme={theme} toggleTheme={toggleTheme} content={content.header} />
            <main>
                <Hero />
                <About content={content.about} />
                <Services />
                <Portfolio items={content.portfolio} />
                <Process />
                <Contact />
            </main>
            <Footer theme={theme} content={content.header} />
            <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-40">
                <WhatsAppButton />
                <BackToTopButton />
            </div>
        </div>
    );
};

export default App;