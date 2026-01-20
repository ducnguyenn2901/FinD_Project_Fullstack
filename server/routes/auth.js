import { Router } from 'express'
import * as authController from '../controllers/auth.js'
import auth from '../middleware/auth.js'

// Auth routes
const router = Router()

router.post('/change-password', auth, authController.changePassword)
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

export default router
