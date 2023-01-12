const jsonwebtoken = require('jsonwebtoken')
const { google } = require('googleapis');
const ds = require('../datastore');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const url = require('url');
require('dotenv').config()


const datastore = ds.datastore;
const USER = "User"

// TODO What is this guy?!?!?
let userCredential = null;


/* ======================  What are these functions? ========== */

const state = generate_state();
/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI.
 * To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
// Access scopes for read-only Drive activity.
const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Generate a url that asks permissions for the Drive activity scope
const authorizationUrl = oauth2Client.generateAuthUrl({
    response_type: 'code',
  // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
  /** Pass in the scopes array defined above.
    * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
  // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
    state: state
});


async function post_user(givenName, familyName, idToken){
  /* Create and store user inside of Database

    :params:
      givenName     : string    : Users given name
      familyName    : string    : Users family name
      idToken       : int       : Users unique ID token for authentication
  */
    var key = datastore.key(USER);
    const newUser = {"givenName": givenName, "familyName":familyName, "idToken": idToken}
    return datastore.save({"key":key, "data":newUser}).then(()=> {return[key, newUser]})
}

async function get_user(idToken){
    /* Create and store user inside of Database

    :params:
      idToken       : int       : Users unique ID token for authentication

    :return:
      TODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODOTODO
    */
    const query = datastore
    .createQuery('User')
    .filter('idToken', '=', idToken);

    const [results] = await datastore.runQuery(query);
    return results
}


function generate_state(){
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var text = ""
    for (let i = 0; i < 40; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text
}

router.get('/', async function(req, res){
  let q = url.parse(req.url, true).query;

    if (q.error) { // An error response e.g. error=access_denied
      console.log('Error:' + q.error);
    } else { // Get access and refresh tokens (if access_type is offline)
      let { tokens } = await oauth2Client.getToken(q.code);
      oauth2Client.setCredentials(tokens);

      /** Save credential to the global variable in case access token was refreshed.
        * ACTION ITEM: In a production app, you likely want to save the refresh token
        *              in a secure persistent database instead. */
      userCredential = tokens;
    }

    axios.defaults.headers.common['Authorization'] = "Bearer " + userCredential.access_token
    var axiosResponse = await axios({
        method: 'GET',
        url: 'https://people.googleapis.com/v1/people/me?personFields=names'
    })

    const user = await get_user(jsonwebtoken.decode(oauth2Client.credentials.id_token).sub);
    if (user.length === 0){
      await post_user(axiosResponse.data.names[0].givenName, axiosResponse.data.names[0].familyName, jsonwebtoken.decode(oauth2Client.credentials.id_token).sub)
    }

    res.send(`<p>The value of your JWT id_token is: ${oauth2Client.credentials.id_token}</p>
              <p>The value of your id_token sub is: ${jsonwebtoken.decode(oauth2Client.credentials.id_token).sub}</p>`)
})

router.get('/getAuth', async function (req, res){
    res.writeHead(301, { "Location": authorizationUrl })
    res.end();
})


module.exports = router;
module.exports.get_oauth2Client = () => {
  if (oauth2Client !== undefined && oauth2Client.credentials !== undefined){
    return oauth2Client
  }
  else {
    return null
  }
}

module.exports.get_currentUser = async () => {
  const user = await get_user();
  return user
}