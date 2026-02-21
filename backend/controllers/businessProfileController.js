import { getAuth } from "@clerk/express";
import BusinessProfile from "../models/businessProfileModel.js";


function uploadedFilesToUrls(req) {
  const urls = {};
  if (!req.files) return urls;

  const base = `${req.protocol}://${req.get("host")}`;

  if (req.files.logoName?.[0]) {
    urls.logoUrl = `${base}/uploads/${req.files.logoName[0].filename}`;
  }

  if (req.files.stampName?.[0]) {
    urls.stampUrl = `${base}/uploads/${req.files.stampName[0].filename}`;
  }

  if (req.files.signatureNameMeta?.[0]) {
    urls.signatureUrl = `${base}/uploads/${req.files.signatureNameMeta[0].filename}`;
  }

  return urls;
}

// create business profile
export async function createBusinessProfile(req, res) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const body = req.body || {};
    const fileUrls = uploadedFilesToUrls(req);

    const profile = new BusinessProfile({
      owner: userId,
      businessName: body.businessName || "ABC Solutions",
      email: body.email || "",
      address: body.address || "",
      phone: body.phone || "",
      gst: body.gst || "",
      logoUrl: fileUrls.logoUrl || body.logoUrl || null,
      stampUrl: fileUrls.stampUrl || body.stampUrl || null,
      signatureUrl: fileUrls.signatureUrl || body.signatureUrl || null,
      signatureOwnerName: body.signatureOwnerName || "",
      signatureOwnerTitle: body.signatureOwnerTitle || "",
      defaultTaxPercent:
        body.defaultTaxPercent !== undefined
          ? Number(body.defaultTaxPercent)
          : 18,
    });

    const saved = await profile.save();

    return res.status(201).json({
      success: true,
      data: saved,
      message: "Business profile created",
    });
  } catch (err) {
    console.error("Create profile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// update business profile
export async function updateBusinessProfile(req, res) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const body = req.body || {};
    const fileUrls = uploadedFilesToUrls(req);

    const existing = await BusinessProfile.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    if (existing.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden" });
    }

    const update = {
      ...body,
      ...fileUrls,
    };

    const updated = await BusinessProfile.findByIdAndUpdate(id, update, {
      new: true,
    });

    return res.json({
      success: true,
      data: updated,
      message: "Profile updated",
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// get my business profile
export async function getMyBusinessProfile(req, res) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await BusinessProfile.findOne({ owner: userId }).lean();

    if (!profile) {
      return res.status(200).json({ success: true, data: null });
    }

    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}