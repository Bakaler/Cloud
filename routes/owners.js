const jsonwebtoken = require('jsonwebtoken');
const bodyParser = require('body-parser');
const ds = require('../datastore');
const express = require('express');
const router = express.Router();
const oauth = require("./oauth");
router.use(bodyParser.json());

const oauth2Client = oauth.get_oauth2Client()
const datastore = ds.datastore;
const OWNER = 'User'

const URL = "https://portfolio-bakera5.ue.r.appspot.com"
//const URL = "http://localhost:8888";


async function get_users(){
    const q = datastore.createQuery(OWNER);
      return datastore.runQuery(q).then((entities) => {
          // Use Array.map to call the function fromDatastore. This function
          // adds id attribute to every element in the array at element 0 of
          // the variable entities
          //console.log(entities[0].map(fromDatastore))
          return entities[0].map(ds.fromDatastore);
    });
}


router.get('/', async function(req, res){

    if(req.get('accept') !== 'application/json'){
        res.status(406).json({'Error' : 'Server only sends application/json data'})
    }

    else {
        get_users()
        .then(async (users) =>{
            res.status(200).json(users)
        })
    }
})

module.exports = router;