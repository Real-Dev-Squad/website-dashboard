const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8000;
const pathIsAbsolute = require('path-is-absolute');

http
  .createServer(function (req, res) {
    const urlPath = path.normalize(req.url);
    let filePath = path.join(__dirname, urlPath);

    if (!pathIsAbsolute(filePath)) {
      res.statusCode = 400;
      res.end('Invalid file path');
      return;
    }

    if (!path.extname(filePath)) {
      filePath = path.join(filePath, 'index.html');
    }

    // Check that the file exists before reading it
    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end('File not found');
      return;
    }

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
