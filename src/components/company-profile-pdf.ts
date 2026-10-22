import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { Shop } from "./demo-data";
import { OM_LOGO_PATH } from "./om-logo-data";

// All dimensions are PDF points, measured from the owner's supplied PDF.
export async function createCompanyProfilePdf(shop: Shop) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = 595.276, height = 841.89, left = 55, right = 540;
  let page = pdf.addPage([width, height]);
  page.drawSvgPath(OM_LOGO_PATH, { x: right - 50, y: height - 28, scale: 50 / 256, color: rgb(184 / 255, 91 / 255, 20 / 255) });
  let pageNumber = 1;
  const text = (value: string, x: number, y: number, size = 10.5, font = regular) => {
    page.drawText(value, { x, y, size, font, color: rgb(0, 0, 0) });
  };
  const rule = (y: number, thickness: number) => page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness, color: rgb(0, 0, 0) });
  const wrap = (value: string, maxWidth: number, font: PDFFont = regular, size = 10.5) => {
    const lines: string[] = [];
    for (const paragraph of value.split(/\r?\n/)) {
      let line = "";
      for (const word of paragraph.trim().split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) { lines.push(line); line = word; }
        else line = candidate;
      }
      lines.push(line);
    }
    return lines;
  };
  const footer = () => {
    rule(110, 0.5);
    text(shop.name, left, 90, 8);
    text(String(pageNumber), 531, 90, 8);
  };
  const ensureSpace = (y: number, needed: number) => {
    if (y - needed >= 135) return y;
    footer(); page = pdf.addPage([width, height]); pageNumber += 1;
    return 788;
  };
  const heading = (value: string, y: number) => text(value, left, y, 13, bold);
  // The reference uses unkerned Helvetica advances for the inline labels.
  const labelWidth = (value: string) => [...value].reduce((sum, char) => sum + bold.widthOfTextAtSize(char, 10.5), 0);
  // Keep the same two heading lines as the reference when a comma is present.
  const comma = shop.name.indexOf(",");
  const title = comma >= 0 ? [shop.name.slice(0, comma + 1), ...wrap(shop.name.slice(comma + 1).trim(), right - left, bold, 24)] : wrap(shop.name, right - left, bold, 24);
  title.forEach((line, i) => text(line, left, 788 - i * 30, 24, bold));
  let y = 788 - (title.length - 1) * 30 - 28;
  text("Company profile", left, y, 11); rule(y - 18, 0.8);
  y -= 49;
  heading("About", y); y -= 23;
  const about = wrap(shop.about, right - left);
  about.forEach(line => { y = ensureSpace(y, 16); text(line, left, y); y -= 16; });
  y -= 35;
  heading("What we offer", y); y -= 23;
  const inline = (label: string, value: string, baseline: number) => {
    text(label, left, baseline, 10.5, bold);
    text(value, left + labelWidth(label), baseline);
  };
  inline("Fertilisers: ", "Crop nutrition inputs", y); y -= 20;
  inline("Pesticides: ", "Crop protection inputs", y); y -= 20;
  inline("Seeds: ", "Agricultural seeds", y); y -= 40;
  y = ensureSpace(y, 180); heading("Business details", y); y -= 25;
  const field = (label: string, value: string, maxWidth?: number) => {
    const valueX = left + labelWidth(label);
    const lines = wrap(value, maxWidth ?? right - valueX);
    y = ensureSpace(y, lines.length * 16 + 6);
    text(label, left, y, 10.5, bold);
    lines.forEach((line, i) => text(line, i && label === "Address: " ? 102 : valueX, y - i * 16));
    y -= 22 + (lines.length - 1) * 16;
  };
  field("Business name: ", shop.name);
  // The narrow address measure reproduces the reference's break after “Mdl,”.
  field("Address: ", shop.address, 238);
  field("GSTIN: ", shop.gstin);
  if (shop.pan) field("PAN No.: ", shop.pan);
  if (shop.licence) field("PL No.: ", shop.licence);
  field("Phone: ", shop.phone);
  y -= 24; y = ensureSpace(y, 135); heading("Bank details", y); y -= 25;
  if (shop.bank.isSample !== false) { text("Sample bank details - not for payment.", left, y); y -= 22; }
  field("Account number: ", shop.bank.account);
  field("Account name: ", shop.bank.holder);
  field("Bank name: ", shop.bank.name);
  if (shop.bank.branch) field("Branch: ", shop.bank.branch);
  field("IFSC: ", shop.bank.ifsc);
  footer();
  pdf.setTitle("Omsai Company Profile");
  return pdf.save();
}
