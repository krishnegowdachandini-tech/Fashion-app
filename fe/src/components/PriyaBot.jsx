import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePriyaBot } from "../hooks/usePriyaBot";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../services/api";

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <Avatar />
      <div className="flex items-center gap-1 px-4 py-3 bg-skin-50 border border-skin-100 rounded-2xl rounded-bl-none">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-2 h-2 bg-skin-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.18}s`, animationDuration: "0.75s" }}
          />
        ))}
      </div>
    </div>
  );
}

function Avatar({ size = "sm" }) {
  const dim = size === "lg" ? "w-10 h-10 text-base" : "w-7 h-7 text-xs";
  return (
    <div className={`${dim} rounded-full bg-skin-500 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      P
    </div>
  );
}

function ChatProductCard({ product, onAddToCart }) {
  const imageUrl = getImageUrl(product.images?.[0]);
  return (
    <div className="flex-shrink-0 w-44 bg-white border border-skin-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="h-24 bg-skin-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}/200/160`; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-skin-300 text-xs">No image</div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
        <p className="text-sm font-bold text-skin-600 mt-1">${product.price.toFixed(2)}</p>
        <div className="flex gap-1.5 mt-2">
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 text-xs bg-skin-500 text-white rounded-lg py-1.5 hover:bg-skin-600 transition-colors font-medium"
          >
            🛒 Cart
          </button>
          <Link
            to={`/products/${product.category}/${product.id}`}
            className="text-xs border border-skin-300 text-skin-600 rounded-lg py-1.5 px-2 hover:bg-skin-50 transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

function PhotoUploadButton({ onUpload }) {
  const fileRef = useRef(null);
  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        className="hidden"
        onChange={() => fileRef.current?.files[0] && onUpload()}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="text-xs px-3 py-1.5 border border-dashed border-skin-400 text-skin-600 rounded-full hover:bg-skin-50 transition-colors flex items-center gap-1.5 w-fit"
      >
        📸 Upload photo
      </button>
    </>
  );
}

function MessageBubble({ msg, onQuickReply, onAddToCart, onPhotoUpload }) {
  const isBot = msg.from === "bot";

  return (
    <div className={`flex items-end gap-2 ${isBot ? "" : "flex-row-reverse"}`}>
      {isBot && <Avatar />}

      <div className={`flex flex-col gap-1.5 ${isBot ? "items-start" : "items-end"} max-w-[83%]`}>

        {/* Text bubble */}
        {msg.text && msg.type !== "upload" && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isBot
                ? "bg-skin-50 border border-skin-100 text-gray-800 rounded-bl-none"
                : "bg-skin-500 text-white rounded-br-none"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Photo upload prompt */}
        {msg.type === "upload" && (
          <div className="px-4 py-3 bg-skin-50 border border-skin-100 rounded-2xl text-sm text-gray-700 rounded-bl-none space-y-2">
            <p>{msg.text}</p>
            <PhotoUploadButton onUpload={onPhotoUpload} />
          </div>
        )}

        {/* Product cards */}
        {msg.products?.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 max-w-full">
            {msg.products.map((p) => (
              <ChatProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
            ))}
          </div>
        )}

        {/* Quick reply buttons — active or grayed after selection */}
        {msg.quickReplies?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {msg.quickReplies.map((r) => {
              const isSelected = msg.usedReply === r.label;
              const isDone = !!msg.usedReply;
              return (
                <button
                  key={r.value}
                  onClick={() => !isDone && onQuickReply(msg.id, r.value, r.label)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border font-medium transition-colors ${
                    isSelected
                      ? "bg-skin-500 text-white border-skin-500"
                      : isDone
                      ? "border-gray-200 text-gray-300 cursor-default"
                      : "border-skin-400 text-skin-600 hover:bg-skin-500 hover:text-white cursor-pointer"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Smart extras — persistent secondary actions */}
        {!msg.usedReply && msg.extras?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.extras.map((r) => (
              <button
                key={r.value}
                onClick={() => onQuickReply(null, r.value, r.label)}
                className="text-xs px-3 py-1 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-skin-400 hover:text-skin-600 transition-colors"
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* Photo upload inline option */}
        {!msg.usedReply && msg.hasPhotoUpload && (
          <PhotoUploadButton onUpload={onPhotoUpload} />
        )}
      </div>
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function PriyaBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [hasUnread, setHasUnread] = useState(false);

  const { messages, isTyping, handleQuickReply, handleTextInput, handlePhotoUpload } = usePriyaBot();
  const { addToCart } = useCart();

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const prevLenRef = useRef(0);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // Unread badge when chat is closed and new bot messages arrive
  useEffect(() => {
    const newBotMsg = messages.slice(prevLenRef.current).some((m) => m.from === "bot");
    if (newBotMsg && !isOpen) setHasUnread(true);
    prevLenRef.current = messages.length;
  }, [messages.length, isOpen]);

  const openChat = () => {
    setIsOpen(true);
    setHasUnread(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const sendText = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    handleTextInput(text);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    // brief confirmation added inline by the bot can be nice but we keep it simple
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat window ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="w-[360px] bg-white rounded-3xl shadow-2xl border border-skin-100 flex flex-col overflow-hidden"
          style={{ maxHeight: "min(580px, calc(100vh - 100px))" }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-skin-700 to-skin-500 px-5 py-3.5 flex items-center gap-3 flex-shrink-0">
            <Avatar size="lg" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Priya</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <p className="text-white/75 text-xs truncate">Online · Style Assistant 💅</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors flex-shrink-0"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onQuickReply={handleQuickReply}
                onAddToCart={handleAddToCart}
                onPhotoUpload={handlePhotoUpload}
              />
            ))}

            {isTyping && <TypingIndicator />}

            <div ref={endRef} />
          </div>

          {/* Input bar */}
          <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2 flex-shrink-0 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText()}
              placeholder="Type a message…"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-skin-300 focus:border-transparent bg-gray-50"
            />
            <button
              onClick={sendText}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl bg-skin-500 flex items-center justify-center text-white hover:bg-skin-600 transition-colors disabled:opacity-40 flex-shrink-0"
            >
              <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Floating action button ───────────────────────────────────────────── */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : openChat}
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center bg-gradient-to-br from-skin-600 to-skin-400 text-white"
        title={isOpen ? "Close Priya" : "Chat with Priya"}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Chat bubble icon */
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center animate-bounce">
            !
          </span>
        )}
      </button>

      {/* Tooltip label (shown when chat is closed) */}
      {!isOpen && (
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 hover:opacity-0 pointer-events-none"
          style={{ right: "100%", marginRight: 8 }}>
          Chat with Priya 👋
        </div>
      )}
    </div>
  );
}
