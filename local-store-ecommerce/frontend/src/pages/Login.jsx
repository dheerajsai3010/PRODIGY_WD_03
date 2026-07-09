import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: localStorage.getItem('rememberEmail') || '',
    password: '',
    remember: !!localStorage.getItem('rememberEmail'),
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await login(form.email, form.password, form.remember);
      showToast('Welcome back!');
      navigate(location.state?.from || '/');
    } catch (err) {
      setServerError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] gradient-brand">
      <div className="container-app flex min-h-[calc(100vh-4rem)] items-center py-8">
        <div className="hidden w-3/5 pr-12 text-white lg:block">
          <h1 className="text-4xl font-bold">Shop Urban, Shop Smart</h1>
          <p className="mt-4 text-lg text-emerald-100">Access your orders, wishlist, and exclusive deals.</p>
        </div>

        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl lg:w-2/5">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mt-1 text-slate-500">Sign in to your account</p>

          {serverError && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{serverError}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                onBlur={validate}
                placeholder="Enter your email"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                  onBlur={validate}
                  placeholder="Enter your password"
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-slate-500 hover:text-primary-600">Forgot Password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><span className="spinner mr-2" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:underline">Sign up</Link>
          </p>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Demo: demo@urbancart.com / Demo@1234
          </div>
        </div>
      </div>
    </div>
  );
}
