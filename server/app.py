import os
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from coolname import generate_slug

load_dotenv()

app = Flask(__name__)

SERVER_API_TOKEN = os.getenv("SERVER_API_TOKEN")

MXROUTE_SERVER = os.getenv("MXROUTE_SERVER")
MXROUTE_USERNAME = os.getenv("MXROUTE_USERNAME")
MXROUTE_API_KEY = os.getenv("MXROUTE_API_KEY")


def build_request(domain):
    mxroute_endpoint = f"https://api.mxroute.com/domains/{domain}/forwarders"
    mxroute_headers = {
        "X-Server": MXROUTE_SERVER,
        "X-Username": MXROUTE_USERNAME,
        "X-API-Key": MXROUTE_API_KEY,
        "Content-Type": "application/json",
    }

    return mxroute_endpoint, mxroute_headers


@app.before_request
def check_auth():
    if request.endpoint == "status":
        return

    auth_header = request.headers.get("Authorization")
    if not SERVER_API_TOKEN:
        return jsonify({"error": "SERVER_API_TOKEN not configured"}), 500

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.split(" ")[1]
    if token != SERVER_API_TOKEN:
        return jsonify({"error": "Invalid token"}), 401


@app.route("/")
def status():
    if not SERVER_API_TOKEN:
        return "Bitwarden Mxroute plugin is running, but SERVER_API_TOKEN is not configured."

    return "Bitwarden Mxroute plugin is running healthy."


@app.route("/add/<destination>/<path:subpath>", methods=["POST"])
def add(destination, subpath):
    data = request.get_json()
    domain = data.get("domain")
    endpoint, headers = build_request(domain)

    alias = generate_slug(2)

    body = {
        "alias": alias,
        "destinations": [destination],
    }

    try:
        response = requests.post(endpoint, headers=headers, json=body)
        response.raise_for_status()

        return {"data": {"email": f"{alias}@{domain}"}}
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route("/list/<domain>", methods=["GET"])
def get(domain):
    endpoint, headers = build_request(domain)

    try:
        response = requests.get(endpoint, headers=headers)
        response.raise_for_status()

        data = response.json()

        return jsonify(data["data"]), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@app.route("/delete/<email>", methods=["DELETE"])
def delete(email):
    try:
        alias, domain = email.split("@")
    except ValueError:
        return jsonify({"error": "Invalid email format."}), 400

    endpoint, headers = build_request(domain)

    try:
        response = requests.delete(f"{endpoint}/{alias}", headers=headers)
        response.raise_for_status()

        return jsonify({"message": "Deleted."}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
