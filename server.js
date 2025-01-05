const express = require('express');
const app = express();
const path = require("path");
const {logger} = require('./middleware/logEvents');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');


const PORT = process.env.PORT || 4000;

app.use(logger);

const whitelist = ['https://www.google.com', 'http://127.0.0.1:5000', 'http://localhost:4000'];

const corsOptions = {
    origin: (origin, callback) => {
        if(whitelist.indexOf(origin) !== -1 || !origin){
            callback(null, true)
        }else{
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));



// app.get('/', (req, res) => res.sendFile('./views/index.html', {root: __dirname}));
app.get('^/$|index(.html)?', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/new-page', (req, res) => res.sendFile(path.join(__dirname, 'views', 'new-page.html')));

app.all('*', (req, res) => {
    
    res.status(404)
    if(req.accepts('html')){

        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }
    else if(req.accepts('json')){

        res.json({error: "Route not found"});
    }
    else{
        res.type('txt').send("404 not found");
    }

})

app.use(errorHandler); 

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
