const mongoose = require('mongoose');

const Site = require('../models/Site');
const Product = require('../models/Product');
const Statistic = require('../models/Statistic');
const HistoryEvent = require('../models/HistoryEvent');
const Satellite = require('../models/Satellite');
const Employee = require('../models/Employee');

const { sites, products, statistics, historyEvents, employees } = require('../data/data');
const satellites = require('./satellites');

const MONGO_URI = process.env.MONGO_URI;

/**
 * Seed the database with sample data.
 */
async function seedDatabase() {
    try {
        // Connect to the database
        await mongoose.connect(MONGO_URI)
            .then(() => console.log('Connected to MongoDB'))
            .catch((error) => console.error('Error connecting to MongoDB:', error));

        // Clear existing data
        await Satellite.deleteMany({});
        await Site.deleteMany({});
        await Product.deleteMany({});
        await Statistic.deleteMany({});
        await HistoryEvent.deleteMany({});
        console.log('Cleared existing data');

        // Seed new data
        // Define the static data mappings 
        const mappedData = [
            { key: 'Satellites', data: await satellites, model: Satellite },
            { key: 'Sites', data: sites, model: Site },
            { key: 'Products', data: products, model: Product },
            { key: 'Statistics', data: statistics, model: Statistic },
            { key: 'HistoryEvents', data: historyEvents, model: HistoryEvent },
            { key: 'Employees', data: employees, model: Employee },
        ];

        // Loop over each mapping and seed the data
        for (const { key, data } of mappedData) {
            // Check if the data is an array and not empty
            //console.log('Data:', data);
            if (!data) throw new Error(`Data for key: ${key} is undefined`);
            else if (!Array.isArray(data)) throw new Error(`Data for key: ${key} is not an array`);
            else if (data.length === 0) throw new Error(`Data for key: ${key} is empty`);

            // Check if the model exists
            //console.log('Models:', mongoose.models);
            if (!mongoose.models[key]) throw new Error(`Model not found for key: ${key}`);

            // Clear the collection before inserting
            await mongoose.models[key].deleteMany({});
            await mongoose.models[key].insertMany(data);

            console.log(`Data seeded for key: ${key}`);
        }
        console.log('Data seeded successfully');
    }
    catch (error) {
        console.error('Error seeding data:', error);
    }
    finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seed function
seedDatabase()
    .then(() => {
        console.log('Seeding completed');
    })
    .catch((error) => {
        console.error('Error during seeding:', error);
    });