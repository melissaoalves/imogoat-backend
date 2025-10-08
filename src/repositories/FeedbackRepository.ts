import { PrismaClient, Feedback, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Classe repositório para operações de banco de dados relacionadas a feedbacks.
 * Fornece operações CRUD para a entidade Feedback usando Prisma ORM.
 */
export class FeedbackRepository {
  /**
   * Busca todos os feedbacks do banco de dados.
   * @returns {Promise<Feedback[]>} Uma promise que resolve para um array com todos os feedbacks
   */
  async findAll(): Promise<Feedback[]> {
    return prisma.feedback.findMany();
  }

  /**
   * Busca um feedback pelo seu ID.
   * @param {number} id - O identificador único do feedback
   * @returns {Promise<Feedback | null>} Uma promise que resolve para o objeto feedback ou null se não encontrado
   */
  async findById(id: number): Promise<Feedback | null> {
    return prisma.feedback.findUnique({
      where: { id },
    });
  }

  /**
   * Cria um novo feedback no banco de dados.
   * @param {Prisma.FeedbackCreateInput} data - Os dados do feedback a ser criado
   * @returns {Promise<Feedback>} Uma promise que resolve para o objeto do feedback criado
   */
  async create(data: Prisma.FeedbackCreateInput): Promise<Feedback> {
    return prisma.feedback.create({
      data,
    });
  }

  /**
   * Atualiza um feedback existente no banco de dados.
   * @param {number} id - O identificador único do feedback a ser atualizado
   * @param {Prisma.FeedbackUpdateInput} data - Os dados atualizados do feedback
   * @returns {Promise<Feedback | null>} Uma promise que resolve para o objeto do feedback atualizado ou null se não encontrado
   */
  async update(
    id: number,
    data: Prisma.FeedbackUpdateInput
  ): Promise<Feedback | null> {
    return prisma.feedback.update({
      where: { id },
      data,
    });
  }

  /**
   * Remove um feedback do banco de dados.
   * @param {number} id - O identificador único do feedback a ser removido
   * @returns {Promise<void>} Uma promise que resolve quando o feedback é removido com sucesso
   * @throws {Error} Lança um erro se o feedback não for encontrado ou não puder ser removido
   */
  async delete(id: number): Promise<void> {
    await prisma.feedback.delete({
      where: { id },
    });
  }
}
