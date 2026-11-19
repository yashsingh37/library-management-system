import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    membershipId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.isNew && this.role === "member" && !this.membershipId) {
    const count = await mongoose
      .model("User")
      .countDocuments({ role: "member" });
    this.membershipId = `LIB${String(1001 + count).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("User", userSchema);
