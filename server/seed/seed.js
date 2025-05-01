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
        await Promise.all([
            Satellite.deleteMany({}),
            Site.deleteMany({}),
            Product.deleteMany({}),
            Statistic.deleteMany({}),
            HistoryEvent.deleteMany({}),
            Employee.deleteMany({}),
            Grade.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // First, seed satellites and sites
        await Satellite.insertMany(await satellites);
        await Site.insertMany(sites);
        console.log('Seeded satellites and sites');

        // Seed basic data
        await Promise.all([
            Product.insertMany(products),
            Statistic.insertMany(statistics),
            HistoryEvent.insertMany(historyEvents),
            Grade.insertMany(grades)
        ]);
        console.log('Seeded basic data');

        // Prepare employee data with site references
        const siteMap = new Map();
        const allSites = await Site.find({});
        allSites.forEach(site => siteMap.set(site.name, site._id));

        const employeesWithSites = employees.map(emp => {
            const siteId = siteMap.get(emp.office);
            if (!siteId) {
                throw new Error(`Site not found for office: ${emp.office}`);
            }
            return { ...emp, site: siteId };
        });

        // Seed employees
        const savedEmployees = await Employee.insertMany(employeesWithSites);
        console.log('Seeded employees with site references');

        // Find grades for reference
        const gradeLevels = await Grade.find({}).lean();
        const gradeMap = new Map(gradeLevels.map(grade => [grade.name, grade._id]));

        // Create admin user with employee reference
        const aliceEmployee = savedEmployees.find(emp => emp.email === adminUser.email);
        if (!aliceEmployee) {
            throw new Error('Admin employee record not found');
        }
        await User.create({
            ...adminUser,
            employee: aliceEmployee._id
        });
        console.log('Created admin user');

        // Create test users with proper references
        const testUsersWithRefs = testUsers.map(user => {
            const employee = savedEmployees.find(emp => emp.email === user.email);
            if (!employee) {
                throw new Error(`Employee not found for test user: ${user.username}`);
            }

            let gradeName;
            if (user.points < 100) gradeName = "Apprentice";
            else if (user.points < 500) gradeName = "Technician";
            else if (user.points < 1000) gradeName = "Engineer";
            else gradeName = "Manager";

            return {
                ...user,
                employee: employee._id,
                grade: gradeMap.get(gradeName)
            };
        });

        await Promise.all(testUsersWithRefs.map(user => User.create(user)));
        console.log('Created test users with proper references');

        console.log('Database seeding completed successfully');
    }
    catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
    finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seed function
seedDatabase()
    .then(() => {
        console.log('Seeding completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error during seeding:', error);
        process.exit(1);
    });
