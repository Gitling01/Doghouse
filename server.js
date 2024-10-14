const connection = require('./db.js');
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
app.use(express.json());
app.use(cors());
app.use('/static', express.static(path.join(__dirname, 'public')));

const port = 3000;

//DB RELATED ROUTES
let db;
connection().then(connection => {
    db = connection;
}).catch(err => {
    console.error('Failed to connect to the database.',err);
});

app.get('/data', async (req,res) => {
    if(!db){
      return res.status(500).json({ error: 'Database connection not made.' });  
    }
    const query = "SELECT street_address, price, bedroom_quantity, bathroom_quantity, photo_url, size FROM DoghouseDB.listing";
    try{
        const [results] = await db.execute(query); 
        res.json(results); 
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
})

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
    try{
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password,salt);
        const username = req.body.username; 
        const email = req.body.email;
        const query = "INSERT INTO DoghouseDB.user (username, user_password, email) VALUES (?,?,?)";
        await db.execute(query,[username,hashedPassword,email]);     
        res.status(201).send();     
    } catch(error){
        console.error("Error adding user", error);
        res.status(500).send();
    }
});

app.post('/users/login',(res,req) => {
    //TODO: add route to let users login
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

