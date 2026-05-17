import db from "../../connection/DbConnectionPool";
import { IReviewRepository } from "../../../Domain/repositories/reviews/IReviewRepository";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ReviewDto } from "../../../Domain/DTOs/reviews/ReviewDto";

export class ReviewRepository implements IReviewRepository {
  async canUserReview(userId: number, gameId: number): Promise<boolean> {
    try {
      // Da li vec postoji recenzija ovog korisnika za ovu igru
      const [revRows] = await db.execute<RowDataPacket[]>('SELECT id FROM reviews WHERE user_id = ? AND game_id = ?', [userId, gameId]);
      if (revRows.length > 0) return false;

      // Da li korisnik ima ovu igru u svojoj kolekciji
      const [colRows] = await db.execute<RowDataPacket[]>('SELECT game_id FROM user_games WHERE user_id = ? AND game_id = ?', [userId, gameId]);
      if (colRows.length === 0) return false;

      return true;
    } catch {
      return false;
    }
  }

  // Kreiranje nove recenzije
  async create(gameId: number, userId: number, title: string, body: string, rating: number): Promise<boolean> {
    try {
      const query = `INSERT INTO reviews (game_id, user_id, title, body, rating) VALUES (?, ?, ?, ?, ?)`;
      const [result] = await db.execute<ResultSetHeader>(query, [gameId, userId, title, body, rating]);
      
      if (result.affectedRows > 0) {
        await db.execute('UPDATE user_games SET rating = ? WHERE user_id = ? AND game_id = ?', [rating, userId, gameId]);
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greska pri upisu recenzije:", error);
      return false;
    }
  }

  // Dohvatanje recenzija po ID-u igre
  async getByGameId(gameId: number): Promise<ReviewDto[]> {
    try {
      const query = `
        SELECT r.id, r.game_id, r.user_id as userId, r.title, r.body, r.rating, r.created_at as createdAt,
               u.username, u.profile_image as profileImage
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.game_id = ?
        ORDER BY r.created_at DESC
      `;
      const [rows] = await db.execute<RowDataPacket[]>(query, [gameId]);
      
      return rows as ReviewDto[];
    } catch (error) {
      return [];
    }
  }

  // Azuriranje recenzije
  async update(id: number, userId: number, title: string, body: string, rating: number): Promise<boolean> {
    try {
      const query = `UPDATE reviews SET title = ?, body = ?, rating = ? WHERE id = ? AND user_id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [title, body, rating, id, userId]);

      if (result.affectedRows > 0) {
        const [rev] = await db.execute<RowDataPacket[]>('SELECT game_id FROM reviews WHERE id = ?', [id]);
        if (rev.length > 0) {
          await db.execute('UPDATE user_games SET rating = ? WHERE user_id = ? AND game_id = ?', [rating, userId, rev[0].game_id]);
        }
      }
      return result.affectedRows > 0;
    } catch { return false; }
  }

  // Brisanje recenzije
  async delete(id: number, userId: number): Promise<boolean> {
    try {
      const query = `DELETE FROM reviews WHERE id = ? AND user_id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [id, userId]);
      return result.affectedRows > 0;
    } catch { return false; }
  }

  // Dohvatanje recenzija po ID-u korisnika
  async getByUserId(userId: number): Promise<ReviewDto[]> {
    try {
      const query = `
        SELECT r.id, r.game_id, r.user_id as userId, r.title, r.body, r.rating, r.created_at as createdAt,
               u.username, u.profile_image as profileImage,
               g.name as gameName 
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN games g ON r.game_id = g.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `;
      const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);
      return rows as unknown as ReviewDto[];
    } catch (error) {
      return [];
    }
  }
}