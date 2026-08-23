// Netlify Function (v2, Web Request/Response). Deployed at
// /.netlify/functions/auth-yahoo-login — the entry point the client
// redirects to in order to start Yahoo sign-in.
//
// Part of the Phase 2 auth scaffold (see WEEKLY_QUIZ_PLAN.md). The client
// does not call this yet — the login-triggering UI is a later step, once
// the token this flow produces has somewhere to land (predictions/leagues
// linked to $users).

import { serializeCookie } from './_lib/cookies';
import { requireEnv } from './_lib/env';

const STATE_COOKIE = 'yahoo_oauth_state';
const RETURN_TO_COOKIE = 'yahoo_oauth_return_to';

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const returnTo = url.searchParams.get('returnTo') ?? '/superbowl/';

  const clientId = requireEnv('YAHOO_CLIENT_ID');
  const redirectUri = requireEnv('YAHOO_REDIRECT_URI');

  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  const authorizeUrl = new URL('https://api.login.yahoo.com/oauth2/request_auth');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', 'openid profile email');
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('nonce', nonce);

  const headers = new Headers({ Location: authorizeUrl.toString() });
  headers.append('Set-Cookie', serializeCookie(STATE_COOKIE, state));
  headers.append('Set-Cookie', serializeCookie(RETURN_TO_COOKIE, returnTo));

  return new Response(null, { status: 302, headers });
};
