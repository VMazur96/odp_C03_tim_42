import axios from "axios";
import type { UserDto } from "../../models/users/UserDto";
import type { IUsersAPIService } from "./IUsersAPIService";

const API_URL: string = import.meta.env.VITE_API_URL + "users";

export const usersApi: IUsersAPIService = {
  async getSviKorisnici(token: string): Promise<UserDto[]> {
    try {
      const res = await axios.get<UserDto[]>(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch {
      return [];
    }
  },

  async getMe(token: string): Promise<UserDto | null> {
    try {
      const res = await axios.get<{success: boolean, data: UserDto}>(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    } catch (error) {
      console.error("Greska pri dohvatanju korisnika:", error);
      return null;
    }
  }
};
