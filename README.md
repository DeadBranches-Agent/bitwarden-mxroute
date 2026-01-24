# MXRoute Bitwarden Alias Plugin

This project intends to be a Bitwarden plugin specific to MXRoute API. 

It works by creating a "fake" Addy.io server and route the calls to MXRoute.

Under the hood, it uses `coolname` to create the aliases.

## ⚠️ Disclaimer

Although there's authentication to the app, diligence is needed when exposing this utility to the public.

I'm not responsible for any compromised data.

## Installation

### Environment Variables
1. Configure the environment variables in a `.env` file or use them directly inside your `docker-compose.yml`:
   ```bash
   SERVER_API_TOKEN=your_secure_token_here

   MXROUTE_SERVER=<your_server>.mxrouting.net
   MXROUTE_USERNAME=<control_pane_username>
   MXROUTE_API_KEY=<control_pane_api_key>

   DEBUG=false # Optional for debugging the server

   SERVER_ADDRESS=http://bitwarden-mxroute-server:6123 # Optional for web app
   ```

### Docker (recommended)

1. Grab the example docker-compose file from [here](./docker-compose.yml).
2. Start the service:
   ```bash
   docker-compose up -d
   ```

The application will be running on `http://localhost:6123` by default.

### Manual

1. Clone the repo
2. Navigate to the `server` directory:
   ```bash
   cd server
   ```
3. Install python dependencies, e.g.:
   ```bash
   uv venv
   uv pip install -r requirements.txt
   source .venv/bin/activate
   ```
4. Run the server
   ```bash
   flask run --app app.py --host=0.0.0.0 --port=6123

   # Or, when debugging
   flask run --app app.py --host=0.0.0.0 --port=6123 --debug 
   ```

## How to use

Configure Bitwarden's "Generator" Tab:

1. Type: Forwarded email alias
2. Service: Addy.io
3. Email domain: The domain aliases will be created with. It doesn't need to be the same as the domain from `<alias_destination_email>` found in step 5.
4. API Key: The same that has been configured in the `SERVER_API_TOKEN` environment variable.
5. Self-host server URL: 
    1. `http://<server_address>/add/<alias_destination_email>`, e.g. `http://localhost:6123/add/custom@domain.com` (if host or port is kept at the defaults).
    2. Replace `<alias_destination_email>` with the email you want to redirect your alias **to**.
6. Click the "Generate email" icon.

Note: Sometimes cache can be an issue with extensions or the server. Remember to clean them if something goes wrong.

## Utilities

### Web App

This repo provides a simple web app for listing and deleting aliases. By default, it's exposed on port `6124`.

The default docker-compose files contain an example for running it.

It uses the server instead of directly interacting with MXRoute's API, so the server is a dependency, while the web app is just optional.

### API
- Status check
    - `http://<server_address>/`
- List aliases for given domain
    - `http://<server_address>/list/<domain>`
- Delete alias
    - `http://<server_address>/delete/<alias_email>`
