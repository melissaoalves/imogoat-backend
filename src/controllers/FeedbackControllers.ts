import { Request, Response } from "express";

import { PrismaClient } from "@prisma/client";

import { FeedbackRepository } from "../repositories/FeedbackRepository";

const prisma = new PrismaClient();

const feedbackRepository = new FeedbackRepository();

/**
 * Controller responsável por gerenciar as operações relacionadas a feedbacks.
 * Fornece endpoints para buscar, criar, atualizar e deletar feedbacks de imóveis.
 */
export class FeedbackController {
  /**
   * Busca todos os feedbacks cadastrados no sistema.
   * Inclui informações do usuário e imóvel relacionados.
   * @param {Request} req - Objeto de requisição do Express
   * @param {Response} res - Objeto de resposta do Express
   * @returns {Promise<void>} Retorna um JSON com todos os feedbacks ou erro 500 em caso de falha
   */
  async getAllFeedbacks(req: Request, res: Response): Promise<void> {
    try {
      const feedbacks = await feedbackRepository.findAll();
      res.json(feedbacks);
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * Busca um feedback específico pelo seu ID.
   * Inclui informações do usuário e imóvel relacionados.
   * @param {Request} req - Objeto de requisição do Express contendo o ID nos parâmetros
   * @param {Response} res - Objeto de resposta do Express
   * @returns {Promise<void>} Retorna um JSON com o feedback encontrado, erro 404 se não encontrado ou erro 500 em caso de falha
   */
  async getFeedbackById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const feedback = await feedbackRepository.findById(Number(id));
      if (feedback) {
        res.json(feedback);
      } else {
        res.status(404).json({ message: "Feedback não encontrado" });
      }
    } catch (error) {
      console.error("Erro ao buscar feedback:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * Cria um novo feedback para um imóvel específico.
   * Verifica as permissões do usuário, valida os dados e cria o feedback no banco.
   * Apenas usuários com role 'user' podem criar feedbacks.
   * @param {Request} req - Objeto de requisição contendo rating, comment, userId e immobileId no body
   * @param {Response} res - Objeto de resposta do Express
   * @returns {Promise<void>} Retorna status 201 com sucesso, 400 para dados inválidos, 403 para acesso negado ou 500 em caso de erro
   */
  async createFeedback(req: Request, res: Response): Promise<void> {
    const { rating, comment, userId, immobileId } = req.body;

    if (!rating || !comment || !userId || !immobileId) {
      res.status(400).json({
        message:
          "Os campos 'ratting', 'comment', 'userId' e 'immobileId' são obrigatórios! ",
      });
      return;
    }

    if (req.user.role !== "user") {
      res
        .status(403)
        .json({ message: "Você não tem permissão para criar feedbacks" });
      return;
    }
    const userP = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userP || userP.role !== "user") {
      res.status(400).json({ message: "Usuário inválido" });
      return;
    }
    try {
      const feedback = await feedbackRepository.create({
        rating,
        comment,
        user: { connect: { id: userId } },
        immobile: { connect: { id: immobileId } },
      });
      res.status(201).json({ message: "Feedback criado com sucesso!" });
    } catch (error) {
      console.error("Erro ao criar feedback:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * Atualiza um feedback existente no sistema.
   * Verifica se o feedback existe e se o usuário tem permissão para atualizá-lo.
   * Apenas o autor do feedback pode fazer alterações.
   * @param {Request} req - Objeto de requisição contendo o ID nos parâmetros e dados atualizados no body
   * @param {Response} res - Objeto de resposta do Express
   * @returns {Promise<void>} Retorna status 200 com sucesso, 404 se não encontrado, 403 para acesso negado ou 500 em caso de erro
   */
  async updateFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const feedback = await feedbackRepository.findById(Number(id));

      if (!feedback) {
        res.status(404).json({ message: "Feedback não encontrado" });
        return;
      }

      if (req.user.id !== feedback?.userId) {
        res
          .status(403)
          .json({
            message: "Você não tem permissão para atualizar esse feedback",
          });
        return;
      }
      await feedbackRepository.update(Number(id), { rating, comment });
      res.status(200).json({ message: "Feedback atualizado com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar feedback:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * Remove um feedback do sistema.
   * Verifica se o feedback existe e se o usuário tem permissão para deletá-lo.
   * Apenas o autor do feedback pode removê-lo.
   * @param {Request} req - Objeto de requisição contendo o ID do feedback nos parâmetros
   * @param {Response} res - Objeto de resposta do Express
   * @returns {Promise<void>} Retorna status 200 com sucesso, 404 se não encontrado, 403 para acesso negado ou 500 em caso de erro
   */
  async deleteFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const feedback = await feedbackRepository.findById(Number(id));

      if (!feedback) {
        res.status(404).json({ message: "Feedback não encontrado" });
        return;
      }

      if (req.user.id !== feedback?.userId) {
        res
          .status(403)
          .json({
            message: "Você não tem permissão para deletar esse feedback",
          });
        return;
      }
      await feedbackRepository.delete(Number(id));
      res.status(200).json({ message: "Feedback delatado com sucesso!" });
    } catch (error) {
      console.error("Erro ao deletar feedback:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
