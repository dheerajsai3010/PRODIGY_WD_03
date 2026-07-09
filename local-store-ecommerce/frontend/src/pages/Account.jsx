import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const loadOrders = async () => {
      try {
        const res = await api.getUserOrders(user.id);
        setOrders(res.data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="container-app py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-slate-600">Welcome, {user.name}</p>
        </div>
        <button onClick={logout} className="btn-secondary">Logout</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h2 className="mb-4 font-bold">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-slate-500">Name</dt><dd className="font-medium">{user.name}</dd></div>
            <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{user.email}</dd></div>
            {user.phone && <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{user.phone}</dd></div>}
          </dl>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 font-bold">Order History</h2>
          {loading ? (
            <p className="text-slate-500">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No orders yet</p>
              <Link to="/products" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="font-mono text-sm font-medium">{order._id}</p>
                    <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                    <Link to={`/orders/${order._id}/track`} className="text-sm text-primary-600 hover:underline">
                      Track Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
