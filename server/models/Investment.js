import mongoose from "mongoose";
const InvestmentSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    symbol: { type: String, required: true },
    name: { type: String, default: '' },
    type: { type: String, enum: ['stock', 'crypto', 'etf', 'bond', 'other'], default: 'stock' },
    quantity: { type: Number, required: true },
    avg_price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    current_price: { type: Number, default: null },
    notes: { type: String, default: '' },
    purchase_date: { type: String, default: null },
    status: { type: String, default: 'active' },
    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
)
export default mongoose.model('Investment', InvestmentSchema)
