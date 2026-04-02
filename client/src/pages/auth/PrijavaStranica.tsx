import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PrijavaForma } from "../../components/auth/PrijavaForma";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";

interface LoginPageProps {
  authApi: IAuthAPIService;
}

export default function PrijavaStranica({ authApi }: LoginPageProps) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) 
      navigate(`/${user.role}-dashboard`);
  }, [isAuthenticated, navigate, user]);

  return (
    <main className="min-h-screen bg-linear-to-tr from-slate-600/75 to-orange-800/70 flex items-center justify-center">
      {/* Dodaje belu pozadinu u vidu kartice oko forme */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Prijava</h1>
        
        <PrijavaForma authApi={authApi} />
        
        {/* Dodaje link za prelazak na registraciju */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Nemate nalog? <a href="/register" className="text-blue-600 font-bold hover:underline">Registrujte se</a>
        </p>
      </div>
    </main>
  );
}
