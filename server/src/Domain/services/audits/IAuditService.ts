export interface IAuditService {
  dohvatiSveLogove(): Promise<Record<string, unknown>[]>;
  logAkcija(userId: number | null, action: string, details?: string): Promise<void>;
}