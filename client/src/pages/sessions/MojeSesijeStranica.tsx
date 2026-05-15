import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/auth/AuthContext';
import { sessionApi } from '../../api_services/sessions/SessionAPIService';
import type { SessionDto } from '../../models/sessions/SessionDto';

export default function MojeSesijeStranica() {
  const authContext = useContext(AuthContext);
  const [sesije, setSesije] = useState<SessionDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);
  
  // Stanje za modal za izmenu
  const [sesijaZaIzmenu, setSesijaZaIzmenu] = useState<SessionDto | null>(null);

  const ucitajSesije = async () => {
    const podaci = await sessionApi.dohvatiMojeSesije();
    setSesije(podaci);
    setUcitavanje(false);
  };

  useEffect(() => {
    const ucitajSesije = async () => {
      const podaci = await sessionApi.dohvatiMojeSesije();
      setSesije(podaci);
      setUcitavanje(false);
    };
    ucitajSesije();
  }, []);

  const handleObrisi = async (id: number) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovu sesiju?")) {
      const uspesno = await sessionApi.obrisiSesiju(id);
      if (uspesno) {
        setSesije(sesije.filter(s => s.id !== id));
      } else {
        alert("Samo kreator može da obriše sesiju!");
      }
    }
  };

  // Čuvanje izmena iz modala
  const sacuvajIzmene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesijaZaIzmenu) return;

    // Čuvamo podatke sesije
    await sessionApi.azurirajSesiju(
      sesijaZaIzmenu.id, 
      sesijaZaIzmenu.date.slice(0, 10), 
      sesijaZaIzmenu.durationMin, 
      sesijaZaIzmenu.note
    );

    // Čuvamo poene za svakog igrača ponaosob
    for (const igrac of sesijaZaIzmenu.players) {
      await sessionApi.azurirajIgraca(sesijaZaIzmenu.id, igrac.userId, igrac.score, igrac.winner);
    }

    setSesijaZaIzmenu(null); // Zatvara modal
    ucitajSesije(); // Osvežava listu na ekranu
  };

  if (ucitavanje) return <div className="min-h-screen flex justify-center items-center text-xl">Učitavanje sesija...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">🎮 Moje Sesije Igranja</h1>
          <Link to="/nova-sesija" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md">
            + Evidentiraj novu sesiju
          </Link>
        </div>

        {sesije.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-md text-center border border-gray-200">
            <p className="text-gray-500 text-lg mb-4">Još uvek nemaš evidentiranih sesija.</p>
            <Link to="/nova-sesija" className="text-blue-600 font-semibold hover:underline">Započni svoju prvu sesiju!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sesije.map((sesija) => (
              <div key={sesija.id} className="bg-white p-6 rounded-xl shadow border border-gray-200 flex flex-col md:flex-row gap-6 items-center hover:shadow-lg transition">
                
                <div className="w-full md:w-1/4 flex flex-col items-center text-center">
                  {sesija.coverImage ? (
                    <img src={sesija.coverImage} alt={sesija.gameName} className="w-24 h-24 object-cover rounded shadow mb-3" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded mb-3 text-xs text-gray-500">Nema slike</div>
                  )}
                  <Link to={`/igre/${sesija.gameId}`} className="font-bold text-blue-600 hover:underline text-lg">
                    {sesija.gameName}
                  </Link>
                  <span className="text-sm text-gray-500 mt-1">🕒 {sesija.durationMin} min</span>
                  <span className="text-sm text-gray-500">📅 {new Date(sesija.date).toLocaleDateString('sr-RS')}</span>
                </div>

                <div className="w-full md:w-3/4 flex flex-col h-full">
                  <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">Učesnici i rezultati:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {sesija.players.map(igrac => (
                      <div key={igrac.userId} className={`flex items-center gap-3 p-2 rounded-lg border ${igrac.winner ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                        {igrac.profileImage ? (
                          <img src={igrac.profileImage} alt={igrac.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">{igrac.username.charAt(0).toUpperCase()}</div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 flex items-center gap-2">
                            {igrac.username} 
                            {igrac.winner && <span title="Pobednik">🏆</span>}
                          </p>
                          <p className="text-sm text-gray-600">Poeni: {igrac.score !== null ? igrac.score : '-'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {sesija.note && (
                    <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 italic mb-4">
                      "{sesija.note}"
                    </div>
                  )}

                  {authContext?.user?.id === sesija.creatorId && (
                    <div className="flex gap-4 mt-auto justify-end">
                      {/* OVO DUGME SADA OTVARA MODAL */}
                      <button onClick={() => setSesijaZaIzmenu(sesija)} className="text-sm text-blue-600 font-semibold hover:text-blue-800">Izmeni sesiju</button>
                      <button onClick={() => handleObrisi(sesija.id)} className="text-sm text-red-600 font-semibold hover:text-red-800">Obriši sesiju</button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL ZA IZMENU SESIJE */}
      {sesijaZaIzmenu && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Upiši rezultate i izmeni sesiju</h2>
            
            <form onSubmit={sacuvajIzmene} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Datum</label>
                  <input type="date" value={sesijaZaIzmenu.date.slice(0, 10)} 
                    onChange={e => setSesijaZaIzmenu({...sesijaZaIzmenu, date: e.target.value})} 
                    className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Trajanje (min)</label>
                  <input type="number" value={sesijaZaIzmenu.durationMin} 
                    onChange={e => setSesijaZaIzmenu({...sesijaZaIzmenu, durationMin: Number(e.target.value)})} 
                    className="w-full p-2 border rounded" required min="5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Beleška</label>
                <input type="text" value={sesijaZaIzmenu.note || ''} 
                  onChange={e => setSesijaZaIzmenu({...sesijaZaIzmenu, note: e.target.value})} 
                  className="w-full p-2 border rounded" placeholder="Opciona beleška..." />
              </div>

              <hr className="my-2 border-gray-200" />
              <h3 className="font-bold text-gray-700">Igrači i Poeni:</h3>
              
              <div className="flex flex-col gap-3">
                {sesijaZaIzmenu.players.map((igrac, index) => (
                  <div key={igrac.userId} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg">
                    <span className="font-semibold text-gray-800">{igrac.username}</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1 text-sm text-gray-600">
                        Poeni:
                        <input type="number" value={igrac.score || ''} 
                          onChange={(e) => {
                            const noviIgraci = [...sesijaZaIzmenu.players];
                            noviIgraci[index].score = e.target.value ? Number(e.target.value) : null;
                            setSesijaZaIzmenu({...sesijaZaIzmenu, players: noviIgraci});
                          }} 
                          className="w-16 p-1 border rounded text-center" />
                      </label>
                      <label className="flex items-center gap-1 text-sm font-bold text-yellow-600 cursor-pointer">
                        <input type="checkbox" checked={igrac.winner} 
                          onChange={(e) => {
                            const noviIgraci = [...sesijaZaIzmenu.players];
                            noviIgraci[index].winner = e.target.checked;
                            setSesijaZaIzmenu({...sesijaZaIzmenu, players: noviIgraci});
                          }} 
                          className="w-4 h-4 cursor-pointer" />
                        Pobednik 🏆
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setSesijaZaIzmenu(null)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-xl transition">
                  Odustani
                </button>
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow">
                  Sačuvaj rezultate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}