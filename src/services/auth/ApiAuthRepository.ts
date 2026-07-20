import type { IAuthRepository, AuthResult } from '../../domain/auth/IAuthRepository';

export class ApiAuthRepository implements IAuthRepository {
  private apiUrl = `${process.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/auth`;

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Falha no login' };
      }
      return { success: true, token: data.token, user: data.user };
    } catch (error: any) {
      return { success: false, error: 'Erro ao conectar à API' };
    }
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Falha no registro' };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Erro ao conectar à API' };
    }
  }
}
