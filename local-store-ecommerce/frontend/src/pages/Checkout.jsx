import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/api';

const STEPS = ['Cart Review', 'Address', 'Payment', 'Confirmation'];
const INDIAN_STATES = ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, tax, shipping, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [address, setAddress] = useState({
    firstName: '', lastName: '', email: user?.email || '', phone: '',
    address: '', apartment: '', city: '', state: '', postalCode: '', country: 'India',
  });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    if (items.length === 0 && step < 3) navigate('/cart');
    const saved = localStorage.getItem('checkoutDraft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.address) setAddress(draft.address);
        if (draft.step) setStep(draft.step);
      } catch { /* ignore */ }
    }
  }, [items, navigate, step]);

  useEffect(() => {
    localStorage.setItem('checkoutDraft', JSON.stringify({ address, step }));
  }, [address, step]);

  const validateAddress = () => {
    const newErrors = {};
    if (address.firstName.length < 2) newErrors.firstName = 'Required (min 2 chars)';
    if (address.lastName.length < 2) newErrors.lastName = 'Required (min 2 chars)';
    if (!/\S+@\S+\.\S+/.test(address.email)) newErrors.email = 'Valid email required';
    if (!/^\d{10}$/.test(address.phone)) newErrors.phone = '10-digit phone required';
    if (address.address.length < 5) newErrors.address = 'Address required';
    if (!address.city) newErrors.city = 'City required';
    if (!address.state) newErrors.state = 'State required';
    if (!/^\d{6}$/.test(address.postalCode)) newErrors.postalCode = '6-digit PIN required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      showToast('Please login to place order', 'error');
      navigate('/login');
      return;
    }
    if (!agreedTerms) {
      showToast('Please accept Terms & Conditions', 'error');
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = {
        ...address,
        name: `${address.firstName} ${address.lastName}`,
      };

      const orderRes = await api.createOrder({
        items: items.map((i) => ({ productId: i.id || i._id, quantity: i.quantity, price: i.price })),
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod,
      });

      const order = orderRes.data;
      const paymentRes = await api.createPayment({
        orderId: order.orderId || order._id,
        amount: order.totalAmount,
        email: address.email,
        phone: address.phone,
        customerName: `${address.firstName} ${address.lastName}`,
      });

      if (paymentRes.data.devMode) {
        setOrderResult({ ...order, paymentStatus: 'paid', transactionId: paymentRes.data.status });
        clearCart();
        localStorage.removeItem('checkoutDraft');
        setStep(3);
        showToast('Order placed successfully!');
      } else {
        setOrderResult(order);
        clearCart();
        setStep(3);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step < 3 && !orderResult) return null;

  const OrderSummary = () => (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sticky top-24 space-y-6">
      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2">Order Summary</h3>
      <div className="max-h-72 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 items-center">
            <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover border border-slate-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
              <p className="text-xs text-slate-400 font-medium">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-slate-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>
      
      <div className="space-y-2.5 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-500">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (18%)</span>
          <span className="text-slate-800">₹{tax.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-slate-800">{shipping ? `₹${shipping}` : 'FREE'}</span>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-extrabold text-slate-900">
          <span>Total</span>
          <span className="text-primary-600">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-800 tracking-tight">Checkout</h1>

      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i <= step ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`ml-2 hidden text-sm sm:inline ${i <= step ? 'font-medium' : 'text-slate-400'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${i < step ? 'bg-primary-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {step < 3 ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Active Checkout Step Forms */}
          <div className="lg:col-span-2">
            {step === 0 && (
              <div className="card p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Review Your Cart</h2>
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-sm text-slate-400 font-semibold">Qty: {item.quantity} · ₹{item.price?.toLocaleString('en-IN')} each</p>
                      </div>
                      <p className="font-extrabold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                  <Link to="/cart" className="btn-secondary flex-1 sm:flex-none text-center">Edit Cart</Link>
                  <button onClick={() => setStep(1)} className="btn-primary flex-1">Continue to Shipping</button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="card p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Shipping Address</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['firstName', 'First Name'], ['lastName', 'Last Name'],
                    ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'],
                  ].map(([key, label, type = 'text']) => (
                    <div key={key}>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
                      <input
                        type={type}
                        value={address[key]}
                        onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                        onBlur={() => validateAddress()}
                        className={`input-field ${errors[key] ? 'border-red-500 focus:ring-red-100' : ''}`}
                      />
                      {errors[key] && <p className="mt-1 text-xs text-red-600 font-semibold">{errors[key]}</p>}
                    </div>
                  ))}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Street Address</label>
                  <input value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} className="input-field" />
                  {errors.address && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.address}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">City</label>
                    <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">State</label>
                    <select value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="input-field">
                      <option value="">Select</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">PIN Code</label>
                    <input value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className="input-field" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setStep(0)} className="btn-secondary">Back</button>
                  <button onClick={() => validateAddress() && setStep(2)} className="btn-primary flex-1">Continue to Payment</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="card p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3">Payment Method</h2>
                <div className="space-y-3">
                  {['card', 'upi', 'netbanking', 'wallet'].map((method) => (
                    <label key={method} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${paymentMethod === method ? 'border-primary-500 bg-primary-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="text-primary-600 focus:ring-primary-500" />
                      <span className="capitalize font-bold text-slate-800">{method === 'netbanking' ? 'Net Banking' : method === 'wallet' ? 'Mobile Wallet' : method.toUpperCase()}</span>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    <input placeholder="Cardholder Name" className="input-field" />
                    <input placeholder="Card Number" className="input-field" maxLength={19} />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM/YY" className="input-field" />
                      <input placeholder="CVV" className="input-field" maxLength={4} />
                    </div>
                  </div>
                )}
                {paymentMethod === 'upi' && <input placeholder="UPI ID" className="input-field mt-4 animate-fade-in" />}
                {paymentMethod === 'netbanking' && (
                  <select className="input-field mt-4 animate-fade-in">
                    <option>SBI</option><option>HDFC</option><option>ICICI</option><option>Axis Bank</option>
                  </select>
                )}
                {paymentMethod === 'wallet' && <input placeholder="Phone Number" className="input-field mt-4 animate-fade-in" />}

                <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} className="rounded text-primary-600 focus:ring-primary-500" />
                  I agree to Terms & Conditions
                </label>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1">
                    {loading ? <><span className="spinner mr-2" /> Processing...</> : `Pay ₹${total.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      ) : (
        /* Confirmation screen (Step 3) */
        <div className="mx-auto max-w-xl text-center animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
          <h2 className="mt-4 text-2xl font-bold text-slate-800">Order Placed Successfully!</h2>
          <p className="mt-2 text-slate-500">Thank you for shopping with Urban Cart</p>

          <div className="mt-6 rounded-2xl border border-slate-200 p-6 text-left text-sm space-y-2 bg-white shadow-sm">
            <p><strong>Order ID:</strong> {orderResult.orderId || orderResult._id}</p>
            <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Total Paid:</strong> ₹{orderResult.totalAmount?.toLocaleString('en-IN')}</p>
            <p><strong>Payment:</strong> Successful</p>
            <p><strong>Delivery:</strong> {orderResult.estimatedDelivery ? new Date(orderResult.estimatedDelivery).toLocaleDateString() : '5-7 business days'}</p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={`/orders/${orderResult.orderId || orderResult._id}/track`} className="btn-primary">Track Order</Link>
            <Link to="/products" className="btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
}
