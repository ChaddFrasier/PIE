/* Libraries */
const express = require('express')

/* init the application */
const app = express()
app.set('view engine', 'pug')
const port = 8080

app.get('/', (req, res) => {
    res.render('index', {title: 'Login', emailMessage: 'Please log in with your USGS credentials'})
})

app.listen(port, () => console.log(`Listening for connection at http://localhost:${port}`))