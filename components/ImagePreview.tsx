import React, { useState, useEffect } from 'react';

interface ImagePreviewProps {
  src: string | null | undefined;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ src }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset state whenever the src changes
    if (src) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const containerClasses = "flex-shrink-0 h-16 w-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden";
  const iconClasses = "h-8 w-8 text-slate-400 dark:text-slate-600";
  
  if (!src) {
    return (
      <div className={containerClasses} title="Nenhuma imagem fornecida">
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {isLoading && (
         <div role="status" className="h-full w-full animate-pulse bg-slate-200 dark:bg-slate-700" />
      )}
      {hasError && (
        <div title="Erro ao carregar imagem">
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
        </div>
      )}
      <img
        src={src}
        alt="Pré-visualização"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading || hasError ? 'hidden opacity-0' : 'opacity-100'}`}
        style={{ display: isLoading || hasError ? 'none' : 'block' }}
        loading="lazy"
      />
    </div>
  );
};

export default ImagePreview;