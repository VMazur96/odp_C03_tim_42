import { SessionDto } from "../../DTOs/sessions/SessionDto";

export interface ISessionService {
  napraviSesiju(creatorId: number, gameId: number, date: Date, durationMin: number, note: string | null, playerIds: number[]): Promise<number>;
  dohvatiSveSesijeKorisnika(userId: number): Promise<SessionDto[]>;
  dohvatiDetaljeSesije(id: number): Promise<SessionDto | null>;
  obrisiSesiju(id: number, creatorId: number): Promise<boolean>;
  azurirajIgraca(sessionId: number, userId: number, score: number | null, winner: boolean): Promise<boolean>;
  ukloniIgraca(sessionId: number, userId: number): Promise<boolean>;
  azurirajSesiju(id: number, creatorId: number, date: Date, durationMin: number, note: string | null): Promise<boolean>;
  dodajIgracaUSesiju(sessionId: number, userId: number): Promise<boolean>;
}