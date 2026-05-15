import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewApi } from '../../api_services/reviews/ReviewAPIService';
import type { ReviewDto } from '../../models/reviews/ReviewDto';

export default function MojeRecenzijeStranica() {
  const [recenzije, setRecenzije] = useState<(ReviewDto & { gameName?: string })[]>([]);
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);
  
  const [recenzijaZaIzmenu, setRecenzijaZaIzmenu] = useState<ReviewDto | null>(null);

  const fetchRecenzije = async () => {
    return await reviewApi.dohvatiMojeRecenzije();
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const podaci = await fetchRecenzije();
      if (isMounted) {
        setRecenzije(podaci);
        setUcitavanje(false);
      }
    };
    init();
    
    return () => { isMounted = false; };
  }, []);

  const handleObrisi = async (id: number) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovu recenziju?")) {
      const uspesno = await reviewApi.obrisiRecenziju(id);
      if (uspesno) {
        const podaci = await fetchRecenzije();
        setRecenzije(podaci);
      }
    }
  };

  const sacuvajIzmenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recenzijaZaIzmenu) return;
    
    if (recenzijaZaIzmenu.body.length < 50 || recenzijaZaIzmenu.body.length > 3000) {
      alert("Recenzija mora imati između 50 i 3000 karaktera!");
      return;
    }

    const uspesno = await reviewApi.izmeniRecenziju(
      recenzijaZaIzmenu.id, 
      recenzijaZaIzmenu.title, 
      recenzijaZaIzmenu.body, 
      recenzijaZaIzmenu.rating
    );

    if (uspesno) {
      setRecenzijaZaIzmenu(null);
      const podaci = await fetchRecenzije();
      setRecenzije(podaci);
    }
  };

  if (ucitavanje) return <div className="min-h-screen flex justify-center items-center text-xl">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">📝 Moje Recenzije</h1>

        {recenzije.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow border border-gray-200 text-center">
            <p className="text-gray-500 mb-4">Još uvek niste napisali nijednu recenziju.</p>
            <Link to="/katalog" className="text-blue-600 font-bold hover:underline">Započni u katalogu igara</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {recenzije.map(rec => (
              <div key={rec.id} className="bg-white p-6 rounded-xl shadow border border-gray-200 flex flex-col">
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                  <div>
                    <span className="text-sm text-gray-500">Igra:</span>
                    <Link to={`/igre/${rec.game_id}`} className="block text-xl font-bold text-blue-600 hover:underline">
                      {rec.gameName || 'Nepoznata igra'}
                    </Link>
                  </div>
                  <div className="bg-blue-100 text-blue-800 font-bold px-4 py-2 rounded-lg text-lg">
                    ⭐ {rec.rating} / 10
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{rec.title}</h3>
                <p className="text-gray-700 whitespace-pre-line mb-4">{rec.body}</p>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100 text-sm">
                  <span className="text-gray-400">Napisano: {new Date(rec.createdAt).toLocaleDateString('sr-RS')}</span>
                  <div className="flex gap-4">
                    <button onClick={() => setRecenzijaZaIzmenu(rec)} className="text-blue-600 font-bold hover:text-blue-800">
                      ✏️ Izmeni
                    </button>
                    <button onClick={() => handleObrisi(rec.id)} className="text-red-600 font-bold hover:text-red-800">
                      🗑 Obriši
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL ZA IZMENU RECENZIJE */}
      {recenzijaZaIzmenu && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Izmeni recenziju</h2>
            
            <form onSubmit={sacuvajIzmenu} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Naslov</label>
                <input type="text" value={recenzijaZaIzmenu.title} 
                  onChange={e => setRecenzijaZaIzmenu({...recenzijaZaIzmenu, title: e.target.value})} 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ocena (1-10)</label>
                <input type="number" min="1" max="10" value={recenzijaZaIzmenu.rating} 
                  onChange={e => setRecenzijaZaIzmenu({...recenzijaZaIzmenu, rating: Number(e.target.value)})} 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tekst recenzije</label>
                <textarea value={recenzijaZaIzmenu.body} rows={5}
                  onChange={e => setRecenzijaZaIzmenu({...recenzijaZaIzmenu, body: e.target.value})} 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
                <p className={`text-xs mt-1 ${recenzijaZaIzmenu.body.length < 50 ? 'text-red-500' : 'text-green-600'}`}>
                  Karaktera: {recenzijaZaIzmenu.body.length} / 50 (minimum)
                </p>
              </div>

              <div className="flex gap-4 mt-4">
                <button type="button" onClick={() => setRecenzijaZaIzmenu(null)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-xl transition">
                  Odustani
                </button>
                <button type="submit" disabled={recenzijaZaIzmenu.body.length < 50} className="flex-1 bg-blue-600 disabled:bg-blue-300 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow">
                  Sačuvaj izmene
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}