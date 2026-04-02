import type { AuthFormProps } from "../../types/props/auth_form_props/AuthFormProps";
// import { useAuth } from "../../hooks/auth/useAuthHook";
import { useState } from "react";

export function RegistracijaForma({ authApi }: AuthFormProps) {
  // TODO: ADD STATE VARIABLES
  //const { login } = useAuth();

  // 1. STATE VARIJABLE: Posto ima vise polja po zahtevu ForgeBoard baze, dodate su ovde
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [greska, setGreska] = useState("");
  const [uspeh, setUspeh] = useState("");

  // 2. FUNKCIJA ZA SLANJE
  const podnesiFormu = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska("");
    setUspeh("");

    // TODO: Add register logic
    // FRONTEND VALIDACIJA: Proverava uslove pre nego sto optereti servere
    if (username.length < 3 || username.length > 40) {
      setGreska("Korisnicko ime mora imati izmedju 3 i 40 karaktera.");
      return;
    }
    if (!email.includes("@")) {
      setGreska("Unesite validan email format.");
      return;
    }
    if (password.length < 8) {
      setGreska("Lozinka mora imati najmanje 8 karaktera.");
      return;
    }
    if (!fullName) {
      setGreska("Ime i prezime su obavezni.");
      return;
    }

    try {
      // 3. API POZIV: Slanje podataka na backend
      const odgovor = await authApi.registracija(username, email, password, fullName);

      if (odgovor.success) {
        setUspeh("Uspesna registracija! Sada mozete da se prijavite.");
        setUsername(""); setEmail(""); setPassword(""); setFullName("");
      } else {
        setGreska(odgovor.message || "Registracija nije uspela.");
      }
    } catch (error) {
      console.error("Serverska greska:", error);
      setGreska("Doslo je do greske prilikom povezivanja sa serverom.");
    }
  };

  return (
    <form onSubmit={podnesiFormu} className="flex flex-col gap-4">
      {/* Prikaz poruka (zeleno za uspeh, crveno za gresku) */}
      {greska && <p className="text-red-500 text-sm font-semibold">{greska}</p>}
      {uspeh && <p className="text-green-600 text-sm font-semibold">{uspeh}</p>}

      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Ime i prezime:</label>
        <input 
          type="text" 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          className="border border-gray-300 p-2 rounded focus:outline-blue-500"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="border border-gray-300 p-2 rounded focus:outline-blue-500"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Korisnicko ime:</label>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          className="border border-gray-300 p-2 rounded focus:outline-blue-500"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Lozinka:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="border border-gray-300 p-2 rounded focus:outline-blue-500"
        />
      </div>

      <button type="submit" className="bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition mt-2">
        Registruj se
      </button>
    </form>
  );
}
