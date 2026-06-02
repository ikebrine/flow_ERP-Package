'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, DollarSign, Users, Clock, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const fetchRequests = async () => {
      const { data } = await supabase
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setRequests(data || []);
    };

    fetchRequests();
  }, []);

  const createRequest = async () => {
    const amount = prompt("Enter amount (e.g. 1250):");
    const vendor = prompt("Enter vendor name:");
    if (!amount || !vendor) return;

    const { error } = await supabase.from('payment_requests').insert({
      amount: parseFloat(amount),
      vendor,
      status: 'Pending',
      user_id: user?.id
    });

    if (error) alert(error.message);
    else {
      alert('✅ Payment Request Created!');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-8 py-5 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">FlowERP</h1>
        <div className="flex items-center gap-6">
          <span className="text-sm">{user?.email}</span>
          <button 
            onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-semibold">Dashboard</h2>
          <button 
            onClick={createRequest}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-blue-700"
          >
            <Plus size={22} /> New Payment Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow">
            <DollarSign className="text-green-500 mb-4" size={40} />
            <p className="text-5xl font-bold">{requests.length}</p>
            <p className="text-gray-500 mt-2">Total Requests</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow">
            <Users className="text-blue-500 mb-4" size={40} />
            <p className="text-5xl font-bold">8</p>
            <p className="text-gray-500 mt-2">Approved</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow">
            <Clock className="text-orange-500 mb-4" size={40} />
            <p className="text-5xl font-bold">4</p>
            <p className="text-gray-500 mt-2">Pending</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-6">Recent Payment Requests</h3>
        
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {requests.length === 0 ? (
            <p className="p-16 text-center text-gray-500 text-lg">
              No requests yet. Click "New Payment Request" to create one.
            </p>
          ) : (
            requests.map((req, index) => (
              <div key={index} className="border-b last:border-none p-6 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-lg">{req.vendor}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">${Number(req.amount).toFixed(2)}</p>
                  <span className="inline-block mt-2 px-4 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    {req.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
