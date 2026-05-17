export interface IAuditRepository {
  getAllLogs(): Promise<any[]>;
  logAction(userId: number | null, action: string, details?: string): Promise<void>;
}