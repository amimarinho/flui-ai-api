# flui-ai-api

HTTP API that answers a place request near a coordinate. A question such as “posto de gasolina perto daqui” is classified with Gemini into one category — electric-car charging, coffee, or gas station — then matched against places stored in Postgres within 2 km.

Requests that do not fit those categories return an empty list.

## Requirements

- Node.js 22 or later
- Docker, for the local Postgres database
- A [Gemini API key](https://aistudio.google.com/apikey)

## Setup

```bash
cp .env.example .env
docker compose up -d
npx prisma migrate dev
npm run prisma:seed
```

Fill `GEMINI_API_KEY` in `.env` before starting the API. The other values in `.env.example` already match the Compose database.

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Key used to call Gemini |
| `GEMINI_MODEL` | Model name. Defaults to `gemini-3.5-flash-lite` |
| `DATABASE_URL` | Postgres connection string |
| `PORT` | HTTP port. Defaults to `3000` |

The seed replaces every place with a small set around ARCA in São Paulo (`-23.5358`, `-46.7454`), taken from OpenStreetMap.

## Run

```bash
npm install
npm run start:dev
```

The server listens on `http://localhost:3000`. CORS allows requests with no `Origin` header and browsers on `localhost` or `127.0.0.1`.

`GET /` returns `Hello World!`.

## Ask for places

`POST /ask`

```json
{
  "text": "onde carrego o carro elétrico?",
  "latitude": -23.5358,
  "longitude": -46.7454
}
```

`text` is required. `latitude` must be between `-90` and `90`, and `longitude` between `-180` and `180`.

A match returns places nearest first:

```json
[
  {
    "name": "Enel",
    "category": "ev_charging",
    "latitude": -23.5485132,
    "longitude": -46.7359186
  }
]
```

`category` is one of `ev_charging`, `coffee`, or `gas_station`.

| Status | When |
| --- | --- |
| `200` | The request was understood. The body is a list, empty when nothing nearby matches or the question is outside the three categories |
| `400` | Missing text, latitude, or longitude |
| `502` | Gemini or the database lookup failed |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run start:dev` | Start with reload |
| `npm run start` | Start once |
| `npm run start:prod` | Run the compiled app in `dist` |
| `npm run build` | Compile TypeScript |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run lint` | Lint and fix |
| `npm run prisma:seed` | Reload the sample places |
