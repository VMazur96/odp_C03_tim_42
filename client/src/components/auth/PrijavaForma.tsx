import type { AuthFormProps } from "../../types/props/auth_form_props/AuthFormProps";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useState } from "react";

export function PrijavaForma({ authApi }: AuthFormProps) {
  // TODO: ADD STATE VARIABLES
  // 1. STATE VARIJABLE: Cuva ono sto korisnik trenutno kuca u polja
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Cuva greske ako ih ima, da bi ih ispisao crvenom bojom
  const [greska, setGreska] = useState("");

  // 2. HOOK: Koristimo funkciju login iz AuthContext-a da sacuvamo JWT token u LocalStorage
  const { login } = useAuth();

  // 3. FUNKCIJA ZA SLANJE: Pokrece se kada korisnik klikne "Prijavi se"
  const podnesiFormu = async (e: React.FormEvent) => {
  e.preventDefault(); //  Sprecava osvezavanje cele stranice
  setGreska(""); // Brise staru gresku pre novog pokusaja

    // FRONTEND VALIDACIJA: Provera da li su polja prazna pre slanja zahteva na server
    if (!username || !password) {
      setGreska("Korisnicko ime i lozinka su obavezni!");
      return;
    }

    try {
      // 4. API POZIV: Salje podatke na backend (Express)
      const odgovor = await authApi.prijava(username, password);

      if (odgovor.success && odgovor.data) {
        login(odgovor.data);
      } else {
        setGreska(odgovor.message || "Neuspešna prijava.");
      }
    } catch (error) {
      console.error("Serverska greska:", error);
      setGreska("Doslo je do greske prilikom povezivanja sa serverom.");
    }
  };

  return (
    <form onSubmit={podnesiFormu} className="flex flex-col gap-4">
      {/* Prikaz greske ako postoji */}
      {greska && <p className="text-red-500 text-sm font-semibold">{greska}</p>}

      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Korisnicko ime:</label>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          className="border border-gray-300 p-2 rounded focus:outline-blue-500"
          placeholder="Unesite korisničko ime"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Lozinka:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="border border-gray-300 p-2 rounded focus:outline-blue-500"
          placeholder="Unesite lozinku"
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">
        Prijavi se
      </button>
    </form>
  );
}
