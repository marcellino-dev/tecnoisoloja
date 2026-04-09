import { createAdminClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Users } from 'lucide-react';
import Image from 'next/image';

export const metadata = { title: 'Usuários | Admin' };

export default async function AdminUsersPage() {
  const supabase  = createAdminClient();
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-800 text-2xl text-white">Usuários</h1>
        <p className="text-dark-400 text-sm mt-1">{users?.length || 0} usuário{users?.length !== 1 ? 's' : ''} cadastrado{users?.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 text-dark-500 text-xs font-mono uppercase tracking-wider">
                <th className="text-left px-4 py-3">Usuário</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                <th className="text-center px-4 py-3">Tipo</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user: any) => (
                <tr key={user.id} className="border-b border-dark-800 hover:bg-dark-700/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image src={user.image} alt={user.name} width={32} height={32} className="rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-brand-300 font-display font-700 text-sm">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="font-display font-600 text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-400 hidden md:table-cell">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    {user.role === 'admin' ? (
                      <span className="badge bg-brand-600/20 text-brand-400 border border-brand-600/30">Admin</span>
                    ) : (
                      <span className="badge bg-dark-600 text-dark-400">Usuário</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-dark-400 hidden md:table-cell">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <Users className="w-10 h-10 text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-500">Nenhum usuário ainda</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
