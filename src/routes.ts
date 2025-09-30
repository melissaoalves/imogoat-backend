import { Router } from 'express';

import { UserController } from '../src/controllers/UserControllers';
import { ImmobileController } from '../src/controllers/ImmobileControllers';
import { authMiddleware } from '../src/middlewares/authMiddleware';

const routes = Router();

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

export default routes;
