"use client";

import type { Event, Ticket } from "@/types/domain";
import { formatCurrency, formatEventDate } from "@/lib/utils";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "eventchimp-ticket";

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const createTicketCanvas = async (ticket: Ticket, event?: Event) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 760;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#fff8f2");
  gradient.addColorStop(0.5, "#ffffff");
  gradient.addColorStop(1, "#f3ecff");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#1f1730";
  context.fillRect(52, 52, canvas.width - 104, canvas.height - 104);
  context.fillStyle = "#ffffff";
  context.fillRect(78, 78, canvas.width - 156, canvas.height - 156);

  context.fillStyle = "#ff5a1f";
  context.beginPath();
  context.roundRect(98, 98, 190, 54, 27);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "700 25px Arial";
  context.fillText("EventChimp", 122, 133);

  context.fillStyle = "#1f1730";
  context.font = "700 54px Arial";
  context.fillText(event?.title ?? "Event ticket", 98, 242, 680);

  context.fillStyle = "#6f687a";
  context.font = "400 28px Arial";
  context.fillText(event?.startDate ? formatEventDate(event.startDate) : "Event date", 98, 306, 680);
  context.fillText(event?.location ?? "Event venue", 98, 352, 680);

  context.fillStyle = "#f7f4fa";
  context.beginPath();
  context.roundRect(98, 410, 640, 176, 28);
  context.fill();

  context.fillStyle = "#6f687a";
  context.font = "700 22px Arial";
  context.fillText("ATTENDEE", 130, 462);
  context.fillText("TICKET TYPE", 130, 538);

  context.fillStyle = "#1f1730";
  context.font = "700 31px Arial";
  context.fillText(`${ticket.attendeeFirstName ?? ""} ${ticket.attendeeLastName ?? ""}`.trim() || "Guest", 130, 499, 560);
  context.fillText(ticket.ticketTypeName ?? "General admission", 130, 575, 560);

  context.fillStyle = "#ffefe7";
  context.beginPath();
  context.roundRect(798, 134, 302, 410, 34);
  context.fill();

  if (ticket.qrCode) {
    const qrImage = await loadImage(ticket.qrCode);
    context.drawImage(qrImage, 836, 172, 226, 226);
  }

  context.fillStyle = "#1f1730";
  context.font = "700 25px Arial";
  context.textAlign = "center";
  context.fillText(ticket.ticketCode ?? ticket.orderReference ?? ticket.paymentReference, 949, 445, 250);
  context.fillStyle = "#6f687a";
  context.font = "400 21px Arial";
  context.fillText(ticket.totalPaid ? formatCurrency(ticket.totalPaid) : "Free", 949, 487);
  context.textAlign = "left";

  context.fillStyle = "#6f687a";
  context.font = "400 20px Arial";
  context.fillText("Bring this ticket with you. Each QR code admits one guest only.", 98, 650, 880);

  return canvas;
};

export const downloadTicketPng = async (ticket: Ticket, event?: Event) => {
  const canvas = await createTicketCanvas(ticket, event);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Could not export ticket image."))), "image/png");
  });
  downloadBlob(blob, `${sanitizeFileName(ticket.ticketCode ?? ticket.paymentReference)}.png`);
};

const escapePdfText = (value: string) => value.replace(/[\\()]/g, "\\$&");

const buildPdfBlob = (ticket: Ticket, event: Event | undefined, imageDataUrl: string) => {
  const imageBinary = atob(imageDataUrl.split(",")[1] ?? "");
  const width = 612;
  const height = 792;
  const imageWidth = 540;
  const imageHeight = 342;
  const left = 36;
  const top = height - 72 - imageHeight;
  const title = escapePdfText(`${event?.title ?? "EventChimp ticket"} - ${ticket.ticketCode ?? ticket.paymentReference}`);
  const contentStream = `BT /F1 14 Tf 36 740 Td (${title}) Tj ET\nq ${imageWidth} 0 0 ${imageHeight} ${left} ${top} cm /Im1 Do Q`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im1 4 0 R >> /Font << /F1 5 0 R >> >> /Contents 6 0 R >>`,
    `<< /Type /XObject /Subtype /Image /Width 1200 /Height 760 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBinary.length} >>\nstream\n${imageBinary}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const bytes = new Uint8Array(pdf.length);
  for (let index = 0; index < pdf.length; index += 1) {
    bytes[index] = pdf.charCodeAt(index) & 0xff;
  }
  return new Blob([bytes], { type: "application/pdf" });
};

export const downloadTicketPdf = async (ticket: Ticket, event?: Event) => {
  const canvas = await createTicketCanvas(ticket, event);
  const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const blob = buildPdfBlob(ticket, event, imageDataUrl);
  downloadBlob(blob, `${sanitizeFileName(ticket.ticketCode ?? ticket.paymentReference)}.pdf`);
};
