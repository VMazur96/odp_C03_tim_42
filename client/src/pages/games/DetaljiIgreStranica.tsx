import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { GameDto } from '../../models/games/GameDto';
import type { ReviewDto } from '../../models/reviews/ReviewDto';
import { gameApi } from '../../api_services/games/GameAPIService';
import { reviewApi } from '../../api_services/reviews/ReviewAPIService';
import AuthContext from '../../contexts/auth/AuthContext';

export default function DetaljiIgreStranica() {
  const { id } = useParams<{ id: string }>();
  const authContext = useContext(AuthContext);
  
  const [igra, setIgra] = useState<GameDto | null>(null);
  const [recenzije, setRecenzije] = useState<ReviewDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);

  // Stanja za formu recenzije
  const [naslov, setNaslov] = useState<string>('');
  const [tekst, setTekst] = useState<string>('');
  const [ocena, setOcena] = useState<number>(10);

  // Funkcija koja dohvata podatke
  const fetchPodatkeSaServera = async (gameId: number) => {
    const podaciIgre = await gameApi.getGameById(gameId);
    const podaciRecenzija = await reviewApi.dohvatiZaIgru(gameId);
    return { podaciIgre, podaciRecenzija };
  };

  // Ucitavanje pri prvom ulasku na stranicu
  useEffect(() => {
    let isMounted = true;
    
    const pokreniUcitavanje = async () => {
      if (id) {
        const { podaciIgre, podaciRecenzija } = await fetchPodatkeSaServera(Number(id));
        if (isMounted) {
          setIgra(podaciIgre);
          setRecenzije(podaciRecenzija);
          setUcitavanje(false);
        }
      } else {
        if (isMounted) setUcitavanje(false);
      }
    };
    
    pokreniUcitavanje();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Slanje nove recenzije
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tekst.length < 50 || tekst.length > 3000) {
      alert("Recenzija mora imati između 50 i 3000 karaktera!");
      return;
    }
    
    if (id) {
      const uspesno = await reviewApi.dodajRecenziju(Number(id), naslov, tekst, ocena);
      if (uspesno) {
        setNaslov('');
        setTekst('');
        setOcena(10);
        
        // Osvežavamo podatke nakon unosa
        const { podaciIgre, podaciRecenzija } = await fetchPodatkeSaServera(Number(id));
        setIgra(podaciIgre);
        setRecenzije(podaciRecenzija);
      }
    }
  };

  // Brisanje sopstvene recenzije
  const handleObrisiRecenziju = async (reviewId: number) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete svoju recenziju?")) {
      const uspesno = await reviewApi.obrisiRecenziju(reviewId);
      if (uspesno && id) {
        // Osvežavamo podatke nakon brisanja
        const { podaciIgre, podaciRecenzija } = await fetchPodatkeSaServera(Number(id));
        setIgra(podaciIgre);
        setRecenzije(podaciRecenzija);
      }
    }
  };

  if (ucitavanje) {
    return <div className="text-center py-20 text-xl text-gray-600">Učitavanje detalja igre...</div>;
  }

  if (!igra) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Igra nije pronađena!</h2>
        <Link to="/katalog" className="text-blue-500 hover:underline">Vrati se na katalog</Link>
      </div>
    );
  }

  // Da li je ulogovani korisnik već napisao recenziju za ovu igru
  const vecOcenio = recenzije.some(r => r.userId === authContext?.user?.id);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Slika i osnovni podaci */}
        <div className="flex flex-col md:flex-row border-b border-gray-200">
          <div className="md:w-1/3 bg-gray-200 flex items-center justify-center min-h-75">
            {igra.cover_image ? (
              <img src={igra.cover_image} alt={igra.name} className="object-cover w-full h-full" />
            ) : (
              <span className="text-gray-500 text-lg">Nema slike</span>
            )}
          </div>
          
          <div className="p-8 md:w-2/3">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{igra.name}</h1>
            <p className="text-gray-500 text-lg mb-6">{igra.publisher} ({igra.release_year})</p>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {igra.description}
            </p>

            {/* PRIKAZ MEHANIKA */}
            {igra.mechanics && igra.mechanics.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Mehanike:</h3>
                <div className="flex flex-wrap gap-2">
                  {igra.mechanics.map((mehanika, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold shadow-sm border border-purple-200">
                      {mehanika}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-gray-700 bg-gray-50 p-4 rounded-lg">
              <div><strong className="text-gray-900">Broj igrača:</strong> {igra.min_players} - {igra.max_players}</div>
              <div><strong className="text-gray-900">Trajanje:</strong> {igra.duration_min} min</div>
              <div><strong className="text-gray-900">Težina:</strong> {igra.weight}/5.0</div>
              <div><strong className="text-gray-900">Prosečna ocena:</strong> {igra.average_rating ? `${igra.average_rating}/10` : 'Još nema ocena'}</div>
            </div>
          </div>
        </div>

        {/* RECENZIJE SEKCIJA */}
        <div className="p-8 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recenzije igrača ({recenzije.length})</h2>
          
          {/* Forma za dodavanje recenzije (samo ako je korisnik ulogovan i nije jos uvek ocenio) */}
          {authContext?.user && !vecOcenio && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Napiši svoju recenziju</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Naslov</label>
                  <input type="text" value={naslov} onChange={e => setNaslov(e.target.value)} required 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                    placeholder="Ukratko o igri..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Ocena (1-10)</label>
                  <input type="number" min="1" max="10" value={ocena} onChange={e => setOcena(Number(e.target.value))} required 
                    className="w-full p-2 border rounded text-center focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Tekst recenzije (min. 50 karaktera)</label>
                <textarea value={tekst} onChange={e => setTekst(e.target.value)} required rows={4}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                  placeholder="Šta ti se svidelo, a šta ne?..." />
                <p className={`text-xs mt-1 ${tekst.length < 50 ? 'text-red-500' : 'text-green-600'}`}>
                  Trenutno karaktera: {tekst.length} / 50
                </p>
              </div>

              <button type="submit" disabled={tekst.length < 50} 
                className="bg-blue-600 disabled:bg-blue-300 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition">
                Objavi recenziju
              </button>
            </form>
          )}

          {/* Lista Recenzija */}
          {recenzije.length === 0 ? (
            <p className="text-gray-500 italic">Još uvek nema recenzija za ovu igru. Budi prvi!</p>
          ) : (
            <div className="space-y-4">
              {recenzije.map((recenzija) => (
                <div key={recenzija.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {recenzija.profileImage ? (
                        <img src={recenzija.profileImage} alt={recenzija.username} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
                          {recenzija.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-800">{recenzija.username}</p>
                        <p className="text-xs text-gray-500">{new Date(recenzija.createdAt).toLocaleDateString('sr-RS')}</p>
                      </div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full">
                      ⭐ {recenzija.rating} / 10
                    </div>
                  </div>
                  <h4 className="font-bold text-lg text-gray-800 mb-2">{recenzija.title}</h4>
                  <p className="text-gray-700 whitespace-pre-line">{recenzija.body}</p>

                  {/* Dugme za brisanje sopstvene recenzije */}
                  {authContext?.user?.id === recenzija.userId && (
                    <div className="mt-4 text-right border-t pt-2">
                      <button onClick={() => handleObrisiRecenziju(recenzija.id)} className="text-sm text-red-600 hover:text-red-800 font-semibold">
                        Obriši recenziju
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      
      <div className="max-w-5xl mx-auto mt-6">
        <Link to="/katalog" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2">
          &larr; Nazad na katalog
        </Link>
      </div>
    </div>
  );
}