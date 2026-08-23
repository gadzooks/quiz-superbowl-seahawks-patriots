// Netlify Function (v2, Web Request/Response). Deployed at
// /.netlify/functions/auth-yahoo-callback — this is the redirect_uri
// registered with the Yahoo developer app.
//
// Part of the Phase 2 auth scaffold (see WEEKLY_QUIZ_PLAN.md). Exchanges
// the Yahoo auth code for tokens, reads the user's email out of the id_token,
// and mints an InstantDB sign-in token via the admin SDK. Redirects back to
// the SPA with the token in the URL fragment — the client-side code that
// picks this up and calls db.auth.signInWithToken() is a later step, once
// predictions/leagues have an owner linked to $users.

import { init } from '@instantdb/admin';

import { parseCookies, serializeCookie } from './_lib/cookies';
import { requireEnv } from './_lib/env';

const STATE_COOKIE = 'yahoo_oauth_state';
const RETURN_TO_COOKIE = 'yahoo_oauth_return_to';

interface YahooTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface YahooIdTokenClaims {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

function decodeIdTokenClaims(idToken: string): YahooIdTokenClaims {
  // TODO(auth): this decodes the JWT payload without verifying the
  // signature. Before this flow handles real writes, verify it against
  // Yahoo's JWKS (see https://api.login.yahoo.com/.well-known/openid-configuration)
  // instead of trusting the payload as-is.
  const payload = idToken.split('.')[1];
  if (!payload) {
    throw new Error('Malformed id_token from Yahoo');
  }
  const json = Buffer.from(payload, 'base64url').toString('utf8');
  return JSON.parse(json) as YahooIdTokenClaims;
}

function clearedAuthCookies(): Headers {
  const headers = new Headers();
  headers.append('Set-Cookie', serializeCookie(STATE_COOKIE, '', { clear: true }));
  headers.append('Set-Cookie', serializeCookie(RETURN_TO_COOKIE, '', { clear: true }));
  return headers;
}

function redirectWithError(
  appBaseUrl: string,
  returnTo: string,
  errorCode: string,
  headers: Headers
): Response {
  const redirectUrl = new URL(returnTo, appBaseUrl);
  redirectUrl.searchParams.set('auth_error', errorCode);
  headers.set('Location', redirectUrl.toString());
  return new Response(null, { status: 302, headers });
}

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  const cookies = parseCookies(req.headers.get('cookie'));
  const expectedState = cookies[STATE_COOKIE];
  const returnTo = cookies[RETURN_TO_COOKIE] ?? '/superbowl/';
  const appBaseUrl = requireEnv('APP_BASE_URL');

  if (oauthError) {
    return redirectWithError(appBaseUrl, returnTo, oauthError, clearedAuthCookies());
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithError(appBaseUrl, returnTo, 'invalid_state', clearedAuthCookies());
  }

  const clientId = requireEnv('YAHOO_CLIENT_ID');
  const clientSecret = requireEnv('YAHOO_CLIENT_SECRET');
  const redirectUri = requireEnv('YAHOO_REDIRECT_URI');

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const tokenResponse = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    return redirectWithError(appBaseUrl, returnTo, 'token_exchange_failed', clearedAuthCookies());
  }

  const tokens = (await tokenResponse.json()) as YahooTokenResponse;
  const claims = decodeIdTokenClaims(tokens.id_token);

  if (!claims.email) {
    return redirectWithError(appBaseUrl, returnTo, 'no_email_scope', clearedAuthCookies());
  }

  const db = init({
    appId: requireEnv('VITE_INSTANTDB_APP_ID'),
    adminToken: requireEnv('INSTANT_ADMIN_TOKEN'),
  });

  const instantAuthToken = await db.auth.createToken({ email: claims.email });

  const redirectUrl = new URL(returnTo, appBaseUrl);
  redirectUrl.hash = `instant_auth_token=${encodeURIComponent(instantAuthToken)}`;

  const headers = clearedAuthCookies();
  headers.set('Location', redirectUrl.toString());
  return new Response(null, { status: 302, headers });
};
