import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-skin-900 text-skin-200 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold text-white">
              Fashion <span className="text-skin-400">World</span>
            </span>
            <p className="mt-3 text-sm text-skin-300 max-w-xs leading-relaxed">
              Your destination for premium eyewear, fashion bags, and luxury cosmetics. Look and feel your best every day.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=specs" className="hover:text-white transition-colors">Eyewear</Link></li>
              <li><Link to="/products?category=bags" className="hover:text-white transition-colors">Bags</Link></li>
              <li><Link to="/products?category=cosmetics" className="hover:text-white transition-colors">Cosmetics</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-skin-800 text-sm text-skin-400 text-center">
          © {new Date().getFullYear()} Fashion World. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
