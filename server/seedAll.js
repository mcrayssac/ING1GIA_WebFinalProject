// seedAll.js
const mongoose = require('mongoose');
require('dotenv').config();

const { sites, machines, products, statistics, historyEvents } = require('./data/data');

// Import des modèles
const Site = require('./models/Site');
const Machine = require('./models/Machine');
const Product = require('./models/Product');
const Statistic = require('./models/Statistic');       // Si vous disposez de ce modèle
const HistoryEvent = require('./models/HistoryEvent');   // Si vous disposez de ce modèle

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spacey';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB for seeding');

    // Optionnel : vider les collections existantes
    await Site.deleteMany({});
    await Machine.deleteMany({});
    await Product.deleteMany({});
    await Statistic.deleteMany({});
    await HistoryEvent.deleteMany({});

    // Insérer les sites
    console.log('Seeding Sites...');
    const insertedSites = await Site.insertMany(sites);
    console.log(`Seeding Sites: ${insertedSites.length} sites added`);

    // Exemple d'association :
    // Si vous souhaitez associer toutes vos machines au premier site inséré
    if (machines && machines.length > 0 && insertedSites.length > 0) {
      machines.forEach(machine => {
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

    // Insérer les statistiques (si vous avez un modèle et des données correspondantes)
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

    // Affichage des contenus des collections dans le "terminal"
    console.log('--- Contenu des Collections ---');
    
    console.log('Sites:');
    const sitesNow = await Site.find();
    console.log(JSON.stringify(sitesNow, null, 2));
    
    console.log('Machines:');
    const machinesNow = await Machine.find();
    console.log(JSON.stringify(machinesNow, null, 2));
    
    console.log('Products:');
    const productsNow = await Product.find();
    console.log(JSON.stringify(productsNow, null, 2));

    // Facultatif : afficher Statistics & HistoryEvents si désiré
    const statisticsNow = await Statistic.find();
    console.log('Statistics:');
    console.log(JSON.stringify(statisticsNow, null, 2));

    const eventsNow = await HistoryEvent.find();
    console.log('HistoryEvents:');
    console.log(JSON.stringify(eventsNow, null, 2));

    mongoose.connection.close();
    console.log('Seeding complete, connection closed.');
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
