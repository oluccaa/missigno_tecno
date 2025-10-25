import React from "react";

const Footer: React.FC = () => {
  const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.hash = "#login"; // ESSENCIAL!
  };

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
          <div className="text-2xl font-bold text-slate-900 dark:text-light order-first md:order-last">
            MissigNo<span className="text-accent">.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
