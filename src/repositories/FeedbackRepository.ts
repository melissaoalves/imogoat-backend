import { PrismaClient, Feedback, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class FeedbackRepository {
  async findAll(): Promise<Feedback[]> {
    return prisma.feedback.findMany();
  }

  async findById(id: number): Promise<Feedback | null> {
    return prisma.feedback.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.FeedbackCreateInput): Promise<Feedback> {
    return prisma.feedback.create({
      data
    });
  }

  async update(id: number, data: Prisma.FeedbackUpdateInput): Promise<Feedback | null> {
    return prisma.feedback.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.feedback.delete({
      where: { id }
    });
  }
}