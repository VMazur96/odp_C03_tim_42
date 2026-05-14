import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { GameDto } from '../../models/games/GameDto';
import { gameApi } from '../../api_services/games/GameAPIService';

export default function DetaljiIgreStranica() {
  const { id } = useParams<{ id: string }>();
  const [igra, setIgra] = useState<GameDto | null>(null);
  const [ucitavanje, setUcitavanje] = useState<boolean>(true);

  useEffect(() => {
    const pronadjiIgru = async () => {
      if (id) {
        const podaci = await gameApi.getGameById(Number(id));
        setIgra(podaci);
      }
      setUcitavanje(false);
    };
    pronadjiIgru();
  }, [id]);

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
              <div><strong className="text-gray-900">Težina (1-5):</strong> {igra.weight} / 5</div>
              <div><strong className="text-gray-900">Prosečna ocena:</strong> {igra.average_rating ? `${igra.average_rating}/10` : 'Još nema ocena'}</div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recenzije igrača</h2>
          <div className="p-6 bg-white border border-gray-200 rounded-lg text-center text-gray-500">
            Forma za pisanje recenzija i lista svih komentara.
          </div>
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