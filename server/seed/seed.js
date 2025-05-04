const mongoose = require('mongoose');

const Site = require('../models/Site');
const Product = require('../models/Product');
const Statistic = require('../models/Statistic');
const HistoryEvent = require('../models/HistoryEvent');
const Satellite = require('../models/Satellite');
const Employee = require('../models/Employee');
const Grade = require('../models/Grade');
const User = require('../models/User');
const News = require('../models/News');
const Machine = require('../models/Machine'); 
const Sensor = require('../models/Sensor');
const Ticket = require('../models/Ticket');
const RewardAction = require('../models/RewardAction');
const { sites, products, statistics, historyEvents, employees, grades, adminUser, testUsers, news, machines, sensors, rewardActions } = require('../data/data');
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
            User.deleteMany({}),
            Ticket.deleteMany({}),
            News.deleteMany({}),
            Machine.deleteMany({}),
            Sensor.deleteMany({}),
            RewardAction.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // First, seed satellites and sites
        await Satellite.insertMany(await satellites);
        await Site.insertMany(sites);
        console.log('Seeded satellites and sites');

        // Seed basic data
        // Insert basic data except machines
        await Promise.all([
            Product.insertMany(products),
            Statistic.insertMany(statistics),
            HistoryEvent.insertMany(historyEvents),
            Grade.insertMany(grades),
            News.insertMany(news),
            Sensor.insertMany(sensors),
            RewardAction.insertMany(rewardActions)
        ]);
        console.log('Seeded basic data');

        // Get all sites
        const allSites = await Site.find({});
        const launchSites = allSites.filter(site => site.markerType === 'launch');
        const testSites = allSites.filter(site => site.markerType === 'test');

        // Prepare counters for even distribution
        const siteCounters = new Map();
        allSites.forEach(site => siteCounters.set(site._id.toString(), 0));

        // Map machines to appropriate single site
        const machinesWithSite = machines.map(machine => {
            let availableSites = [];
            
            switch (machine.mainPole) {
                case 'Bas de la fusée':
                case 'Haut de la fusée':
                    availableSites = launchSites;
                    break;
                case 'Extérieur':
                    availableSites = allSites;
                    break;
                case 'Réservoir principal':
                    availableSites = [...launchSites, ...testSites];
                    break;
            }

            // Find site with least machines
            let leastUsedSite = availableSites[0];
            let minCount = Number.MAX_VALUE;

            availableSites.forEach(site => {
                const count = siteCounters.get(site._id.toString());
                if (count < minCount) {
                    minCount = count;
                    leastUsedSite = site;
                }
            });

            // Increment counter for selected site
            siteCounters.set(leastUsedSite._id.toString(), minCount + 1);

            return {
                ...machine,
                site: leastUsedSite._id
            };
        });

        await Machine.insertMany(machinesWithSite);
        console.log('Seeded machines with site references');

        // Create site map for employees
        const siteMap = new Map();
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
