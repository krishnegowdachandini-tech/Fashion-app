import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../services/api";

const STEPS = ["Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orderDone, setOrderDone] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "US",
  });
  const [payment, setPayment] = useState({
    cardName: "", cardNumber: "", expiry: "", cvv: "",
  });

  const shippingCost = total >= 75 ? 0 : 9.99;
  const grandTotal = total + shippingCost;

  if (cart.length === 0 && !orderDone) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-900">Nothing to checkout</h2>
        <Link to="/products" className="inline-block mt-6 bg-skin-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-skin-600">
          Shop Now
        </Link>
      </div>
    );
  }

  if (orderDone) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="bg-white rounded-3xl border border-skin-100 p-12 shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Order Placed!</h2>
          <p className="text-gray-500 mt-3">
            Thank you, <strong>{shipping.firstName}</strong>! Your order has been confirmed. A confirmation will be sent to <strong>{shipping.email}</strong>.
          </p>
          <p className="text-lg font-bold text-skin-600 mt-4">Order Total: ${grandTotal.toFixed(2)}</p>
          <div className="flex flex-col gap-3 mt-8">
            <Link to="/products" className="bg-skin-500 text-white py-3 rounded-xl font-semibold hover:bg-skin-600 transition-colors">
              Continue Shopping
            </Link>
            <Link to="/" className="text-sm text-gray-400 hover:text-skin-600 transition-colors">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(1);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = () => {
    clearCart();
    setOrderDone(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < step ? "bg-green-500 text-white" : i === step ? "bg-skin-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${i === step ? "text-skin-600" : "text-gray-400"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mb-4 ${i < step ? "bg-green-400" : "bg-gray-200"}`} style={{ width: 60 }} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form column */}
        <div className="lg:col-span-2">

          {/* Step 0: Shipping */}
          {step === 0 && (
            <form onSubmit={handleShippingSubmit} className="bg-white rounded-2xl border border-skin-100 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <CheckoutField label="First Name" value={shipping.firstName} onChange={(v) => setShipping({ ...shipping, firstName: v })} required />
                <CheckoutField label="Last Name" value={shipping.lastName} onChange={(v) => setShipping({ ...shipping, lastName: v })} required />
                <CheckoutField label="Email" type="email" value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} required />
                <CheckoutField label="Phone" type="tel" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} />
                <div className="sm:col-span-2">
                  <CheckoutField label="Street Address" value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} required />
                </div>
                <CheckoutField label="City" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} required />
                <CheckoutField label="State / Province" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} required />
                <CheckoutField label="ZIP / Postal Code" value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: v })} required />
                <CheckoutField label="Country" value={shipping.country} onChange={(v) => setShipping({ ...shipping, country: v })} required />
              </div>
              <button type="submit" className="mt-8 bg-skin-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-skin-600 transition-colors">
                Continue to Payment →
              </button>
            </form>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <form onSubmit={handlePaymentSubmit} className="bg-white rounded-2xl border border-skin-100 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <CheckoutField label="Name on Card" value={payment.cardName} onChange={(v) => setPayment({ ...payment, cardName: v })} required />
                </div>
                <div className="sm:col-span-2">
                  <CheckoutField label="Card Number" value={payment.cardNumber} onChange={(v) => setPayment({ ...payment, cardNumber: v })} placeholder="•••• •••• •••• ••••" required />
                </div>
                <CheckoutField label="Expiry (MM/YY)" value={payment.expiry} onChange={(v) => setPayment({ ...payment, expiry: v })} placeholder="MM/YY" required />
                <CheckoutField label="CVV" value={payment.cvv} onChange={(v) => setPayment({ ...payment, cvv: v })} placeholder="•••" required />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setStep(0)} className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  ← Back
                </button>
                <button type="submit" className="bg-skin-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-skin-600 transition-colors">
                  Review Order →
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-skin-100 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Review Your Order</h2>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Shipping to</h3>
                <p className="text-sm text-gray-600">
                  {shipping.firstName} {shipping.lastName} · {shipping.email}<br />
                  {shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment</h3>
                <p className="text-sm text-gray-600">Card ending in {payment.cardNumber.slice(-4) || "••••"}</p>
              </div>

              <div className="space-y-3">
                {cart.map((item) => {
                  const imageUrl = getImageUrl(item.images?.[0]);
                  return (
                    <div key={item.id} className="flex items-center gap-4 py-2 border-b border-gray-50">
                      {imageUrl && (
                        <img src={imageUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover"
                          onError={(e) => { e.target.src = `https://picsum.photos/seed/${item.id}/100/100`; }} />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-skin-700">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  ← Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-skin-500 text-white py-3 rounded-xl font-semibold hover:bg-skin-600 transition-colors"
                >
                  Place Order · ${grandTotal.toFixed(2)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-skin-100 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-600 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="line-clamp-1">{item.name} × {item.quantity}</span>
                  <span className="ml-2 shrink-0 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutField({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-skin-300 focus:border-transparent"
      />
    </div>
  );
}
