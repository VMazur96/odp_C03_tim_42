import type { AuthResponse } from "../../types/auth/AuthResponse";

/**
 * Interfejs za Auth API servis.
 */
export interface IAuthAPIService {
  prijava(username: string, password: string): Promise<AuthResponse>;
  registracija(username: string, email: string, password: string, fullName: string): Promise<AuthResponse>;
}