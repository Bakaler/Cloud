const express = require('express');
const app = express();
const path = require('path')

app.use(express.static(path.join(__dirname, '/public')))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())



app.set('views', path.join(__dirname, '/public'))
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile);


app.use('/', require('./routes/index'));

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});