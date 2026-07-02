import { apiEndpoints } from "@/lib/api/api-constants";
import { getOdooConfig, postOdoo, setSessionId } from "@/lib/api/odoo-server";
import type { LoginCredentials, LoginResult } from "@/features/auth/domain/auth-credentials";
import { unwrapOdooData } from "@/lib/helpers";

type OdooLoginUser = {
  uid?: number;
  name?: string;
  login?: string;
  username?: string;
  session_id?: string;
  roles?: Record<string, boolean>;
};

type OdooLoginEnvelope = {
  result?: OdooLoginUser | { result?: OdooLoginUser; data?: OdooLoginUser };
  data?: OdooLoginUser;
};

function unwrapLoginResult(envelope: OdooLoginEnvelope) {
  return unwrapOdooData<OdooLoginUser>(envelope);
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const { database } = getOdooConfig();
    const envelope = await postOdoo<OdooLoginEnvelope>(apiEndpoints.auth.login, {
      db: database,
      login: credentials.username,
      password: credentials.password,
    });

    const user = unwrapLoginResult(envelope);

    if (!user?.uid) {
      throw new Error("Username atau password salah");
    }

    if (user.session_id) {
      setSessionId(user.session_id);
    }

    return {
      session: {
        userId: user.uid,
        name: user.name ?? "",
        login: user.login ?? user.username ?? credentials.username ?? "",
        roleFlags: user.roles ?? {},
        roles: Object.entries(user.roles ?? {})
          .filter(([, isActive]) => isActive)
          .map(([role]) => role),
      },
    };
  },
  async logout(): Promise<void> {
    await postOdoo(apiEndpoints.auth.logout, {});
  },
};
