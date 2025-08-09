import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import "./ProductCard.css";

// Inline SVG placeholder (light gray) for broken images
const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
      <rect width='100%' height='100%' fill='#f1f3f5'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#adb5bd' font-family='Arial, sans-serif' font-size='20'>Image unavailable</text>
    </svg>`
  );

function formatCurrency(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    // Fallback if an invalid currency is passed
    return `$${Number(value).toFixed(2)}`;
  }
}

// Normalize variants to a consistent array of { id, label }
function normalizeVariants(variants) {
  if (!variants || variants.length === 0) return [];
  return variants.map((v, idx) => {
    if (typeof v === "string" || typeof v === "number") {
      return { id: String(v), label: String(v) };
    }
    if (v && (v.id || v.value || v.label)) {
      const id = String(v.id ?? v.value ?? idx);
      const label = String(v.label ?? v.name ?? v.id ?? v.value ?? idx);
      return { id, label };
    }
    return { id: String(idx), label: String(v) };
  });
}

const ProductCard = ({
  id,
  imageUrl,
  name,
  price,
  currency = "USD",
  inStock = true,
  quantity,
  variants = [],
  defaultVariantId,
  onAddToCart,
  className = "",
  badge,
  showPrice = true,
  detailHref,
}) => {
  const isOutOfStock = !inStock || (typeof quantity === "number" && quantity <= 0);

  const normalizedVariants = useMemo(() => normalizeVariants(variants), [variants]);

  const initialVariant = useMemo(() => {
    if (!normalizedVariants.length) return undefined;
    if (defaultVariantId) {
      const match = normalizedVariants.find((v) => v.id === String(defaultVariantId));
      if (match) return match.id;
    }
    return normalizedVariants[0]?.id;
  }, [normalizedVariants, defaultVariantId]);

  const [selectedVariant, setSelectedVariant] = useState(initialVariant);

  const handleAdd = () => {
    if (typeof onAddToCart === "function") {
      onAddToCart({ id, name, price, currency, imageUrl, variantId: selectedVariant });
    }
  };

  return (
    <div className={`card product-card h-100 ${className}`.trim()} data-testid="product-card">
      {/* Image */}
      <div className="ratio ratio-4x3 product-card-img-wrap">
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          src={imageUrl || FALLBACK_IMG}
          alt={name}
          className="card-img-top"
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMG) {
              e.currentTarget.src = FALLBACK_IMG;
            }
          }}
        />
        {isOutOfStock && (
          <span className="badge bg-secondary product-card-badge" aria-label="Out of Stock">
            Out of Stock
          </span>
        )}
        {!!badge && !isOutOfStock && (
          <span className="badge bg-dark product-card-badge" aria-label={String(badge)}>
            {badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="card-body d-flex flex-column">
        <h6 className="card-title mb-1 text-truncate" title={name}>
          {name}
        </h6>
        {showPrice && (
          <div className="mb-2 fw-semibold" aria-label="price">
            {formatCurrency(price, currency)}
          </div>
        )}

        {/* Variants */}
        {normalizedVariants.length > 1 ? (
          <div className="mb-2">
            <label htmlFor={`variant-${id}`} className="form-label small mb-1">
              Variant
            </label>
            <select
              id={`variant-${id}`}
              className="form-select form-select-sm"
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              aria-label="Choose a variant"
            >
              {normalizedVariants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        ) : normalizedVariants.length === 1 ? (
          <div className="mb-2 small text-muted" aria-label="Single variant">
            {normalizedVariants[0].label}
          </div>
        ) : null}

        {/* Spacer */}
        <div className="mt-auto" />

        {/* CTA */}
        {isOutOfStock ? (
          <button type="button" className="btn btn-secondary w-100" disabled aria-disabled>
            Out of Stock
          </button>
        ) : (
          <div className="d-grid gap-2">
            <button
              type="button"
              className="btn btn-dark"
              onClick={handleAdd}
              aria-label="Add to Cart"
            >
              Add to Cart
            </button>
            {detailHref && (
              <a href={detailHref} className="btn btn-outline-dark" aria-label="Buy Now">
                Buy Now
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  imageUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currency: PropTypes.string,
  inStock: PropTypes.bool,
  quantity: PropTypes.number,
  variants: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({ id: PropTypes.any, value: PropTypes.any, label: PropTypes.any, name: PropTypes.any }),
    ])
  ),
  defaultVariantId: PropTypes.any,
  onAddToCart: PropTypes.func,
  className: PropTypes.string,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showPrice: PropTypes.bool,
  detailHref: PropTypes.string,
};

export default ProductCard;

