import "./App.css";
import React, { useState } from "react";
import axios from "axios";
import ProductLists from "./ProductLists";
import "./index.css";

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
    aiAnswers: {},
  });

  const [aiQuestions, setAiQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAiAnswerChange = (index, value) => {
    setFormData({
      ...formData,
      aiAnswers: { ...formData.aiAnswers, [index]: value },
    });
  };

  const nextStep = async () => {
    if (step === 2) {
      try {
        setLoadingQuestions(true);
        const res = await axios.post("http://localhost:8000/generate-questions", {
          name: formData.name,
          brand: formData.brand,
          price: formData.price,
          description: formData.description,
        });
        setAiQuestions(res.data.questions || []);
      } catch (err) {
        alert("⚠️ Could not generate AI questions.");
      } finally {
        setLoadingQuestions(false);
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/products", formData);
      alert("✅ Product added successfully!");
      setFormData({
        name: "",
        brand: "",
        price: "",
        description: "",
        aiAnswers: {},
      });
      setAiQuestions([]);
      setStep(1);
    } catch (error) {
      alert("❌ Failed to add product");
    }
  };

  return (
    <div className="container">
      <h1 className="title"> Product Transparency Portal</h1>

      <div className="form-card">
        <h2>Step {step} / 3</h2>

        <form onSubmit={handleSubmit} className="form">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <label>Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />

              <label>Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} required />

              <div className="btn-row">
                <button type="button" onClick={nextStep} className="btn next">
                  Next ➡️
                </button>
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <label>Price</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required />

              <div className="btn-row">
                <button type="button" onClick={prevStep} className="btn back">⬅️ Back</button>
                <button type="button" onClick={nextStep} className="btn next">Next ➡️</button>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />

              {loadingQuestions ? (
                <p>🤖 Generating intelligent questions...</p>
              ) : (
                aiQuestions.length > 0 && (
                  <div className="ai-questions">
                    <h4>🤖 Additional AI Questions</h4>
                    {aiQuestions.map((q, idx) => (
                      <div key={idx}>
                        <label>{q}</label>
                        <input
                          type="text"
                          value={formData.aiAnswers[idx] || ""}
                          onChange={(e) => handleAiAnswerChange(idx, e.target.value)}
                          placeholder="Your answer"
                        />
                      </div>
                    ))}
                  </div>
                )
              )}

              <div className="btn-row">
                <button type="button" onClick={prevStep} className="btn back">⬅️ Back</button>
                <button type="submit" className="btn submit">✅ Submit</button>
              </div>
            </>
          )}
        </form>
      </div>

      <ProductLists />

      <footer className="footer">
        <p>✨ Making product info clearer & greener ✨</p>
      </footer>
    </div>
  );
}
