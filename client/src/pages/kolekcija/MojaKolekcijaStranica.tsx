import { useState, useEffect } from 'react';
import { userGamesApi } from '../../api_services/user_games/UserGamesAPIService';
import type { UserGameDto } from '../../models/user_games/UserGameDto';
import { Link } from 'react-router-dom';

export default function MojaKolekcijaStranica() {
  const [kolekcija, setKolekcija] = useState<UserGameDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);
  
  // Stanje za izmenu
  const [editingGameId, setEditingGameId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ status: '', rating: 0, note: '' });

  const osveziKolekciju = async () => {
    const podaci = await userGamesApi.dohvatiMojuKolekciju();
    setKolekcija(podaci);
  };

  useEffect(() => {
    const inicijalnoUcitavanje = async () => {
      const podaci = await userGamesApi.dohvatiMojuKolekciju();
      setKolekcija(podaci);
      setUcitavanje(false);
    };
    
    inicijalnoUcitavanje();
  }, []);

  // Brisanje igre
  const handleObrisi = async (gameId: number) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovu igru iz kolekcije?")) {
      const uspesno = await userGamesApi.obrisiIgru(gameId);
      if (uspesno) {
        setKolekcija(kolekcija.filter(g => g.gameId !== gameId));
      } else {
        alert("Greška pri brisanju.");
      }
    }
  };

  // Izmena igre
  const zapocniIzmenu = (igra: UserGameDto) => {
    setEditingGameId(igra.gameId);
    setEditForm({
      status: igra.status,
      rating: igra.rating || 0,
      note: igra.note || ''
    });
  };

 const sacuvajIzmene = async (gameId: number) => {
    const { status, rating, note } = editForm;
    const uspesno = await userGamesApi.izmeniIgru(gameId, status, rating === 0 ? null : rating, note);
    if (uspesno) {
      await osveziKolekciju(); // Koristimo novo ime bez loading ekrana!
      setEditingGameId(null);
    } else {
      alert("Greška pri čuvanju izmena.");
    }
  };

  // Kartice igre
  const renderGameCard = (igra: UserGameDto) => {
    
    // Ako se igra trenutno menja, prikaži formu
    if (editingGameId === igra.gameId) {
      return (
        <div key={`edit-${igra.gameId}`} className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-300">
          <p className="font-bold text-gray-800 mb-2">Izmena: {igra.gameName}</p>
          <div className="flex flex-col gap-2">
            <select 
              value={editForm.status} 
              onChange={e => setEditForm({...editForm, status: e.target.value})}
              className="border p-2 rounded"
            >
              <option value="owned">Imam (Owned)</option>
              <option value="wishlist">Želim (Wishlist)</option>
              <option value="previously_owned">Imao ranije</option>
            </select>
            
            <input 
              type="number" 
              placeholder="Ocena (1-10)" 
              min="1" max="10"
              value={editForm.rating || ''}
              onChange={e => setEditForm({...editForm, rating: Number(e.target.value)})}
              className="border p-2 rounded"
            />
            
            <textarea 
              placeholder="Beleška..." 
              value={editForm.note}
              onChange={e => setEditForm({...editForm, note: e.target.value})}
              className="border p-2 rounded h-16"
            />
            
            <div className="flex gap-2 mt-2">
              <button onClick={() => sacuvajIzmene(igra.gameId)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded w-full">Sačuvaj</button>
              <button onClick={() => setEditingGameId(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded w-full">Otkaži</button>
            </div>
          </div>
        </div>
      );
    }

    // Standardni prikaz kartice
    return (
      <div key={igra.gameId} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex gap-4 items-start relative group">
        {igra.coverImage ? (
          <img src={igra.coverImage} alt={igra.gameName} className="w-20 h-20 object-cover rounded" />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">Nema</div>
        )}
        <div className="flex-1">
          <Link to={`/igre/${igra.gameId}`} className="text-lg font-bold text-blue-600 hover:underline">
            {igra.gameName}
          </Link>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Ocena:</strong> {igra.rating ? `${igra.rating} / 10` : 'Nije ocenjeno'}
          </p>
          {igra.note && <p className="text-sm text-gray-500 mt-1 italic">"{igra.note}"</p>}
          
          {/* Dugmići koji se pojavljuju na hover */}
          <div className="mt-3 flex gap-2">
            <button onClick={() => zapocniIzmenu(igra)} className="text-sm text-blue-500 hover:text-blue-700 font-semibold">Izmeni</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => handleObrisi(igra.gameId)} className="text-sm text-red-500 hover:text-red-700 font-semibold">Obriši</button>
          </div>
        </div>
      </div>
    );
  };

  if (ucitavanje) return <div className="min-h-screen flex justify-center items-center text-xl">Učitavanje kolekcije...</div>;

  const owned = kolekcija.filter(g => g.status === 'owned');
  const wishlist = kolekcija.filter(g => g.status === 'wishlist');
  const previouslyOwned = kolekcija.filter(g => g.status === 'previously_owned');

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Moja Kolekcija</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">📦 Imam ({owned.length})</h2>
            <div className="flex flex-col gap-4">
              {owned.length > 0 ? owned.map(renderGameCard) : <p className="text-gray-500">Nemaš igara.</p>}
            </div>
          </div>
          <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-100">
            <h2 className="text-2xl font-bold text-purple-800 mb-4 border-b-2 border-purple-200 pb-2">⭐ Želim ({wishlist.length})</h2>
            <div className="flex flex-col gap-4">
              {wishlist.length > 0 ? wishlist.map(renderGameCard) : <p className="text-gray-500">Nemaš igara.</p>}
            </div>
          </div>
          <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b-2 border-gray-300 pb-2">🕰️ Imao ranije ({previouslyOwned.length})</h2>
            <div className="flex flex-col gap-4">
              {previouslyOwned.length > 0 ? previouslyOwned.map(renderGameCard) : <p className="text-gray-500">Nemaš igara.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}