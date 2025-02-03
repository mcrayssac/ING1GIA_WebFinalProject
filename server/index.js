const express = require('express');
const chalk = require('chalk');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
console.log('Mongo URI:', MONGO_URI);

const error = chalk.bold.red;
const warning = chalk.keyword('orange');
const info = chalk.bold.cyan;
const debug = chalk.bold.gray;
const success = chalk.bold.green;
const routes = chalk.bold.magenta;
const datetime = chalk.bold.yellow;

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

// Connect to MongoDB
async function connectToMongoDB() {
    const client = new MongoClient(MONGO_URI, { });
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db('Users');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
}

app.get('/mongo/', async (req, res) => {
    const db = await connectToMongoDB();
    res.send('Hello from MongoDB!');
});

app.get('/', (req, res) => {
    res.send('Hello from Node.js backend!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});