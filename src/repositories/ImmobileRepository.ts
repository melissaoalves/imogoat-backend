import { PrismaClient, Immobile, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Classe repositório para operações de banco de dados relacionadas a imóveis.
 * Fornece operações CRUD para a entidade Immobile usando Prisma ORM.
 */
export class ImmobileRepository {
  /**
   * Busca todos os imóveis do banco de dados.
   * Inclui informações do proprietário e feedbacks relacionados.
   * @returns {Promise<Immobile[]>} Uma promise que resolve para um array com todos os imóveis
   */
  async findAll(): Promise<Immobile[]> {
    return prisma.immobile.findMany({
      include: {
        owner: true,
        feedbacks: true,
        images: true,
      },
    });
  }

  /**
   * Busca um imóvel pelo seu ID.
   * Inclui informações do proprietário e feedbacks relacionados.
   * @param {number} id - O identificador único do imóvel
   * @returns {Promise<Immobile | null>} Uma promise que resolve para o objeto imóvel ou null se não encontrado
   */
  async findById(id: number): Promise<Immobile | null> {
    return prisma.immobile.findUnique({
      where: { id },
      include: {
        owner: true,
        feedbacks: true,
        images: true,
      },
    });
  }

  /**
   * Cria um novo imóvel no banco de dados.
   * Conecta automaticamente o imóvel ao seu proprietário através do ID.
   * @param {Prisma.ImmobileCreateInput} data - Os dados do imóvel a ser criado
   * @returns {Promise<Immobile>} Uma promise que resolve para o objeto do imóvel criado
   */
  async create(data: Prisma.ImmobileCreateInput): Promise<Immobile> {
    return prisma.immobile.create({
      data: {
        ...data,
        owner: {
          connect: { id: data.owner.connect?.id },
        },
      },
    });
  }

  /**
   * Atualiza um imóvel existente no banco de dados.
   * @param {number} id - O identificador único do imóvel a ser atualizado
   * @param {Prisma.ImmobileUpdateInput} data - Os dados atualizados do imóvel
   * @returns {Promise<Immobile | null>} Uma promise que resolve para o objeto do imóvel atualizado ou null se não encontrado
   */
  async update(
    id: number,
    data: Prisma.ImmobileUpdateInput
  ): Promise<Immobile | null> {
    return prisma.immobile.update({
      where: { id },
      data,
    });
  }

  /**
   * Remove um imóvel do banco de dados.
   * @param {number} id - O identificador único do imóvel a ser removido
   * @returns {Promise<void>} Uma promise que resolve quando o imóvel é removido com sucesso
   * @throws {Error} Lança um erro se o imóvel não for encontrado ou não puder ser removido
   */
  async delete(id: number): Promise<void> {
    await prisma.immobile.delete({
      where: { id },
    });
  }
}
