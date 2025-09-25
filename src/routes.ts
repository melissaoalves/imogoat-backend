import { Router } from 'express';

import { UserController } from '../src/controllers/UserControllers';

const routes = Router();

routes.post('/create-user', new UserController().createUser);
routes.post('/login', new UserController().signUser);
routes.get('/user', new UserController().getAllUsers);
routes.get('/user/:id', new UserController().getUserById);
routes.put('/alter-user/:id', new UserController().updateUser);
routes.delete('/delete-user/:id', new UserController().deleteUser);


export default routes;
