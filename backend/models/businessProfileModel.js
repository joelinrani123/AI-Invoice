import mongoose from "mongoose";

const businessProfileSchema = new mongoose.Schema({
    owner:{ type:String, required: true, index: true},

    businessName:{ type:String, required:true},
    email:{type:String,required:false, trim:true, lowercase:true, default:""},
    address:{type:String, required:false,default:""},
    phone:{type:String, required:false, default:""},
    gst :{type:String, required:false, default:""},

// For Images
  logoUrl: { type: String, default: null },
  stampUrl: { type: String, default: null },
  signatureUrl: { type: String, default: null },

  signatureOwnerName: { type: String, default: null},
  signatureOwnerTitle: { type: String, default: null },

  defaultTaxPercent: { type: Number, default: 18 },
},
{
  timestamps: true
});

const BusinessProfile = mongoose.models.BusinessProfile || mongoose.model("BusinessProfile", businessProfileSchema);

export default BusinessProfile;