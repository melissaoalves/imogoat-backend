import { Router } from 'express';

import { UserController } from '../src/controllers/UserControllers';

const routes = Router();

routes.post('/create-user', new UserController().createUser);
routes.post('/login', new UserController().signUser);
routes.get('/users', new UserController().getAllUsers);
routes.get('/users/:id', new UserController().getUserById);


export default routes;
