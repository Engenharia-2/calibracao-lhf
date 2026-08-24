import React, { useState } from 'react';
import './Login.css';

interface RegisterProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

export function Register({ onSuccess, onBackToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signatureBase64, setSignatureBase64] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSignatureBase64('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await (window as any).electron.authRegister(name, email, password, signatureBase64);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Erro ao realizar cadastro.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Criar Conta</h1>
          <p>Preencha os dados abaixo para se cadastrar no sistema.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome Completo</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="signature">Assinatura Digital (Opcional)</label>
            <input
              id="signature"
              type="file"
              accept="image/*"
              className="form-input"
              onChange={handleFileChange}
              disabled={isLoading}
              style={{ padding: '8px' }}
            />
            <small style={{ color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
              Anexe a foto (.png/.jpg) da sua rubrica para assinar relatórios como Técnico Responsável.
            </small>
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Cadastrando...</span>
              </>
            ) : (
              'Cadastrar'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Já possui uma conta?{' '}
            <button className="link-button" onClick={onBackToLogin}>
              Faça login
            </button>
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
