export interface IAuditService {
  dohvatiSveLogove(): Promise<any[]>;
  logAkcija(userId: number | null, action: string, details?: string): Promise<void>;
}