import express from 'express';
import { getAssets, getAssetById, createAsset, updateAsset } from '../controllers/assetsController.js';

const router = express.Router();

router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', createAsset);
router.put('/:id', updateAsset);

export default router;
