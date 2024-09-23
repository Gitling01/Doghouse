const express = require('express');
const app = express()
const cors = require('cors')
const path = require('path')
app.use(express.json())
app.use(cors())
app.use('/static', express.static(path.join(__dirname, 'public')))

const port = 3000

app.get('/data', (req, res)=> {
    res.send("Hi");
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

TODO: Update GET /data to get values for the street_address, price, photo_url,
bedroom_quantity, bathroom_quantity, and size