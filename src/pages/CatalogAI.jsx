import React, { useMemo, useState } from "react";
import sampleProducts from "../data/sampleProducts";
import { ProductCard } from "../components";

const parseQuery = (text) => {
  // very simple heuristic parser for demo
  const t = (text || "").toLowerCase();
  const res = { maxPrice: undefined, category: undefined, minRating: undefined, terms: [] };

  // price under/less than $X
  const priceMatch = t.match(/under \$?([0-9]+(?:\.[0-9]+)?)/) || t.match(/less than \$?([0-9]+(?:\.[0-9]+)?)/);
  if (priceMatch) res.maxPrice = parseFloat(priceMatch[1]);

  // rating at least X or good reviews
  const ratingMatch = t.match(/(rating|reviews?)\s*(?:of|at least|>=?)\s*([0-9](?:\.[0-9])?)/);
  if (ratingMatch) res.minRating = parseFloat(ratingMatch[2]);
  if (t.includes("good reviews") || t.includes("highly rated") || t.includes("top rated")) res.minRating = Math.max(res.minRating || 0, 4);

  // category keywords
  const cats = ["apparel", "footwear", "electronics", "accessories", "outdoors"];
  for (const c of cats) {
    if (t.includes(c)) res.category = c.charAt(0).toUpperCase() + c.slice(1);
  }

  // general terms (e.g., 'running', 'yoga') used to match name/description
  const stop = new Set(["show", "me", "with", "and", "the", "a", "an", "under", "less", "than", "rating", "reviews", "at", "least"]);
  res.terms = t.split(/[^a-z0-9]+/).filter(Boolean).filter((w) => !stop.has(w));

  return res;
};

const filterProducts = (query) => {
  return sampleProducts.filter((p) => {
    if (query.category && String(p.category).toLowerCase() !== String(query.category).toLowerCase()) return false;
    if (query.maxPrice != null && p.price > query.maxPrice) return false;
    if (query.minRating != null && p.rating < query.minRating) return false;
    if (query.terms.length) {
      const hay = (p.name + " " + p.description).toLowerCase();
      for (const term of query.terms) {
        if (!hay.includes(term)) return false;
      }
    }
    return true;
  });
};

const CatalogAI = () => {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const parsed = useMemo(() => parseQuery(input), [input]);
  const results = useMemo(() => {
    const effCategory = category || parsed.category;
    const effMaxPrice = priceMax ? Number(priceMax) : parsed.maxPrice;
    const q = { ...parsed, category: effCategory, maxPrice: effMaxPrice };
    return filterProducts(q);
  }, [parsed, category, priceMax]);

  return (
    <div className="container my-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h2 className="m-0">Catalog AI</h2>
        <a href="/" className="btn btn-outline-secondary btn-sm">Back to Home</a>
      </div>
      <div className="row g-3 align-items-end">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Natural language search</label>
          <div className="input-group">
            <span className="input-group-text bg-white"><i className="fa fa-search" /></span>
            <input
              className="form-control"
              placeholder="e.g. running shoes under $100 with good reviews"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="form-text">Understands simple phrases: price ceilings, categories, and "good reviews".</div>
        </div>
        <div className="col-md-3">
          <label className="form-label">Filter by Category</label>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            <option>Apparel</option>
            <option>Footwear</option>
            <option>Electronics</option>
            <option>Accessories</option>
            <option>Outdoors</option>
          </select>
        </div>
        <div className="col-md-3">
      <div className="alert alert-info py-2 small" role="alert">
        Try: <em>running shoes under $100 with good reviews</em> or <em>Apparel under $50</em>
      </div>

          <label className="form-label">Max Price</label>
          <input className="form-control" type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="e.g. 100" />
        </div>
      </div>

      <hr className="my-4" />

      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-2">Results</h5>
            <span className="text-muted small">{results.length} items</span>
          </div>
          <div className="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {results.map((p) => (
              <div key={p.id} className="col">
                <ProductCard
                  id={p.id}
                  imageUrl={p.imageUrl || "/assets/product-placeholder.svg"}
                  name={p.name}
                  price={p.price}
                  currency="USD"
                  inStock={true}
                  variants={["Standard"]}
                  onAddToCart={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-2">Catalog (All Products)</h5>
            <span className="text-muted small">{sampleProducts.length} items</span>
          </div>
          <div className="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {sampleProducts.map((p) => (
              <div key={p.id} className="col">
                <ProductCard
                  id={p.id}
                  imageUrl={p.imageUrl || "/assets/product-placeholder.svg"}
                  name={p.name}
                  price={p.price}
                  currency="USD"
                  inStock={true}
                  variants={["Standard"]}
                  onAddToCart={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h6>How this AI could integrate with blockchain</h6>
        <ul>
          <li>Token-gated pricing: NLP search can detect premium segments; token holders could unlock dynamic discounts enforced by smart contracts.</li>
          <li>On-chain preferences: aggregate natural language queries into on-chain profiles to personalize future results while preserving user-controlled data ownership.</li>
          <li>Loyalty smart contracts: reward intents (e.g., “eco-friendly shoes”) with on-chain loyalty points when purchases match AI-detected preferences.</li>
        </ul>
      </div>
    </div>
  );
};

export default CatalogAI;

