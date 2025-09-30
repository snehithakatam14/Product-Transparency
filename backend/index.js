require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Product = require("./models/Product");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(bodyParser.json());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully 🚀");
});

app.get("/add-product", async (req, res) => {
  try {
    const newProduct = new Product({
      name: "Laptop",
      brand: "Dell",
      price: 799,
      description: "A powerful laptop for developers",
    });
    await newProduct.save();
    res.send("✅ Product added to database!");
  } catch (error) {
    res.status(500).send("❌ Failed to add product");
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send("❌ Failed to fetch products");
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, brand, price, description, aiAnswers } = req.body;
    const newProduct = new Product({ name, brand, price, description, aiAnswers });
    await newProduct.save();
    res.status(201).json({ message: "✅ Product added", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, brand, price, description } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, brand, price, description },
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "✅ Product updated", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// New: generate a summary PDF for a single product and stream it to the client
app.get("/api/products/:id/pdf", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="product-${product._id}.pdf"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(20).text("Product Transparency Summary", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Name: ${product.name}`);
    doc.moveDown(0.2);
    doc.fontSize(12).text(`Brand: ${product.brand}`);
    doc.moveDown(0.2);
    doc.text(`Price: $${product.price}`);
    doc.moveDown(0.5);
    doc.fontSize(12).text("Summary:");
    doc.moveDown(0.2);
    doc.fontSize(11).text(product.description || "No description provided.", { align: "left" });
    doc.moveDown(0.7);

    // If there are AI answers stored, include short bullets
    if (product.aiAnswers && Object.keys(product.aiAnswers).length > 0) {
      doc.fontSize(12).text("AI-collected details:");
      doc.moveDown(0.2);
      Object.entries(product.aiAnswers).forEach(([k, v], i) => {
        doc.fontSize(10).text(`• ${v}`);
      });
      doc.moveDown();
    }

    doc.fontSize(10).fillColor("gray").text(`Generated: ${new Date().toLocaleString()}`, { align: "right" });

    doc.end();
  } catch (error) {
    console.error("❌ Failed to generate product PDF:", error);
    res.status(500).send("❌ Failed to generate product PDF");
  }
});

app.get("/api/products/pdf", async (req, res) => {
  try {
    const products = await Product.find();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="products-report.pdf"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(20).text("Product Report", { align: "center" });
    doc.moveDown();

    products.forEach((p, index) => {
      doc.fontSize(14).text(`Product #${index + 1}`);
      doc.fontSize(12).text(`Name: ${p.name}`);
      doc.text(`Brand: ${p.brand}`);
      doc.text(`Price: $${p.price}`);
      doc.text(`Description: ${p.description || "N/A"}`);
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("❌ Failed to generate bulk PDF:", error);
    res.status(500).send("❌ Failed to generate PDF");
  }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
