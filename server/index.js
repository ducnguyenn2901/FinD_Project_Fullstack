import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { MongoMemoryServer } from 'mongodb-memory-server'
import authRoutes from './routes/auth.js'
import transactionsRoutes from './routes/transactions.js'
import goalsRoutes from './routes/goals.js'
import subscriptionsRoutes from './routes/subscriptions.js'
import walletsRoutes from './routes/wallets.js'
import investmentsRoutes from './routes/investments.js'
import marketRoutes from './routes/market.js'
import chatRoutes from './routes/chat.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const app = express()

app.use(cors({ 
  origin: process.env.FRONTEND_URL || true, 
  credentials: true 
}))
app.use(express.json())

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || ''
const port = process.env.PORT ? Number(process.env.PORT) : 4000

async function start() {
  let uri = mongoUri
  try {
    if (!uri) {
      const mem = await MongoMemoryServer.create()
      uri = mem.getUri()
      console.log('Using in-memory MongoDB')
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 })
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error', err)
    try {
      const mem = await MongoMemoryServer.create()
      uri = mem.getUri()
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 })
      console.log('MongoDB connected (in-memory fallback)')
    } catch (err2) {
      console.error('MongoDB fallback connection error', err2)
      process.exit(1)
    }
  }

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/auth', authRoutes)
  app.use('/transactions', transactionsRoutes)
  app.use('/goals', goalsRoutes)
  app.use('/subscriptions', subscriptionsRoutes)
  app.use('/wallets', walletsRoutes)
  app.use('/investments', investmentsRoutes)
  app.use('/market', marketRoutes)
  app.use('/chat', chatRoutes)

  app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`)
  })
}

start()
