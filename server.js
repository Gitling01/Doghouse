//HTTPS SETTINGS SECTION (can comment out if you want http)
//***************************************************
const https = require('https');
const fs = require('fs');
//require('dotenv').config(); //will add for photo uploading stuff
const certPathName = "C:/Users/Faylo/Desktop/cert files/localhost+2.pem";
const keyPathName = "C:/Users/Faylo/Desktop/cert files/localhost+2-key.pem";
const options = {
    key: fs.readFileSync(keyPathName), //path to 'localhost-key.pem'
    cert: fs.readFileSync(certPathName) //path to 'localhost.pem'
};
//*************************************************** 
const connection = require('./db.js');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());
app.use(cors({
   origin: 'http://localhost:3000',
   credentials: true,
   methods: ['*'],
   allowedHeaders: ['*']
}));
//app.set('trust proxy', 1); //will deploy to heroku later
app.use(session({
    secret: 'kimpossible',
    resave: false,
    saveUninitialized: false,
    cookie:{
        secure: true, //set true in production (or when using https)
        maxAge: 1000 * 60 * 5, //5 min
        httpOnly: true, //avoids xss (ok for https too)
        sameSite: 'none' //mdn docs says if this is none, then secure must be true
    }
}));
app.use(express.static(path.join(__dirname,'public'))); 
app.get('/index.html', function (req, res) {
    var options = {
      root: path.join(__dirname, 'public'),
    }

    res.sendFile(index.html, options); //could add error handling like express doc
    });

const port = process.env.PORT || 3000;

//CONNECT TO DB
let db;
connection().then(connection => {
    db = connection;
}).catch(err => {
    console.error('Failed to connect to the database.',err);
});

//GET LISTINGS
/* app.get('/listings', async (req,res) => {
   if(!db){
     return res.status(500).json({ error: 'Database connection not made.' });  
    }
    const { listing_id } = req.query;
    try{
       let query;
       if(listing_id){
           query = "SELECT * FROM DoghouseDB.listing WHERE listing_id = ?"
           const [listing] = await db.execute(query, [listing_id]);
           if(!listing){
               return res.status(404).json({ message: "Listing matching that id not found"});
           }
           res.json(listing);
       } else{
           query = "SELECT * FROM DoghouseDB.listing";
           const [allListings] = await db.execute(query); 
           res.json(allListings); 
       }
   } catch(err) {
       console.error("Error getting listing/s",error)
       res.status(500).json({ error: err.message });
   }
}); */

//POST LISTING
app.post('/listings', async (req,res) => {
    if(!db){
        return res.status(500).json({ error: 'Database connection not made'});
    }
    console.log("Request body: ", req.body);
    try{
        const streetAddress = req.body.street_address;
        const city = req.body.city;
        const zipcode = req.body.zipcode;
        const price = req.body.price;
        const bedroomQuantity = req.body.bedroom_quantity;
        const bathroomQuantity = req.body.bathroom_quantity;
        const photoUrl = req.body.photo_url;
        const size = req.body.size;
        console.log("In post route: " + streetAddress + " " + city + " " + zipcode + " " + price + " " +
            + bedroomQuantity + " " + bathroomQuantity + " " + size + " " + photoUrl);
        const query = "INSERT INTO DoghouseDB.listing (street_address, city, zipcode, price, bedroom_quantity, bathroom_quantity, photo_url, size) VALUES (?,?,?,?,?,?,?,?)";
        await db.execute(query,[streetAddress, city, zipcode, price, bedroomQuantity, bathroomQuantity, photoUrl, size]);
        res.status(201).json({ message: "Listing created successfully!"});
    } catch(err){
        console.error("Error creating listing in post route", err);
        res.status(500).json({ error: err.message });
    }
});

//DELETE A LISTING (will add user_id info)
app.delete('/listings', async (req,res) => {
    if(!db){
        return res.status(500).json({ error: 'Database connection not made'});
    }
    const { listing_id } = req.query;
    try{
        const query = "DELETE FROM DoghouseDB.listing WHERE listing_id = ?"; 
        await db.execute(query, [listing_id]);
        //can also check if listing with that id exists (could use result.affectedRows > 0)
        res.status(200).json({ message: "Deletion successful" });
    }catch(error){
        console.error("Error trying to delete listing", error);
        res.status(500).json({ error: error.message });
    }
});

//WIP: Search by params (for the search bar and the rental type dropdown)
app.get('/listings', async (req, res) => {
    if(!db){
        return res.status(500).json({ error: 'Database connection not made.' });  
    }
    const { listing_id, rental_type, street_address, borough, city, zipcode } = req.query;
    
    let query = 'SELECT * FROM DoghouseDB.listing WHERE 1=1'; 
    const params = [];

    if (listing_id) {
        query += ' AND listing_id = ?';
        params.push(listing_id);
    }
    if (rental_type) {
        query += ' AND rental_type = ?';
        params.push(rental_type);
    }
    if (street_address) {
        query += ' AND street_address = ?';
        params.push(street_address);
    }
    if (borough) {
        query += ' AND borough = ?';
        params.push(borough);
    }
    if (city) {
        query += ' AND city = ?';
        params.push(city);
    }
    if (zipcode) {
        query += ' AND zipcode = ?';
        params.push(zipcode);
    }
   
    try {
        const [rows] = await db.execute(query, params);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No matching listings found.' });
        }
        res.json(rows);
    } catch (error) {
        console.log("error: ", error)
        res.status(500).json({ error: 'Database query failed' });
    }
});


