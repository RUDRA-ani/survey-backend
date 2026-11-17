
import { Request, Response } from "express";
import {
  login,
  getAdminById,
  createPasswordReset,
  resetPassword,
} from "../services/auth.service";

import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

export async function loginAdmin(req: Request, res: Response) {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await login(
      validation.data.email,
      validation.data.password
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Login failed",
    });
  }
}

export async function getCurrentAdmin(req: Request, res: Response) {
  try {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await getAdminById(req.admin.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch {
    res.status(404).json({
      success: false,
      message: "Admin account not found",
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
      return;
    }

    const token = await createPasswordReset(validation.data.email);

    // Development-only reset link. Replace with email delivery later.
    if (token && process.env.NODE_ENV !== "production") {
      console.log(
        `Password reset link: http://localhost:5173/reset-password?token=${token}`
      );
    }

    res.status(200).json({
      success: true,
      message: "If the account exists, a password reset link will be generated.",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
    });
  }
}

export async function resetAdminPassword(req: Request, res: Response) {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await resetPassword(
      validation.data.token,
      validation.data.newPassword
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Password reset failed",
    });
  }
}
