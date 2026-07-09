import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const checkPasswordStrength = (password) => {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(password) },
  ];
  const metCount = requirements.filter((r) => r.met).length;
  const level = metCount <= 2 ? 'Weak' : metCount <= 4 ? 'Medium' : 'Strong';
  const color = level === 'Weak' ? 'text-red-600' : level === 'Medium' ? 'text-yellow-600' : 'text-green-600';
  return { requirements, level, color, valid: metCount === 5 };
};

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
    terms: false, newsletter: true,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const strength = checkPasswordStrength(form.password);

  const validate = () => {
    const newErrors = {};
    if (form.firstName.length < 2) newErrors.firstName = 'Min 2 characters';
    if (form.lastName.length < 2) newErrors.lastName = 'Min 2 characters';
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email required';
    if (form.phone && !/^\d{10}$/.test(form.phone)) newErrors.phone = '10-digit phone';
    if (!strength.valid) newErrors.password = 'Password does not meet requirements';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!form.terms) newErrors.terms = 'You must accept terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await register({
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      showToast('Account created! Please sign in.');
      navigate('/login', { state: { email: form.email } });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] gradient-brand">
      <div className="container-app flex min-h-[calc(100vh-4rem)] items-center py-8">
        <div className="hidden w-3/5 pr-12 text-white lg:block">
          <h1 className="text-4xl font-bold">Join Urban Cart</h1>
          <p className="mt-4 text-lg text-emerald-100">Create an account for faster checkout and order tracking.</p>
        </div>

        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl lg:w-2/5">
          <h2 className="text-2xl font-bold">Create Your Account</h2>
          <p className="mt-1 text-slate-500">Join our community today</p>

          {serverError && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{serverError}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">First Name</label>
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" placeholder="John" />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Last Name</label>
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" placeholder="Doe" />
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="your@email.com" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Phone (Optional)</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="10-digit number" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <p className={`text-xs font-medium ${strength.color}`}>{strength.level}</p>
                  <ul className="mt-1 space-y-0.5">
                    {strength.requirements.map((r) => (
                      <li key={r.label} className={`text-xs ${r.met ? 'text-green-600' : 'text-slate-400'}`}>
                        {r.met ? '✓' : '○'} {r.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} className="mt-1" />
              I agree to Terms & Conditions
            </label>
            {errors.terms && <p className="text-xs text-red-600">{errors.terms}</p>}

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.newsletter} onChange={(e) => setForm({ ...form, newsletter: e.target.checked })} />
              Subscribe to our newsletter
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