//SESSIONS RELATED
const isAuthenticated = (req,res,next) => {
    console.log(`isAuthenticated: ${req.session.id}`);
    console.log(req.session);
    if(req.session.userId){ 
        console.log("User is logged in");
        return next(); //return
    } else {
        console.log("Unauthorized");
        res.status(401).json({message: "Not authorized to view this page - login"});
    }
};

//Protected Route for Add a Listing Link
app.get('/protected/add-listing', isAuthenticated, (req,res) => {
    console.log("isAuthenticated finished and I was called to send a file");
    res.status(200).json({message: "from /protected/add-listing: user passed isAuthenticated"});
});

//Get specific user-related data -- if the user is logged in (thus also has a session.userId)
app.get('/protected/users', isAuthenticated, async (req,res) => {
    if(!db){
        return res.status(500).json({ error: 'Database connection not made.' });  
    }
      const userId  = req.session.userId; 
      const userInfoQuery = "SELECT photo_url, username, user_id FROM DoghouseDB.user WHERE user_id = ?";
      const listingsQuery = "SELECT street_address, listing_id FROM DoghouseDB.listing WHERE user_id = ?"
    try{
       const [userInfoResults] = await db.execute(userInfoQuery, [userId]); 
       const [listingsResults] = await db.execute(listingsQuery, [userId]);
       console.log(userInfoResults);
       console.log(listingsResults);
       res.json({ userInfoResults: userInfoResults[0], listingsResults: listingsResults}); 
    } catch(err) {
         res.status(500).json({ error: err.message });
    }
});

//Get specific user-related favorite listings
app.get('/protected/favorites', isAuthenticated, async(req,res) => {
    if(!db){
        return res.status(500).json({ error: 'Database connection not made' });
    }
    const userId = req.session.userId;
    const query = "SELECT f.listing_id, street_address FROM DoghouseDB.favorite f JOIN DoghouseDB.listing l ON l.listing_id = f.listing_id WHERE f.user_id = ?";
    try{
        const [listings] = await db.execute(query, [userId]); 
        res.json(listings);
    } catch(error){
        console.error("Error getting favorites from database", error);
        res.status(500).json({ error: "Error getting favorites from database"});
    }
});

//add a listing to favorites
app.post('/protected/favorites', isAuthenticated, async (req, res) => {
    if (!db) {
        return res.status(500).json({ error: 'Database connection not made' });
    }
    const userId = req.session.userId; 
    const { listing_id } = req.body;
    if (!listing_id) {
        return res.status(400).json({ error: 'Listing ID is required' });
    }
    const query = `INSERT INTO DoghouseDB.favorite (user_id, listing_id) VALUES (?, ?)`;
    try {
        await db.execute(query, [userId, listing_id]);
        res.status(200).json({ message: 'Listing added to favorites' });
    } catch (error) {
        console.error("Error adding to favorites:", error);
        res.status(500).json({ error: "Error adding to favorites" });
    }
});


//LOGIN RELATED ROUTES
app.post('/users', async(req,res) => { //TODO: REVIEW
    if(!db){
        return res.status(500).json({ error: 'Database connection not made.' });  
      }
      console.log("Request body received: ", req.body);
    try{
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password,salt);
        const username = req.body.username; 
        const email = req.body.email;
        const query = "INSERT INTO DoghouseDB.user (username, user_password, email) VALUES (?,?,?)";
        await db.execute(query,[username,hashedPassword,email]);     
        res.status(201).json({ message: "User added successfully!"});     
    } catch(error){
        console.error("Error adding user", error);
        res.status(500).send();
    }
});

//TODO: add error checking as needed
app.post('/users/login', async (req,res) => {
    if(!db){
        return res.status(500).json({ error: 'Database connection not made.' });  
    }
    try{
        const request_username = req.body.username;
        const request_password = req.body.password;
        const query = "SELECT user_id, user_password FROM DoghouseDB.user WHERE username = ?";
        const [result] = await db.execute(query,[request_username]);
        if (result.length === 0) {
            return res.status(404).json({ message: "User not found!" });
        }
        const { user_id, user_password } = result[0];
        const match = await bcrypt.compare(request_password,user_password);
        if(match){
            //the user is logged in
            req.session.userId = user_id;
            console.log(`Logged in!: ${request_username}`);
            res.status(200).json({ message: "Logged in successfully!"});
        } else {
            //deny login
            console.log("Not logged in!");
            res.status(500).json({ message: "Did not log in successfully!"});
        }
    }  catch(error){
        console.error("Error logging in", error);
        res.status(500).send();
    }
});

//logout
app.post('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err){
            console.log("logout error", err);
            res.status(500).json( {message: "error logging out"} );
        }
        res.clearCookie('connect.sid');
        res.status(200).json( {message: "logout successful"} );
    });
});

//app.listen(port, () => {
 //   console.log(`App listening on port ${port}`)
//})

//MORE HTTPS SETUP: uncomment out the app.listen code directly above to use http instead
https.createServer(options, app).listen(port, () => {
  console.log('HTTPS server running on https://localhost:3000');
});

//********************************************************************************** 
