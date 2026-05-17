import { Link } from 'react-router-dom';

export default function AdminDashboardStranica() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8 border-t-4 border-purple-600 mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">Dobrodošli u kontrolni panel. Odaberite modul kojim želite da upravljate.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Kartica 1: Korisnici */}
          <Link to="/admin/korisnici" className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-400 transition transform hover:-translate-y-1">
            <div className="text-blue-500 text-4xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Upravljanje Korisnicima</h2>
            <p className="text-gray-600">Pregled svih registrovanih korisnika sistema i promena njihovih korisničkih uloga (Admin/Igrač).</p>
          </Link>

          {/* Kartica 2: Mehanike */}
          <Link to="/admin/mehanike" className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-green-400 transition transform hover:-translate-y-1">
            <div className="text-green-500 text-4xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Upravljanje Mehanikama</h2>
            <p className="text-gray-600">Dodavanje novih mehanika u sistem i brisanje postojećih iz globalnog skupa mehanika.</p>
          </Link>

          {/* Kartica 3: Katalog Igara */}
          <Link to="/katalog" className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-yellow-400 transition transform hover:-translate-y-1">
            <div className="text-yellow-500 text-4xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Katalog Igara</h2>
            <p className="text-gray-600">Pređite na katalog kako biste dodali nove igre, menjali postojeće podatke ili brisali igre iz baze.</p>
          </Link>

          {/* Kartica 4: Audit Log */}
          <Link to="/admin/audit-log" className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-red-400 transition transform hover:-translate-y-1">
            <div className="text-red-500 text-4xl mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Audit Log</h2>
            <p className="text-gray-600">Pregled evidencije aktivnosti. Pratite ko se prijavljivao i odjavljivao sa sistema i ostale bitne događaje.</p>
          </Link>

        </div>
      </div>
    </div>
  );
}