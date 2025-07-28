import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireVerification } from "../middlewares/require.verification.middleware";


import {  validateCreateUser, validateLogin, validateUpdateProfile, validatePasswordUpdate, validateSearchUser } from "../validatitons/user.validation";

const router = Router();

router.post("/register", validateCreateUser, userController.register);
router.post("/login", validateLogin, userController.login);
router.put("/profile", authMiddleware, requireVerification,  validateUpdateProfile, userController.updateProfile);
router.put("/password", authMiddleware, requireVerification,  validatePasswordUpdate, userController.updatePassword);
router.get('/search', authMiddleware, requireVerification, validateSearchUser, userController.searchUsers);
router.get("/me/solde", authMiddleware, userController.getBalance);

export default router;
