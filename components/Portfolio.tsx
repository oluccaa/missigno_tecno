import React, { useState, useMemo } from 'react';
import PortfolioModal from './PortfolioModal'; // Importando o novo componente de modal

interface Technology {
    name: string;
    icon: string;
}

interface PortfolioItemProps {
    id?: string;
    imageurl: string;
    title: string;
    category: string;
    technologies?: Technology[];
    desafio?: string;
    solucao?: string;
    resultados?: string;
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

const PortfolioItem: React.FC<PortfolioItemProps & { onClick: () => void }> = ({ imageurl, title, category, onClick }) => {
    const optimizedImageUrl = optimizeImageUrl(imageurl, { width: 800, quality: 80 });
    return (
        <button 
            onClick={onClick}
            className="group relative overflow-hidden rounded-lg shadow-lg h-full w-full text-left focus:outline-none focus:ring-4 focus:ring-accent/50 focus:ring-offset-4 focus:ring-offset-slate-50 dark:focus:ring-offset-primary"
            aria-label={`Ver detalhes do projeto: ${title}`}
        >
            <img src={optimizedImageUrl} alt={title} className="w-full h-full aspect-video object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 group-hover:from-black/90"></div>
            <div className="absolute bottom-0 left-0 p-6">
                <span className="text-sm text-accent font-semibold">{category}</span>
                <h3 className="text-xl font-bold text-light mt-1">{title}</h3>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-bold border-2 border-white rounded-full px-4 py-2">Ver Detalhes</span>
            </div>
        </button>
    );
};

interface PortfolioProps {
    items: PortfolioItemProps[];
}

const Portfolio: React.FC<PortfolioProps> = ({ items }) => {
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedItem, setSelectedItem] = useState<PortfolioItemProps | null>(null);

    const categories = useMemo(() => {
        const uniqueCategories = new Set(items.map(item => item.category).filter(Boolean));
        return ['Todos', ...Array.from(uniqueCategories)];
    }, [items]);

    const filteredItems = useMemo(() => {
        if (selectedCategory === 'Todos') {
            return items;
        }
        return items.filter(item => item.category === selectedCategory);
    }, [items, selectedCategory]);
    
    const openModal = (item: PortfolioItemProps) => {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      setSelectedItem(item);
    };

    const closeModal = () => {
      document.body.style.overflow = ''; // Restore scrolling
      setSelectedItem(null);
    };

    return (
        <>
            <section id="portfolio" className="py-20 sm:py-28 bg-slate-50 dark:bg-primary">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12" data-aos="fade-up">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-light">
                            Projetos que <span className="text-accent">Falam por Si</span>
                        </h2>
                        <p className="mt-4 text-lg text-slate-500 dark:text-muted max-w-2xl mx-auto">
                            Confira alguns dos trabalhos que nos enchem de orgulho.
                        </p>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-12" data-aos="fade-up" data-aos-delay="100">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-offset-primary ${
                                    selectedCategory === category
                                        ? 'bg-accent text-white shadow-lg'
                                        : 'bg-white dark:bg-secondary text-slate-600 dark:text-muted hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Portfolio Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredItems.map((item, index) => (
                            <div key={item.id || index} data-aos="fade-up" data-aos-delay={index > 5 ? '0' : (index * 100)}>
                                <PortfolioItem {...item} onClick={() => openModal(item)} />
                            </div>
                        ))}
                        {filteredItems.length === 0 && (
                            <p className="col-span-full text-center text-slate-500 dark:text-muted py-8">
                                Nenhum projeto encontrado para esta categoria.
                            </p>
                        )}
                    </div>
                </div>
            </section>
            {selectedItem && (
                <PortfolioModal item={selectedItem} onClose={closeModal} />
            )}
        </>
    );
};

export default Portfolio;