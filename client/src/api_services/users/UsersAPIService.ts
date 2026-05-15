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
  },

 async pretragaKorisnika(query: string): Promise<UserDto[]> {
    try {
      const token = localStorage.getItem("authToken");
      
      const res = await axios.get<{
        success: boolean; 
        data: { id: number; username: string; profile_picture: string | null }[]
      }>(`${API_URL}/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.data || !res.data.data) return [];

      return res.data.data.map(u => ({
        id: u.id,
        korisnickoIme: u.username,
        profile_image: u.profile_picture,
        uloga: "player"
      }));
    } catch {
      return [];
    }
  },

async azurirajProfil(oldPassword?: string, password?: string, profileImage?: string): Promise<boolean> {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`${API_URL}/me`, 
        { oldPassword, password, profileImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Došlo je do greške pri ažuriranju profila.");
      } else {
        alert("Dogodila se neočekivana greška.");
      }
      return false;
    }
  }
};
