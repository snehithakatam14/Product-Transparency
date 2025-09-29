import "./App.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { saveAs } from "file-saver";

export default function ProductLists() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://product-transparency-gbny.onrender.com/products");
      setProducts(res.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`https://product-transparency-gbny.onrender.com/api/products/${id}`);
      alert("🗑️ Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      alert("❌ Failed to delete product");
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product._id);
    setUpdatedData({
      name: product.name,
      brand: product.brand,
      price: product.price,
      description: product.description,
    });
  };

  const handleUpdateChange = (e) => {
    setUpdatedData({ ...updatedData, [e.target.name]: e.target.value });
  };

  const saveUpdate = async (id) => {
    try {
      await axios.put(`https://product-transparency-gbny.onrender.com/api/products/${id}`, updatedData);
      alert("✅ Product updated!");
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      alert("❌ Failed to update product");
    }
  };

  // 🧠 Fetch AI Score
  const fetchAIScore = async (product) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/transparency-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: product.description,
          aiAnswers: {},
        }),
      });
      const data = await response.json();
      alert(`🤖 AI Transparency Score: ${data.transparency_score}`);
    } catch (error) {
      console.error("❌ Error fetching AI score:", error);
    }
  };

  // 📤 Export all products as CSV
  const exportCSV = () => {
    const csvData = products.map((p) => ({
      Name: p.name,
      Brand: p.brand,
      Price: p.price,
      Description: p.description,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "products_export.csv");
  };

  return (
    <div className="product-section">
      <div className="header-bar">
        <h2>📦 All Products</h2>
        <button className="export-btn" onClick={exportCSV}>
          📁 Export CSV
        </button>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p._id} className="product-card">
              {editingProduct === p._id ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={updatedData.name}
                    onChange={handleUpdateChange}
                  />
                  <input
                    type="text"
                    name="brand"
                    value={updatedData.brand}
                    onChange={handleUpdateChange}
                  />
                  <input
                    type="number"
                    name="price"
                    value={updatedData.price}
                    onChange={handleUpdateChange}
                  />
                  <textarea
                    name="description"
                    value={updatedData.description}
                    onChange={handleUpdateChange}
                  />
                  <div className="button-row">
                    <button onClick={() => saveUpdate(p._id)}>💾 Save</button>
                    <button onClick={() => setEditingProduct(null)}>
                      ❌ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>{p.name}</h3>
                  <p>Brand: {p.brand}</p>
                  <p>Price: ${p.price}</p>
                  <p>{p.description}</p>

                  <div className="button-row">
                    <button onClick={() => startEditing(p)}>✏️ Edit</button>
                    <button onClick={() => deleteProduct(p._id)}>🗑️ Delete</button>
                    <button onClick={() => fetchAIScore(p)}>
                      🤖 Get AI Score
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
