import db from "../../connection/DbConnectionPool";
import { IUserGameRepository } from "../../../Domain/repositories/user_games/IUserGameRepository";
import { UserGame } from "../../../Domain/models/UserGame";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class UserGameRepository implements IUserGameRepository {
  
  // Dodavanje igre u kolekciju (ili ažuriranje ako već postoji)
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

  // Dohvatanje kolekcije korisnika
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

            let mehanikeIgre: string[] = [];
            try {
                const [mechanicRows] = await db.execute<RowDataPacket[]>(
                    `SELECT m.name FROM mechanics m 
                     JOIN game_mechanics gm ON m.id = gm.mechanic_id 
                     WHERE gm.game_id = ?`, 
                    [ug.game_id]
                );
                mehanikeIgre = mechanicRows.map(row => row.name);
            } catch (error) {
                console.log(`Mehanike za igru ${ug.game_id} nisu pronađene.`);
            }

            if (gameRows.length > 0) {
                sastavljenaKolekcija.push({
                    userId: ug.user_id,
                    gameId: ug.game_id,
                    status: ug.status,
                    rating: ug.rating,
                    note: ug.note,
                    gameName: gameRows[0].name,
                    coverImage: gameRows[0].cover_image,
                    mechanics: mehanikeIgre 
                } as any); 
            }
        }

        return sastavljenaKolekcija;

    } catch (error) {
        console.error("Greska pri dohvatanju kolekcije:", error);
        throw error;
    }
  }

  // Izmenu igre
  async izmeniIgru(userId: number, gameId: number, status: string, rating: number | null, note: string | null): Promise<boolean> {
    try {
      const query = `UPDATE user_games SET status = ?, rating = ?, note = ? WHERE user_id = ? AND game_id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [status, rating, note, userId, gameId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greska pri izmeni igre:", error);
      return false;
    }
  }

  // Brisanje igre
  async obrisiIgru(userId: number, gameId: number): Promise<boolean> {
    try {
      const query = `DELETE FROM user_games WHERE user_id = ? AND game_id = ?`;
      const [result] = await db.execute<ResultSetHeader>(query, [userId, gameId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greska pri brisanju igre:", error);
      return false;
    }
  }
}