import type { GameDto } from "../../models/games/GameDto";
import type { IGameAPIService } from "./IGameAPIService";
import axios from "axios";

// Gadja http://localhost:4000/api/v1/games
const API_URL: string = import.meta.env.VITE_API_URL + "games";

export const gameApi: IGameAPIService = {
  async getAllGames(): Promise<GameDto[]> {
    try {
      // Posto je ruta za pregled igara javna, ne moramo da saljemo JWT token
      const res = await axios.get<{success: boolean, data: GameDto[]}>(API_URL);
      
      if (res.data.success) {
        return res.data.data;
      }
      return [];
    } catch (error) {
      console.error("Greska pri pronalazenju kataloga igara:", error);
      return [];
    }
  }
};