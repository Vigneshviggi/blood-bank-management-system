import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../api/userApi';
import { useNavigate } from 'react-router-dom';
import Card from './Card.jsx';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(err => setError(err.error || 'Failed to fetch users'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 pb-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">User Directory</h1>
            <p className="mt-2 text-slate-600 dark:text-gray-400">Manage all registered members of the LifeLink network</p>
          </div>
          <button
            onClick={() => navigate('/register-user')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add New User
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 dark:bg-red-900/20">
            {error}
          </div>
        )}

        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-gray-300">
              <thead className="bg-slate-50 dark:bg-gray-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-5">Member</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Blood Group</th>
                  <th className="px-6 py-5">Location</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800 bg-white dark:bg-gray-900/30">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
                        <p className="text-slate-500">Loading directory...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic">No users registered yet.</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user._id} className="transition hover:bg-slate-50 dark:hover:bg-gray-800/50 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center font-bold text-slate-900 dark:text-white">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-mono font-bold text-red-600 dark:text-red-400">
                        {user.bloodGroup}
                      </td>
                      <td className="px-6 py-5 text-slate-600 dark:text-gray-400">
                        {user.location}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => navigate(`/profile-view/${user._id}`)}
                          className="text-slate-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserList;
