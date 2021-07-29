require('dotenv').config();
const express = require("express");
const cors = require("cors");
const SpotifyWebApi = require("spotify-web-api-node");
const lyricsFinder = require("lyrics-finder");

const app = express();
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken
  })

  // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      console.log(data.body);

      // Save the access token so that it's used in future calls
      //spotifyApi.setAccessToken(data.body['access_token']);
    })
    .catch(() => {
      res.sendStatus(400);
    })
})

app.post("/login", (req, res) => {
    const code = req.body.code;
    const spotifyApi = new SpotifyWebApi({
      redirectUri: process.env.REDIRECT_URI,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    })

    // Retrieve an access token and a refresh token
  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      res.json({
        accessToken: data.body.access_token, 
        refreshToken: data.body.refresh_token, 
        expiresIn: data.body.expires_in,
      })
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    })
})

app.get('/lyrics', async (req, res) => {
  const lyrics = await lyricsFinder(req.query.artist, req.query.track) || "No Lyrics Found"
  res.json({ lyrics })
})

app.listen(3001);