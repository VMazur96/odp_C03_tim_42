export interface IAuditRepository {
  getAllLogs(): Promise<Record<string, unknown>[]>;
  logAction(userId: number | null, action: string, details?: string): Promise<void>;
}