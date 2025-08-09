const express = require("express");

// In-memory test data (feel free to modify/extend)
let products = [
  {
    id: 1,
    name: "Classic Tee",
    category: "Apparel",
    price: 19.99,
    imageUrl: "https://via.placeholder.com/400x400?text=Classic+Tee",
    inStock: true,
    variants: ["S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: "Running Shoes",
    category: "Footwear",
    price: 79.5,
    imageUrl: "https://via.placeholder.com/400x400?text=Running+Shoes",
    inStock: true,
    variants: ["7", "8", "9", "10"],
  },
  {
    id: 3,
    name: "Denim Jacket",
    category: "Apparel",
    price: 59.0,
    imageUrl: "https://via.placeholder.com/400x400?text=Denim+Jacket",
    inStock: false,
    variants: ["S", "M", "L"],
  },
  {
    id: 4,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 129.99,
    imageUrl: "https://via.placeholder.com/400x400?text=Headphones",
    inStock: true,
    variants: [],
  },
];

const router = express.Router();

// GET /products - list all, with optional category filter
router.get("/products", (req, res) => {
  const { category } = req.query;
  if (category) {
    const filtered = products.filter(
      (p) => String(p.category).toLowerCase() === String(category).toLowerCase()
    );
    return res.json(filtered);
  }
  return res.json(products);
});

// GET /products/:id - single by ID
router.get("/products/:id", (req, res) => {
  const idParam = req.params.id;
  const idNum = Number(idParam);
  const product = products.find((p) => p.id === idNum);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json(product);
});

// POST /products - create new (basic validation)
router.post("/products", (req, res) => {
  const { id, name, category, price, imageUrl, inStock, variants } = req.body || {};

  const errors = [];
  if (!name || typeof name !== "string") errors.push("'name' is required (string)");
  if (category == null || typeof category !== "string") errors.push("'category' is required (string)");
  if (price == null || typeof price !== "number" || Number.isNaN(price))
    errors.push("'price' is required (number)");
  if (variants && !Array.isArray(variants)) errors.push("'variants' must be an array if provided");
  if (inStock != null && typeof inStock !== "boolean") errors.push("'inStock' must be boolean if provided");

  if (errors.length) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const newId = id != null ? Number(id) : (products.reduce((m, p) => Math.max(m, p.id), 0) + 1);
  if (products.some((p) => p.id === newId)) {
    return res.status(409).json({ message: `Product with id ${newId} already exists` });
  }

  const newProduct = {
    id: newId,
    name,
    category,
    price,
    imageUrl: imageUrl || null,
    inStock: inStock == null ? true : !!inStock,
    variants: Array.isArray(variants) ? variants : [],
  };
  products.push(newProduct);
  return res.status(201).json(newProduct);
});

module.exports = router;

