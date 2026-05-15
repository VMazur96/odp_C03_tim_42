import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/auth/AuthContext';
import { userGamesApi } from '../../api_services/user_games/UserGamesAPIService';
import { sessionApi } from '../../api_services/sessions/SessionAPIService';
import type { UserGameDto } from '../../models/user_games/UserGameDto';
import type { SessionDto } from '../../models/sessions/SessionDto';

export default function PlayerDashboard() {
  const authContext = useContext(AuthContext);
  const [kolekcija, setKolekcija] = useState<UserGameDto[]>([]);
  const [sesije, setSesije] = useState<SessionDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);

  // Funkcija koja dohvata podatke kolekcije i sesija sa servera
  const fetchPodatke = async () => {
    const podaciKolekcije = await userGamesApi.dohvatiMojuKolekciju();
    const podaciSesija = await sessionApi.dohvatiMojeSesije();
    return { podaciKolekcije, podaciSesija };
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { podaciKolekcije, podaciSesija } = await fetchPodatke();
      if (isMounted) {
        setKolekcija(podaciKolekcije);
        setSesije(podaciSesija);
        setUcitavanje(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  if (ucitavanje) return <div className="min-h-screen flex justify-center items-center text-xl">Učitavanje...</div>;

  // Ukupno igara i prosečna ocena (iz kolekcije)
  const ukupnoIgara = kolekcija.length;
  const igreSaOcenom = kolekcija.filter(g => g.rating !== null && g.rating > 0);
  const prosecnaOcena = igreSaOcenom.length > 0
    ? (igreSaOcenom.reduce((suma, igra) => suma + (igra.rating || 0), 0) / igreSaOcenom.length).toFixed(1)
    : 'Nema ocena';

  // Najigranija mehanika (RAČUNAMO IZ ODIGRANIH SESIJA)
  const mehanikeCount: Record<string, number> = {};

  sesije.forEach(sesija => {
    // Tražimo igru u kolekciji da bismo izvukli njene mehanike
    const igra = kolekcija.find(g => g.gameId === sesija.gameId);
    if (igra && igra.mechanics) {
      igra.mechanics.forEach(m => {
        mehanikeCount[m] = (mehanikeCount[m] || 0) + 1;
      });
    }
  });

  let najigranijaMehanika = "Nema podataka";
  let maxBroj = 0;
  for (const [mehanika, broj] of Object.entries(mehanikeCount)) {
    if (broj > maxBroj) {
      maxBroj = broj;
      najigranijaMehanika = mehanika;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Dobrodošao, {authContext?.user?.username}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
            <span className="block text-gray-500 mb-2">Ukupno igara</span>
            <span className="text-5xl font-bold text-blue-600">{ukupnoIgara}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
            <span className="block text-gray-500 mb-2">Prosečna ocena</span>
            <span className="text-5xl font-bold text-green-600">{prosecnaOcena}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 text-center">
            <span className="block text-gray-500 mb-2">Najigranija mehanika</span>
            <span className="text-3xl font-bold text-purple-600 mt-2 block wrap-break-word">
              {najigranijaMehanika}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Brzi linkovi</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/kolekcija" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow">
              Upravljaj Kolekcijom
            </Link>
            <Link to="/sesije" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow">
              Moje Sesije
            </Link>
            <Link to="/moje-recenzije" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow">
              Moje Recenzije
            </Link>
            <Link to="/profil" className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow">
              Izmeni Profil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}