import React, { useState, useRef } from 'react';
import './Login.css';

interface LoginProps {
  onSuccess: (user?: { name: string; email: string }) => void;
  onGoToRegister: () => void;
}

export function Login({ onSuccess, onGoToRegister }: LoginProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Usando o window.electron fornecido no preload.ts
      // @ts-ignore
      const result = await (window as any).electron.authLogin(email, password);

      if (result.success) {
        onSuccess(result.user);
      } else {
        setError(result.error || 'Usuário ou senha inválidos.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao realizar login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Calibração LHF</h1>
          <p>Entre com suas credenciais para acessar o sistema.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="text"
              className="form-input"
              ref={emailRef}
              placeholder="Digite seu e-mail"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="form-input"
              ref={passwordRef}
              placeholder="Digite sua senha"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Entrando...</span>
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Não tem uma conta?{' '}
            <button type="button" className="link-button" onClick={onGoToRegister}>
              Cadastre-se
            </button>
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
