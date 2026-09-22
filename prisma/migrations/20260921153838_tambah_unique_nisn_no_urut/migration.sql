/*
  Warnings:

  - A unique constraint covering the columns `[nisn]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[noUrut]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `users_nisn_key` ON `users`(`nisn`);

-- CreateIndex
CREATE UNIQUE INDEX `users_noUrut_key` ON `users`(`noUrut`);
