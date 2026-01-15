import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { getAllUsers } from '../services/databaseService';
import { User } from '../types';

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  return (
    <div className="p-6 pb-24 space-y-6 animate-fade-in">
       <header>
          <h1 className="text-3xl font-bold text-red-400">User Management</h1>
       </header>

       <div className="space-y-2">
         {users.map(u => (
           <GlassCard key={u.id} className="flex justify-between items-center">
              <div>
                 <div className="font-bold">{u.name}</div>
                 <div className="text-xs text-gray-400 flex gap-2">
                    <span className="bg-white/10 px-1 rounded">{u.role}</span>
                    <span>ID: {u.id.substr(0,8)}</span>
                 </div>
              </div>
              <button className="text-xs text-red-400 border border-red-500/30 px-3 py-1 rounded">Ban</button>
           </GlassCard>
         ))}
       </div>
    </div>
  );
};

export default AdminUsers;