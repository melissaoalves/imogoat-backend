import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { UserRepository } from '../repositories/UserRepository';
import { EmailService } from '../services/emailService';
import { error, info } from 'console';

const jwt_pass = process.env.JWT_PASS as string;

const userRepository = new UserRepository();
const emailService = new EmailService();

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
      
      emailService.sendWelcomeEmail(email, username).catch(error => {
        console.error('Erro ao enviar email de boas-vindas:', error);
      });

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
      res.json(users);
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
      const user = await userRepository.findById(Number(id));
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }


  /**
 * Atualiza os dados de um usuário existente.
 *
 * @route PUT /users/:id
 * @param {Request} req - Requisição contendo o parâmetro de rota "id" e os novos dados do usuário (username, email, password, number, role).
 * @param {Response} res - Resposta contendo mensagem de sucesso ou erro.
 * @returns {Promise<void>} Retorna status 204 em caso de sucesso, 404 se o usuário não existir ou 500 em caso de erro interno.
 */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { username, email, password, phoneNumber, role } = req.body;
      const user = await userRepository.findById(Number(id));
      if (user) {
        await userRepository.update(Number(id), { username, email, password, phoneNumber, role });
        res.status(204).json({ message: 'Usuário atualizado com sucesso' });
      } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
 * Deleta um usuário do sistema.
 *
 * @route DELETE /users/:id
 * @param {Request} req - Requisição contendo o parâmetro de rota "id".
 * @param {Response} res - Resposta contendo mensagem de sucesso ou erro.
 * @returns {Promise<void>} Retorna status 204 em caso de sucesso, 404 se o usuário não existir ou 500 em caso de erro interno.
 */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userRepository.findById(Number(id));
      if (user) {
        await userRepository.delete(Number(id));
        res.status(204).json({ message: 'Usuário deletado com sucesso' });
      } else {
        res.status(404).json({ message: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Solicita recuperação de senha enviando código por email.
   *
   * @route POST /forgot-password
   * @param {Request} req - Requisição contendo o campo email.
   * @param {Response} res - Resposta contendo mensagem de sucesso ou erro.
   * @returns {Promise<void>} Retorna status 200 em caso de sucesso ou erros de validação/servidor.
   */
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: 'Email é obrigatório' });
        return;
      }

      const user = await userRepository.findByEmail(String(email));
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await userRepository.setPasswordResetCode(email, resetCode, expiresAt);

      await emailService.sendPasswordResetEmail(email, user.username, resetCode);

      res.json({ message: 'Código de recuperação enviado para o email' });
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * Redefine a senha usando o código enviado por email.
   *
   * @route POST /reset-password
   * @param {Request} req - Requisição contendo resetCode e newPassword.
   * @param {Response} res - Resposta contendo mensagem de sucesso ou erro.
   * @returns {Promise<void>} Retorna status 200 em caso de sucesso ou erros de validação/servidor.
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { resetCode, newPassword } = req.body;

      if (!resetCode || !newPassword) {
        res.status(400).json({ message: 'Código de recuperação e nova senha são obrigatórios' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres' });
        return;
      }

      const user = await userRepository.findByResetCode(String(resetCode));
      if (!user) {
        res.status(400).json({ message: 'Código de recuperação inválido ou expirado' });
        return;
      }

      const hashedPassword = await bcrypt.hash(String(newPassword), 10);

      await userRepository.updatePasswordAndClearResetCode(user.id, hashedPassword);

      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
