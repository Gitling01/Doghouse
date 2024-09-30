const connection = require('./db.js');
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
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

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

