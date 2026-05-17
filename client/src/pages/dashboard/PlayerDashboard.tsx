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

  const ukupnoIgara = kolekcija.length;
  const igreSaOcenom = kolekcija.filter(g => g.rating !== null && g.rating > 0);
  const prosecnaOcena = igreSaOcenom.length > 0
    ? (igreSaOcenom.reduce((suma, igra) => suma + (igra.rating || 0), 0) / igreSaOcenom.length).toFixed(1)
    : 'Nema ocena';

  const mehanikeCount: Record<string, number> = {};

  sesije.forEach(sesija => {
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
        
        <div className="bg-white shadow-xl rounded-2xl p-8 border-t-4 border-blue-600 mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Dobrodošao, {authContext?.user?.username}!</h1>
          <p className="text-gray-600 text-lg">Pregledaj svoju statistiku i brzo pristupi svojim aktivnostima na platformi.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
            <span className="block text-gray-500 mb-2 uppercase text-sm font-bold tracking-wider">Ukupno igara</span>
            <span className="text-5xl font-bold text-blue-600">{ukupnoIgara}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
            <span className="block text-gray-500 mb-2 uppercase text-sm font-bold tracking-wider">Prosečna ocena</span>
            <span className="text-5xl font-bold text-green-600">{prosecnaOcena}</span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center">
            <span className="block text-gray-500 mb-2 uppercase text-sm font-bold tracking-wider">Najigranija mehanika</span>
            <span className="text-2xl font-bold text-purple-600 mt-3 block wrap-break-word">
              {najigranijaMehanika}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-800 mb-6">Tvoj Prostor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Link to="/kolekcija" className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-400 transition transform hover:-translate-y-1">
            <div className="text-blue-500 text-4xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Moja Kolekcija</h2>
            <p className="text-gray-600">Dodaj nove igre, oceni ih i uredi status igara koje poseduješ ili želiš.</p>
          </Link>

          <Link to="/sesije" className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-green-400 transition transform hover:-translate-y-1">
            <div className="text-green-500 text-4xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Moje Sesije</h2>
            <p className="text-gray-600">Evidentiraj odigrane partije, zabeleži rezultate prijatelja i proglasi pobednike.</p>
          </Link>

          <Link to="/moje-recenzije" className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-purple-400 transition transform hover:-translate-y-1">
            <div className="text-purple-500 text-4xl mb-4">✍️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Moje Recenzije</h2>
            <p className="text-gray-600">Pregledaj i izmeni recenzije koje si napisao za igre iz svoje kolekcije.</p>
          </Link>

          <Link to="/profil" className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-gray-400 transition transform hover:-translate-y-1">
            <div className="text-gray-600 text-4xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Podešavanja Profila</h2>
            <p className="text-gray-600">Izmeni svoju lozinku, promeni profilnu sliku i ažuriraj svoje lične podatke.</p>
          </Link>

        </div>
      </div>
    </div>
  );
}