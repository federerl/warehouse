/**
 * Seed script: imports the curated inventory from `inventory.xlsx` into Postgres.
 *
 * Only the 13 named category tabs are imported. The synthetic "Sheet1" tab
 * (~15.5k rows of placeholder data) is intentionally skipped. Override the set
 * of imported sheets with the SEED_SHEETS env var (comma-separated tab names).
 *
 * Run with:  npm run seed   (or `npx prisma db seed`)
 */
import "dotenv/config";
import path from "node:path";
import ExcelJS from "exceljs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { resolveDirectDatabaseUrl } from "../lib/pg-url";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: resolveDirectDatabaseUrl() }),
});

// Source spreadsheet tabs that hold real curated parts (Sheet1 excluded).
const DEFAULT_SHEETS = [
  "Screws",
  "Electrical Connectors",
  "Camloc",
  "Fittings",
  "Bolts",
  "Southco",
  "Dzus",
  "Washers",
  "Nuts",
  "Rivets",
  "Rubber Grommets",
  "Tinnerman",
  "Pins",
];

const CATEGORY_SHEETS = process.env.SEED_SHEETS
  ? process.env.SEED_SHEETS.split(",").map((s) => s.trim())
  : DEFAULT_SHEETS;

// Column order is identical across all 13 tabs (0-based).
const COL = {
  location: 0,
  partNumber: 1,
  otherPartNumber: 2,
  otherPartNumber2: 3,
  selection1: 4,
  type: 5,
  series: 6,
  pcPrice: 7,
  packQuantity: 8,
  packPrice: 9,
  quantity: 10,
  warnQuantity: 11,
  indPic: 12,
  description: 13,
} as const;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Read a cell as a trimmed string, or null when empty. Handles exceljs value shapes. */
function cell(row: ExcelJS.Row, idx: number): string | null {
  const v = row.getCell(idx + 1).value; // exceljs is 1-based
  if (v == null) return null;
  let s: string;
  if (typeof v === "object") {
    const o = v as unknown as Record<string, unknown>;
    if (Array.isArray(o.richText)) {
      s = (o.richText as { text?: string }[]).map((r) => r.text ?? "").join("");
    } else if (o.text != null) {
      s = String(o.text); // hyperlink cell
    } else if (o.result != null) {
      s = String(o.result); // formula cell
    } else if (o.error != null) {
      return null;
    } else {
      s = String(v);
    }
  } else {
    s = String(v);
  }
  const t = s.trim();
  return t === "" ? null : t;
}

/** Parse a money-ish string to Decimal, or null. */
function toDecimal(s: string | null): Prisma.Decimal | null {
  if (s == null) return null;
  const cleaned = s.replace(/[$,\s]/g, "");
  if (cleaned === "" || Number.isNaN(Number(cleaned))) return null;
  return new Prisma.Decimal(cleaned);
}

/** Parse an integer only when the whole value is integral ("25" -> 25, "1/8 LB" -> null). */
function toInt(s: string | null): number | null {
  if (s == null) return null;
  const cleaned = s.replace(/[,\s]/g, "");
  if (!/^-?\d+$/.test(cleaned)) return null;
  const n = Number.parseInt(cleaned, 10);
  return Number.isNaN(n) ? null : n;
}

const truthyFlag = (s: string | null) =>
  !!s && /^(x|required|yes|true|1)$/i.test(s.trim());

async function main() {
  const file = path.join(process.cwd(), "inventory.xlsx");
  console.log(`Reading ${file}`);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);

  // 1) Upsert the 13 categories (sortOrder follows the spreadsheet tab order).
  for (let i = 0; i < CATEGORY_SHEETS.length; i++) {
    const name = CATEGORY_SHEETS[i];
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name, sortOrder: i },
      create: { name, slug: slugify(name), sortOrder: i },
    });
  }
  const categoriesBySlug = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c]),
  );

  // 2) Full, idempotent reseed of products.
  await prisma.product.deleteMany({});

  let grandTotal = 0;
  for (const sheetName of CATEGORY_SHEETS) {
    const ws = wb.getWorksheet(sheetName);
    if (!ws) {
      console.warn(`  ! sheet not found: "${sheetName}" — skipping`);
      continue;
    }
    const slug = slugify(sheetName);
    const category = categoriesBySlug[slug];

    const rows: Prisma.ProductCreateManyInput[] = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // header
      const partNumber = cell(row, COL.partNumber);
      if (!partNumber) return; // skip empty/spacer rows

      const rawPackQty = cell(row, COL.packQuantity);
      rows.push({
        sourceSheet: sheetName,
        location: cell(row, COL.location),
        partNumber,
        otherPartNumber: cell(row, COL.otherPartNumber),
        otherPartNumber2: cell(row, COL.otherPartNumber2),
        categoryId: category.id,
        categorySlug: slug,
        selection1: cell(row, COL.selection1) ?? sheetName,
        type: cell(row, COL.type),
        series: cell(row, COL.series),
        pcPrice: toDecimal(cell(row, COL.pcPrice)),
        packQuantity: rawPackQty,
        packQuantityNum: toInt(rawPackQty),
        packPrice: toDecimal(cell(row, COL.packPrice)),
        quantity: toInt(cell(row, COL.quantity)),
        warnQuantity: toInt(cell(row, COL.warnQuantity)),
        hasImage: truthyFlag(cell(row, COL.indPic)),
        description: cell(row, COL.description),
      });
    });

    if (rows.length) {
      await prisma.product.createMany({ data: rows });
      grandTotal += rows.length;
      console.log(`  + ${String(rows.length).padStart(4)} parts  ${sheetName}`);
    }
  }

  const categoryCount = await prisma.category.count();
  console.log(`\nDone. ${categoryCount} categories, ${grandTotal} products imported.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
