import { AuditRepository } from "../../Database/repositories/audits/AuditRepository";

export class AuditService {
  constructor(private auditRepo: AuditRepository) {}

  // Dohvatanje svih logova
  async dohvatiSveLogove(): Promise<Record<string, unknown>[]> {
    return await this.auditRepo.getAllLogs();
  }
  
  // Logovanje akcije
  async logAkcija(userId: number | null, action: string, details: string = ""): Promise<void> {
    await this.auditRepo.logAction(userId, action, details);
  }
}