import db from "../../connection/DbConnectionPool";
import { IUserGameRepository } from "../../../Domain/repositories/user_games/IUserGameRepository";
import { UserGame } from "../../../Domain/models/UserGame";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class UserGameRepository implements IUserGameRepository {
  
  async dodajUKolekciju(userGame: UserGame): Promise<boolean> {
    try {
      const query = `
        INSERT INTO user_games (user_id, game_id, status, rating) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = ?, rating = ?
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        userGame.userId,
        userGame.gameId,
        userGame.status,
        userGame.rating,
        userGame.status,
        userGame.rating
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greska pri dodavanju u kolekciju:", error);
      return false;
    }
  }

  async dohvatiKolekcijuKorisnika(userId: number): Promise<UserGame[]> {
    try {
      const query = `
        SELECT ug.user_id, ug.game_id, ug.status, ug.rating, g.name as gameName, g.cover_image as coverImage
        FROM user_games ug
        JOIN games g ON ug.game_id = g.id
        WHERE ug.user_id = ?
      `;
      const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);
      
      return rows.map(r => new UserGame(
        r.user_id,
        r.game_id,
        r.status,
        r.rating,
        r.gameName,
        r.coverImage
      ));
    } catch (error) {
      console.error("Greska pri dohvatanju kolekcije:", error);
      return [];
    }
  }
}