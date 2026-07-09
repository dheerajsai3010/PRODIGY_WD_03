import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
export default function Cart() {
  const { items, subtotal, tax, shipping, total, removeFromCart, updateQuantity, increaseQuantity, decreaseQuantity } = useCart();
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const handleRemove = (id) => {
    if (confirmRemove === id) {
      removeFromCart(id);
      setConfirmRemove(null);
    } else {
      setConfirmRemove(id);
      setTimeout(() => setConfirmRemove(null), 3000);
    }
  };

  const applyPromo = () => {
    const codes = { SAVE10: subtotal * 0.1, FLAT100: 100, WELCOME50: 50 };
    const discount = codes[promoCode.toUpperCase()];
    setPromoDiscount(discount || 0);
  };

  if (items.length === 0) {
    return (
      <div className="container-app py-16 text-center">
        <div className="mx-auto max-w-md">
          <div className="text-6xl">🛒</div>
          <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-slate-600">Add some products to get started!</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const finalTotal = total - promoDiscount;

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center animate-fade-in">
              <img src={item.image} alt={item.name} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
              <div className="flex-1">
                <Link to={`/products/${item.id}`} className="font-semibold hover:text-primary-600">{item.name}</Link>
                <p className="text-sm text-slate-500">₹{item.price?.toLocaleString('en-IN')} each</p>
                {item.quantity > (item.stock || 99) && (
                  <p className="text-sm text-red-600">Only {item.stock} in stock</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-slate-300">
                  <button onClick={() => decreaseQuantity(item.id)} className="px-3 py-2">−</button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                    className="w-12 border-x border-slate-300 py-2 text-center"
                    min={1}
                    max={10}
                  />
                  <button onClick={() => increaseQuantity(item.id)} className="px-3 py-2">+</button>
                </div>
                <p className="min-w-[80px] text-right font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className={`rounded-lg p-2 ${confirmRemove === item.id ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                  aria-label="Remove"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
          <Link to="/products" className="inline-block text-sm font-medium text-primary-600 hover:underline">
            ← Continue Shopping
          </Link>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>GST (18%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && subtotal < 500 && (
                <p className="text-xs text-green-600">Add ₹{(500 - subtotal).toLocaleString('en-IN')} more for free shipping!</p>
              )}
              {promoDiscount > 0 && (
                <div className="flex justify-between text-green-600"><span>Promo Discount</span><span>-₹{promoDiscount.toLocaleString('en-IN')}</span></div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Promo code" className="input-field flex-1" />
              <button onClick={applyPromo} className="btn-secondary !px-3">Apply</button>
            </div>

            <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
              <span className="text-lg font-bold">Total</span>
              <span className="text-xl font-bold text-primary-600">₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>

            <Link to="/checkout" className="btn-primary mt-6 block w-full text-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
