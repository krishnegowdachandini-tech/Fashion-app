import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../services/api";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-6">🛒</p>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Looks like you haven't added anything yet.</p>
        <Link
          to="/products"
          className="inline-block mt-8 bg-skin-500 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-skin-600 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const shipping = total >= 75 ? 0 : 9.99;
  const grandTotal = total + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const imageUrl = getImageUrl(item.images?.[0]);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-skin-100 p-5 flex gap-5 shadow-sm">
                {/* Image */}
                <Link to={`/products/${item.category}/${item.id}`} className="shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-24 h-24 rounded-xl object-cover"
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.id}/200/200`; }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-skin-100 flex items-center justify-center text-skin-300 text-xs">No image</div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/products/${item.category}/${item.id}`} className="font-semibold text-gray-900 hover:text-skin-600 transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors ml-4 shrink-0"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-skin-50 transition-colors text-sm"
                      >−</button>
                      <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-gray-600 hover:bg-skin-50 transition-colors text-sm"
                      >+</button>
                    </div>
                    <span className="font-bold text-skin-700">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={clearCart}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors mt-2"
          >
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-skin-100 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-skin-500">
                  Add ${(75 - total).toFixed(2)} more for free shipping
                </p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full mt-6 bg-skin-500 text-white py-3.5 rounded-xl font-semibold hover:bg-skin-600 transition-colors"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/products"
              className="block text-center mt-3 text-sm text-gray-400 hover:text-skin-600 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
