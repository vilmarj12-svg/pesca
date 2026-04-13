CREATE TABLE `alertas_enviados` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pesqueiro_id` integer NOT NULL,
	`janela_inicio` text NOT NULL,
	`janela_fim` text NOT NULL,
	`score_medio` integer NOT NULL,
	`enviado_em` text DEFAULT (datetime('now')) NOT NULL,
	`canal` text DEFAULT 'telegram' NOT NULL,
	FOREIGN KEY (`pesqueiro_id`) REFERENCES `pesqueiros`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cache_navios` (
	`mmsi` integer PRIMARY KEY NOT NULL,
	`lat` real NOT NULL,
	`lon` real NOT NULL,
	`nome_navio` text,
	`primeiro_visto_em` text NOT NULL,
	`ultimo_visto_em` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `config` (
	`chave` text PRIMARY KEY NOT NULL,
	`valor` text NOT NULL,
	`atualizado_em` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `especies_temporada` (
	`especie` text PRIMARY KEY NOT NULL,
	`meses_ativos` text NOT NULL,
	`temp_agua_min` real NOT NULL,
	`temp_agua_max` real NOT NULL,
	`lua_preferida` text DEFAULT 'qualquer' NOT NULL,
	`tipos_pesqueiro` text NOT NULL,
	`profundidade_min_m` real,
	`profundidade_max_m` real,
	`iscas` text NOT NULL,
	`tecnica` text NOT NULL,
	`notas` text
);
--> statement-breakpoint
CREATE TABLE `iscas` (
	`nome` text PRIMARY KEY NOT NULL,
	`tipo` text NOT NULL,
	`especies_alvo` text NOT NULL,
	`condicoes_ideais` text,
	`disponibilidade` text
);
--> statement-breakpoint
CREATE TABLE `pesqueiros` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`nome` text NOT NULL,
	`lat` real NOT NULL,
	`lon` real NOT NULL,
	`tipo` text NOT NULL,
	`profundidade_m` real,
	`distancia_costa_mn` real,
	`especies_alvo` text NOT NULL,
	`notas` text,
	`pesos_override` text,
	`ativo` integer DEFAULT true NOT NULL,
	`criado_em` text DEFAULT (datetime('now')) NOT NULL,
	`atualizado_em` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pesqueiros_slug_unique` ON `pesqueiros` (`slug`);--> statement-breakpoint
CREATE TABLE `runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`iniciado_em` text DEFAULT (datetime('now')) NOT NULL,
	`terminado_em` text,
	`status` text NOT NULL,
	`fontes_consultadas` text,
	`erro` text
);
--> statement-breakpoint
CREATE TABLE `snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pesqueiro_id` integer NOT NULL,
	`timestamp` text NOT NULL,
	`score` integer NOT NULL,
	`classificacao` text NOT NULL,
	`breakdown` text NOT NULL,
	`condicoes` text NOT NULL,
	`fonte_run_id` integer NOT NULL,
	FOREIGN KEY (`pesqueiro_id`) REFERENCES `pesqueiros`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fonte_run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action
);
