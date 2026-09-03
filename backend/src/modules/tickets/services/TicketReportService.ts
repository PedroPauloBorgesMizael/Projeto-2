import PDFDocument from "pdfkit";
import { TicketRepository } from "../repositories/TicketRepository";
import { Response } from "express";

export class TicketReportService {
  private repository = TicketRepository.getInstance();

  async execute(response: Response, userId: string, role: string) {
    const tickets = await this.repository.findMany({
        userId,
        role: role as any,
        skip: 0,
        take: 1000, // Apenas um limit seguro
        filters: {},
        sort: { field: "createdAt", order: "desc" }
    });

    const doc = new PDFDocument({ margin: 50 });
    
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader(
      "Content-Disposition",
      'attachment; filename="tickets-report.pdf"'
    );
    
    doc.pipe(response);

    // Header
    doc.fontSize(20).text("Relatorio de Chamados", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text("Total de chamados encontrados: " + tickets.total);
    doc.moveDown();

    // Line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Tickets
    for (const ticket of tickets.tickets) {
      doc.fontSize(14).text("ID: " + ticket.id, { continued: true });
      doc.fontSize(10).text("  (Criado em: " + ticket.createdAt.toLocaleDateString() + ")", { align: "right" });
      
      doc.fontSize(12).text("Titulo: " + ticket.title);
      doc.text("Status: " + ticket.status);
      doc.text("Prioridade: " + ticket.priority);
      
      if ((ticket as any).slaBreached) {
        doc.fillColor("red").text("SLA VIOLADO").fillColor("black");
      }

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
    }

    doc.end();
  }
}
