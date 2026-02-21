import Invoice from "../models/invoiceModel.js";
import path from "path";


// helper

function computeTotals(items = [], taxPercent = 0) {
  const safe = Array.isArray(items) ? items.filter(Boolean) : [];
  const subtotal = safe.reduce(
    (sum, it) => sum + Number(it.qty || 0) * Number(it.unitPrice || 0),
    0
  );
  const tax = (subtotal * Number(taxPercent || 0)) / 100;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function parseItemsField(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }
  return [];
}

function isObjectIdString(val) {
  return typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val);
}

function uploadedFilesToUrls(req) {
  const urls = {};
  if (!req.files) return urls;

  const mapping = {
    logo: "logoDataUrl",
    stamp: "stampDataUrl",
    signature: "signatureDataUrl",
  };

  for (const field in mapping) {
    const fileArr = req.files[field];
    if (Array.isArray(fileArr) && fileArr[0]) {
      const filename =
        fileArr[0].filename ||
        (fileArr[0].path && path.basename(fileArr[0].path));
      if (filename) {
       urls[mapping[field]] = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
      }
    }
  }

  return urls;
}

async function generateUniqueInvoiceNumber() {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 900000)}`;
}

// create invoice

export async function createInvoice(req, res) {
  try {
    const userId = req.auth.userId; 
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const body = req.body || {};
    const items = parseItemsField(body.items);
    const taxPercent = Number(body.taxPercent || 0);
    const totals = computeTotals(items, taxPercent);
    const fileUrls = uploadedFilesToUrls(req);

    const invoice = new Invoice({
      owner: userId,
      invoiceNumber: await generateUniqueInvoiceNumber(),
      issueDate: body.issueDate || new Date().toISOString().slice(0, 10),
      dueDate: body.dueDate || "",
      fromBusinessName: body.fromBusinessName || "",
      fromEmail: body.fromEmail || "",
      fromAddress: body.fromAddress || "",
      fromPhone: body.fromPhone || "",
      fromGst: body.fromGst || "",
      client:
        typeof body.client === "string"
          ? { name: body.client }
          : body.client || {},
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      currency: body.currency || "INR",
      status: body.status || "draft",
      taxPercent,
      logoDataUrl: fileUrls.logoDataUrl || null,
      stampDataUrl: fileUrls.stampDataUrl || null,
      signatureDataUrl: fileUrls.signatureDataUrl || null,
      signatureName: body.signatureName || "",
      signatureTitle: body.signatureTitle || "",
      notes: body.notes || "",
    });

    await invoice.save();

    return res.status(201).json({
      success: true,
      message: "Invoice created",
      data: invoice,
    });
  } catch (err) {
    console.error("createInvoice error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// get all invoice

export async function getInvoices(req, res) {
  try {
    const userId = req.auth.userId; // ✅ FIX

    const invoices = await Invoice.find({ owner: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (err) {
    console.error("getInvoices error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
// get invoice by id

export async function getInvoiceById(req, res) {
  try {
    const userId = req.auth.userId; // ✅ FIX
    const { id } = req.params;

    const invoice = isObjectIdString(id)
      ? await Invoice.findById(id)
      : await Invoice.findOne({ invoiceNumber: id });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (String(invoice.owner) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (err) {
    console.error("getInvoiceById error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// update invoice

export async function updateInvoice(req, res) {
  try {
    const userId = req.auth.userId; 
    const { id } = req.params;
    const body = req.body || {};
    const fileUrls = uploadedFilesToUrls(req);

    const invoice = await Invoice.findOne({
      owner: userId,
      ...(isObjectIdString(id) ? { _id: id } : { invoiceNumber: id }),
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (body.items !== undefined) {
      invoice.items = parseItemsField(body.items);
    }

    if (body.taxPercent !== undefined) {
      invoice.taxPercent = Number(body.taxPercent);
    }

    Object.assign(invoice, body, fileUrls);

    const totals = computeTotals(invoice.items, invoice.taxPercent);
    invoice.subtotal = totals.subtotal;
    invoice.tax = totals.tax;
    invoice.total = totals.total;

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice updated",
      data: invoice,
    });
  } catch (err) {
    console.error("updateInvoice error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// delete invoice

export async function deleteInvoice(req, res) {
  try {
    const userId = req.auth.userId; 
    const { id } = req.params;

    const deleted = await Invoice.findOneAndDelete({
      owner: userId,
      ...(isObjectIdString(id) ? { _id: id } : { invoiceNumber: id }),
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice deleted",
    });
  } catch (err) {
    console.error("deleteInvoice error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
