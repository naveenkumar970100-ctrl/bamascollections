import express from 'express';
import { getSiteConfig, updateSiteConfig } from '../controllers/siteConfigController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getSiteConfig)
  .put(protect, admin, updateSiteConfig);

export default router;
