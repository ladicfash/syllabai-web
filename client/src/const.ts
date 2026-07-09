export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  // Use production domain for redirect URI to match registered OAuth URLs
  const productionOrigin = "https://syllibai.one";
  const redirectUri = `${productionOrigin}/api/oauth/callback`;
  // Encode both origin and return path so the callback can redirect correctly
  const state = btoa(JSON.stringify({ origin: productionOrigin, returnPath: "/dashboard" }));

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  console.log("[OAuth] Login URL:", url.toString(), "Redirect URI:", redirectUri);

  return url.toString();
};
