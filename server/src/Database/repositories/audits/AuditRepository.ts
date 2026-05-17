import db from "../../connection/DbConnectionPool";
import { RowDataPacket } from "mysql2";

export class AuditRepository {
  // Dohvatanje svih audit logova sa informacijom o korisniku
  async getAllLogs(): Promise<any[]> {
    try {
      const query = `
        SELECT a.id, a.action, a.details, a.created_at, u.username 
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
      `;
      const [rows] = await db.execute<RowDataPacket[]>(query);
      return rows;
    } catch (error) {
      console.error("Greška pri dohvatanju audit logova:", error);
      return [];
    }
  }

  // Logovanje akcije u audit log
  async logAction(userId: number | null, action: string, details: string = ""): Promise<void> {
    try {
      const query = `INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)`;
      await db.execute(query, [userId, action, details]);
    } catch (error) {
      console.error("Greška pri upisu u audit log:", error);
    }
  }
}