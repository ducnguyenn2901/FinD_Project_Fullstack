import { Router } from 'express'
import * as chatController from '../controllers/chat.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/messages', chatController.getMessages)
router.post('/messages', chatController.createMessage)

export default router
