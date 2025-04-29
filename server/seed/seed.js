const mongoose = require('mongoose');

const Site = require('../models/Site');
const Product = require('../models/Product');
const Statistic = require('../models/Statistic');
const HistoryEvent = require('../models/HistoryEvent');
const Satellite = require('../models/Satellite');
const Employee = require('../models/Employee');
const Grade = require('../models/Grade');
const User = require('../models/User');
const { sites, products, statistics, historyEvents, employees, grades, adminUser, testUsers } = require('../data/data');
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
        await User.deleteMany({});
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
            { key: 'Grades', data: grades, model: Grade }
        ];

        // Seed all data
        for (const { key, data } of mappedData) {
            if (!data) throw new Error(`Data for key: ${key} is undefined`);
            else if (!Array.isArray(data)) throw new Error(`Data for key: ${key} is not an array`);
            else if (data.length === 0) throw new Error(`Data for key: ${key} is empty`);

            if (!mongoose.models[key]) throw new Error(`Model not found for key: ${key}`);

            await mongoose.models[key].deleteMany({});
            await mongoose.models[key].insertMany(data);

            console.log(`Data seeded for key: ${key}`);
        }

        // Find Alice's employee record to link to admin user
        const aliceEmployee = await Employee.findOne({ email: 'alice.smith@example.com' });
        if (!aliceEmployee) {
            throw new Error('Admin employee record not found');
        }

        // Clear existing users
        await User.deleteMany({});

        // Create admin user with employee reference
        adminUser.employee = aliceEmployee._id;
        await User.create(adminUser);
        console.log('Admin user created successfully');

        // Create test users for each grade level
        for (const testUser of testUsers) {
            const employee = await Employee.findOne({ email: testUser.email });
            if (!employee) {
                throw new Error(`Employee not found for test user: ${testUser.username}`);
            }
            testUser.employee = employee._id;
            await User.create(testUser);
        }
        console.log('Test users created successfully');

        // Assign grades to non-admin users based on their points
        const users = await User.find({ admin: false });
        for (const user of users) {
            let grade;
            if (user.points < 100) {
                grade = await Grade.findOne({ name: "Apprentice" });
            } else if (user.points < 500) {
                grade = await Grade.findOne({ name: "Technician" });
            } else if (user.points < 1000) {
                grade = await Grade.findOne({ name: "Engineer" });
            } else {
                grade = await Grade.findOne({ name: "Manager" });
            }
            
            if (!grade) {
                throw new Error(`Grade not found for user: ${user.username}`);
            }
            
            await User.findByIdAndUpdate(user._id, { grade: grade._id });
        }

        // Ensure admin has no grade
        await User.updateMany({ admin: true }, { $unset: { grade: "" } });
        console.log('User grades assigned successfully');

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
