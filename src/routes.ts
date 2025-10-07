import { Router } from 'express';

import { UserController } from '../src/controllers/UserControllers';
import { ImmobileController } from '../src/controllers/ImmobileControllers';
import { ImageController } from '../src/controllers/ImageControllers';
import { authMiddleware } from '../src/middlewares/authMiddleware';
import { FavoriteController } from './controllers/FavoriteControllers';

const routes = Router();

const multer = require('multer');

const uploadImovel = require('./services/firebase.js');

const Multer = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 10,
    files: 5
  }
});

routes.post('/create-user', new UserController().createUser);
routes.post('/login', new UserController().signUser);
routes.get('/user', new UserController().getAllUsers);
routes.get('/user/:id', new UserController().getUserById);
routes.put('/alter-user/:id', new UserController().updateUser);
routes.delete('/delete-user/:id', new UserController().deleteUser);

routes.get('/immobile/:id', new ImmobileController().getImmobileById);
routes.get('/immobile', new ImmobileController().getAllImmobiles);
routes.post('/create-immobile', authMiddleware, new ImmobileController().createImmobile);
routes.put('/alter-immobile/:id', authMiddleware, new ImmobileController().updateImmobile);
routes.delete('/delete-immobile/:id', authMiddleware, new ImmobileController().deleteImmobile);

routes.post('/create-image', authMiddleware, Multer.array('url', 5), uploadImovel, new ImageController().createImage);
routes.get('/image', new ImageController().getAllImages);
routes.get('/image/:id', new ImageController().getImageById);

routes.post('/create-favorites', authMiddleware, new FavoriteController().addFavorite);
routes.delete('/delete-favorites/:id', authMiddleware, new FavoriteController().deleteFavorite);
routes.get('/favorites/:userId', authMiddleware, new FavoriteController().getFavorites);

export default routes;
