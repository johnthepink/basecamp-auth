import http from 'http';
import express from 'express';
import qs from 'querystring';
import { OAuth2 } from 'oauth';

const BASECAMP_ID = process.env.BASECAMP_ID,
      BASECAMP_SECRET = process.env.BASECAMP_SECRET;

const oauth2 = new OAuth2(
  BASECAMP_ID,
  BASECAMP_SECRET,
  'https://launchpad.37signals.com/',
  'authorization/new',
  'authorization/token',
  null
)

const callbackURL = `${process.env.URL}/oauth/callback`

const authOptions = {
  redirect_uri: callbackURL,
  type: 'web_server'
}

const authURL = oauth2.getAuthorizeUrl(authOptions)

const app = express();
app.server = http.createServer(app);

app.get('/', (req, res) => {
  const authLink = `<a href="${authURL}">Authenticate with Basecamp</a>`;
  res.send(authLink);
});

app.get('/oauth/callback', (req, res) => {
  const p = req.url.split('/');
  let qsObj = {};
  qsObj = qs.parse(p[2].split('?')[1]);

  oauth2.getOAuthAccessToken(
    qsObj.code,
    authOptions,
    function (e, accessToken, refreshToken, results){
      if (e) {
        console.log(e);
        res.send(e);
      } else if (results.error) {
        console.log(results);
        res.send(JSON.stringify(results));
      }
      else {
        console.log('Obtained accessToken: ', accessToken);
        res.send(accessToken);
      }
  });
});

app.server.listen(process.env.PORT || 8080, () => {
  console.log(`Started on port ${app.server.address().port}`);
});

export default app;
