const MODEL = 'claude-3-5-sonnet@20240620';
const TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';

let tokenCache = {
  accessToken: '',
  expiry: 0,
  refreshPromise: null
};

async function getAccessToken(env) {
  const now = Date.now() / 1000;

  if (tokenCache.accessToken && now < tokenCache.expiry - 120) {
    return tokenCache.accessToken;
  }

  if (tokenCache.refreshPromise) {
    await tokenCache.refreshPromise;
    return tokenCache.accessToken;
  }

  tokenCache.refreshPromise = (async () => {
    try {
      const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: env.CLIENT_ID,
          client_secret: env.CLIENT_SECRET,
          refresh_token: env.REFRESH_TOKEN,
          grant_type: 'refresh_token'
        })
      });

      const data = await response.json();
      
      tokenCache.accessToken = data.access_token;
      tokenCache.expiry = now + data.expires_in;
    } finally {
      tokenCache.refreshPromise = null;
    }
  })();

  await tokenCache.refreshPromise;
  return tokenCache.accessToken;
}

function getLocation() {
  const currentSeconds = new Date().getSeconds();
  return currentSeconds < 30 ? 'europe-west1' : 'us-east5';
}

function constructApiUrl(location, env) {
  return `https://${location}-aiplatform.googleapis.com/v1/projects/${env.PROJECT_ID}/locations/${location}/publishers/anthropic/models/${MODEL}:streamRawPredict`;
}

async function handleRequest(request, env) {
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }
  
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== env.API_KEY) {
    const errorResponse = new Response(JSON.stringify({
      type: "error",
      error: {
        type: "permission_error",
        message: "Your API key does not have permission to use the specified resource."
      }
    }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, HEAD');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version, model');
     
    return errorResponse;
  }

  const accessToken = await getAccessToken(env);
  const location = getLocation();
  const apiUrl = constructApiUrl(location, env);

  let requestBody = await request.json();
  
  if (requestBody.anthropic_version) {
    delete requestBody.anthropic_version;
  }
  
  if (requestBody.model) {
    delete requestBody.model;
  }
  
  requestBody.anthropic_version = "vertex-2023-10-16";

  const modifiedHeaders = new Headers(request.headers);
  modifiedHeaders.set('Authorization', `Bearer ${accessToken}`);
  modifiedHeaders.set('Content-Type', 'application/json; charset=utf-8');
  modifiedHeaders.delete('anthropic-version');

  const modifiedRequest = new Request(apiUrl, {
    headers: modifiedHeaders,
    method: request.method,
    body: JSON.stringify(requestBody),
    redirect: 'follow'
  });

  const response = await fetch(modifiedRequest);
  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
 
  modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
  modifiedResponse.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version, model');
   
  return modifiedResponse;
}

function handleOptions() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version, model');

  return new Response(null, {
    status: 204,
    headers: headers
  });
}

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
}
