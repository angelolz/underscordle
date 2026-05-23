import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const challengeStats = sqliteTable('challengeStats', {
    date: text('date').primaryKey().notNull(),
    totalGames: integer('totalGames').default(0).notNull(),
    totalPoints: integer('totalPoints').default(0).notNull(),
});
