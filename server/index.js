const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Load environment variables
const app = express();
app.use(express.json({ limit: "10mb" }));
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
console.log('Mongo URI:', MONGO_URI);

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
    ],
    credentials: true,
}));

// Middleware to parse cookies
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log(success('Connected to MongoDB')))
    .catch(err => console.error(error('Error connecting to MongoDB:', err)));

// Load models
require('./models/Employee');
require('./models/User');
require('./models/Site');
require('./models/Product');
require('./models/Statistic');
require('./models/HistoryEvent');
require('./models/News');
require('./models/Machine');
require('./models/RewardAction');
require('./models/LogMetric');

// Logging middleware for request metrics
const loggingMiddleware = require('./middlewares/loggingMiddleware');
app.use(loggingMiddleware);


app.get('/', (req, res) => {
    res.send('Hello from SpaceY API');
});

// Load routes
const emailRoutes = require('./routes/emailRoutes');
app.use('/api/send-email', emailRoutes);
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes); 
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const siteRoutes = require('./routes/siteRoutes');
app.use('/api/sites', siteRoutes);
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);
const statisticRoutes = require('./routes/statisticRoutes');
app.use('/api/statistics', statisticRoutes);
const historyEventRoutes = require('./routes/historyEventRoutes');
app.use('/api/history-events', historyEventRoutes);
const newsRoutes = require('./routes/newsRoutes');
app.use('/api/news', newsRoutes);
const machinesRoutes = require('./routes/machinesRoutes');
app.use('/api/machines', machinesRoutes);
// const addMachinesRoutes = require('./routes/addMachinesRoutes');
// app.use('/api/machinesForm', addMachinesRoutes);
const sensorsRoutes = require('./routes/sensorsRoutes');
app.use('/api/sensors', sensorsRoutes);

const satellitesRoutes = require('./routes/satellitesRoutes');
app.use('/api/satellites', satellitesRoutes);
const gradeRoutes = require('./routes/gradeRoutes');
app.use('/api/grades', gradeRoutes);
const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);
const rewardActionRoutes = require('./routes/rewardActionRoutes');
app.use('/api/rewards', rewardActionRoutes);

const logMetricsRoutes = require('./routes/logMetricsRoutes');
app.use('/api/metrics', logMetricsRoutes);

const userActivityRoutes = require('./routes/userActivityRoutes');
app.use('/api/users', userActivityRoutes); // Changed from '/api' to '/api/users' to match client-side paths

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
