import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="container-app py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white font-black text-sm shadow-md">UC</span>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Urban <span className="text-primary-400">Cart</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Your neighborhood e-commerce platform. Quality products, fast delivery, and trusted service since 2020.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-bold text-white text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors duration-200">Home</Link></li>
              <li><Link to="/products" className="hover:text-primary-400 transition-colors duration-200">Products</Link></li>
              <li><Link to="/cart" className="hover:text-primary-400 transition-colors duration-200">Cart</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors duration-200">Account</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-bold text-white text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="mailto:support@urbancart.com" className="hover:text-primary-400 transition-colors duration-200">Customer Support</a></li>
              <li><span className="text-slate-500">Mon-Sat: 9AM - 8PM</span></li>
              <li><span className="text-slate-500">+91 98765 43210</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 font-bold text-white text-sm uppercase tracking-wider">Newsletter</h4>
            <p className="mb-4 text-sm text-slate-500">Get updates on new products and offers.</p>
            <form className="flex items-stretch gap-2" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all" required />
              <button type="submit" className="shrink-0 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-500 transition-all duration-200">Join</button>
            </form>
            <div className="mt-5 flex gap-2.5">
              {[
                {
                  name: 'Facebook',
                  svg: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  ),
                },
                {
                  name: 'Twitter',
                  svg: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                    </svg>
                  ),
                },
                {
                  name: 'Instagram',
                  svg: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 text-slate-500 transition-all duration-200 hover:bg-primary-600 hover:text-white hover:scale-110 hover:shadow-lg"
                  aria-label={social.name}
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          <span>© {new Date().getFullYear()} Urban Cart E-commerce. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
