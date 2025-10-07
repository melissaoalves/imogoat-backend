import { Favorite, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FavoriteRepository {
  /**
   * @method addFavorite
   * @description Cria um novo registro de favorito no banco de dados.
   * @param {number} userId - O ID do usuário que está favoritando.
   * @param {number} immobileId - O ID do imóvel que está sendo favoritado.
   * @returns {Promise<void>}
   * @async
   */
  async addFavorite(userId: number, immobileId: number): Promise<void> {
    await prisma.favorite.create({
      data: {
        userId,
        immobileId,
      },
    });
  }
/**
   * @method getFavorites
   * @description Busca todos os favoritos de um usuário, incluindo os dados completos do Imóvel e suas Imagens relacionadas.
   * @param {number} userId - O ID do usuário cujos favoritos devem ser buscados.
   * @returns {Promise<any[]>} Uma lista de objetos de favorito, com os dados do imóvel e das imagens.
   * @async
   */

  async getFavorites(userId: number): Promise<any[]> {
    return await prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        immobile: {
          include: {
            images: true,
          },
        },
      },
    });
  }

/**
   * @method delete
   * @description Remove um registro de favorito baseado no ID do registro (não no userId/immobileId).
   * Nota: Usa deleteMany com where: { id } para ser mais seguro, garantindo que apenas 0 ou 1 registro seja apagado.
   * @param {number} id - O ID primário do registro de favorito a ser deletado.
   * @returns {Promise<void>}
   * @async
   */
  async delete(id: number): Promise<void> {
    await prisma.favorite.deleteMany({
      where: { id },
    });
  }

/**
   * @method findById
   * @description Busca um registro de favorito pelo seu ID primário.
   * @param {number} id - O ID do registro de favorito.
   * @returns {Promise<Favorite | null>} O objeto favorito ou null se não for encontrado.
   * @async
   */
  async findById(id: number): Promise<Favorite | null> {
    return prisma.favorite.findUnique({
      where: { id }
    });
  }
}
