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
  // Custom fields below
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  }, 
  password: {
    type: String,
    sparse: true,
  },
}
);

export const Users =
  mongoose.models.Users ?? mongoose.model("Users", usersSchema);

