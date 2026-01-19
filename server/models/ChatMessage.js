import mongoose from 'mongoose'

const ChatMessageSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    user_name: { type: String, default: '' },
    user_email: { type: String, default: '' },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export default mongoose.model('ChatMessage', ChatMessageSchema)

