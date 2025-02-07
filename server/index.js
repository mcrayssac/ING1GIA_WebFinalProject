const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables
const app = express();
app.use(express.json());
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
//console.log('Mongo URI:', MONGO_URI);

// Chalk colors
const error = chalk.bold.red;
const warning = chalk.keyword('orange');
const info = chalk.bold.cyan;
const debug = chalk.bold.gray;
const success = chalk.bold.green;
const routes = chalk.bold.magenta;
const datetime = chalk.bold.yellow;

// CORS configuration
app.use(cors({
  origin: [
    process.env.ORIGIN_LOCAL
  ]
}));

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log(success('Connected to MongoDB')))
  .catch(err => console.error(error('Error connecting to MongoDB:', err)));

// Load middlewares
const { isAdmin, verifyToken } = require('./middlewares/authMiddlewares');

// Load models
require('./models/User');

// Track all incoming requests
app.use((req, res, next) => {
    // Request infos
    console.log("")
    console.log(datetime('DateTime:', new Date().toLocaleString())); 
    console.log(routes(`[${req.method}] ${req.url}`));
    console.log(info(`ip: ${req.ip}, origin: ${req.headers.origin}`));

    if (process.env.DEBUG === 'true'){
      console.log("");
      console.log(debug(`Params: ${JSON.stringify(req.params)}`)); 
      console.log(debug(`Query: ${JSON.stringify(req.query)}`));
      console.log(debug(`Body: ${JSON.stringify(req.body)}`));
      console.log(debug(`Headers: ${JSON.stringify(req.headers)}`));
      console.log("");
    }

  next();
});

app.get('/', (req, res) => {
    res.send('Hello from SpaceY API');
});

// Load routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});