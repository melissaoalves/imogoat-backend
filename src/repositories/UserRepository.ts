import { PrismaClient, User, Prisma } from "@prisma/client";

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
      where: { id },
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
      where: { email },
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
        role: data.role,
      },
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
      data,
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
      where: { id },
    });
  }

  /**
   * Armazena o código de recuperação de senha e sua data de expiração para um usuário.
   *
   * @param {string} email - Email do usuário.
   * @param {string} resetCode - Código de recuperação de 6 dígitos.
   * @param {Date} expiresAt - Data de expiração do código.
   * @returns {Promise<User | null>} Usuário atualizado ou null se não existir.
   */
  async setPasswordResetCode(
    email: string,
    resetCode: string,
    expiresAt: Date
  ): Promise<User | null> {
    return prisma.user.update({
      where: { email },
      data: {
        resetPasswordCode: resetCode,
        resetPasswordCodeExpiresAt: expiresAt,
      },
    });
  }

  /**
   * Busca um usuário pelo código de recuperação de senha.
   *
   * @param {string} resetCode - Código de recuperação.
   * @returns {Promise<User | null>} Usuário encontrado ou null se não existir.
   */
  async findByResetCode(resetCode: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        resetPasswordCode: resetCode,
        resetPasswordCodeExpiresAt: {
          gte: new Date(),
        },
      },
    });
  }

  /**
   * Atualiza a senha do usuário e remove o código de recuperação.
   *
   * @param {number} id - ID do usuário.
   * @param {string} newPassword - Nova senha já criptografada.
   * @returns {Promise<User | null>} Usuário atualizado ou null se não existir.
   */
  async updatePasswordAndClearResetCode(
    id: number,
    newPassword: string
  ): Promise<User | null> {
    return prisma.user.update({
      where: { id },
      data: {
        password: newPassword,
        resetPasswordCode: null,
        resetPasswordCodeExpiresAt: null,
      },
    });
  }
}
