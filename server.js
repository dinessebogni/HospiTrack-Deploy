require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const http = require('http');
const path = require('path');

const setupSocketServer = require('./api-backend/routes/socket');
const contactRoutes = require('./api-backend/routes/contact'); 
const hopitauxRoutes = require('./api-backend/routes/hopitaux');
const medecinsRoutes = require('./api-backend/routes/medecins');
const signupRoutes = require('./api-backend/routes/signup');
const loginRoutes = require('./api-backend/routes/login');
const evenementsRoutes = require('./api-backend/routes/evenements');
const notificationsRouter = require('./api-backend/routes/notifications');
const profileRouter = require('./api-backend/routes/profile');
const patientsRoutes = require('./api-backend/routes/patients');
const rendezVousRoutes = require('./api-backend/routes/rendez-vous');
const chatRoutes = require('./api-backend/routes/chat');
const visioRoutes = require('./api-backend/routes/visio');
const checkAdmins = require('./api-backend/routes/checkAdmins');

const app = express();
const PORT = process.env.PORT || 8000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospitrack';
const serverUrl1 = `http://localhost:${PORT}/api`;
const serverUrl2 = `https://hospitrack.system.com/api`;

// Connexion MongoDB 
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connecté à MongoDB');

    // Vérifier les admins et hopitaux manquants
    try {
      await checkAdmins();  
    } catch (err) {
      console.error("Erreur checkAdmins :", err);
    }
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err);
    process.exit(1);
  });

// Middleware 
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques pour les images uploadées 
app.use('/uploads', express.static(path.join(__dirname, 'api-backend/uploads')));

// Swagger config 
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Hospi Track API', version: '1.0.0' },
    servers: [{ url: serverUrl1 }, { url: serverUrl2 }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  }, 
  apis: ['./api-backend/routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routeur principal /api 
const apiRouter = express.Router();

apiRouter.use('/contact', contactRoutes);
apiRouter.use('/hopitaux', hopitauxRoutes);
apiRouter.use('/medecins', medecinsRoutes);
apiRouter.use('/evenements', evenementsRoutes);
apiRouter.use('/auth/signup', signupRoutes);
apiRouter.use('/auth/login', loginRoutes);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/patients', patientsRoutes);
apiRouter.use('/rendez-vous', rendezVousRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/visio', visioRoutes);

app.use('/api', apiRouter);

// Fermeture propre MongoDB 
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB déconnecté, arrêt du serveur');
  process.exit(0);
});

// Création serveur HTTP + socket.io 
const httpServer = http.createServer(app);
setupSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}/api`);
  console.log(`📖 Swagger UI disponible sur http://localhost:${PORT}/api-docs`);
});
