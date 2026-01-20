import { Router } from 'express'
import * as investmentsController from '../controllers/investments.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/', investmentsController.getInvestments)
router.post('/', investmentsController.createInvestment)
router.patch('/:id', investmentsController.updateInvestment)
router.delete('/:id', investmentsController.deleteInvestment)

export default router
