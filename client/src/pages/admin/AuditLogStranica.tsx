import { useState, useEffect } from 'react';
import { auditApi } from '../../api_services/audits/AuditAPIService';
import type { AuditLogDto } from '../../models/audits/AuditLogDto';

export default function AuditLogStranica() {
  const [logovi, setLogovi] = useState<AuditLogDto[]>([]);
  const [ucitavanje, setUcitavanje] = useState(true);

  useEffect(() => {
    const ucitajLogove = async () => {
      const podaci = await auditApi.getAllLogs();
      setLogovi(podaci);
      setUcitavanje(false);
    };
    ucitajLogove();
  }, []);

  const formatirajDatum = (isoDatum: string) => {
    const datum = new Date(isoDatum);
    return datum.toLocaleString('sr-RS');
  };

  if (ucitavanje) return <div className="text-center py-10">Učitavanje logova...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Evidencija Aktivnosti (Audit Log)</h1>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-white border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold">ID</th>
              <th className="p-4 font-bold">Datum i Vreme</th>
              <th className="p-4 font-bold">Korisnik</th>
              <th className="p-4 font-bold">Akcija</th>
              <th className="p-4 font-bold">Detalji</th>
            </tr>
          </thead>
          <tbody>
            {logovi.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-gray-500">#{log.id}</td>
                <td className="p-4 text-gray-600 font-mono text-sm">{formatirajDatum(log.created_at)}</td>
                <td className="p-4 font-semibold text-blue-600">
                  {log.username ? `@${log.username}` : <span className="text-gray-400 italic">Nepoznato</span>}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold 
                    ${log.action.toLowerCase().includes('login') ? 'bg-green-100 text-green-800' : 
                      log.action.toLowerCase().includes('logout') ? 'bg-orange-100 text-orange-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-gray-600 text-sm">{log.details || '-'}</td>
              </tr>
            ))}
            {logovi.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nema zapisa u evidenciji.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}