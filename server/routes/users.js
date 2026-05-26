import express from 'express';
import { getUsers, getUserById, createUser, updateUser } from '../controllers/usersController.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);

export default router;
