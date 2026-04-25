import { useState, useRef, useEffect } from "react";
import { specsApi, bagsApi, cosmeticsApi } from "../services/api";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let _id = 0;
const uid = () => `m${++_id}`;

// ─── Static data ──────────────────────────────────────────────────────────────

export const MAIN_MENU = [
  { label: "👓 Specs", value: "specs" },
  { label: "👜 Bags", value: "bags" },
  { label: "💄 Cosmetics", value: "cosmetics" },
  { label: "✨ Complete Look", value: "complete" },
];

export const SMART_EXTRAS = [
  { label: "🔥 Best Sellers", value: "best_sellers" },
  { label: "✨ Trending Picks", value: "trending" },
];

const FLOWS = {
  specs: [
    {
      key: "faceShape",
      text: "What's your face shape? 🔍",
      options: ["Round", "Oval", "Square", "Not sure"],
      hasPhotoUpload: true,
    },
    {
      key: "style",
      text: "What style do you prefer? 😎",
      options: ["Formal", "Casual", "Trendy"],
    },
    {
      key: "budget",
      text: "What's your budget range? 💰",
      options: ["Under $50", "$50–$100", "Premium ($100+)"],
    },
  ],
  bags: [
    {
      key: "use",
      text: "Where will you mainly use this bag? 👜",
      options: ["Office", "Travel", "Casual", "Party"],
    },
    {
      key: "size",
      text: "What size do you need?",
      options: ["Small", "Medium", "Large"],
    },
    {
      key: "color",
      text: "Any preferred color? 🎨",
      options: ["Black", "Brown", "Trendy"],
    },
  ],
  cosmetics: [
    {
      key: "skinTone",
      text: "What's your skin tone? 🌸",
      options: ["Fair", "Medium", "Dark"],
    },
    {
      key: "lookingFor",
      text: "What are you looking for? 💄",
      options: ["Lipstick 💋", "Skincare 🌿", "Full kit ✨"],
    },
    {
      key: "occasion",
      text: "What's the occasion? 🎉",
      options: ["Daily", "Party", "Wedding"],
    },
  ],
};

const CATEGORY_INTROS = {
  specs: [
    "Great choice! 👓 Glasses can totally transform your look.",
    "Let me find your perfect pair — just a few quick questions!",
  ],
  bags: [
    "Love it! 👜 A great bag completes any outfit.",
    "Let me find the one made for you!",
  ],
  cosmetics: [
    "Let's create your perfect beauty look! 💄✨",
    "A few quick questions and I'll nail it for you.",
  ],
  complete: [
    "A full makeover? I love it! ✨",
    "Let me curate the perfect head-to-toe look for you...",
  ],
};

// ─── API helpers ──────────────────────────────────────────────────────────────

const buildFilters = (flow, answers) => {
  const f = {};
  if (flow === "specs") {
    if (answers.budget === "Under $50") f.maxPrice = 50;
    else if (answers.budget === "$50–$100") { f.minPrice = 50; f.maxPrice = 100; }
    else if (answers.budget?.startsWith("Premium")) f.minPrice = 100;
  }
  if (flow === "cosmetics") {
    if (answers.lookingFor?.includes("Lipstick")) f.subCategory = "lips";
    else if (answers.lookingFor?.includes("Skincare")) f.subCategory = "face";
  }
  return f;
};

