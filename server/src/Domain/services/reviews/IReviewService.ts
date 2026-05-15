import { ReviewDto } from "../../DTOs/reviews/ReviewDto";

export interface IReviewService {
  dodajRecenziju(userId: number, gameId: number, title: string, body: string, rating: number): Promise<boolean>;
  dohvatiZaIgru(gameId: number): Promise<ReviewDto[]>;
  izmeniRecenziju(id: number, userId: number, title: string, body: string, rating: number): Promise<boolean>;
  obrisiRecenziju(id: number, userId: number): Promise<boolean>;
  dohvatiMojeRecenzije(userId: number): Promise<ReviewDto[]>;
}