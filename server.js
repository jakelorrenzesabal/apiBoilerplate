require('rootpath')();
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
// Configure CORS once with specific options
// specify the frontend origin
// allow cookies and other credentials to be sent
app.use(cors({
  origin: ['http://localhost:4200', 'https://angular-boilerplate-two-delta.vercel.app'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'products')));

app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));
app.use('/accounts', require('./accounts/account.controller'));
app.use('/api-docs', require('./_helpers/swagger'));

app.use(errorHandler);

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));