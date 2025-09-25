import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import { UserRepository } from '../repositories/UserRepository';
import { error, info } from 'console';

const jwt_pass = process.env.JWT_PASS as string;
const email_pass = process.env.EMAIL_PASS as string;
const email_user = process.env.EMAIL_USER as string;

const userRepository = new UserRepository();

export class UserController {
  /**
   * Cria um novo usuário no sistema.
   *
   * @route POST /users
   * @param {Request} req - Requisição contendo os campos username, email, password, phoneNumber e role.
   * @param {Response} res - Resposta contendo mensagem de sucesso ou erro.
   * @returns {Promise<void>} Retorna status 200 em caso de sucesso ou erros de validação/servidor.
   */
  async createUser(req: Request, res: Response): Promise<void> {
    const { username, email, password, phoneNumber, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: "Os campos 'username', 'email' e 'password' são obrigatórios" });
      return;
    }

    const userFind = await userRepository.findByEmail(String(email));
    if (userFind) {
      res.status(400).json({ message: 'Email já cadastrado' });
      return;
    }

    if (role !== 'admin' && role !== 'user' && role !== 'owner') {
      res.status(400).json({ message: "O campo 'role' deve ser 'admin', 'user' ou 'owner'" });
      return;
    }

    try {
      const hashP = await bcrypt.hash(String(password), 10);
      const user = await userRepository.create({ username, email, password: hashP, phoneNumber, role });
      res.status(200).json({ message: 'Usuário criado com sucesso! '});
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Realiza login de um usuário já cadastrado.
   *
   * @route POST /login
   * @param {Request} req - Requisição contendo email e password.
   * @param {Response} res - Resposta contendo token JWT, id e role do usuário.
   * @returns {Promise<void>} Retorna status 200 em caso de sucesso ou erros de autenticação/servidor.
   */
  async signUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email e password são campos obrigatórios' });
        return;
      }

      const user = await userRepository.findByEmail(String(email));
      if (!user) {
        res.status(400).json({ message: 'Usuário não existe' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(String(password), user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: 'Senha incorreta' });
        return;
      }

      const token = jwt.sign({ id: user.id }, jwt_pass, { expiresIn: '8h' });

      const { password: _, ...userLogin } = user;

      res.json({
        message: "Login efetuado com sucesso!",
        id: user.id,
        role: user.role,
        token
      });
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Lista todos os usuários cadastrados.
   *
   * @route GET /users
   * @param {Request} req - Requisição HTTP.
   * @param {Response} res - Resposta contendo lista de usuários (sem senha).
   * @returns {Promise<void>} Retorna status 200 com lista de usuários ou erro 500.
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userRepository.findAll();
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.status(200).json(usersWithoutPassword);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Busca um usuário específico pelo ID.
   *
   * @route GET /users/:id
   * @param {Request} req - Requisição contendo o parâmetro de rota "id".
   * @param {Response} res - Resposta contendo dados do usuário (sem senha).
   * @returns {Promise<void>} Retorna status 200 em caso de sucesso, 400 para ID inválido ou 404 se não encontrado.
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);

      if (isNaN(userId)) {
        res.status(400).json({ message: 'O ID do usuário deve ser um número válido' });
        return;
      }

      const user = await userRepository.findById(userId);

      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { username, email, password, phoneNumber, role } = req.body;
      const userId = Number(id);

      if (isNaN(userId)) {
        res.status(400).json({ message: 'O ID do usuário deve ser um número válido.' });
        return;
      }

      const user = await userRepository.findById(userId);

      if (user) {
        const updatePayload = {
          username,
          email,
          phoneNumber,
          role,
          password: password ? await bcrypt.hash(password, 10) : undefined
        };
        
        const updatedUser = await userRepository.update(userId, updatePayload);
        
        const { password: _, ...userWithoutPassword } = updatedUser!;

        res.status(200).json(userWithoutPassword);
      } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userRepository.findById(Number(id));
      if (user) {
        await userRepository.delete(Number(id));
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
      } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
