import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameDto } from '../../models/games/GameDto';
import { gameApi } from '../../api_services/games/GameAPIService';
import AuthContext from '../../contexts/auth/AuthContext';

export default function KatalogStranica() {
  const [igre, setIgre] = useState<GameDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);
  
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const pronadjiIgre = async () => {
      const podaci = await gameApi.getAllGames();
      setIgre(podaci);
      setUcitavanje(false);
    };
    pronadjiIgre();
  }, []);

  // DODATO: Funkcija za klik na dugme
  const handleLogout = async () => {
    if (authContext) {
      await authContext.logout();
      navigate("/login");
    }
  };

  if (ucitavanje) {
    return <div className="form-container">Ucitavanje kataloga...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-8 text-center">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide">
            Globalni katalog igara
          </h1>
          <button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
          >
            Odjavi se
          </button>
        </div>
        
        <div className="games-grid">
          {igre.length === 0 ? (
            <div className="col-span-full py-12 text-gray-500 text-lg">
              <p>Trenutno nema igara u katalogu.</p>
            </div>
          ) : (
            igre.map((igra) => (
              <div key={igra.id} className="game-card transform transition duration-300 hover:scale-105">
                {igra.cover_image ? (
                  <img src={igra.cover_image} alt={igra.name} className="game-image" />
                ) : (
                  <div className="game-image-placeholder">Nema slike</div>
                )}
                <h2 className="text-xl font-bold text-gray-900 mt-4">{igra.name}</h2>
                <p className="text-gray-600 mt-2"><strong>Igraci:</strong> {igra.min_players} - {igra.max_players}</p>
                <p className="text-gray-600"><strong>Trajanje:</strong> {igra.duration_min} min</p>
                <p className="text-gray-600"><strong>Tezina:</strong> {igra.weight} / 5</p>
                <p className="text-gray-600 text-sm mt-3 italic"><strong>Izdavac:</strong> {igra.publisher} ({igra.release_year})</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}