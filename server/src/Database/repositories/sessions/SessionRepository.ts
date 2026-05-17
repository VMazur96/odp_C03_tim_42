import db from "../../connection/DbConnectionPool";
import { ISessionRepository } from "../../../Domain/repositories/sessions/ISessionRepository";
import { Session } from "../../../Domain/models/Session";
import { SessionPlayer } from "../../../Domain/models/SessionPlayer";
import { SessionDto, SessionPlayerDto } from "../../../Domain/DTOs/sessions/SessionDto";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class SessionRepository implements ISessionRepository {
  
  // Kreiranje nove sesije
  async createSession(session: Session): Promise<number> {
    try {
      const query = `
        INSERT INTO sessions (creator_id, game_id, played_at, duration_minutes, notes)
        VALUES (?, ?, ?, ?, ?)
      `;
      const mysqlDate = session.date.toISOString().slice(0, 19).replace('T', ' ');

      const [result] = await db.execute<ResultSetHeader>(query, [
        session.creatorId,
        session.gameId,
        mysqlDate,
        session.durationMin,
        session.note
      ]);

      return result.insertId;
    } catch (error) {
      console.error("Greska pri kreiranju sesije:", error);
      return 0;
    }
  }

  // Dohvatanje sesije po ID-u sa detaljima o igri i igracima
  async getSessionById(id: number): Promise<SessionDto | null> {
    try {
      const sessionQuery = `
        SELECT s.id, s.creator_id, s.game_id, s.played_at as date, s.duration_minutes as duration_min, s.notes as note,
               g.name as gameName, g.cover_image as coverImage
        FROM sessions s
        JOIN games g ON s.game_id = g.id
        WHERE s.id = ?
      `;
      const [sessionRows] = await db.execute<RowDataPacket[]>(sessionQuery, [id]);

      if (sessionRows.length === 0) return null;
      const s = sessionRows[0];

      const playersQuery = `
        SELECT sp.user_id, sp.score, sp.winner, u.username, u.profile_image 
        FROM session_players sp
        JOIN users u ON sp.user_id = u.id
        WHERE sp.session_id = ?
      `;
      const [playerRows] = await db.execute<RowDataPacket[]>(playersQuery, [id]);

      const players: SessionPlayerDto[] = playerRows.map(p => ({
        userId: p.user_id,
        username: p.username,
        score: p.score,
        winner: Boolean(p.winner),
        profileImage: p.profile_image // ISPRAVLJENO
      }));

      return {
        id: s.id,
        creatorId: s.creator_id,
        gameId: s.game_id,
        gameName: s.gameName,
        coverImage: s.coverImage,
        date: new Date(s.date).toISOString(),
        durationMin: s.duration_min,
        note: s.note,
        players: players
      };

    } catch (error) {
      console.error("Greska pri dohvatanju sesije:", error);
      return null;
    }
  }

  // Dohvatanje svih sesija koje je korisnik odigrao
  async getUserSessions(userId: number): Promise<SessionDto[]> {
    try {
      const query = `
        SELECT s.id
        FROM sessions s
        JOIN session_players sp ON s.id = sp.session_id
        WHERE sp.user_id = ?
        ORDER BY s.played_at DESC
      `;
      const [sessionIds] = await db.execute<RowDataPacket[]>(query, [userId]);

      const result: SessionDto[] = [];
      for (const row of sessionIds) {
        const sessionDetails = await this.getSessionById(row.id);
        if (sessionDetails) {
          result.push(sessionDetails);
        }
      }
      return result;
    } catch (error) {
      console.error("Greska pri dohvatanju sesija korisnika:", error);
      return [];
    }
  }

  // Azuriranje sesije
  async updateSession(session: Session): Promise<boolean> {
    try {
      const mysqlDate = session.date.toISOString().slice(0, 19).replace('T', ' ');
      const query = `
        UPDATE sessions 
        SET played_at = ?, duration_minutes = ?, notes = ? 
        WHERE id = ? AND creator_id = ?
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        mysqlDate, session.durationMin, session.note, session.id, session.creatorId
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greska pri azuriranju sesije:", error);
      return false;
    }
  }

  // Brisanje sesije
  async deleteSession(id: number, creatorId: number): Promise<boolean> {
    try {
      const [rows] = await db.execute<RowDataPacket[]>('SELECT creator_id FROM sessions WHERE id = ?', [id]);
      if (rows.length === 0 || rows[0].creator_id !== creatorId) {
        return false;
      }
      await db.execute('DELETE FROM session_players WHERE session_id = ?', [id]);
      await db.execute('DELETE FROM sessions WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error("Greska pri brisanju sesije:", error);
      return false;
    }
  }

  // Dodavanje igraca u sesiju
  async addPlayer(sp: SessionPlayer): Promise<boolean> {
    try {
      const query = `
        INSERT INTO session_players (session_id, user_id, score, winner)
        VALUES (?, ?, ?, ?)
      `;
      await db.execute(query, [sp.sessionId, sp.userId, sp.score, sp.winner ? 1 : 0]);
      return true;
    } catch (error) {
      console.error("Greska pri dodavanju igraca:", error);
      return false;
    }
  }

  // Azuriranje rezultata igraca u sesiji
  async updatePlayer(sp: SessionPlayer): Promise<boolean> {
    try {
      const query = `
        UPDATE session_players 
        SET score = ?, winner = ? 
        WHERE session_id = ? AND user_id = ?
      `;
      const [result] = await db.execute<ResultSetHeader>(query, [
        sp.score, sp.winner ? 1 : 0, sp.sessionId, sp.userId
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greska pri azuriranju igraca:", error);
      return false;
    }
  }

  // Uklanjanje igraca iz sesije
  async removePlayer(sessionId: number, userId: number): Promise<boolean> {
    try {
      const query = 'DELETE FROM session_players WHERE session_id = ? AND user_id = ?';
      const [result] = await db.execute<ResultSetHeader>(query, [sessionId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Greska pri uklanjanju igraca iz sesije:", error);
      return false;
    }
  }
}