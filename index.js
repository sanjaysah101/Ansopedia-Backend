require('dotenv').config();
const compression = require('compression');
const express = require('express');
const cors = require('cors');
const path = require('path');
const expressUpload = require('express-fileupload');
const { Logs } = require('./middlewares/Logs');
const { Config } = require('./config/Config');
const { whitelist } = require('./middlewares/CorsWhiteList');

// ############################ Init #################################
const app = express();
const port = process.env.PORT;

// /########################### Dependency ###########################
// Json
app.use(express.json());

// For Express-FileUpload
app.use(expressUpload());

// compress all responses
// Compress all HTTP responses
app.use(compression());

// To use HBS
app.set('view engine', 'hbs');
// app.use(express.static(path.join(__dirname, "..","public")));

//CORS Policy - Enble for every device
app.use(cors());
app.use(cors(Config.corsOptions));
app.use(whitelist);

//Database Connection
Config.connectDb();

// const firebaseAdminAuth = new FirebaseAdminApp()

require('./config/Firebase');
// console.log(FirebaseApp().auth())

// API Routes
// app.use("/api/user", require("./routes/userRoutes"));
app.use('/api/role', require('./routes/roleRouter'));
app.use('/api/contents', require('./routes/contentsRoute'));
app.use('/api/contact', require('./routes/contactRoute'));
app.use('/api/notify', require('./routes/notifyRoute'));
app.use('/api/leaders', require('./routes/leadersRouter'));
app.use('/api/user', require('./routes/AuthRoute'));

// Non Api Routes
app.use('/', require('./routes/NonApiRoute'));
app.get('/health', (req, res) => res.send('Server is up and running!'));

console.log('first');

// Handling non matching request from the client
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not found' });
  } else {
    res.type('txt').send('file 404 not found');
  }
});

app.use(Logs.errorHandler);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
