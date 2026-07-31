export interface PortfolioRuntimeEnv {
  DB: D1Database;
  PORTFOLIO_ASSETS: R2Bucket;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD_HASH?: string;
}

let runtimeEnv: PortfolioRuntimeEnv | null = null;

export function setRuntimeEnv(env: PortfolioRuntimeEnv): void {
  runtimeEnv = env;
}

export function getRuntimeEnv(): PortfolioRuntimeEnv {
  if (!runtimeEnv) {
    throw new Error("Portfolio runtime bindings are unavailable.");
  }
  return runtimeEnv;
}

