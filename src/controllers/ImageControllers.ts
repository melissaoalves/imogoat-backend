import { Request, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { ImageRepository } from '../repositories/ImageRepository';

const prisma = new PrismaClient();
const imagemRepository = new ImageRepository();

interface UploadedFile extends Express.Multer.File {
  firebaseUrl?: string;
}

export class ImageController {
  async getAllImages(req: Request, res: Response): Promise<void> {
    try {
      const images = await imagemRepository.findAll();
      res.json(images);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async getImageById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const images = await imagemRepository.findById(Number(id));

      if (images) {
        res.json(images);
      } else {
        res.status(404).json({ message: 'Imagem não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }

  }

  async createImage(req: Request, res: Response): Promise<void> {
    const { immobileId } = req.body;
    const files = (req.files && Array.isArray(req.files)) ? req.files as UploadedFile[] : [];

    if (files.length === 0 || !immobileId) {
      res.status(400).json({
        message: "Os arquivos de imagem e o campo 'immobileId' são obrigatórios."
      });
      return;
    }

    const imageUrls = files
      .map(file => file.firebaseUrl)
      .filter((url): url is string => typeof url === 'string' && url.trim() !== '');

    if (imageUrls.length === 0) {
      res.status(400).json({ message: "Nenhuma URL válida fornecida para as imagens." });
      return;
    }

    const immobileIdNumber = parseInt(immobileId, 10);
    if (isNaN(immobileIdNumber)) {
      res.status(400).json({ message: "ID do imóvel inválido" });
      return;
    }

    if (!req.user || req.user.role === 'user') {
      res.status(403).json({ message: 'Você não tem permissão para criar imagens' });
      return;
    }

    try {
      const images = await Promise.all(
        imageUrls.map(async (url, index) => {
          try {
            return await prisma.image.create({
              data: {
                url,
                immobileId: immobileIdNumber
              }
            });
          } catch (error) {
            console.error(`Erro ao criar imagem ${index + 1}: ${url}`, error);
            throw error;
          }
        })
      );
      res.status(201).json({ message: 'Imagens criadas com sucesso!', images });
    } catch (error) {
      console.error('Erro ao criar imagens:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }



}