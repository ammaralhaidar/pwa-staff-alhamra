export type LoginCredentials = {
  username?: string;
  password?: string;
};

export type AuthSession = {
  userId: number;
  name: string;
  login: string;
  roles: string[];
  roleFlags?: Record<string, boolean>;
};

export type LoginResult = {
  session: AuthSession;
};
