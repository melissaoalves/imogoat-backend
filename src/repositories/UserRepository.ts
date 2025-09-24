import { PrismaClient, User, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
  /**
   * Retorna todos os usuários cadastrados no banco.
   *
   * @returns {Promise<User[]>} Lista de usuários.
   */
  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  /**
   * Busca um usuário pelo ID.
   *
   * @param {number} id - ID do usuário.
   * @returns {Promise<User | null>} Usuário encontrado ou null se não existir.
   */
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  /**
   * Busca um usuário pelo email.
   *
   * @param {string} email - Email do usuário.
   * @returns {Promise<User | null>} Usuário encontrado ou null se não existir.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Cria um novo usuário no banco.
   *
   * @param {Prisma.UserCreateInput} data - Dados do usuário (username, email, password, phoneNumber, role).
   * @returns {Promise<User>} Usuário criado.
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        role: data.role
      }
    });
  }

  /**
   * Atualiza os dados de um usuário existente.
   *
   * @param {number} id - ID do usuário a ser atualizado.
   * @param {Prisma.UserUpdateInput} data - Campos a serem atualizados.
   * @returns {Promise<User | null>} Usuário atualizado ou erro se não existir.
   */
  async update(id: number, data: Prisma.UserUpdateInput): Promise<User | null> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  /**
   * Deleta um usuário pelo ID.
   *
   * @param {number} id - ID do usuário.
   * @returns {Promise<void>} Sem retorno em caso de sucesso.
   */
  async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id }
    });
  }
}
