const express = require('express');
const app = express();
const path = require("path");

const PORT = process.env.PORT || 4000;

// app.get('/', (req, res) => res.sendFile('./views/index.html', {root: __dirname}));
app.get('^/$|index(.html)?', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/new-page', (req, res) => res.sendFile(path.join(__dirname, 'views', 'new-page.html')));

app.get('/*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));

})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
