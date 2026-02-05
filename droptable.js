const mongoose = require('mongoose');

async function dropCollections() {
  await mongoose.connect('mongodb://localhost:27017/hospi_track');

  await mongoose.connection.db.dropCollection('chatmessages');
  await mongoose.connection.db.dropCollection('chatrooms');
  await mongoose.connection.db.dropCollection('rooms');


  console.log('Collections supprimées');
  mongoose.disconnect();
}

dropCollections();
