import mongoose from "mongoose";
import autopopulate from "mongoose-autopopulate";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'admin' });

// Apply the autopopulate plugin to the schema
userSchema.plugin(autopopulate);

const User = mongoose.model("User", userSchema);

export default User;