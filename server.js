require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const shortid = require('short-id');
const {isURL} = require('validator');
const Url = require('./models/url');



// Connect to DataBase



const DBURI = process.env['DB_URI']
mongoose.connect(DBURI, { useNewUrlParser: true, useUnifiedTopology: true });

let db = mongoose.connection;

// check connection
db.once('open', () => {
    console.log('connectd to mongoDB');
})

// Print error if found
db.on('error', err => console.log(err));




// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());


// The most important two lines 
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());



app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

/*
app.get("/api/shorturl/", (req, res) => {
		
});
*/


let createAndSaveURL = (url) => {
  let url_ID = shortid.generate()
  const myShrotnerUrlBase = "myShortner";  
  /*
  No Need to configure new full url it's not our site
  let newURL = new Url({long_url : url , short_url : myShrotnerUrlBase + "/" + url_ID});
  */
  let newURL = new Url({long_url : url , short_url :  url_ID});
  newURL.save( (err) => {
    if (err) return console.error(err);
  });
  return  url_ID;
};

app.get('/api/shorturl/:id', (req, res) => {
    console.log(typeof(req.params.id));
    Url.findOne({short_url : req.params.id}, (err, url) => {
        if(err) return res.json({error: err});   
    })
    .then(url =>{
        //console.log(JSON.stringify(url));
        res.redirect(url.long_url);
    })
    .catch( err => {
        console.log(err);
    });
});


app.post("/api/shorturl", (req, res) => {
	if(!isURL(req.body.url)){
        console.log("invalid");
		return res.json({ error: "invalid url"})
    }
    // Alredy In DB
    Url.find({long_url : req.body.url}, (err, url) => {
        if(err) return res.json({error: err});
    })
    .then(url => {
        if(url.length > 0){
            console.log(url , 'Pre Saved');
            console.log(JSON.stringify({original_url : req.body.url, short_url : url.short_url}));
            res.json({original_url : req.body.url, short_url : url.short_url});
        }else{
            // Create New
            const short_url = createAndSaveURL(req.body.url);
            console.log(short_url, 'First Time');
            res.json({original_url : req.body.url, short_url : short_url});
        }
    
    })
    .catch(err => {
        return console.log(err);
    }); 
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
