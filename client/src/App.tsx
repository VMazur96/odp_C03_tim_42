import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation
} from "react-router-dom";
import { authApi } from "./api_services/auth/AuthAPIService";
// import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import PrijavaStranica from "./pages/auth/PrijavaStranica";
import RegistracijaStranica from "./pages/auth/RegistracijaStranica";
import NotFoundStranica from "./pages/not_found/NotFoundPage";
// import { usersApi } from "./api_services/users/UsersAPIService";

// Nasi novi importi
import KatalogStranica from "./pages/games/KatalogStranica";
import { PročitajVrednostPoKljuču } from "./helpers/local_storage";
import "./index.css";

function App() {
  const location = useLocation();
  
  // Citamo token direktno. 
  // Posto useLocation() osvezava App pri svakoj promeni URL-a, 
  // ovo ce uvek biti tacno bez ikakvog kasnjenja!
  const prijavljen = !!PročitajVrednostPoKljuču("authToken");

  return (
    <div>
      {/* Navigacioni meni koji je uvek vidljiv na vrhu ekrana */}
      <nav className="nav-bar">
        <Link 
          to="/katalog" 
          className={`nav-btn ${location.pathname === '/katalog' ? 'active' : ''}`}
        >
          Katalog Igara
        </Link>
        <Link 
          to={prijavljen ? "/user-dashboard" : "/login"} 
          className={`nav-btn ${location.pathname === '/login' || location.pathname === '/user-dashboard' ? 'active' : ''}`}
        >
          {prijavljen ? "Moj Profil" : "Prijava"}
        </Link>
      </nav>

      {/* Ruter koji menja komponente ispod menija u zavisnosti od URL-a */}
      <Routes>
        {/* Nasa nova javna ruta za katalog */}
        <Route path="/katalog" element={<KatalogStranica />} />

        {/* Asistentove rute za autentifikaciju */}
        <Route path="/login" element={<PrijavaStranica authApi={authApi} />} />
        <Route path="/register" element={<RegistracijaStranica authApi={authApi} />} />
        <Route path="/404" element={<NotFoundStranica />} />

        {/*
          Example usage of protected route.
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <KontrolnaTablaUserStranica />
            </ProtectedRoute>
          }
        /> */}

        {/* Preusmerava na katalog kao default rutu */}
        <Route path="/" element={<Navigate to="/katalog" replace />} />

        {/* Catch-all ruta za nepostojece stranice */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </div>
  );
}

export default App;