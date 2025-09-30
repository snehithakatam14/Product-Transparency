import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

export default function ProductLists() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>📦 Loading products...</p>;
  if (products.length === 0) return <p>❌ No products found.</p>;

  return (
    <div className="product-list">
      <h2>📋 Product List</h2>
      {products.map((p) => (
        <div key={p._id} className="product-card">
          <h3>{p.name}</h3>
          <p><strong>Brand:</strong> {p.brand}</p>
          <p><strong>Price:</strong> ₹{p.price}</p>
          <p><strong>Description:</strong> {p.description}</p>
        </div>
      ))}
    </div>
  );
}
