# Production compose file
# ── Build stage ──────────────────────────────────────────────
FROM python:3.11-slim AS build

WORKDIR /build
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# ── Runtime stage ────────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app
COPY --from=build /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY server .
EXPOSE 6123
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:6123", "app:app"]
