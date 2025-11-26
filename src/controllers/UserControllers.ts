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
      res.status(200).json({ message: 'Usuário criado com sucesso! ' });
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
 * Envia um e-mail contendo um token JWT para redefinição de senha.
 *
 * @async
 * @function sendResetEmail
 * @param {Request} req - Objeto da requisição HTTP contendo o campo `email` no corpo.
 * @param {Response} res - Objeto da resposta HTTP utilizado para retornar o status e mensagens.
 * 
 * @description
 * - Verifica se o campo `email` foi enviado.
 * - Busca o usuário no banco através do repositório.
 * - Gera um token JWT válido por 1 hora.
 * - Envia o token por e-mail usando o Gmail e Nodemailer.
 *
 * @returns {Promise<void>} Retorna uma resposta HTTP indicando sucesso ou erro.
 * 
 * @throws
 * - 400: quando o email não é informado.
 * - 404: quando o usuário não é encontrado.
 * - 500: erro ao enviar o e-mail ou erro interno do servidor.
 */
  async sendResetEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        console.log(email);
        res.status(400).json({ message: "O campo 'email' é obrigatório" });
        return;
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      const token = jwt.sign({ id: user.id }, jwt_pass, { expiresIn: '1h' });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email_user,
          pass: email_pass
        }
      });

      const info = await transporter.sendMail({
        from: '"ImoGoat" <eduardosousa1718@gmail.com>',
        to: email,
        subject: 'Redefinição de Senha - ImoGoat',
        text: `Olá,\n\nRecebemos sua solicitação para redefinir a senha. Copie o código abaixo e cole no aplicativo para continuar:\n\n${token}\n\nSe você não solicitou a redefinição, ignore este e-mail.\n\nAtenciosamente,\nEquipe ImoGoat`
      }, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).json({ message: 'Erro ao enviar email' });
        } else {
          res.status(200).json({ token });
        }
      });

    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }



  /**
   * Redefine a senha de um usuário usando o token JWT enviado anteriormente por e-mail.
   *
   * @async
   * @function resetPassword
   * @param {Request} req - Objeto da requisição HTTP contendo `token` e `novaSenha` no corpo.
   * @param {Response} res - Objeto da resposta HTTP utilizado para retornar o status e mensagens.
   * 
   * @description
   * - Valida os campos obrigatórios.
   * - Decodifica o token JWT usando a chave secreta.
   * - Verifica se o token é válido e contém um ID.
   * - Busca o usuário correspondente ao ID no banco.
   * - Gera um hash da nova senha usando bcrypt.
   * - Atualiza a senha no banco.
   *
   * @returns {Promise<void>} Retorna uma mensagem indicando o status da redefinição.
   * 
   * @throws
   * - 400: token ou senha ausentes / token inválido.
   * - 404: quando o usuário associado ao token não é encontrado.
   * - 500: erro interno do servidor.
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        res.status(400).json({ message: "Os campos 'token' e 'novaSenha' são obrigatórios" });
        return;
      }

      let decodedToken: any;
      try {
        decodedToken = jwt.verify(token, jwt_pass);
      } catch (err) {
        res.status(400).json({ message: 'Token inválido' });
        return;
      }

      if (!decodedToken || !decodedToken.id) {
        res.status(400).json({ message: 'Token inválido' });
        return;
      }

      const user = await userRepository.findById(decodedToken.id);
      if (!user) {
        res.status(404).json({ message: 'Usuário não encontrado' });
        return;
      }

      const hashNewPassword = await bcrypt.hash(novaSenha, 10);
      user.password = hashNewPassword;

      await userRepository.update(user.id, user);

      res.status(200).json({ message: 'Senha redefinida com sucesso' });

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
