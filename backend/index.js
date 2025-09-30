import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { jsPDF } from "jspdf";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Allow frontend
app.use(
  cors({
    origin: ["https://product-transparency-two.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ✅ Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  price: Number,
  description: String,
});
const Product = mongoose.model("Product", productSchema);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Get all products
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ✅ Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: "Failed to add product" });
  }
});

// ✅ Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Failed to update product" });
  }
});

// ✅ Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete product" });
  }
});

// ✅ Generate PDF
app.get("/api/products/pdf", async (req, res) => {
  try {
    const products = await Product.find();
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("📊 Product Transparency Report", 20, 20);

    let y = 40;
    products.forEach((p, i) => {
      doc.setFontSize(12);
      doc.text(
        `${i + 1}. ${p.name} (${p.brand}) - ₹${p.price} - ${p.description}`,
        20,
        y
      );
      y += 10;
    });

    const pdfBuffer = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products.pdf");
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
