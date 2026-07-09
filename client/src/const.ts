export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || "https://manus.im";
  const appId = import.meta.env.VITE_APP_ID;
  const productionOrigin = "https://syllibai.one";
  const redirectUri = `${productionOrigin}/api/oauth/callback`;
  
  // Create state object with origin and return path
  const stateObj = { origin: productionOrigin, returnPath: "/dashboard" };
  const state = btoa(JSON.stringify(stateObj));
  
  // Build URL using URLSearchParams for proper encoding
  const params = new URLSearchParams();
  params.set("appId", appId);
  params.set("redirectUri", redirectUri);
  params.set("state", state);
  params.set("type", "signIn");
  
  const loginUrl = `${oauthPortalUrl}/app-auth?${params.toString()}`;
  console.log("[OAuth] Login URL:", loginUrl);
  
  return loginUrl;
};
