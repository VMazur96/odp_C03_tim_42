import db from '../../connection/DbConnectionPool';
import { IMechanicRepository } from '../../../Domain/repositories/mechanics/IMechanicRepository';
import { Mechanic } from '../../../Domain/models/Mechanic';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class MechanicRepository implements IMechanicRepository {
  
  // Pronalazenje svih mehanika
  async getAll(): Promise<Mechanic[]> {
    const query = 'SELECT * FROM mechanics ORDER BY name ASC';
    const [rows] = await db.execute<RowDataPacket[]>(query);
    return rows as Mechanic[];
  }

  // Dodavanje nove mehanike
  async add(name: string): Promise<Mechanic | null> {
    try {
      const query = 'INSERT INTO mechanics (name) VALUES (?)';
      const [result] = await db.execute<ResultSetHeader>(query, [name]);
      return { id: result.insertId, name };
    } catch (error) {
      return null;
    }
  }

  // Proverava da li se mehanika koristi u veznoj tabeli
  async isAssignedToGame(id: number): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM game_mechanics WHERE mechanic_id = ?';
    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
    return rows[0].count > 0;
  }

  // Brisanje mehanike
  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM mechanics WHERE id = ?';
    const [result] = await db.execute<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }
}