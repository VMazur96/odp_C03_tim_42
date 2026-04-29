import { IGameRepository } from "../../../Domain/repositories/games/IGameRepository";
import { Game } from "../../../Domain/models/Game";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../../connection/DbConnectionPool";

export class GameRepository implements IGameRepository {
  
  // Dodavanje nove igre u bazu
  async create(game: Game): Promise<Game> {
    try {
      const query = `
        INSERT INTO games (
          name, description, min_players, max_players, 
          duration_min, weight, release_year, publisher, cover_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        game.name, game.description, game.min_players, game.max_players,
        game.duration_min, game.weight, game.release_year, game.publisher, game.cover_image
      ]);

      if (result.insertId) {
        game.id = result.insertId;
        return game;
      }
      return new Game();
    } catch (error) {
      console.error("Greska pri kreiranju igre:", error);
      return new Game();
    }
  }

  // Pronalazenje igre po ID-u
  async getById(id: number): Promise<Game | null> {
    try {
      const query = 'SELECT * FROM games WHERE id = ?';
      const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

      if (rows.length > 0) {
        const r = rows[0];
        return new Game(
          r.id, r.name, r.description, r.min_players, r.max_players,
          r.duration_min, r.weight, r.release_year, r.publisher, r.cover_image
        );
      }
      return null;
    } catch (error) {
      console.error("Greska pri pronalazenju igre:", error);
      return null;
    }
  }

  // Pronalazenje svih igara (za katalog)
  async getAll(): Promise<Game[]> {
    try {
      const query = 'SELECT * FROM games ORDER BY name ASC';
      const [rows] = await db.execute<RowDataPacket[]>(query);

      return rows.map(r => new Game(
        r.id, r.name, r.description, r.min_players, r.max_players,
        r.duration_min, r.weight, r.release_year, r.publisher, r.cover_image
      ));
    } catch (error) {
      console.error("Greska pri pronalazenju svih igara:", error);
      return [];
    }
  }

  // Azuriranje postojece igre
  async update(game: Game): Promise<Game> {
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

      if (result.affectedRows > 0) {
        return game;
      }
      return new Game();
    } catch (error) {
      console.error("Greska pri azuriranju igre:", error);
      return new Game();
    }
  }

  // Brisanje igre po ID-u
  async delete(id: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM games WHERE id = ?';
      const [result] = await db.execute<ResultSetHeader>(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greska pri brisanju igre:", error);
      return false;
    }
  }
}