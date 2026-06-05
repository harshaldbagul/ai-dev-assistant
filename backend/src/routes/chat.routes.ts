import { Router } from 'express';
import * as chatController from '../controllers/chat.controller.js';

const router = Router();

router.post('/stream', chatController.stream);

export default router;
