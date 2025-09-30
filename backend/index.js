import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { jsPDF } from "jspdf";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ✅ Allow frontend (Vercel) + local dev
app.use(
  cors({
    origin: [
      "https://product-transparency-two.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ Schema
const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  description: String,
});

const Product = mongoose.model("Product", productSchema);

// ✅ Routes
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("❌ Failed to fetch products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Failed to add product:", error);
    res.status(400).json({ error: "Failed to add product" });
  }
});

// ✅ PDF generation route
app.get("/api/products/pdf", async (req, res) => {
  try {
    const products = await Product.find();

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Product Transparency Report", 20, 20);

    let y = 40;
    products.forEach((p, i) => {
      doc.setFontSize(12);
      doc.text(`${i + 1}. ${p.name} (${p.brand}) - ${p.description}`, 20, y);
      y += 10;
    });

    const pdfBuffer = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products.pdf");
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error("❌ Failed to generate PDF:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
