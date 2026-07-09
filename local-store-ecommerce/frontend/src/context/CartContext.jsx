import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const TAX_RATE = 0.18;
const SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 100;

const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shipping = subtotal > SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? SHIPPING_COST : 0;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, tax, shipping, total, itemCount };
};

const loadCart = () => {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const cartReducer = (state, action) => {
  let items = [...state.items];

  switch (action.type) {
    case 'LOAD_CART':
      items = action.payload;
      break;
    case 'ADD_TO_CART': {
      const productId = action.payload.id || action.payload._id;
      const existing = items.find((i) => (i.id || i._id) === productId);
      if (existing) {
        items = items.map((i) =>
          (i.id || i._id) === productId
            ? { ...i, quantity: Math.min(10, i.quantity + (action.payload.quantity || 1)) }
            : i
        );
      } else {
        items.push({ ...action.payload, id: productId, quantity: action.payload.quantity || 1 });
      }
      break;
    }
    case 'REMOVE_FROM_CART':
      items = items.filter((i) => (i.id || i._id) !== action.payload);
      break;
    case 'UPDATE_QUANTITY':
      items = items.map((i) =>
        (i.id || i._id) === action.payload.id
          ? { ...i, quantity: Math.max(1, Math.min(10, action.payload.quantity)) }
          : i
      );
      break;
    case 'INCREASE_QUANTITY':
      items = items.map((i) =>
        (i.id || i._id) === action.payload ? { ...i, quantity: Math.min(10, i.quantity + 1) } : i
      );
      break;
    case 'DECREASE_QUANTITY':
      items = items.map((i) =>
        (i.id || i._id) === action.payload ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
      );
      break;
    case 'CLEAR_CART':
      items = [];
      break;
    default:
      return state;
  }

  const totals = calculateTotals(items);
  return { items, ...totals, lastUpdated: Date.now() };
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: loadCart(),
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
    lastUpdated: Date.now(),
  });

  useEffect(() => {
    dispatch({ type: 'LOAD_CART', payload: loadCart() });
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'cart') {
        dispatch({ type: 'LOAD_CART', payload: loadCart() });
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addToCart = (product, quantity = 1) => {
    if (product.stock === 0) return false;
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        image: product.image || product.images?.[0],
        stock: product.stock,
        quantity,
      },
    });
    return true;
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart: (id) => dispatch({ type: 'REMOVE_FROM_CART', payload: id }),
    updateQuantity: (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
    increaseQuantity: (id) => dispatch({ type: 'INCREASE_QUANTITY', payload: id }),
    decreaseQuantity: (id) => dispatch({ type: 'DECREASE_QUANTITY', payload: id }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
