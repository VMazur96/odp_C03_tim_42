import { IReviewService } from "../../Domain/services/reviews/IReviewService";
import { IReviewRepository } from "../../Domain/repositories/reviews/IReviewRepository";
import { ReviewDto } from "../../Domain/DTOs/reviews/ReviewDto";

export class ReviewService implements IReviewService {
  constructor(private reviewRepo: IReviewRepository) {}

  async dodajRecenziju(userId: number, gameId: number, title: string, body: string, rating: number): Promise<boolean> {
    const mozeDaOstavi = await this.reviewRepo.canUserReview(userId, gameId);
    if (!mozeDaOstavi) return false;
    return await this.reviewRepo.create(gameId, userId, title, body, rating);
  }

  async dohvatiZaIgru(gameId: number): Promise<ReviewDto[]> {
    return await this.reviewRepo.getByGameId(gameId);
  }

  async izmeniRecenziju(id: number, userId: number, title: string, body: string, rating: number): Promise<boolean> {
    return await this.reviewRepo.update(id, userId, title, body, rating);
  }

  async obrisiRecenziju(id: number, userId: number): Promise<boolean> {
    return await this.reviewRepo.delete(id, userId);
  }

  async dohvatiMojeRecenzije(userId: number): Promise<ReviewDto[]> {
    return await this.reviewRepo.getByUserId(userId);
  }
}