import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./contexts/auth/AuthContext";
import { authApi } from "./api_services/auth/AuthAPIService";

import PrijavaStranica from "./pages/auth/PrijavaStranica";
import RegistracijaStranica from "./pages/auth/RegistracijaStranica";
import NotFoundStranica from "./pages/not_found/NotFoundPage";
import KatalogStranica from "./pages/games/KatalogStranica";
import PlayerDashboard from "./pages/dashboard/PlayerDashboard";
import DetaljiIgreStranica from './pages/games/DetaljiIgreStranica';
import MojaKolekcijaStranica from "./pages/kolekcija/MojaKolekcijaStranica";
import ProfilStranica from "./pages/profil/ProfilStranica";
import MojeSesijeStranica from "./pages/sessions/MojeSesijeStranica";
import NovaSesijaStranica from "./pages/sessions/NovaSesijaStranica";
import { procitajVrednostPoKljucu } from "./helpers/local_storage";
import MojeRecenzijeStranica from './pages/reviews/MojeRecenzijeStranica';
import { ProtectedRoute } from './components/protected_route/ProtectedRoute';
import UpravljanjeMehanikamaStranica from './pages/admin/UpravljanjeMehanikamaStranica';
import DodajIgruStranica from './pages/admin/DodajIgruStranica';
import IzmeniIgruStranica from './pages/admin/IzmeniIgruStranica';
import UpravljanjeKorisnicimaStranica from './pages/admin/UpravljanjeKorisnicimaStranica';
import AuditLogStranica from './pages/admin/AuditLogStranica';
import AdminDashboardStranica from './pages/admin/AdminDashboardStranica';
import "./index.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  
  const prijavljen = authContext?.isAuthenticated || !!procitajVrednostPoKljucu("authToken");

  const handleLogout = async () => {
    if (authContext) {
      await authContext.logout();
      navigate("/login");
    }
  };

  return (
    <div>
      <nav className="nav-bar flex justify-between items-center px-8 py-4 bg-gray-800 text-white shadow-md relative z-50">
        <div className="flex gap-4">
          <Link to="/katalog" className={`nav-btn px-4 py-2 rounded ${location.pathname === '/katalog' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
            Katalog Igara
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!prijavljen ? (
            <Link to="/login" className={`nav-btn px-4 py-2 rounded ${location.pathname === '/login' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
              Prijava
            </Link>
          ) : (
            <>
              <Link to={`/${authContext?.user?.role || 'player'}/dashboard`} className={`nav-btn px-4 py-2 rounded ${location.pathname.includes('dashboard') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
                Dashboard
              </Link>

              <Link to="/kolekcija" className={`nav-btn px-4 py-2 rounded ${location.pathname === '/kolekcija' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
                Moja Kolekcija
              </Link>
              
              <Link to="/sesije" className={`nav-btn px-4 py-2 rounded ${location.pathname.includes('/sesije') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
                Moje Sesije
              </Link>

              <Link to="/moje-recenzije" className={`nav-btn px-4 py-2 rounded ${location.pathname.includes('/moje-recenzije') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
                Moje Recenzije
              </Link>

              <Link to="/profil" className={`nav-btn flex items-center gap-2 px-4 py-2 rounded ${location.pathname === '/profil' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}>
                {authContext?.user?.profile_picture ? (
                  <img src={authContext.user.profile_picture} alt="Profil" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs">P</span>
                )}
                Profil
              </Link>
              <button onClick={handleLogout} className="nav-btn bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold transition">
                Odjavi se
              </button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/katalog" replace />} />
        <Route path="/katalog" element={<KatalogStranica />} />
        <Route path="/login" element={<PrijavaStranica authApi={authApi} />} />
        <Route path="/register" element={<RegistracijaStranica authApi={authApi} />} />
        <Route path="/igre/:id" element={<DetaljiIgreStranica />} />

        {/* PROTECTED RUTE */}
        <Route path="/player/dashboard" element={<PlayerDashboard />} />
        <Route path="/kolekcija" element={<MojaKolekcijaStranica />} />
        <Route path="/profil" element={<ProfilStranica />} />
        
        <Route path="/sesije" element={<MojeSesijeStranica />} />
        <Route path="/nova-sesija" element={<NovaSesijaStranica />} />

        <Route path="/moje-recenzije" element={<MojeRecenzijeStranica />} />
        
        <Route path="/admin/mehanike" element={<ProtectedRoute requiredRole="admin"><UpravljanjeMehanikamaStranica /></ProtectedRoute>} />        
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboardStranica /></ProtectedRoute>} />
        <Route path="/admin/dodaj-igru" element={<ProtectedRoute requiredRole="admin"><DodajIgruStranica /></ProtectedRoute>} />
        <Route path="/admin/izmeni-igru/:id" element={<ProtectedRoute requiredRole="admin"><IzmeniIgruStranica /></ProtectedRoute>} />
        <Route path="/admin/korisnici" element={<ProtectedRoute requiredRole="admin"><UpravljanjeKorisnicimaStranica /></ProtectedRoute>} />
        <Route path="/admin/audit-log" element={<ProtectedRoute requiredRole="admin"><AuditLogStranica /></ProtectedRoute>} />

        <Route path="/404" element={<NotFoundStranica />} />
        
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </div>
  );
}

export default App;