export type LoginCredentials = {
  username?: string;
  password?: string;
};

export type AuthSession = {
  userId: number;
  name: string;
  login: string;
  username?: string;
  email?: string;
  companyId?: number;
  avatar?: string;
  roles: string[];
  roleFlags?: Record<string, boolean>;
};

export type LoginResult = {
  session: AuthSession;
};
