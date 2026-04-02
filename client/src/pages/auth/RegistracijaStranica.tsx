import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegistracijaForma } from "../../components/auth/RegistracijaForma";
import type { IAuthAPIService } from "../../api_services/auth/IAuthAPIService";
import { useAuth } from "../../hooks/auth/useAuthHook";

interface RegistracijaPageProps {
  authApi: IAuthAPIService;
}

export default function RegistracijaStranica({ authApi }: RegistracijaPageProps) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) 
      navigate(`/${user.role}-dashboard`);
  }, [isAuthenticated, navigate, user]);

  return (
    <main className="min-h-screen bg-linear-to-tr from-slate-600/75 to-orange-800/70 flex items-center justify-center py-10">
      {/* Dodaje belu pozadinu u vidu kartice oko forme */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Registracija</h1>
        
        <RegistracijaForma authApi={authApi} />
        
        {/* Dodaje link za prelazak na prijavu */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Vec imate nalog? <a href="/login" className="text-blue-600 font-bold hover:underline">Prijavite se</a>
        </p>
      </div>
    </main>
  );
}
