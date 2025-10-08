import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { UserRepository } from "../repositories/UserRepository";

const jwt_pass = process.env.JWT_PASS as string;
const userRepository = new UserRepository();

type JwtPayload = {
  id: number;
};

/**
 * Middleware de autenticação JWT para proteger rotas da API.
 *
 * Verifica se o usuário possui um token JWT válido no header Authorization.
 * Decodifica o token, busca o usuário no banco de dados e adiciona as informações
 * do usuário (sem a senha) ao objeto req.user para uso nas rotas protegidas.
 *
 * @param {Request} req - Objeto de requisição do Express, deve conter o header Authorization
 * @param {Response} res - Objeto de resposta do Express
 * @param {NextFunction} next - Função para passar controle para o próximo middleware
 * @returns {Promise<Response | void>} Retorna erro 401 se não autorizado, ou chama next() se válido
 *
 * @example
 * // Uso em rotas protegidas:
 * routes.post('/rota-protegida', authMiddleware, controller.metodo);
 *
 * // Header necessário na requisição:
 * // Authorization: Bearer <token_jwt>
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  try {
    if (!authorization) {
      return res.status(401).json({ message: "Não autorizado" });
    }

    const token = authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, jwt_pass) as JwtPayload;

    const user = await userRepository.findById(decodedToken.id);

    if (!user) {
      return res.status(401).json({ message: "Não autorizado" });
    }

    const { password: _, ...loggedUser } = user;

    req.user = loggedUser;
    next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({ message: "Não autorizado" });
  }
};
