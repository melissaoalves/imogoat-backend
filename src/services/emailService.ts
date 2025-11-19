import nodemailer from "nodemailer";
import "dotenv/config";

const email_pass = process.env.EMAIL_PASS as string;
const email_user = process.env.EMAIL_USER as string;

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email_user,
        pass: email_pass,
      },
    });
  }

  /**
   * Envia email de recuperação de senha com código de verificação.
   *
   * @param {string} email - Email do destinatário.
   * @param {string} username - Nome do usuário.
   * @param {string} resetCode - Código de recuperação de 6 dígitos.
   * @returns {Promise<void>} Retorna void em caso de sucesso ou lança erro.
   */
  async sendPasswordResetEmail(
    email: string,
    username: string,
    resetCode: string
  ): Promise<void> {
    const mailOptions = {
      from: email_user,
      to: email,
      subject: "Código de Recuperação de Senha - ImoGoat",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Recuperação de Senha</h2>
          <p>Olá, <strong>${username}</strong>!</p>
          <p>Você solicitou a recuperação da sua senha. Use o código abaixo para redefinir sua senha:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 4px;">${resetCode}</h1>
          </div>
          <p><strong>Este código expira em 30 minutos.</strong></p>
          <p>Se você não solicitou esta recuperação, ignore este email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">ImoGoat - Sistema de Gestão Imobiliária</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      throw new Error("Falha ao enviar email de recuperação");
    }
  }

  /**
   * Envia email de boas-vindas para novos usuários.
   *
   * @param {string} email - Email do destinatário.
   * @param {string} username - Nome do usuário.
   * @returns {Promise<void>} Retorna void em caso de sucesso ou lança erro.
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const mailOptions = {
      from: email_user,
      to: email,
      subject: "Bem-vindo ao ImoGoat! 🏠",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #007bff; text-align: center;">Bem-vindo ao ImoGoat! 🏠</h2>
          <p>Olá, <strong>${username}</strong>!</p>
          <p>Seja bem-vindo à nossa plataforma de gestão imobiliária!</p>
          <p>Agora você pode:</p>
          <ul>
            <li>Cadastrar e gerenciar seus imóveis</li>
            <li>Receber feedbacks de interessados</li>
            <li>Favoritar imóveis que te interessam</li>
            <li>E muito mais!</li>
          </ul>
          <p>Estamos felizes em tê-lo conosco!</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">ImoGoat - Sistema de Gestão Imobiliária</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erro ao enviar email de boas-vindas:", error);
    }
  }
}
