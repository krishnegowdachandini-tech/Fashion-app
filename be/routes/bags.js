const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../data/store");

const router = express.Router();
const CATEGORY = "bags";

// GET /api/bags  — optional ?brand=&gender=&material=&minPrice=&maxPrice=
router.get("/", (req, res) => {
  const db = readDB();
  let items = db[CATEGORY];

  const { brand, gender, material, minPrice, maxPrice } = req.query;
  if (brand) items = items.filter((i) => i.brand.toLowerCase() === brand.toLowerCase());
  if (gender) items = items.filter((i) => i.gender.toLowerCase() === gender.toLowerCase());
  if (material) items = items.filter((i) => i.material.toLowerCase().includes(material.toLowerCase()));
  if (minPrice) items = items.filter((i) => i.price >= parseFloat(minPrice));
  if (maxPrice) items = items.filter((i) => i.price <= parseFloat(maxPrice));

  res.json({ success: true, count: items.length, data: items });
});

// GET /api/bags/:id
router.get("/:id", (req, res) => {
  const db = readDB();
  const item = db[CATEGORY].find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Bag not found" });
  res.json({ success: true, data: item });
});

// POST /api/bags
router.post("/", (req, res) => {
  const { name, brand, price, description, color, material, dimensions, gender, stock, images, tags } = req.body;

  if (!name || !brand || price === undefined) {
    return res.status(400).json({ success: false, message: "name, brand and price are required" });
  }

  const newItem = {
    id: `bg-${uuidv4().slice(0, 8)}`,
    name,
    brand,
    category: CATEGORY,
    price: parseFloat(price),
    description: description || "",
    color: color || "",
    material: material || "",
    dimensions: dimensions || { width: 0, height: 0, depth: 0 },
    gender: gender || "Unisex",
    stock: stock !== undefined ? parseInt(stock) : 0,
    images: images || [],
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const db = readDB();
  db[CATEGORY].push(newItem);
  writeDB(db);

  res.status(201).json({ success: true, data: newItem });
});

// PUT /api/bags/:id
router.put("/:id", (req, res) => {
  const db = readDB();
  const idx = db[CATEGORY].findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Bag not found" });

  const updated = {
    ...db[CATEGORY][idx],
    ...req.body,
    id: db[CATEGORY][idx].id,
    category: CATEGORY,
    createdAt: db[CATEGORY][idx].createdAt,
    updatedAt: new Date().toISOString(),
  };

  if (updated.price !== undefined) updated.price = parseFloat(updated.price);
  if (updated.stock !== undefined) updated.stock = parseInt(updated.stock);

  db[CATEGORY][idx] = updated;
  writeDB(db);

  res.json({ success: true, data: updated });
});

// DELETE /api/bags/:id
router.delete("/:id", (req, res) => {
  const db = readDB();
  const idx = db[CATEGORY].findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Bag not found" });

  db[CATEGORY].splice(idx, 1);
  writeDB(db);

  res.json({ success: true, message: "Bag deleted" });
});

module.exports = router;
