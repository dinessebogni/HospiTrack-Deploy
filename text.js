// testHash.js
const bcrypt = require('bcrypt');

const password = "divine"; // mot de passe choisi
bcrypt.hash(password, 10).then(hash => {
  console.log('Hash généré:', hash);
});
