import { Router } from 'express';

import { UserController } from '../src/controllers/UserControllers';

const routes = Router();

routes.post('/create-user', new UserController().createUser);
routes.post('/login', new UserController().signUser);
routes.post('/esqueci', new UserController().sendResetEmail);
routes.post('/trocarSenha', new UserController().resetPassword);


export default routes;
