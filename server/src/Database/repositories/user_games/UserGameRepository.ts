import db from "../../connection/DbConnectionPool";
import { IUserGameRepository } from "../../../Domain/repositories/user_games/IUserGameRepository";
import { UserGame } from "../../../Domain/models/UserGame";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class UserGameRepository implements IUserGameRepository {
  
  async dodajUKolekciju(userGame: UserGame): Promise<boolean> {
    try {
      const query = `
        INSERT INTO user_games (user_id, game_id, status, rating, note) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = ?, rating = ?, note = ?
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        userGame.userId,
        userGame.gameId,
        userGame.status,
        userGame.rating,
        userGame.note,
        userGame.status,
        userGame.rating,
        userGame.note
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greska pri dodavanju u kolekciju:", error);
      return false;
    }
  }

  async dohvatiKolekcijuKorisnika(userId: number): Promise<UserGame[]> {
    try {
        const [userGamesRows] = await db.execute<RowDataPacket[]>(
            `SELECT user_id, game_id, status, rating, note 
             FROM user_games 
             WHERE user_id = ?`,
            [userId]
        );

        const sastavljenaKolekcija: UserGame[] = [];

        for (const ug of userGamesRows) {
            const [gameRows] = await db.execute<RowDataPacket[]>(
                `SELECT name, cover_image 
                 FROM games 
                 WHERE id = ?`,
                [ug.game_id]
            );

            if (gameRows.length > 0) {
                sastavljenaKolekcija.push({
                    userId: ug.user_id,
                    gameId: ug.game_id,
                    status: ug.status,
                    rating: ug.rating,
                    note: ug.note,
                    gameName: gameRows[0].name,
                    coverImage: gameRows[0].cover_image
                }); 
            }
        }

        return sastavljenaKolekcija;

    } catch (error) {
        console.error("Greska pri dohvatanju kolekcije:", error);
        throw error;
    }
  }
}