import express from "express";
import multer from "multer";
import path from "path";
import { clerkMiddleware } from "@clerk/express";

import {
  createBusinessProfile,
  updateBusinessProfile,
  getMyBusinessProfile,
} from "../controllers/businessProfileController.js";

const router = express.Router();

// clerk
router.use(clerkMiddleware());

// multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `business-${unique}${ext}`);
  },
});

const upload = multer({ storage });

// routes

// CREATE
router.post(
  "/",
  upload.fields([
    { name: "logoName", maxCount: 1 },
    { name: "stampName", maxCount: 1 },
    { name: "signatureNameMeta", maxCount: 1 },
  ]),
  createBusinessProfile
);

// UPDATE
router.put(
  "/:id",
  upload.fields([
    { name: "logoName", maxCount: 1 },
    { name: "stampName", maxCount: 1 },
    { name: "signatureNameMeta", maxCount: 1 },
  ]),
  updateBusinessProfile
);

// GET MY PROFILE
router.get("/me", getMyBusinessProfile);

export default router;
