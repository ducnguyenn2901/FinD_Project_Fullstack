import { Router } from 'express'
import * as subscriptionsController from '../controllers/subscriptions.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/', subscriptionsController.getSubscriptions)
router.post('/', subscriptionsController.createSubscription)
router.patch('/:id', subscriptionsController.updateSubscription)
router.delete('/:id', subscriptionsController.deleteSubscription)

export default router
