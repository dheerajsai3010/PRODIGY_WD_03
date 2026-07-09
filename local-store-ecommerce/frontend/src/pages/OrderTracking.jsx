import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderTracking() {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.trackOrder(orderId);
        setOrder(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) load();
    else setLoading(false);
  }, [orderId, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="text-2xl font-bold">Please login to track your order</h1>
        <Link to="/login" className="btn-primary mt-4 inline-flex">Sign In</Link>
      </div>
    );
  }

  if (loading) return <div className="container-app py-8"><LoadingSkeleton count={1} /></div>;

  if (error || !order) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="mt-2 text-slate-600">{error}</p>
        <Link to="/account" className="btn-primary mt-4 inline-flex">View Orders</Link>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.currentStatus);

  return (
    <div className="container-app py-8">
      <h1 className="mb-2 text-2xl font-bold">Order Tracking</h1>
      <p className="mb-8 text-slate-600">Order ID: <span className="font-mono font-bold">{order.orderId}</span></p>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-6 font-bold">Order Status</h2>
            <div className="space-y-0">
              {(order.timeline?.length ? order.timeline : STATUS_FLOW.map((s) => ({ status: s, message: s.replace(/_/g, ' ') }))).map((event, i) => {
                const statusIndex = STATUS_FLOW.indexOf(event.status);
                const isComplete = statusIndex <= currentIndex;
                const isCurrent = event.status === order.currentStatus;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${isComplete ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'} ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                        {isComplete ? '✓' : i + 1}
                      </div>
                      {i < (order.timeline?.length || STATUS_FLOW.length) - 1 && (
                        <div className={`h-12 w-0.5 ${isComplete ? 'bg-green-500' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`font-semibold capitalize ${isCurrent ? 'text-primary-600' : ''}`}>
                        {event.status?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-slate-600">{event.message}</p>
                      {event.timestamp && (
                        <p className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
                      )}
                      {event.location && <p className="text-xs text-slate-500">{event.location}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 font-bold">Order Details</h2>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p><strong>Total:</strong> ₹{order.totalAmount?.toLocaleString('en-IN')}</p>
              <p><strong>Payment:</strong> <span className="capitalize text-green-600">{order.paymentStatus}</span></p>
              <p><strong>Tracking #:</strong> {order.trackingNumber || 'N/A'}</p>
              <p><strong>Est. Delivery:</strong> {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : '5-7 days'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 font-bold">Shipping Address</h2>
            <p className="text-sm text-slate-700">
              {order.shippingAddress?.name}<br />
              {order.shippingAddress?.address}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 font-bold">Items</h2>
            {order.items?.map((item, i) => (
              <div key={i} className="mb-3 flex items-center gap-4 border-b border-slate-100 pb-3 last:border-0">
                <img src={item.image} alt="" className="h-16 w-16 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="btn-secondary">Continue Shopping</Link>
            <Link to="/account" className="btn-primary">View All Orders</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
