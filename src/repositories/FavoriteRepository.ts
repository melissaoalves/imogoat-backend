import { Favorite, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FavoriteRepository {
  async addFavorite(userId: number, immobileId: number): Promise<void> {
    await prisma.favorite.create({
      data: {
        userId,
        immobileId,
      },
    });
  }

  async getFavorites(userId: number): Promise<any[]> {
    return await prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        immobile: {
          include: {
            images: true, // Inclui as imagens relacionadas ao imóvel
          },
        },
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.favorite.deleteMany({
      where: { id },
    });
  }

  async findById(id: number): Promise<Favorite | null> {
    return prisma.favorite.findUnique({
      where: { id }
    });
  }
}
