import express from 'express';
import { 
    getDepartments, getLocations, getDesignations, 
    getAssetTypes, getAssetStatus, getBrands, getModelsByBrand 
} from '../controllers/mastersController.js';

const router = express.Router();

router.get('/departments', getDepartments);
router.get('/locations', getLocations);
router.get('/designations', getDesignations);
router.get('/asset-types', getAssetTypes);
router.get('/asset-status', getAssetStatus);
router.get('/brands', getBrands);
router.get('/models', getModelsByBrand);
router.get('/brands/:brandId/models', getModelsByBrand);

export default router;
