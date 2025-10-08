import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ImmobileRepository } from "../repositories/ImmobileRepository";

const immobileRepository = new ImmobileRepository();
const prisma = new PrismaClient();

/**
 * Controller responsável por gerenciar as operações relacionadas a imóveis.
 * Fornece endpoints para buscar, criar, atualizar e deletar imóveis no sistema.
 */
export class ImmobileController {
  /**
   * Busca todos os imóveis cadastrados no sistema.
   * Inclui informações do proprietário e feedbacks relacionados.
   * @param {Request} req - Objeto de requisição do Express
   * @param {Response} res - Objeto de resposta do Express
   * @returns {Promise<void>} Retorna um JSON com todos os imóveis ou erro 500 em caso de falha
   */
  async getAllImmobiles(req: Request, res: Response): Promise<void> {
    try {
      const immobiles = await immobileRepository.findAll();
      res.json(immobiles);
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * Busca um imóvel específico pelo seu ID.
   * Inclui informações do proprietário e feedbacks relacionados.
   * @param {Request} req - Objeto de requisição do Express contendo o ID nos parâmetros
   * @param {Response} res - Objeto de resposta do Express
   * @returns {Promise<void>} Retorna um JSON com o imóvel encontrado, erro 404 se não encontrado ou erro 500 em caso de falha
   */
  async getImmobileById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const immobile = await immobileRepository.findById(Number(id));
      if (immobile) {
        res.json(immobile);
      } else {
        res.status(404).json({ message: "Imóvel não encontrado" });
      }
    } catch (error) {
      console.error("Erro ao buscar imóvel:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * Cria um novo imóvel no sistema.
   * Verifica as permissões do usuário antes de permitir a criação.
   * Apenas usuários com role diferente de 'user' podem criar imóveis.
   * @param {Request} req - Objeto de requisição contendo os dados do imóvel no body
   * @param {Response} res - Objeto de resposta do Express
   * @returns {Promise<void>} Retorna status 200 com sucesso, 403 para acesso negado ou 500 em caso de erro
   */
  async createImmobile(req: Request, res: Response): Promise<void> {
    const {
      name,
      number,
      type,
      location,
      neighborhood,
      city,
      reference,
      value,
      numberOfBedrooms,
      numberOfBathrooms,
      garagem,
      description,
      ownerId,
    } = req.body;

    if (req.user.role == "user") {
      res
        .status(403)
        .json({ message: "Você não tem permissão para criar imóveis" });
      return;
    }

    try {
      const immobile = await prisma.immobile.create({
        data: {
          name,
          number: Number(number),
          type,
          location,
          neighborhood,
          city,
          reference,
          value: Number(value),
          numberOfBedrooms: Number(numberOfBedrooms),
          numberOfBathrooms: Number(numberOfBathrooms),
          garage: Boolean(garagem),
          description,
          owner: {
            connect: { id: Number(ownerId) },
          },
        },
      });
      res.status(200).json({ message: "Imóvel criado com sucesso! " });
    } catch (error) {
      console.error("Erro ao criar imóvel:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * Atualiza um imóvel existente no sistema.
   * Verifica se o imóvel existe e se o usuário tem permissão para atualizá-lo.
   * Apenas o proprietário do imóvel pode fazer alterações.
   * @param {Request} req - Objeto de requisição contendo o ID nos parâmetros e dados atualizados no body
   * @param {Response} res - Objeto de resposta do Express
   * @returns {Promise<void>} Retorna status 200 com sucesso, 404 se não encontrado, 403 para acesso negado ou 500 em caso de erro
   */
  async updateImmobile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        name,
        number,
        type,
        location,
        neighborhood,
        city,
        reference,
        value,
        numberOfBedrooms,
        numberOfBathrooms,
        garagem,
        description,
      } = req.body;

      const immobile = await immobileRepository.findById(Number(id));

      if (!immobile) {
        res.status(404).json({ message: "Imóvel não encontrado" });
        return;
      }

      if (req.user.id !== immobile.ownerId) {
        res
          .status(403)
          .json({
            message: "Você não tem permissão para atualizar este imóvel",
          });
        return;
      }

      const updatedImmobile = await prisma.immobile.update({
        where: { id: Number(id) },
        data: {
          name,
          number: Number(number),
          type,
          location,
          neighborhood,
          city,
          reference,
          value: Number(value),
          numberOfBedrooms: Number(numberOfBedrooms),
          numberOfBathrooms: Number(numberOfBathrooms),
          garage: Boolean(garagem),
          description,
        },
      });

      res.status(200).json({ message: "Imóvel atualizado com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar imóvel:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * Remove um imóvel do sistema.
   * Verifica se o imóvel existe e se o usuário tem permissão para deletá-lo.
   * Apenas o proprietário do imóvel ou administradores podem deletar.
   * @param {Request} req - Objeto de requisição contendo o ID do imóvel nos parâmetros
   * @param {Response} res - Objeto de resposta do Express
   * @returns {Promise<void>} Retorna status 200 com sucesso, 404 se não encontrado, 403 para acesso negado ou 500 em caso de erro
   */
  async deleteImmobile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const immobile = await immobileRepository.findById(Number(id));

      if (!immobile) {
        res.status(404).json({ message: "Imóvel não encontrado" });
        return;
      }

      if (req.user.id !== immobile.ownerId && req.user.role !== "admin") {
        res
          .status(403)
          .json({ message: "Você não tem permissão para deletar este imóvel" });
        return;
      }

      await immobileRepository.delete(Number(id));
      res.status(200).json({ message: "Imóvel deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar imóvel:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
