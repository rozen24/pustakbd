-- AlterTable
ALTER TABLE "public"."HomepageSection" ADD COLUMN     "categoryId" UUID;

-- CreateIndex
CREATE INDEX "HomepageSection_categoryId_idx" ON "public"."HomepageSection"("categoryId");

-- AddForeignKey
ALTER TABLE "public"."HomepageSection" ADD CONSTRAINT "HomepageSection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
