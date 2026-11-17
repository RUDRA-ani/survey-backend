
export interface AdminUser {
  id: string;
  email: string;
  password: string;
  role: "admin";
  createdAt: string;
}

export interface PasswordReset {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: "admin";
}
