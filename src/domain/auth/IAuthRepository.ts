export interface AuthResult {
  success: boolean;
  token?: string;
  user?: {
    name: string;
    email: string;
  };
  error?: string;
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<AuthResult>;
  register(name: string, email: string, password: string, signatureBase64?: string): Promise<AuthResult>;
}
