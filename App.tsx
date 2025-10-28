import React, { useState, useEffect, useCallback } from 'react';
import { createClient, Session } from '@supabase/supabase-js';

// Component imports
import Header from './components/Header';
import Hero from './components/Hero';
import AboutPage from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import ProcessPage from './components/Process';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTopButton';
import WhatsAppButton from './components/WhatsAppButton';
import TechCarousel from './components/TechCarousel';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import SkeletonLoader from './components/SkeletonLoader';

// Supabase client setup
const supabaseUrl = 'https://hjjnjmzefmbbibrxdlsi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqam5qbXplZm1iYmlicnhkbHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTUwNTYsImV4cCI6MjA3NzE5MTA1Nn0.o0ZRZUPStxS50fNGW9hukXTl4vo2GRrbv2XiP1X2p78';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

interface TechCarouselContent {
    headline: string;
    subheadline: string;
    technologies: Technology[];
}

interface HeroContent {
    headline: string;
    paragraph: string;
    ctaPrimary: string;
    ctaSecondary: string;
    backgroundImageUrl: string;
}

interface ProcessStep {
    title: string;
    description: string;
    icon: string; 
    deliverables: string[];
    tools: string[];
}

interface ProcessContent {
    headline: string;
    subheadline: string;
    steps: ProcessStep[];
}

