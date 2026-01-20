import { Router } from 'express'
import * as transactionsController from '../controllers/transactions.js'
import auth from '../middleware/auth.js'

const router = Router()

router.use(auth)

router.get('/', transactionsController.getTransactions)
router.post('/', transactionsController.createTransaction)
router.delete('/:id', transactionsController.deleteTransaction)
router.patch('/:id', transactionsController.updateTransaction)

export default router
