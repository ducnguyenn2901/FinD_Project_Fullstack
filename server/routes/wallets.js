import { Router } from 'express'
import * as walletsController from '../controllers/wallets.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/', walletsController.getWallets)
router.post('/', walletsController.createWallet)
router.patch('/:id', walletsController.updateWallet)
router.delete('/:id', walletsController.deleteWallet)

export default router
