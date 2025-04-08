const mongoose = require('mongoose');
require('dotenv').config();

const { sites, machines, products, statistics, historyEvents } = require('./data/data');

// Import des modèles
const Site = require('./models/Site');       
const Machine = require('./models/Machine');
const Product = require('./models/Product');
const Statistic = require('./models/Statistic');     
const HistoryEvent = require('./models/HistoryEvent'); 
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:spacey@localhost:27017/spacey?authSource=admin';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB for seeding');

    // Optionnel : Vider les collections existantes (faites-le avec prudence)
    await Site.deleteMany({});
    await Machine.deleteMany({});
    await Product.deleteMany({});
    await Statistic.deleteMany({});
    await HistoryEvent.deleteMany({});
    await User.deleteMany({});

    // Insérer les sites
    console.log('Seeding Sites...');
    const insertedSites = await Site.insertMany(sites);
    console.log(`Seeding Sites: ${insertedSites.length} sites added`);

    // Seeding des utilisateurs
    console.log('Seeding Users...');
    const sampleUsers = [
      {
        username: "technicien1",
        email: "tech1@example.com",
        password: "password123",
        admin: false,
        points: 120,
        accessibleSites: [insertedSites[0].name],       // Exemple : accès au premier site
        accessiblePoles: ["Bas de la fusée"]              // Exemple : accès à ce pôle
      },
      {
        username: "responsable1",
        email: "resp1@example.com",
        password: "password123",
        admin: false,
        points: 1500,
        accessibleSites: insertedSites.map(site => site.name), // accès à tous les sites seeder
        accessiblePoles: ["Bas de la fusée", "Haut de la fusée"]  // accès à plusieurs pôles
      }
    ];
    const insertedUsers = await User.insertMany(sampleUsers);
    console.log(`Seeding Users: ${insertedUsers.length} users added`);

    // Exemple d'association des machines à un site :
    // Ici, on associe la première machine à la première site.
    if (machines && machines.length > 0 && insertedSites.length > 0) {
      machines.forEach(machine => {
        // Vous pouvez adapter cette logique pour associer des machines à plusieurs sites
        machine.sites = [insertedSites[0]._id];
      });
    }

    // Insérer les machines
    if (machines && machines.length > 0) {
      console.log('Seeding Machines...');
      const insertedMachines = await Machine.insertMany(machines);
      console.log(`Seeding Machines: ${insertedMachines.length} machines added`);
    } else {
      console.log('No machine data to seed.');
    }

    // Insérer les produits
    if (products && products.length > 0) {
      console.log('Seeding Products...');
      const insertedProducts = await Product.insertMany(products);
      console.log(`Seeding Products: ${insertedProducts.length} products added`);
    } else {
      console.log('No product data to seed.');
    }

    // Insérer les statistiques (si vous en avez des données)
    if (statistics && statistics.length > 0) {
      console.log('Seeding Statistics...');
      const insertedStatistics = await Statistic.insertMany(statistics);
      console.log(`Seeding Statistics: ${insertedStatistics.length} statistic records added`);
    } else {
      console.log('No statistics data to seed.');
    }

    // Insérer les événements historiques
    if (historyEvents && historyEvents.length > 0) {
      console.log('Seeding History Events...');
      const insertedHistoryEvents = await HistoryEvent.insertMany(historyEvents);
      console.log(`Seeding History Events: ${insertedHistoryEvents.length} history events added`);
    } else {
      console.log('No history events data to seed.');
    }

    // Optionnel : Affichage global des contenus des collections
    console.log('--- Contenu des Collections ---');
    const allSites = await Site.find();
    console.log('Sites:', JSON.stringify(allSites, null, 2));
    const allMachines = await Machine.find();
    console.log('Machines:', JSON.stringify(allMachines, null, 2));
    const allProducts = await Product.find();
    console.log('Products:', JSON.stringify(allProducts, null, 2));
    const allUsers = await User.find();
    console.log('Users:', JSON.stringify(allUsers, null, 2));

    mongoose.connection.close();
    console.log('Seeding complete, connection closed.');
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
