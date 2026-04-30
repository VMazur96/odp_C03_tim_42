import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./contexts/auth/AuthContext";
import { authApi } from "./api_services/auth/AuthAPIService";

import PrijavaStranica from "./pages/auth/PrijavaStranica";
import RegistracijaStranica from "./pages/auth/RegistracijaStranica";
import NotFoundStranica from "./pages/not_found/NotFoundPage";
import KatalogStranica from "./pages/games/KatalogStranica";
import PlayerDashboard from "./pages/dashboard/PlayerDashboard";
import { PročitajVrednostPoKljuču } from "./helpers/local_storage";
import "./index.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  
  const prijavljen = authContext?.isAuthenticated || !!PročitajVrednostPoKljuču("authToken");

  const handleLogout = async () => {
    if (authContext) {
      await authContext.logout();
      navigate("/login");
    }
  };

  return (
    <div>
      <nav className="nav-bar flex justify-center items-center gap-4 p-4 bg-gray-800 text-white">
        <Link 
          to="/katalog" 
          className={`nav-btn px-4 py-2 rounded ${location.pathname === '/katalog' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
        >
          Katalog Igara
        </Link>

        {!prijavljen ? (
          <Link 
            to="/login" 
            className={`nav-btn px-4 py-2 rounded ${location.pathname === '/login' ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
          >
            Prijava
          </Link>
        ) : (
          <>
            {/* DINAMICKI LINK: Vodi na player ili admin dashboard zavisno od role */}
            <Link 
              to={`/${authContext?.user?.role || 'player'}-dashboard`} 
              className={`nav-btn px-4 py-2 rounded ${location.pathname.includes('dashboard') ? 'bg-gray-600' : 'hover:bg-gray-700'}`}
            >
              Moj Profil
            </Link>
            <button 
              onClick={handleLogout}
              className="nav-btn bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold transition"
            >
              Odjavi se
            </button>
          </>
        )}
      </nav>

      <Routes>
        {/* 1. POCETNA RUTA - Odmah preusmerava na katalog */}
        <Route path="/" element={<Navigate to="/katalog" replace />} />

        {/* 2. JAVNE RUTE */}
        <Route path="/katalog" element={<KatalogStranica />} />
        <Route path="/login" element={<PrijavaStranica authApi={authApi} />} />
        <Route path="/register" element={<RegistracijaStranica authApi={authApi} />} />

        {/* 3. PROTECTED RUTE (Dashboard-ovi) */}
        <Route path="/player-dashboard" element={<PlayerDashboard />} />
        <Route path="/admin-dashboard" element={<div className="p-10 text-center text-2xl font-bold">Admin Panel (U izradi)</div>} />

        {/* 4. GRESKE */}
        <Route path="/404" element={<NotFoundStranica />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </div>
  );
}

export default App;