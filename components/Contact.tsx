import React, { useState } from 'react';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('');

    const validate = (): boolean => {
        const newErrors = { name: '', email: '', message: '' };
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'O nome é obrigatório.';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'O e-mail é obrigatório.';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Formato de e-mail inválido.';
            isValid = false;
        }

        if (!formData.message.trim()) {
            newErrors.message = 'A mensagem é obrigatória.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let error = '';

        switch (name) {
            case 'name':
                if (!value.trim()) error = 'O nome é obrigatório.';
                break;
            case 'email':
                if (!value.trim()) {
                    error = 'O e-mail é obrigatório.';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Formato de e-mail inválido.';
                }
                break;
            case 'message':
                if (!value.trim()) error = 'A mensagem é obrigatória.';
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setStatus('Enviando...');
        try {
            const response = await fetch("https://formspree.io/f/xpwoawey", {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setStatus('Mensagem enviada com sucesso!');
                setFormData({ name: '', email: '', message: '' });
                setErrors({ name: '', email: '', message: '' });
                setTimeout(() => setStatus(''), 3000);
            } else {
                setStatus('Ocorreu um erro ao enviar. Tente novamente.');
                 setTimeout(() => setStatus(''), 5000);
            }
        } catch (error) {
            console.error("Erro ao enviar formulário:", error);
            setStatus('Ocorreu um erro de rede. Tente novamente.');
            setTimeout(() => setStatus(''), 5000);
        }
    };

    return (
        <section id="contato" className="py-20 sm:py-28 bg-slate-50 dark:bg-primary">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-light">
                        Vamos Construir Algo <span className="text-accent">Incrível</span> Juntos?
                    </h2>
                    <p className="mt-4 text-lg text-slate-500 dark:text-muted max-w-2xl mx-auto">
                        Entre em contato e vamos transformar sua ideia em realidade.
                    </p>
                </div>
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label htmlFor="name" className="sr-only">Nome</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Seu nome"
                                required
                                aria-invalid={!!errors.name}
                                aria-describedby="name-error"
                                className={`w-full bg-white dark:bg-secondary border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`}
                            />
                            {errors.name && <p id="name-error" className="mt-2 text-sm text-red-600" role="alert">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Seu e-mail"
                                required
                                aria-invalid={!!errors.email}
                                aria-describedby="email-error"
                                className={`w-full bg-white dark:bg-secondary border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`}
                            />
                            {errors.email && <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="message" className="sr-only">Mensagem</label>
                            <textarea
                                name="message"
                                id="message"
                                rows={5}
                                value={formData.message}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Sua mensagem"
                                required
                                aria-invalid={!!errors.message}
                                aria-describedby="message-error"
                                className={`w-full bg-white dark:bg-secondary border rounded-lg px-4 py-3 text-slate-900 dark:text-light placeholder-slate-400 dark:placeholder-muted focus:outline-none focus:ring-2 transition-colors ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-accent'}`}
                            ></textarea>
                            {errors.message && <p id="message-error" className="mt-2 text-sm text-red-600" role="alert">{errors.message}</p>}
                        </div>
                        <div className="text-center">
                            <button
                                type="submit"
                                className="bg-accent hover:bg-accent-hover text-white font-bold text-lg py-3 px-10 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={status === 'Enviando...'}
                            >
                                {status === 'Enviando...' ? 'Enviando...' : 'Enviar Mensagem'}
                            </button>
                        </div>
                    </form>
                    {status && status !== 'Enviando...' && (
                        <p 
                          aria-live="polite"
                          className={`mt-4 text-center ${status.includes('sucesso') ? 'text-green-500' : 'text-red-500'}`}
                        >
                            {status}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Contact;