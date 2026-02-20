import mongoose from "mongoose";

// item schema
const ItemSchema = new mongoose.Schema(
  {
    id: { type: String },
    description: { type: String, required: true },
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

// invoice schema

const invoiceSchema = new mongoose.Schema(
  {
    owner: {
      type: String, 
      required: true,
      index: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    issueDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    // business
    fromBusinessName: { type: String, default: "" },
    fromEmail: { type: String, default: "" },
    fromAddress: { type: String, default: "" },
    fromPhone: { type: String, default: "" },
    fromGst: { type: String, default: "" },

    // client
    client: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
    },

    items: {
      type: [ItemSchema],
      default: [],
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["draft", "unpaid", "paid", "overdue"],
      default: "draft",
    },

    // assets
    logoDataUrl: { type: String, default: null },
    stampDataUrl: { type: String, default: null },
    signatureDataUrl: { type: String, default: null },

    signatureName: { type: String, default: "" },
    signatureTitle: { type: String, default: "" },

    // tax and total
    taxPercent: { type: Number, default: 18 },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);


const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;
