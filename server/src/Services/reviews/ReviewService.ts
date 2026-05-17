import { IReviewService } from "../../Domain/services/reviews/IReviewService";
import { IReviewRepository } from "../../Domain/repositories/reviews/IReviewRepository";
import { ReviewDto } from "../../Domain/DTOs/reviews/ReviewDto";

export class ReviewService implements IReviewService {
  constructor(private reviewRepo: IReviewRepository) {}

  // Dodavanje recenzije sa validacijom
  async dodajRecenziju(userId: number, gameId: number, title: string, body: string, rating: number): Promise<boolean> {
    
    if (!body || body.trim().length < 50 || body.trim().length > 3000) {
      throw new Error("Recenzija mora imati najmanje 50 karaktera");
    }

    const mozeDaOstavi = await this.reviewRepo.canUserReview(userId, gameId);
    if (!mozeDaOstavi) {
      throw new Error("Već ste napisali recenziju za ovu igru");
    }

    return await this.reviewRepo.create(gameId, userId, title, body, rating);
  }

  // Dohvatanje recenzija za igru
  async dohvatiZaIgru(gameId: number): Promise<ReviewDto[]> {
    return await this.reviewRepo.getByGameId(gameId);
  }

  // Izmena recenzije
  async izmeniRecenziju(id: number, userId: number, title: string, body: string, rating: number): Promise<boolean> {
    return await this.reviewRepo.update(id, userId, title, body, rating);
  }

  // Brisanje recenzije
  async obrisiRecenziju(id: number, userId: number): Promise<boolean> {
    return await this.reviewRepo.delete(id, userId);
  }

  // Dohvatanje recenzija koje je napisao korisnik
  async dohvatiMojeRecenzije(userId: number): Promise<ReviewDto[]> {
    return await this.reviewRepo.getByUserId(userId);
  }
}