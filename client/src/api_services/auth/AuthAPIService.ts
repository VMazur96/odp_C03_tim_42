import type { AuthResponse } from "../../types/auth/AuthResponse";
import type { IAuthAPIService } from "./IAuthAPIService";
import axios from "axios";

const API_URL: string = import.meta.env.VITE_API_URL + "auth";

export const authApi: IAuthAPIService = {
  async prijava(username: string, password: string): Promise<AuthResponse> {
    try {
      const res = await axios.post<AuthResponse>(`${API_URL}/login`, {
        username,
        password,
      });
      return res.data;
    } catch (error) {
      let message = "Грешка приликом пријаве.";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      return {
        success: false,
        message,
        data: undefined,
      };
    }
  },

  async registracija(
    username: string,
    email: string,
    password: string,
    fullName: string,
    profileImage: string
  ): Promise<AuthResponse> {
    try {
      const res = await axios.post<AuthResponse>(`${API_URL}/register`, {
        username,
        email,
        password,
        fullName: fullName,
        profileImage: profileImage
      });
      return res.data;
    } catch (error) {
      let message = "Greska prilikom registracije.";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      return {
        success: false,
        message,
        data: undefined,
      };
    }
  },

  async odjava(): Promise<void> {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await axios.post(`${API_URL}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Greska prilikom odjave na serveru:", error);
    }
  }
};
