import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../services/api";

const CATEGORY_LABEL = { specs: "Eyewear", bags: "Bags", cosmetics: "Cosmetics" };

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const imageUrl = getImageUrl(product.images?.[0]);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-skin-100 flex flex-col">
      <Link to={`/products/${product.category}/${product.id}`} className="block overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}/600/420`; }}
          />
        ) : (
          <div className="w-full h-52 bg-skin-100 flex items-center justify-center">
            <span className="text-skin-400 text-sm">No image</span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-skin-400">
            {CATEGORY_LABEL[product.category] || product.category}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <Link to={`/products/${product.category}/${product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-skin-600 transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-xs text-gray-400 mb-2">{product.brand}</p>
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-skin-700">${product.price.toFixed(2)}</span>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="text-sm bg-skin-500 text-white px-4 py-2 rounded-full hover:bg-skin-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
