import { Router } from 'express'
import * as goalsController from '../controllers/goals.js'
import auth from '../middleware/auth.js'

const router = Router()

router.get('/', auth, goalsController.getGoals)
router.post('/', auth, goalsController.createGoal)
router.patch('/:id', auth, goalsController.updateGoal)
router.delete('/:id', auth, goalsController.deleteGoal)
router.post('/:id/contributions', auth, goalsController.addContribution)
router.get('/:id/contributions', auth, goalsController.getContributions)
router.post('/:id/share', auth, goalsController.shareGoal)
router.get('/public/:token', goalsController.getPublicGoal)
router.post('/public/:token/contributions', auth, goalsController.contributeToPublicGoal)

export default router