interface WebsiteContent {
  header: {
    logoType: 'text' | 'image';
    logoText: string;
    logoImageUrlLight: string;
    logoImageUrlDark: string;
    contactButton: string;
  };
  hero: HeroContent;
  about: AboutContent;
  process: ProcessContent;
  portfolio: PortfolioItem[];
  tech_carousel: TechCarouselContent;
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
        contactButton: "Pedir Orçamento"
    },
    hero: {
        headline: "Desbloqueie o Potencial <br className=\"hidden md:block\" /> Digital da Sua Marca<span className=\"text-accent\">.</span>",
        paragraph: "Criamos experiências digitais autênticas que conectam, engajam e convertem. Da ideia ao lançamento, somos o parceiro que sua empresa precisa para decolar no mundo online.",
        ctaPrimary: "Inicie seu Projeto Agora",
        ctaSecondary: "Veja nossos projetos →",
        backgroundImageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1920&q=70&auto=format&fit=crop"
    },
    about: {
        headline: "Somos mais que uma agência, somos seu parceiro de <span class=\"text-accent\">crescimento</span>.",
        paragraph1: "Acreditamos que cada marca tem uma história única para contar. Nossa paixão é transformar essa história em experiências digitais que não só pareçam incríveis, mas que também funcionem perfeitamente, gerando resultados reais e duradouros.",
        paragraph2: "Combinamos design, tecnologia e estratégia para criar soluções sob medida que elevam sua presença online e conectam você ao seu público de maneira autêntica.",
        buttonText: "Fale com um Especialista",
        imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
        philosophyHeadline: "Nossa Filosofia: Criar o Extraordinário.",
        philosophyText: "Não nos contentamos com o 'bom o suficiente'. Mergulhamos fundo em cada projeto para entender sua essência e construir soluções digitais que não apenas atendam, mas superem as expectativas, gerando impacto real e duradouro.",
        valuesHeadline: "Valores que nos guiam",
        values: [
            { icon: 'handshake', title: 'Parceria Genuína', text: 'Vemos nossos clientes como parceiros. O seu sucesso é o nosso sucesso. Trabalhamos lado a lado, com transparência e comunicação constante.' },
            { icon: 'lightbulb', title: 'Inovação Constante', text: 'O mundo digital está sempre em movimento, e nós também. Estamos sempre explorando novas tecnologias e estratégias para manter sua marca à frente.' },
            { icon: 'diamond', title: 'Qualidade Obsessiva', text: 'Do menor pixel ao mais complexo algoritmo, nossa atenção aos detalhes garante um produto final impecável, performático e seguro.' },
            { icon: 'chart', title: 'Resultados Mensuráveis', text: 'Design e tecnologia são meios para um fim: o resultado. Focamos em métricas que importam para o seu negócio, otimizando para o crescimento.' }
        ],
        teamHeadline: "Conheça quem faz acontecer",
        teamMembers: [
            { imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop', name: 'Ana Oliveira', role: 'CEO & Estrategista' },
            { imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop', name: 'Bruno Costa', role: 'Líder de Desenvolvimento' },
            { imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop', name: 'Carla Dias', role: 'Designer UX/UI' },
        ]
    },
    process: {
        headline: "Da Ideia ao <span class=\"text-accent\">Impacto</span>.",
        subheadline: "Nossa metodologia é um processo colaborativo e transparente, desenhado para transformar sua visão em uma realidade digital de sucesso.",
        steps: [
            {
                title: "Imersão & Estratégia",
                description: "Mergulhamos fundo no seu negócio para entender seus desafios, público e objetivos. Esta fase é a fundação de todo o projeto, onde alinhamos expectativas e traçamos o caminho para o sucesso digital.",
                icon: "search",
                deliverables: ["Briefing Aprofundado", "Análise de Mercado", "Definição de KPIs", "Roadmap do Projeto"],
                tools: ["Miro", "Figma", "Google Analytics", "Notion"]
            },
            {
                title: "Design & UX/UI",
                description: "Com base na estratégia, criamos interfaces intuitivas e visualmente impactantes. Focamos em uma jornada de usuário que seja não apenas bonita, mas que também converta e encante.",
                icon: "design",
                deliverables: ["Wireframes e Fluxos", "Protótipos Interativos", "Design System", "Manual de Identidade Visual"],
                tools: ["Figma", "Adobe XD", "Illustrator", "Maze"]
            },
            {
                title: "Desenvolvimento",
                description: "Nossos desenvolvedores transformam o design em código limpo, performático e escalável. Usamos as tecnologias mais modernas para garantir um produto robusto, seguro e preparado para o futuro.",
                icon: "code",
                deliverables: ["Front-end Responsivo", "Back-end Robusto", "Integração de APIs", "Código Versionado (Git)"],
                tools: ["React", "TypeScript", "Node.js", "Supabase"]
            },
            {
                title: "Lançamento & Otimização",
                description: "Após testes rigorosos, lançamos o projeto. Mas nosso trabalho não para aqui. Monitoramos a performance, analisamos dados e propomos otimizações contínuas para garantir resultados crescentes.",
                icon: "launch",
                deliverables: ["Deploy em Produção", "Relatórios de Performance", "Plano de Melhorias", "Suporte Técnico"],
                tools: ["Google Analytics", "Clarity", "Vercel", "Sentry"]
            }
        ]
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
    ],
    tech_carousel: {
        headline: "Nossas Ferramentas de <span class=\"text-accent\">Trabalho</span>",
        subheadline: "Utilizamos as tecnologias mais modernas e robustas do mercado para construir soluções de ponta.",
        technologies: [
            { name: 'React', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348"><title>React Logo</title><circle cx="0" cy="0" r="2.05" fill="#61DAFB"/><g stroke="#61DAFB" stroke-width="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>` },
        ]
    },
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
            const { data: sectionsData, error: sectionsError } = await supabase.from('sections').select('id, content');
            const { data: portfolioData, error: portfolioError } = await supabase.from('portfolio').select('*').order('position', { ascending: true });

            if (sectionsError || portfolioError) {
                throw sectionsError || portfolioError;
            }
            
            if (!sectionsData || sectionsData.length === 0) {
                 console.warn("Nenhuma seção encontrada no banco de dados. Usando conteúdo padrão.");
                 setContent(defaultContent);
                 return;
            }

            const sections = sectionsData.reduce((acc, section) => {
                acc[section.id] = section.content;
                return acc;
            }, {} as { [key: string]: any });
            
            const fetchedContent: WebsiteContent = {
                header: sections.header || defaultContent.header,
                hero: sections.hero || defaultContent.hero,
                about: sections.about || defaultContent.about,
                process: sections.process || defaultContent.process,
                portfolio: portfolioData || defaultContent.portfolio,
                tech_carousel: sections.tech_carousel || defaultContent.tech_carousel,
                site_meta: sections.site_meta || defaultContent.site_meta,
                theme_settings: sections.theme_settings || defaultContent.theme_settings,
            };
            
            setContent(fetchedContent);
        } catch (error) {
            console.error("Erro ao buscar conteúdo:", error);
            setContent(defaultContent); // Fallback to default content on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleHashChange = () => setHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        }).finally(() => {
             fetchContent();
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (_event === 'SIGNED_OUT') {
                window.location.hash = '';
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [fetchContent]);

    useEffect(() => {
        if (hash === '' || hash === '#inicio') {
            const scrollToTarget = sessionStorage.getItem('scrollTo');
            if (scrollToTarget) {
                sessionStorage.removeItem('scrollTo');
                setTimeout(() => {
                    const element = document.querySelector(scrollToTarget);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        }
    }, [hash]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
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

    if (hash === '#login') {
        return <Login theme={theme} toggleTheme={toggleTheme} supabase={supabase} />;
    }

    if (hash === '#admin') {
        if (loading) return <SkeletonLoader />;
        if (!session) {
            window.location.hash = '#login';
            return <SkeletonLoader />;
        }
        if (!content) return <SkeletonLoader />;
        return <AdminDashboard theme={theme} toggleTheme={toggleTheme} supabase={supabase} initialContent={content} onSaveSuccess={fetchContent} session={session} />;
    }

    if (loading || !content) {
        return <SkeletonLoader />;
    }
    
    const renderMainContent = () => {
        switch (hash) {
            case '#sobre-nos':
                return <AboutPage content={content.about} />;
            case '#processo':
                return <ProcessPage content={content.process} />;
            default:
                return (
                    <>
                        <Hero content={content.hero} />
                        <Services />
                        <TechCarousel content={content.tech_carousel} />
                        <Portfolio items={content.portfolio} />
                        <Contact />
                    </>
                );
        }
    };
    
    return (
        <div id="inicio" className="bg-white dark:bg-primary transition-colors duration-300">
            <Header theme={theme} toggleTheme={toggleTheme} content={content.header} />
            <main>{renderMainContent()}</main>
            <Footer theme={theme} content={content.header} />
            <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-40">
                <WhatsAppButton />
                <BackToTopButton />
            </div>
        </div>
    );
};

export default App;