import express from 'express';
import { forgotPassword, loginUser, logoutUser, registerUser, resetPassword, verifyUser } from '../controllers/AuthControllers.js';
import protect from '../middlewares/auth.js';

const AuthRouter = express.Router();

AuthRouter.post('/register', registerUser)
AuthRouter.post('/login', loginUser)
AuthRouter.get('/verify', protect, verifyUser)
AuthRouter.post('/logout', protect, logoutUser)
AuthRouter.post('/forgot-password', forgotPassword)
AuthRouter.post('/reset-password', resetPassword)

export default AuthRouter