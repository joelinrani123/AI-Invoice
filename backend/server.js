import "dotenv/config"; 

import express from "express";
import cors from "cors";

import path from "path";
import { clerkMiddleware } from "@clerk/express";

import connectDB from "./config/db.js";

import invoiceRouter from "./routes/invoiceRouter.js";
import businessProfileRouter from "./routes/businessProfileRouter.js";
import aiInvoiceRouter from "./routes/aiInvoiceRouter.js";

const app = express();
const PORT = process.env.PORT || 4000;


// database
connectDB();

// middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-invoice-joelin.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// app.use(clerkMiddleware());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.use("/api/invoice", invoiceRouter);
app.use("/api/businessProfile", businessProfileRouter);
app.use("/api/ai", aiInvoiceRouter);


app.get("/", (req, res) => {
  res.send("API WORKING");
});

// To start server
app.listen(PORT, () => {
  console.log(`Server running at port :${PORT}`);
});
