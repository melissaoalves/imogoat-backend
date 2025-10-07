import { PrismaClient, Image, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Classe responsável pelas operações de acesso a dados (CRUD)
 * da entidade {@link Image}, utilizando o Prisma ORM.
 *
 * @class ImageRepository
 * @example
 * const imageRepository = new ImageRepository();
 * const images = await imageRepository.findAll();
*/
export class ImageRepository {
  /**
   * Busca todas as imagens cadastradas no banco de dados.
   *
   * @async
   * @returns {Promise<Image[]>} Retorna uma lista com todas as imagens registradas.
   *
   * @example
   * const images = await imageRepository.findAll();
   */
  async findAll(): Promise<Image[]> {
    return prisma.image.findMany();
  }

  /**
   * Busca uma imagem específica com base no ID fornecido.
   *
   * @async
   * @param {number} id - Identificador único da imagem.
   * @returns {Promise<Image | null>} Retorna a imagem encontrada ou `null` se não existir.
   *
   * @example
   * const image = await imageRepository.findById(1);
   */
  async findById(id: number): Promise<Image | null> {
    return prisma.image.findUnique({
      where: { id },
    });
  }

  /**
   * Cria uma nova imagem no banco de dados.
   *
   * @async
   * @param {Prisma.ImageCreateInput} data - Dados necessários para criar uma nova imagem.
   * @returns {Promise<Image>} Retorna o objeto da imagem criada.
   *
   * @example
   * const newImage = await imageRepository.create({
   *   url: 'https://example.com/image.jpg',
   *   immobile: { connect: { id: 1 } }
   * });
   */
  async create(data: Prisma.ImageCreateInput): Promise<Image> {
    return prisma.image.create({
      data,
    });
  }

  /**
   * Atualiza os dados de uma imagem existente.
   *
   * @async
   * @param {number} id - ID da imagem a ser atualizada.
   * @param {Prisma.ImageUpdateInput} data - Campos e valores a serem atualizados.
   * @returns {Promise<Image | null>} Retorna a imagem atualizada.
   *
   * @example
   * const updatedImage = await imageRepository.update(2, { url: 'https://novaurl.com' });
   */
  async update(id: number, data: Prisma.ImageUpdateInput): Promise<Image | null> {
    return prisma.image.update({
      where: { id },
      data,
    });
  }

  /**
   * Exclui uma imagem com base em seu ID.
   *
   * @async
   * @param {number} id - Identificador único da imagem a ser removida.
   * @returns {Promise<void>} Não retorna valor.
   *
   * @example
   * await imageRepository.delete(3);
   */
  async delete(id: number): Promise<void> {
    await prisma.image.delete({
      where: { id },
    });
  }
}
