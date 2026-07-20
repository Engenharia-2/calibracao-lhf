import type { IAuthRepository, AuthResult } from './IAuthRepository';

export class AuthService {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      return { success: false, error: 'E-mail e senha são obrigatórios' };
    }
    return this.authRepository.login(email, password);
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    if (!name || !email || !password) {
      return { success: false, error: 'Todos os campos são obrigatórios' };
    }
    return this.authRepository.register(name, email, password);
  }
}
