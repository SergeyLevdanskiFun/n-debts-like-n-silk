const path = require('path');
const helmet = require('helmet');
require('dotenv').load();
const throng = require('throng');
const express = require('express');
const compression = require('compression');

const WORKERS = process.env.WEB_CONCURRENCY || 1;

function startWorker(id) {
  const app = express();
  app.use(helmet());
  app.use(compression());

  app.get('*', (req, res, next) => {
    // TODO RegExp
    if ((req.url.indexOf('#') > -1) ||
      (req.url.indexOf('?') > -1 && req.url.indexOf('&') > -1) ||
      ((req.url.lastIndexOf('.') === -1 || req.url.indexOf('&') > -1) ||
        (req.url.indexOf('/', req.url.lastIndexOf('.')) > -1))) {
      req.url = `/#${req.url}`;
    }

    next();
  });

  app.use(express.static(path.join(__dirname, 'www')));

  // CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
  app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });

  app.set('port', process.env.PORT || 8200);

  app.listen(app.get('port'), () => {
    console.log(`Express server #${id} listening on port ${app.get('port')}`);
  });
}

throng({
  workers: WORKERS,
  lifetime: Infinity,
  start: startWorker,
});
