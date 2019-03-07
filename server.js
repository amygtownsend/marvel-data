// server.js

// imports
const dotenv = require('dotenv');
const crypto = require('crypto');
const express = require('express');
const https = require('https');

dotenv.config();

// globals
const app = express();
const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;
const baseURL = "https://gateway.marvel.com:443/v1/public/";

let characterData = []; // to cache our API response

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


//-------------------------------------------------------------//
//----------------------- AUTHORIZATION -----------------------//
//-------------------------------------------------------------//


/** Make a marvel-api compliant hash.
  * https://developer.marvel.com/documentation/authorization
  * https://gist.github.com/kitek/1579117
  */

function makeHash() {
  let ts = new Date().getTime();
  var data = `${ts}${privateKey}${publicKey}`;
  let hash = crypto.createHash('md5').update(data).digest("hex");
  return { ts, hash };
}


//-------------------------------------------------------------//
//------------------------- API CALLS -------------------------//
//-------------------------------------------------------------//

app.get('/character', (request, response) => {
  // Only fetch data if it's not cached in a var already
  if (!characterData || characterData.length < 75) {
    // Make the API hash
    let hash = makeHash();

    // Loop through all character data
    for (let offset = 0; offset <= 1480; offset += 20) {
      let charURL = `${baseURL}characters?offset=${offset}&apikey=${publicKey}&ts=${hash.ts}&hash=${hash.hash}`;

      // Fetch the url with a GET request
      https.get(charURL, (res) => {
        // Make empty string to add data to as the response streams in
        let str = "";
        res.on('data', function (chunk) {
          str += chunk;
        });

        // When the response is finished, cache results in characterData array
        res.on('end', function () {
          // Cache the data
          let jsonData = JSON.parse(str);
          characterData.push(jsonData.data.results);
          // Return the results when for loop finishes
          if (characterData.length == 75) {
            console.log("API call");
            response.send(characterData);
          }
        });
      });
    };
  } else {
    console.log("Cached data");
    response.send(characterData);
  }
});

//-------------------------------------------------------------//
//------------------------ WEB SERVER -------------------------//
//-------------------------------------------------------------//


// Listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});