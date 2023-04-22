const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8000;

http
  .createServer(function (req, res) {
    // console.log(`Request received for '${req.url}'`);
    let filePath = path.join(__dirname, req.url);
    if (!path.extname(filePath)) {
      filePath = path.join(filePath, 'index.html');
    }
    console.log({
      ext: path.extname(filePath),
      url: req.url,
      filePath,
    });

    fs.readFile(filePath, function (err, data) {
      let contentType = 'text/html';
      switch (path.extname(filePath)) {
        case '.css':
          contentType = 'text/css';
          break;
        case '.js':
          contentType = 'text/javascript';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
          contentType = 'image/jpg';
          break;
        case '.svg':
          contentType = 'image/svg+xml';
          break;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`Listening on port ${port}`));
