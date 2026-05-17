import { IUserRepository } from "../../../Domain/repositories/users/IUserRepository";
import { User } from "../../../Domain/models/User";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class UserRepository implements IUserRepository {

  // Kreiranje novog korisnika
  async create(user: User): Promise<User> {
    try {
      const query = `
        INSERT INTO users (username, email, password_hash, full_name, profile_image, role) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute<ResultSetHeader>(query, [
        user.username,
        user.email,
        user.password_hash,
        user.full_name,
        user.profile_image,
        user.role
      ]);

      if (result.insertId) {
        return new User(result.insertId, user.username, user.email, user.password_hash, user.full_name, user.profile_image, user.role);
      }
      return new User();
    } catch (error) {
      console.error('Error creating user:', error);
      return new User();
    }
  }

  // Dohvatanje korisnika po ID-u
  async getById(id: number): Promise<User> {
    try {
      const query = `SELECT *FROM users WHERE id = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

      if (rows.length > 0) {
        const row = rows[0];
      return new User(row.id, row.username, row.email, row.password_hash, row.full_name, row.profile_image, row.role);
      }

      return new User();
    } catch {
      return new User();
    }
  }

  // Dohvatanje korisnika po username-u
  async getByUsername(username: string): Promise<User> {
    try {
      const query = `SELECT * FROM users WHERE username = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [username]);
      
      if (rows.length > 0) {
        const row = rows[0];
        return new User(row.id, row.username, row.email, row.password_hash, row.full_name, row.profile_image, row.role);
      }

      return new User();
    } catch (error) {
      console.log("user get by username: " + error);
      return new User();
    }
  }

  // Dohvatanje korisnika po email-u
  async getByEmail(email: string): Promise<User> {
    try {
      const query = `SELECT * FROM users WHERE email = ?`;
      const [rows] = await db.execute<RowDataPacket[]>(query, [email]);

      if (rows.length > 0) {
        const row = rows[0];
        return new User(row.id, row.username, row.email, row.password_hash, row.full_name, row.profile_image, row.role);
      }
      return new User();
    } catch {
      return new User();
    }
  }

  // Dohvatanje svih korisnika
  async getAll(): Promise<User[]> {
    try {
      const query = `SELECT id, username, email, role FROM users ORDER BY id ASC`;
      const [rows] = await db.execute<RowDataPacket[]>(query);

      return rows.map(r => ({
          id: r.id,
          username: r.username,
          email: r.email,
          role: r.role
      } as User));
    } catch (error) {
      console.error("Greška pri dohvatanju svih korisnika:", error);
      return [];
    }
  }

  // Ažuriranje korisnika
  async update(user: User): Promise<User> {
    try {
      const query = `
        UPDATE users 
        SET username = ?, email = ?, password_hash = ?, full_name = ?, profile_image = ?, role = ?
        WHERE id = ?
      `;

      const [result] = await db.execute<ResultSetHeader>(query, [
        user.username,
        user.email,
        user.password_hash,
        user.full_name,
        user.profile_image,
        user.role,
        user.id,
      ]);

      if (result.affectedRows > 0) {
        return user;
      }
      return new User();
    } catch {
      return new User();
    }
  }

  // Brisanje korisnika
  async delete(id: number): Promise<boolean> {
    try {
      const query = `
        DELETE FROM users 
        WHERE id = ?
      `;

      const [result] = await db.execute<ResultSetHeader>(query, [id]);

      return result.affectedRows > 0;
    } catch {
      return false;
    }
  }

  // Provera postojanja korisnika po ID-u
  async exists(id: number): Promise<boolean> {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM users 
        WHERE id = ?
      `;

      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

      return rows[0].count > 0;
    } catch {
      return false;
    }
  }

  // Pretraga korisnika po imenu
  async pretragaKorisnika(query: string): Promise<{ id: number; username: string; profile_image: string | null }[]> {
    try {
      const sql = 'SELECT id, username, profile_image FROM users WHERE username LIKE ? LIMIT 10';
      const [rows] = await db.execute(sql, [`%${query}%`]);
      return rows as { id: number; username: string; profile_image: string | null }[];
    } catch (error) {
      console.error("Greska pri pretrazi korisnika:", error);
      return [];
    }
  }

  // Ažuriranje lozinke i/ili profilne slike korisnika
  async updateUser(userId: number, passwordHash?: string, profileImage?: string): Promise<boolean> {
    try {
      const updates = [];
      const params = [];
      
      if (passwordHash) {
        updates.push('password_hash = ?');
        params.push(passwordHash);
      }
      if (profileImage) {
        updates.push('profile_image = ?');
        params.push(profileImage);
      }
      
      if (updates.length === 0) return true;

      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      params.push(userId);
      
      const [result] = await db.execute<ResultSetHeader>(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greska pri azuriranju profila:", error);
      return false;
    }
  }

  // Dohvatanje hash-a lozinke korisnika
  async getPasswordHash(userId: number): Promise<string | null> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>('SELECT password_hash FROM users WHERE id = ?', [userId]);
      if (rows.length > 0) return rows[0].password_hash;
      return null;
    } catch {
      return null;
    }
  }

  // Promena uloge korisnika
  async updateRole(id: number, newRole: string): Promise<boolean> {
    try {
      const query = `UPDATE users SET role = ? WHERE id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [newRole, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greška pri promeni uloge korisnika:", error);
      return false;
    }
  }
}