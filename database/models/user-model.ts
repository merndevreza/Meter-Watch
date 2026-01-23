import mongoose, { Schema } from "mongoose";

// Extended User schema 
const usersSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  emailVerified: {
    type: Date,
    default: null,
  },
  image: {
    type: String,
  },
  password: {
    type: String,
    sparse: true,
  },
  verificationToken: {
    type: String, 
  },
}
);

export const Users =
  mongoose.models.Users ?? mongoose.model("Users", usersSchema);

