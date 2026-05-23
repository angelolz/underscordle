PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_challengeStats` (
	`date` text PRIMARY KEY NOT NULL,
	`totalGames` integer DEFAULT 0 NOT NULL,
	`totalPoints` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_challengeStats`("date", "totalGames", "totalPoints") SELECT "date", "totalGames", "totalPoints" FROM `challengeStats`;--> statement-breakpoint
DROP TABLE `challengeStats`;--> statement-breakpoint
ALTER TABLE `__new_challengeStats` RENAME TO `challengeStats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;