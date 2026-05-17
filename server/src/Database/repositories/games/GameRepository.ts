import { IGameRepository } from "../../../Domain/repositories/games/IGameRepository";
import { Game } from "../../../Domain/models/Game";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class GameRepository implements IGameRepository {
  
  // Dodavanje nove igre u bazu
  async create(game: Game, mechanicIds: number[]): Promise<Game> {
    try {
      // 1. Upisujemo igru u tabelu games
      const queryGame = `
        INSERT INTO games 
        (name, description, min_players, max_players, duration_min, weight, release_year, publisher, cover_image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute<ResultSetHeader>(queryGame, [
        game.name, game.description, game.min_players, game.max_players,
        game.duration_min, game.weight, game.release_year, game.publisher, game.cover_image
      ]);

      const noviGameId = result.insertId;
      game.id = noviGameId; 

      // 2. Upisujemo mehanike u veznu tabelu
      if (mechanicIds && mechanicIds.length > 0) {
        for (const mechId of mechanicIds) {
          const queryMech = 'INSERT INTO game_mechanics (game_id, mechanic_id) VALUES (?, ?)';
          await db.execute(queryMech, [noviGameId, mechId]);
        }
      }

      return game;
    } catch (error) {
      console.error("Greška pri upisu igre u bazu:", error);
      throw new Error("Greška na bazi podataka.");
    }
  }

  // Pronalazenje igre po ID-u (SADA RACUNA PROSEK I VUCE MEHANIKE)
  async getById(id: number): Promise<Game | null> {
    try {
      const query = `
        SELECT g.*, 
               (SELECT AVG(rating) FROM user_games WHERE game_id = g.id AND rating IS NOT NULL) as average_rating,
               (SELECT GROUP_CONCAT(m.name SEPARATOR ',') FROM mechanics m JOIN game_mechanics gm ON m.id = gm.mechanic_id WHERE gm.game_id = g.id) as mechanics_list
        FROM games g 
        WHERE g.id = ?
      `;
      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

      if (rows.length > 0) {
        const r = rows[0];
        // Ne koristimo strogo "new Game()" da bismo mogli da pošaljemo i nova polja
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          min_players: r.min_players,
          max_players: r.max_players,
          duration_min: r.duration_min,
          weight: r.weight,
          release_year: r.release_year,
          publisher: r.publisher,
          cover_image: r.cover_image,
          average_rating: r.average_rating ? parseFloat(Number(r.average_rating).toFixed(1)) : null,
          mechanics: r.mechanics_list ? r.mechanics_list.split(',') : []
        } as unknown as Game;
      }
      return null;
    } catch (error) {
      console.error("Greska pri pronalazenju igre:", error);
      return null;
    }
  }

  // Pronalazenje svih igara za katalog
  async getAll(): Promise<Game[]> {
    try {
      const query = `
        SELECT g.*, 
               (SELECT AVG(rating) FROM user_games WHERE game_id = g.id AND rating IS NOT NULL) as average_rating,
               (SELECT GROUP_CONCAT(m.name SEPARATOR ',') FROM mechanics m JOIN game_mechanics gm ON m.id = gm.mechanic_id WHERE gm.game_id = g.id) as mechanics_list
        FROM games g 
        ORDER BY g.name ASC
      `;
      const [rows] = await db.execute<RowDataPacket[]>(query);

      return rows.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        min_players: r.min_players,
        max_players: r.max_players,
        duration_min: r.duration_min,
        weight: r.weight,
        release_year: r.release_year,
        publisher: r.publisher,
        cover_image: r.cover_image,
        average_rating: r.average_rating ? parseFloat(Number(r.average_rating).toFixed(1)) : null,
        mechanics: r.mechanics_list ? r.mechanics_list.split(',') : []
      } as unknown as Game));
    } catch (error) {
      console.error("Greska pri pronalazenju svih igara:", error);
      return [];
    }
  }

  // Azuriranje postojece igre
  async update(game: Game, mechanicIds: number[]): Promise<Game> {
    try {
      const query = `
        UPDATE games 
        SET name=?, description=?, min_players=?, max_players=?, 
            duration_min=?, weight=?, release_year=?, publisher=?, cover_image=?
        WHERE id=?
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        game.name, game.description, game.min_players, game.max_players,
        game.duration_min, game.weight, game.release_year, game.publisher, 
        game.cover_image, game.id
      ]);

      if (result.affectedRows === 0) {
        return new Game();
      }

      const queryDeleteMechs = 'DELETE FROM game_mechanics WHERE game_id = ?';
      await db.execute(queryDeleteMechs, [game.id]);

      if (mechanicIds && mechanicIds.length > 0) {
        for (const mechId of mechanicIds) {
          const queryInsertMech = 'INSERT INTO game_mechanics (game_id, mechanic_id) VALUES (?, ?)';
          await db.execute(queryInsertMech, [game.id, mechId]);
        }
      }

      return game;
    } catch (error) {
      console.error("Greška pri ažuriranju igre:", error);
      throw new Error("Greška na bazi podataka prilikom ažuriranja.");
    }
  }

  // Brisanje igre po ID-u
  async delete(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM games WHERE id = ?';
      const [result] = await db.execute<ResultSetHeader>(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greška pri brisanju igre:", error);
      return false;
    }
  }

  // Provera da li je igra u upotrebi
  async isGameInUse(id: number): Promise<boolean> {
    try {
      const query = 'SELECT COUNT(*) as count FROM user_games WHERE game_id = ?';
      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
      return rows[0].count > 0;
    } catch (error) {
      console.error("Greška pri proveri upotrebe igre:", error);
      return true;
    }
  }
}