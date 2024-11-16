-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETRACTED');

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "doi" TEXT,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "volume" TEXT,
    "issue" TEXT,
    "publicationYear" INTEGER,
    "publicationType" TEXT,
    "authors" TEXT[],
    "institutions" TEXT[],
    "publisherName" TEXT,
    "journalName" TEXT,
    "issn" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isOpenAccess" BOOLEAN NOT NULL DEFAULT false,
    "peerReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "citingArticleId" TEXT NOT NULL,
    "citedArticleId" TEXT,
    "citedSiteId" TEXT,
    "citedDoi" TEXT,
    "citedTitle" TEXT,
    "citedAuthors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "citedJournal" TEXT,
    "citedVolume" TEXT,
    "citedIssue" TEXT,
    "citedPages" TEXT,
    "citedYear" INTEGER,
    "citedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticleTopics" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ArticleToKeyword" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ArticleToFieldArea" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_doi_key" ON "Article"("doi");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FieldArea_name_key" ON "FieldArea"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_name_key" ON "Keyword"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleTopics_AB_unique" ON "_ArticleTopics"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleTopics_B_index" ON "_ArticleTopics"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleToKeyword_AB_unique" ON "_ArticleToKeyword"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleToKeyword_B_index" ON "_ArticleToKeyword"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleToFieldArea_AB_unique" ON "_ArticleToFieldArea"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleToFieldArea_B_index" ON "_ArticleToFieldArea"("B");

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_citingArticleId_fkey" FOREIGN KEY ("citingArticleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_citedArticleId_fkey" FOREIGN KEY ("citedArticleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleTopics" ADD CONSTRAINT "_ArticleTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleTopics" ADD CONSTRAINT "_ArticleTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToKeyword" ADD CONSTRAINT "_ArticleToKeyword_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToKeyword" ADD CONSTRAINT "_ArticleToKeyword_B_fkey" FOREIGN KEY ("B") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToFieldArea" ADD CONSTRAINT "_ArticleToFieldArea_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToFieldArea" ADD CONSTRAINT "_ArticleToFieldArea_B_fkey" FOREIGN KEY ("B") REFERENCES "FieldArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
