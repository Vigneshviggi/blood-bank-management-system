const mongoose = require("mongoose");

const ContactSupportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    subject: {
      type: String,
      default: "General Query"
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open"
    },
    issueType: {
      type: String,
      default: "General Query"
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

// collection name: contact_support
module.exports = mongoose.model(
  "ContactSupport",
  ContactSupportSchema,
  "contact_support"
);