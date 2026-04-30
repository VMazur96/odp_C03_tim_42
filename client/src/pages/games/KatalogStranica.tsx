import { useState, useEffect, useContext } from 'react';
import type { GameDto } from '../../models/games/GameDto';
import { gameApi } from '../../api_services/games/GameAPIService';
import AuthContext from '../../contexts/auth/AuthContext';
import { userGamesApi } from '../../api_services/user_games/UserGamesAPIService';

export default function KatalogStranica() {
  const [igre, setIgre] = useState<GameDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);
  
  const [statusiIgara, setStatusiIgara] = useState<Record<number, string>>({});

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
        
        <div className="games-grid">
          {igre.length === 0 ? (
            <div className="col-span-full py-12 text-gray-500 text-lg">
              <p>Trenutno nema igara u katalogu.</p>
            </div>
          ) : (
            igre.map((igra) => (
              <div key={igra.id} className="game-card transform transition duration-300 hover:scale-105 flex flex-col justify-between h-full">
                <div>
                  {igra.cover_image ? (
                    <img src={igra.cover_image} alt={igra.name} className="game-image" />
                  ) : (
                    <div className="game-image-placeholder">Nema slike</div>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 mt-4">{igra.name}</h2>
                  <p className="text-gray-600 mt-2"><strong>Igraci:</strong> {igra.min_players} - {igra.max_players}</p>
                  <p className="text-gray-600"><strong>Trajanje:</strong> {igra.duration_min} min</p>
                  <p className="text-gray-600"><strong>Tezina:</strong> {igra.weight}</p>
                  <p className="text-gray-600 text-sm mt-3 italic"><strong>Izdavac:</strong> {igra.publisher} ({igra.release_year})</p>
                </div>

                {authContext?.isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
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