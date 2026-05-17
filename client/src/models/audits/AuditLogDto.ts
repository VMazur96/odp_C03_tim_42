export interface AuditLogDto {
  id: number;
  action: string;
  details: string;
  created_at: string;
  username: string | null;
}