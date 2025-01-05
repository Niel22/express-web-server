const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;

const logEvent = require("./logEvents");
const eventEmitter = require("events");
class MyEmitter extends eventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on("log", (msg, filename) => logEvent(msg, filename));

const PORT = process.env.PORT || 4000;

const serveFile = async (filePath, contentType, res) => {
    try{
        const rawData = await fsPromises.readFile(
            filePath, 
            !contentType.includes('image') ? 'utf8' : ''
        );
        const data = contentType === 'application/json' ? JSON.parse(rawData) : rawData;

        res.writeHead(
            filePath.includes('404.html') ? 404 : 200, 
            {'Content-Type': contentType}
        );
        res.end(
            contentType === 'application/json' ? JSON.stringify(data) : data
        );
    }catch(err){
        console.log(err);
        res.statusCode = 500;
        myEmitter.emit("log", `${err.name}: ${err.message}`, 'errorLog.txt');
        res.end();
    }
}

const server = http.createServer((req, res) => {
    console.log(req.url, req.method);
    myEmitter.emit("log", `${req.url}\t${req.method}`, 'reqLog.txt');

  const ext = path.extname(req.url);
  let contentType;

  switch (ext) {
    case '.css':
        contentType = 'text/css';
        break;
    case '.js':
        contentType = 'txt/javascript';
        break;
    case '.json':
        contentType = 'application/json';
        break;
    case '.jpg':
        contentType = 'image/jpeg';
        break;
    case '.png':
        contentType = 'image/png';
        break;
    case '.txt':
        contentType = 'text/plain';
        break;
    default:
        contentType = 'text/html';
  }

  let filePath = contentType === 'text/html' && req.yrl === '/'
                        ? path.join(__dirname, 'views', 'index.html')
                        : contentType === 'text/html' && req.url.slice(-1) === '/'
                        ? path.join(__dirname, 'views', req.url, 'index.html')
                        : contentType === 'text/html'
                            ? path.join(__dirname, 'views', req.url)
                            : path.join(__dirname, req.url);
                            
    if(!ext && req.url.slice(-1) !== '/') filePath += '.html';

    const fileExist = fs.existsSync(filePath);

    if(fileExist)
    {
        serveFile(filePath, contentType, res);
    }else{
        switch (path.parse(filePath).base){
            case 'old-page.html':
                res.writeHead(301, {'location': '/new-page.html'});
                res.end();
                break;
            case 'www-page.html':
                res.writeHead(301, {'location': '/'});
                res.end();
                break;
            default:
                // 404
                serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res);
        }
    }


});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
