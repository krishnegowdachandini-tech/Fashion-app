import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { specsApi, bagsApi, cosmeticsApi } from "../services/api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "specs", label: "Eyewear" },
  { key: "bags", label: "Bags" },
  { key: "cosmetics", label: "Cosmetics" },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const category = searchParams.get("category") || "all";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (priceMax) params.maxPrice = priceMax;

      let data = [];
      if (category === "all") {
        const [s, b, c] = await Promise.all([
          specsApi.getAll(params),
          bagsApi.getAll(params),
          cosmeticsApi.getAll(params),
        ]);
        data = [...s.data, ...b.data, ...c.data];
      } else if (category === "specs") {
        data = (await specsApi.getAll(params)).data;
      } else if (category === "bags") {
        data = (await bagsApi.getAll(params)).data;
      } else if (category === "cosmetics") {
        data = (await cosmeticsApi.getAll(params)).data;
      }
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, priceMax]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const setCategory = (key) => {
    if (key === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", key);
    }
    setSearchParams(searchParams);
  };

  const filtered = products.filter((p) =>
    search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="mt-1 text-gray-500">Explore our full collection</p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                category === cat.key
                  ? "bg-skin-500 text-white border-skin-500 shadow"
                  : "bg-white text-gray-600 border-gray-200 hover:border-skin-300 hover:text-skin-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 sm:ml-auto flex-wrap">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-skin-300 w-52"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z" />
            </svg>
          </div>

          {/* Max price */}
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max price $"
            min="0"
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-skin-300 w-32"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-5">
        {loading ? "Loading…" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-skin-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