const fetchProducts = async (flow, answers = {}) => {
  const filters = buildFilters(flow, answers);
  if (flow === "specs")    return (await specsApi.getAll(filters)).data;
  if (flow === "bags")     return (await bagsApi.getAll(filters)).data;
  if (flow === "cosmetics") return (await cosmeticsApi.getAll(filters)).data;
  // complete or best_sellers → one from each
  const [s, b, c] = await Promise.all([specsApi.getAll(), bagsApi.getAll(), cosmeticsApi.getAll()]);
  return [...s.data.slice(0, 2), ...b.data.slice(0, 2), ...c.data.slice(0, 2)];
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePriyaBot() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const flowRef = useRef({ name: null, step: 0, answers: {} });
  const busyRef = useRef(false);

  // ── Low-level message helpers ───────────────────────────────────────────────

  const addMsg = (msg) =>
    setMessages((prev) => [...prev, { id: uid(), ...msg }]);

  const markReplied = (msgId, label) =>
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, usedReply: label } : m))
    );

  const botSay = async (msg, delay = 1100) => {
    setIsTyping(true);
    await sleep(delay);
    setIsTyping(false);
    addMsg({ from: "bot", ...msg });
  };

  // ── Flow helpers ────────────────────────────────────────────────────────────

  const showStep = async (flowName, stepIdx) => {
    const step = FLOWS[flowName][stepIdx];
    await botSay(
      {
        text: step.text,
        quickReplies: step.options.map((o) => ({ label: o, value: o })),
        hasPhotoUpload: !!step.hasPhotoUpload,
      },
      900
    );
  };

  const showProducts = async (flow, answers) => {
    await botSay({ text: "Perfect! Let me find the best options for you... 🔍" }, 750);
    let products = [];
    try {
      setIsTyping(true);
      products = await fetchProducts(flow, answers);
      await sleep(1300);
      setIsTyping(false);
    } catch {
      setIsTyping(false);
    }

    if (!products.length) {
      addMsg({ from: "bot", text: "Hmm, couldn't match exactly — here are my top picks instead!" });
      try { products = await fetchProducts(flow, {}); } catch { products = []; }
    }

    addMsg({
      from: "bot",
      text: `Found ${products.length} great option${products.length !== 1 ? "s" : ""} for you! 🛍️`,
      products,
    });

    await sleep(450);
    addMsg({
      from: "bot",
      text: "What would you like to do?",
      quickReplies: [
        { label: "🛒 Add to Cart", value: "action_add" },
        { label: "🔍 Compare similar", value: "action_compare" },
        { label: "⭐ See reviews", value: "action_reviews" },
        { label: "💰 Buy now", value: "action_buy" },
        { label: "🔄 Start over", value: "restart" },
      ],
    });
  };

  // ── Category flow start ─────────────────────────────────────────────────────

  const startFlow = async (category) => {
    if (category === "complete") {
      flowRef.current = { name: "complete", step: 0, answers: {} };
      for (const line of CATEGORY_INTROS.complete) await botSay({ text: line }, 850);
      await showProducts("complete", {});
      return;
    }

    flowRef.current = { name: category, step: 0, answers: {} };
    for (const line of CATEGORY_INTROS[category]) await botSay({ text: line }, 850);
    await showStep(category, 0);
  };

  const advanceStep = async (answer) => {
    const { name, step, answers } = flowRef.current;
    const newAnswers = { ...answers, [FLOWS[name][step].key]: answer };
    const nextStep = step + 1;

    if (nextStep < FLOWS[name].length) {
      flowRef.current = { name, step: nextStep, answers: newAnswers };
      await showStep(name, nextStep);
    } else {
      flowRef.current = { name, step: nextStep, answers: newAnswers };
      await showProducts(name, newAnswers);
    }
  };

  // ── Special actions ─────────────────────────────────────────────────────────

  const handleSpecial = async (value) => {
    if (value === "restart" || value === "main_menu") {
      flowRef.current = { name: null, step: 0, answers: {} };
      await botSay(
        {
          text: "No problem! 😊 What would you like to explore?",
          quickReplies: MAIN_MENU,
          extras: SMART_EXTRAS,
        },
        650
      );
      return true;
    }

    if (value === "best_sellers" || value === "trending") {
      await botSay({ text: "🔥 Here are our hottest items right now!" }, 850);
      let products = [];
      try {
        setIsTyping(true);
        products = await fetchProducts("complete");
        await sleep(1300);
        setIsTyping(false);
      } catch { setIsTyping(false); }
      addMsg({ from: "bot", products });
      await sleep(450);
      addMsg({
        from: "bot",
        text: "Want to explore a specific category?",
        quickReplies: MAIN_MENU,
      });
      return true;
    }

    if (value === "action_add") {
      await botSay({ text: "Tap 'Cart' on any product card above and it's done! 🛒" }, 650);
      return true;
    }

    if (value === "action_compare") {
      await botSay({
        text: "Sure! Browse the same category and compare prices, materials, and reviews 🔍",
        quickReplies: MAIN_MENU,
      }, 800);
      return true;
    }

    if (value === "action_reviews") {
      await botSay({
        text: "All our products have verified reviews ⭐ Click 'View' on any product card for full details!",
      }, 800);
      return true;
    }

    if (value === "action_buy") {
      await botSay({
        text: "Add the product to your cart and head to checkout to complete your purchase! 💳",
      }, 750);
      return true;
    }

    if (value === "upload_face") {
      addMsg({
        from: "bot",
        text: "Sure! Upload a selfie and I'll analyze your face shape 📸",
        type: "upload",
      });
      return true;
    }

    if (value === "virtual_try") {
      await botSay({
        text: "Virtual try-on is launching very soon! 🚀 For now, here's what suits most face shapes:",
        quickReplies: [{ label: "👓 Show all frames", value: "specs" }],
      }, 850);
      return true;
    }

    return false;
  };

  // ── Public handlers ─────────────────────────────────────────────────────────

  const handleQuickReply = async (msgId, value, label) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      if (msgId) markReplied(msgId, label);
      addMsg({ from: "user", text: label });

      const handled = await handleSpecial(value);
      if (handled) return;

      if (!flowRef.current.name) {
        await startFlow(value);
      } else {
        await advanceStep(value);
      }
    } finally {
      busyRef.current = false;
    }
  };

  const handlePhotoUpload = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      addMsg({ from: "user", text: "📸 Photo uploaded" });
      await botSay({ text: "Got it! Analyzing your face shape... 🔍" }, 550);
      setIsTyping(true);
      await sleep(2200);
      setIsTyping(false);
      addMsg({
        from: "bot",
        text: "✨ You'd look amazing in almost any frame! I especially recommend these for you:",
      });
      let products = [];
      try { products = (await specsApi.getAll()).data; } catch { products = []; }
      addMsg({ from: "bot", products });
      await sleep(450);
      addMsg({
        from: "bot",
        text: "Want to try them virtually? (Coming soon 🚀)",
        quickReplies: [
          { label: "✨ Try virtually", value: "virtual_try" },
          { label: "🛒 Add to Cart", value: "action_add" },
          { label: "🔄 Start over", value: "restart" },
        ],
      });
    } finally {
      busyRef.current = false;
    }
  };

  const handleTextInput = async (text) => {
    if (busyRef.current || !text.trim()) return;
    busyRef.current = true;
    try {
      addMsg({ from: "user", text });
      const t = text.toLowerCase();

      if (/^(hi|hello|hey|hola|sup)\b/.test(t)) {
        await botSay(
          { text: "Hey! 😊 Great to see you! What can I help you with?", quickReplies: MAIN_MENU, extras: SMART_EXTRAS },
          700
        );
      } else if (/spec|glass|eyewear|frame|sunglass/.test(t)) {
        flowRef.current = { name: null, step: 0, answers: {} };
        await startFlow("specs");
      } else if (/bag|purse|tote|clutch|sling|backpack/.test(t)) {
        flowRef.current = { name: null, step: 0, answers: {} };
        await startFlow("bags");
      } else if (/cosmet|makeup|beauty|lipstick|foundation|mascara|palette/.test(t)) {
        flowRef.current = { name: null, step: 0, answers: {} };
        await startFlow("cosmetics");
      } else if (/best seller|trending|popular|hot|top/.test(t)) {
        await handleSpecial("best_sellers");
      } else if (/buy now|checkout|purchase/.test(t)) {
        await botSay({ text: "Add products to your cart then head to checkout — easy! 🛒💳" }, 700);
      } else if (/price|budget|cheap|afford|expensive/.test(t)) {
        await botSay(
          { text: "We have something for every budget 💰 What category are you shopping for?", quickReplies: MAIN_MENU },
          800
        );
      } else {
        await botSay(
          {
            text: "I didn't get that 🤔 Do you want specs, bags, or cosmetics?",
            quickReplies: MAIN_MENU,
            extras: SMART_EXTRAS,
          },
          800
        );
      }
    } finally {
      busyRef.current = false;
    }
  };

  // ── Init greeting ───────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await sleep(550);
      if (cancelled) return;
      addMsg({ from: "bot", text: "Hey 👋 I'm Priya, your personal style assistant!" });
      await sleep(950);
      if (cancelled) return;
      setIsTyping(true);
      await sleep(1050);
      if (cancelled) return;
      setIsTyping(false);
      addMsg({
        from: "bot",
        text: "I can help you build your perfect look 😎 What are you shopping for?",
        quickReplies: MAIN_MENU,
        extras: SMART_EXTRAS,
      });
    })();

    return () => { cancelled = true; };
  }, []);

  return { messages, isTyping, handleQuickReply, handleTextInput, handlePhotoUpload };
}
