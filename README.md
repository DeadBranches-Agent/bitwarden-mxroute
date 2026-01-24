# MXRoute Bitwarden Alias Plugin

This project intends to be a Bitwarden plugin specific to MXRoute API. 

It works by creating a "fake" Addy.io server and route the calls to MXRoute.

Under the hood, it uses `coolname` to create the aliases.

While it's working as intended, consider it as a preview, since the following is planned:
1. Docker image
2. API Key authentication
3. UI for listing and deleting aliases

This could be adapted to pretty much any email server that has an API. It might be configurable in the future, but it's not planned.

## ⚠️ Disclaimer

This should be used only locally. There's no authentication built-in and exposing it will result on exposing the MXRoute API indirectly.

## How to use

1. Clone the repo
2. Install python dependencies, e.g.:
  ```bash
  $ uv venv
  $ uv pip install -r requirements.txt
  $ source .venv/bin/activate
  ```
3. Create a .env file with the following variables:
  ```bash
  # Your email server, e.g. pixel.mxrouting.net
  MXROUTE_SERVER=<your_server>.mxrouting.net
  # Your control pane username
  MXROUTE_USERNAME=<control_pane_username>
  # Panel API key, can be found in https://panel.mxroute.com/api-keys.php
  MXROUTE_API_KEY=<control_pane_api_key>
  ```
4. Run the server
  ```bash
  flask run

  # Or, when debugging
  flask --app app.py --debug run
  ```
5. Configure Bitwarden's "Generator" Tab
  - Type: Forwarded email alias
  - Service: Addy.io
  - API Key: Anything - ignored
  - Self-host server URL: `http://127.0.0.1:5000/add/<alias_destination_email>` (if host or port is kept at the defaults).
6. Click the "Generate email" icon.

Note: Sometimes cache can be an issue with extensions or the server. Remember to clean them if something goes wrong.

## Utilities

1. Status check
  `https://127.0.0.1:5000`
2. List aliases for given domain
  `https://127.0.0.1:5000/list/<alias_destination_email>`
