import { useState, useEffect, useContext } from 'react';
import type { GameDto } from '../../models/games/GameDto';
import { gameApi } from '../../api_services/games/GameAPIService';
import AuthContext from '../../contexts/auth/AuthContext';
import { userGamesApi } from '../../api_services/user_games/UserGamesAPIService';
import { Link } from 'react-router-dom';

export default function KatalogStranica() {
  const [igre, setIgre] = useState<GameDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);
  
  const [statusiIgara, setStatusiIgara] = useState<Record<number, string>>({});

  // STATE-OVI ZA PRETRAGU I SORTIRANJE
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortiranje, setSortiranje] = useState<string>('naziv');
  const [filterTrajanje, setFilterTrajanje] = useState<number>(0);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    const pronadjiIgre = async () => {
      const podaci = await gameApi.getAllGames();
      setIgre(podaci);
      setUcitavanje(false);
    };
    pronadjiIgre();
  }, []);

  const handleStatusChange = (igraId: number, noviStatus: string) => {
    setStatusiIgara(prev => ({ ...prev, [igraId]: noviStatus }));
  };

  const handleDodajUKolekciju = async (igraId: number) => {
    const status = statusiIgara[igraId] || 'wishlist'; // Podrazumevano je wishlist
    
    const uspesno = await userGamesApi.dodajUKolekciju(igraId, status);
    if (uspesno) {
      alert("Igra je uspešno dodata u tvoju kolekciju!");
    } else {
      alert("Došlo je do greške pri dodavanju igre.");
    }
  };

  // FILTRIRANJE I SORTIRANJE
  const prikazaneIgre = igre
    .filter((igra) => igra.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((igra) => filterTrajanje === 0 || igra.duration_min <= filterTrajanje)
    .sort((a, b) => {
      if (sortiranje === 'naziv') return a.name.localeCompare(b.name);
      if (sortiranje === 'godina') return (b.release_year || 0) - (a.release_year || 0);
      if (sortiranje === 'tezina') return b.weight - a.weight;
      return 0;
    });

  if (ucitavanje) {
    return <div className="form-container">Ucitavanje kataloga...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-8 text-center">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 tracking-wide">
            Globalni katalog igara
          </h1>
        </div>

        {/* MENI ZA PRETRAGU I SORTIRANJE*/}
        <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 p-4 rounded-lg mb-8 shadow-sm gap-4">
          
          <input 
            type="text" 
            placeholder="Pretraži igre..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded-md w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          
          <div className="flex flex-wrap gap-4">
            <select
              value={filterTrajanje}
              onChange={(e) => setFilterTrajanje(Number(e.target.value))}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value={0}>Bilo koje trajanje</option>
              <option value={30}>Do 30 minuta</option>
              <option value={60}>Do 60 minuta</option>
              <option value={120}>Do 120 minuta</option>
            </select>

            <select 
              value={sortiranje} 
              onChange={(e) => setSortiranje(e.target.value)}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="naziv">Sortiraj po Nazivu</option>
              <option value="godina">Sortiraj po Godini (Najnovije)</option>
              <option value="tezina">Sortiraj po Težini (Najteže)</option>
            </select>
          </div>
        </div>
        
        <div className="games-grid">
          {prikazaneIgre.length === 0 ? (
            <div className="col-span-full py-12 text-gray-500 text-lg">
              <p>Trenutno nema igara koje odgovaraju pretrazi.</p>
            </div>
          ) : (
            prikazaneIgre.map((igra) => (
              <div key={igra.id} className="game-card transform transition duration-300 hover:scale-105 flex flex-col justify-between h-full overflow-hidden">
                
                {/* LINK KOJI OBUHVATA SLIKU I INFORMACIJE */}
                <Link to={`/igre/${igra.id}`} className="grow cursor-pointer group flex flex-col">
                  <div>
                    {igra.cover_image ? (
                      <img src={igra.cover_image} alt={igra.name} className="game-image" />
                    ) : (
                      <div className="game-image-placeholder">Nema slike</div>
                    )}
                    
                    <div className="p-4">
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {igra.name}
                      </h2>
                      <p className="text-gray-600 mt-2"><strong>Igrači:</strong> {igra.min_players} - {igra.max_players}</p>
                      <p className="text-gray-600"><strong>Trajanje:</strong> {igra.duration_min} min</p>
                      <p className="text-gray-600"><strong>Težina:</strong> {igra.weight}</p>
                      <p className="text-gray-600 text-xs mt-3 italic"><strong>Izdavač:</strong> {igra.publisher} ({igra.release_year})</p>
                    </div>
                  </div>
                </Link>

                {/* DONJI DEO ZA KOLEKCIJU (Van Link-a) */}
                {authContext?.isAuthenticated && (
                  <div className="p-4 pt-0 border-t border-gray-100">
                    <select
                      value={statusiIgara[igra.id] || 'wishlist'}
                      onChange={(e) => handleStatusChange(igra.id, e.target.value)}
                      className="w-full p-2 mb-2 text-sm border border-gray-300 rounded focus:ring focus:ring-blue-200 focus:outline-none"
                    >
                      <option value="wishlist">Želim (Wishlist)</option>
                      <option value="owned">Imam (Owned)</option>
                    </select>
                    <button
                      onClick={() => handleDodajUKolekciju(igra.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
                    >
                      Dodaj u kolekciju
                    </button>
                  </div>
                )}
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}