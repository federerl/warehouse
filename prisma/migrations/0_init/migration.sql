-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sourceSheet" TEXT NOT NULL,
    "location" TEXT,
    "partNumber" TEXT NOT NULL,
    "otherPartNumber" TEXT,
    "otherPartNumber2" TEXT,
    "categoryId" INTEGER NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "selection1" TEXT NOT NULL,
    "type" TEXT,
    "series" TEXT,
    "pcPrice" DECIMAL(10,4),
    "packQuantity" TEXT,
    "packQuantityNum" INTEGER,
    "packPrice" DECIMAL(10,4),
    "quantity" INTEGER,
    "warnQuantity" INTEGER,
    "hasImage" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE INDEX "Product_categorySlug_idx" ON "Product"("categorySlug");

-- CreateIndex
CREATE INDEX "Product_categorySlug_type_idx" ON "Product"("categorySlug", "type");

-- CreateIndex
CREATE INDEX "Product_categorySlug_type_series_idx" ON "Product"("categorySlug", "type", "series");

-- CreateIndex
CREATE INDEX "Product_partNumber_idx" ON "Product"("partNumber");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

