# <%= moduleName %>
<%= moduleName %>
<%= moduleDescription %>
To run app in production mode `npm install && npm t && npm prune --production && npm start`

## Setup
Get the app running locally by configuring your, get node and NPM 
installed (we are currently using node v8.10.0 and NPM v5.6.0), copy `.env.example` to `.env` and fill in the envars, 
and run `npm install`.

## Endpoints
Route | Description
----- | -----------
GET /healthcheck | Returns the process uptime
POST /orders | Will query orders from CA, filter them, and then update them. Needs an actionId as part of the POST body

## Environment Variables
Look at the .env.example for a list of required and optional env vars