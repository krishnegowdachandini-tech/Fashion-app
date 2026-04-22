import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../services/api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  {
    key: "specs",
    label: "Eyewear",
    desc: "Frames that define your look",
    icon: "👓",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    key: "bags",
    label: "Bags",
    desc: "Carry style everywhere",
    icon: "👜",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    key: "cosmetics",
    label: "Cosmetics",
    desc: "Beauty that empowers",
    icon: "💄",
    bg: "bg-pink-50",
    border: "border-pink-200",
  },
];

const BENEFITS = [
  { icon: "🚚", title: "Free Shipping", desc: "On all orders above $75" },
  { icon: "↩️", title: "Easy Returns", desc: "30-day hassle-free returns" },
  { icon: "✨", title: "Premium Quality", desc: "Curated top-tier brands" },
  { icon: "🔒", title: "Secure Checkout", desc: "Your data is always safe" },
];

export default function LandingPage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts()
      .then((products) => setFeatured(products.slice(0, 6)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-skin-800 via-skin-700 to-skin-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center text-center">
          <span className="bg-white/20 text-white text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            New Season Collection
          </span>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight max-w-3xl">
            Style That Speaks<br />
            <span className="text-skin-200">Without Words</span>
          </h1>
          <p className="mt-6 text-lg text-skin-100 max-w-xl">
            Discover premium eyewear, fashion bags, and luxury cosmetics — crafted for people who live boldly.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="bg-white text-skin-700 px-8 py-3.5 rounded-full font-semibold hover:bg-skin-50 transition-colors shadow-lg"
            >
              Shop Now
            </Link>
            <Link
              to="/register"
              className="border-2 border-white/60 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="mt-2 text-gray-500">Everything you need to complete your look</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              to={`/products?category=${cat.key}`}
              className={`group flex flex-col items-center text-center p-10 rounded-3xl border-2 ${cat.bg} ${cat.border} hover:shadow-lg transition-all hover:-translate-y-1`}
            >
              <span className="text-5xl mb-4">{cat.icon}</span>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-skin-600 transition-colors">{cat.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="mt-1 text-gray-500">Hand-picked just for you</p>
            </div>
            <Link to="/products" className="text-skin-600 hover:text-skin-800 font-semibold text-sm transition-colors">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-skin-50 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-skin-50 border border-skin-100">
              <span className="text-3xl mb-3">{b.icon}</span>
              <h4 className="font-semibold text-gray-900">{b.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-skin-100 py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-skin-900">Ready to refresh your style?</h2>
          <p className="mt-3 text-skin-700">Join thousands of happy customers and discover your next favourite look.</p>
          <Link
            to="/register"
            className="inline-block mt-8 bg-skin-600 text-white px-10 py-3.5 rounded-full font-semibold hover:bg-skin-700 transition-colors shadow-md"
          >
            Get Started — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}
