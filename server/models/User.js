import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: '' },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null }
  },
  { timestamps: true }
)

export default mongoose.model('User', UserSchema)
