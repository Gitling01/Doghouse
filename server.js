const connection = require('./db.js');
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const sessionMiddleware = require('./session.js'); 
app.use(express.json());
app.use(cors());
app.use(sessionMiddleware);
app.use('/static', express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;

//CONNECT TO DB
let db;
connection().then(connection => {
    db = connection;
}).catch(err => {
    console.error('Failed to connect to the database.',err);
});

//GET LISTINGS
app.get('/listings', async (req,res) => {
    if(!db){
      return res.status(500).json({ error: 'Database connection not made.' });  
    }
    const query = "SELECT street_address, city, zipcode, price, bedroom_quantity, bathroom_quantity, photo_url, size FROM DoghouseDB.listing";
    try{
        const [results] = await db.execute(query); 
        res.json(results); 
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
})

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

//LOGIN RELATED ROUTES
app.get('/users', async (req,res) => { //TODO: REVIEW
    if(!db){
        return res.status(500).json({ error: 'Database connection not made.' });  
    }
      const query = "SELECT username,user_password,email FROM DoghouseDB.user";
    try{
       const [results] = await db.execute(query); 
       res.json(results); 
    } catch(err) {
         res.status(500).json({ error: err.message });
    }
});

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
        const query = "SELECT user_password FROM DoghouseDB.user WHERE username = ?";
        const [result] = await db.execute(query,[request_username]);
        console.log(result);
        const match = await bcrypt.compare(request_password,result[0].user_password);
        if(match){
            //the user is logged in
            console.log("Logged in!");
            res.status(201).json({ message: "Logged in successfully!"});
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

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

