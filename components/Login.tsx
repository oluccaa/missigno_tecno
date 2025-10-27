import React, { useState } from "react";
import ThemeToggleButton from "./ThemeToggleButton";
import { SupabaseClient } from "@supabase/supabase-js";

type Theme = "light" | "dark";

type Props = {
  theme: Theme;
  toggleTheme: () => void;
  supabase: SupabaseClient;
};

const Login: React.FC<Props> = ({ theme, toggleTheme, supabase }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        setError(error.message || "E-mail ou senha inválidos.");
    } else {
        window.location.hash = "#admin";
    }
    
    setLoading(false);
  };

  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.hash = "";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-200 dark:from-primary dark:via-slate-800 dark:to-secondary animate-gradient-bg bg-[length:200%_200%] z-0" />
      <div className="absolute inset-0 bg-white/50 dark:bg-primary/50 z-0" />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <a
            href="#"
            onClick={goHome}
            className="text-4xl font-bold text-slate-900 dark:text-light"
          >
            MissigNo<span className="text-accent">.</span>
          </a>
        </div>

        <div className="bg-white dark:bg-secondary p-8 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-light mb-6">
            Acesso Restrito
          </h1>

          <form onSubmit={handleSubmit} noValidate autoComplete="on">
            <div className="mb-4">
              <label htmlFor="email" className="sr-only">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                required
                autoComplete="username"
                inputMode="email"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                autoComplete="current-password"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-4" role="alert" aria-live="polite">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover text-white font-bold text-lg py-3 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
