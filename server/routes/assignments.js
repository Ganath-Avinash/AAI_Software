import express from 'express';
import { assignAsset, returnAsset, getHistory } from '../controllers/assignmentsController.js';

const router = express.Router();

router.post('/assign', assignAsset);
router.post('/return', returnAsset);
router.get('/history', getHistory);

export default router;
