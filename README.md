# Cloudflare Worker for Claude API Proxy

This Cloudflare Worker script acts as a proxy for the Claude AI API, utilizing Google Cloud Platform (GCP) for authentication.

## Features

- 🔄 Proxies requests to Claude AI API
- 🔑 Handles OAuth 2.0 token refresh with GCP
- 🛡️ Implements API key validation
- 🌐 Supports CORS for cross-origin requests
- ⚖️ Load balancing between different GCP regions

## Setup

1. Log in to your Cloudflare dashboard.
2. Navigate to Workers & Pages > Create application > Create Worker.
3. Give your worker a name and click "Deploy".
4. In the editor that opens, replace all the code with the contents of the `worker.js` file from this repository.
5. Click "Save and deploy".

## Environment Variables

Set up the following environment variables in your Cloudflare Worker:

- `PROJECT_ID`: Your GCP project ID
- `CLIENT_ID`: Your GCP OAuth 2.0 client ID
- `CLIENT_SECRET`: Your GCP OAuth 2.0 client secret
- `REFRESH_TOKEN`: Your GCP OAuth 2.0 refresh token
- `API_KEY`: Your chosen API key for this worker

### Obtaining GCP Credentials

To obtain the necessary GCP credentials, use the following steps in Google Cloud Shell:

1. Open Google Cloud Shell for your project.
2. Run the following commands:
```
gcloud auth application-default login
cat /tmp/tmp.*/application_default_credentials.json
```

To set environment variables:

1. Go to your Worker's settings.
2. Click on the "Variables" tab.
3. Add each variable under "Environment Variables".

## Usage

To use this worker, send requests to your worker's URL with the following headers:

- `x-api-key`: Your API key (set in the environment variables)
- Other headers as required by the Claude AI API

The worker will handle authentication and forward your request to the Claude AI API.

## Security Considerations

- Keep your `API_KEY` secret and secure.
- Regularly rotate your GCP credentials and update the environment variables.
- Monitor your worker's usage to detect any unusual activity.

## License

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
本项目来源：[LinuxDO](https://linux.do/t/topic/118702)

## Contact

If you have any questions or feedback, please open an issue in this repository.
