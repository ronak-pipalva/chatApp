import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      sparse: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    profile_image: {
      type: String,
      default: null,
    },
    login_otp: {
      otp: String,
      expire_time: Date,
    },
    is_phone_verified: {
      type: Boolean,
      default: false,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "create_at",
      updatedAt: "updated_at",
    },
    collection: "user",
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("user", userSchema);
