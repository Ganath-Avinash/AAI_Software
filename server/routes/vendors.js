import express from 'express';
import { getVendors, getVendorById, getVendorAssets } from '../controllers/vendorsController.js';

const router = express.Router();

router.get('/', getVendors);
router.get('/:id', getVendorById);
router.get('/:id/assets', getVendorAssets);

export default router;
