import { Request, Response } from 'express';
import { FavoriteRepository } from '../repositories/FavoriteRepository';
import prisma from '../../prisma/prismaClient';

const favoriteRepository = new FavoriteRepository();

export class FavoriteController {
  /**
   * @method addFavorite
   * @description Adiciona um imóvel à lista de favoritos de um usuário.
   * Verifica se o imóvel e o usuário são válidos e se o imóvel já está favoritado.
   *
   * @param {Request} req - O objeto de requisição do Express. Espera userId e immobileId no corpo.
   * @param {Response} res - O objeto de resposta do Express.
   * @returns {Promise<void>} Retorna status 200 (Sucesso), 400 (Bad Request), 409 (Conflito) ou 500 (Erro Interno).
   * @async
   */
  async addFavorite(req: Request, res: Response): Promise<void> {
    const { userId, immobileId } = req.body;
  
    if (!userId || !immobileId) {
      res.status(400).json({ message: "Os campos 'userId' e 'immobileId' são obrigatórios!" });
      return;
    }
  
    const userP = await prisma.user.findUnique({
      where: { id: userId }
    });
  
    const immobile = await prisma.immobile.findUnique({
      where: { id: immobileId }
    });
  
    if (!immobile) {
      res.status(400).json({ message: 'Imóvel inválido' });
      return;
    }
  
    try {
      const verificaFavorite = await prisma.favorite.findUnique({
        where: {
          userId_immobileId: {
            userId,
            immobileId,
          },
        },
      });
  
      if (verificaFavorite) {
        res.status(409).json({ message: 'Imóvel já foi favoritado' });
        return;
      }
  
      await favoriteRepository.addFavorite(userId, immobileId);
      res.status(200).json({ message: 'Imóvel favoritado com sucesso' });
    } catch (error) {
      console.error('Erro ao favoritar imóvel:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  } 
/**
   * @method deleteFavorite
   * @description Remove um favorito específico usando o ID do registro de Favorito.
   * Implementa a verificação de permissão: apenas o dono do favorito pode deletá-lo.
   *
   * @param {Request} req - O objeto de requisição do Express. Espera o ID do favorito em req.params.
   * @param {Response} res - O objeto de resposta do Express.
   * @returns {Promise<void>} Retorna status 200 (Sucesso), 404 (Não Encontrado), 403 (Proibido) ou 500 (Erro Interno).
   * @async
   */
  async deleteFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const favorite = await favoriteRepository.findById(Number(id));

      if (!favorite) {
        res.status(404).json({ message: 'Favorito não encontrado'});
        return;
      }

      if (req.user.id !== favorite?.userId) {
        res.status(403).json({ message: 'Você não tem permissão para deletar esse feedback' });
        return;
      }
      await favoriteRepository.delete(Number(id));
      res.status(200).json({ message: 'Favorito delatado com sucesso!'});
    } catch (error) {
      console.error('Erro ao deletar favorito:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

 
  async getFavorites(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const favorites = await favoriteRepository.getFavorites(Number(userId));

      if (!favorites || favorites.length === 0) {
        res.status(404).json({ message: 'Nenhum favorito encontrado' });
        return;
      }

      res.status(200).json(favorites);
    } catch (error) {
      console.error('Erro ao buscar imóveis favoritados:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}
