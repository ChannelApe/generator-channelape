# Allbirds Fraser
Allbirds Canada integration
To run app in production mode `npm install && npm t && npm prune --production && npm start`

## Setup
Get the app running locally by configuring your ChannelApe NPM_TOKEN environment variable, get node and NPM 
installed (we are currently using node v8.10.0 and NPM v5.6.0), copy `.env.example` to `.env` and fill in the envars, 
and run `npm install`.

## Endpoints
Route | Description
----- | -----------
GET /healthcheck | Returns the process uptime
POST /orders | Will query orders from CA, parse into a CSV, and upload to RSS Bus. Needs an actionId as part of the POST body
POST /fulfillments | Will pull CSV documents from SQS one at a time until there are none left. Will update orders on CA for every CSV
POST /inventory?age={{number_in_seconds}} | Will stream back the newest available inventory file withing the time range

## Environment Variables
Look at the .env.example for a list of required and optional env vars