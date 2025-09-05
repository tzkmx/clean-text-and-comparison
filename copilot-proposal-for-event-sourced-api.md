\# Esqueleto de proyecto Nest.js con event sourcing



A continuación tienes un esqueleto listo para clonar, basado en Nest.js + CQRS + Event Sourcing, con artefactos .md en cada etapa, prompts parametrizables y adaptadores de proveedores LLM intercambiables.



---



\## Estructura y arranque



```

llm-pipeline/

├─ apps/

│  └─ api/

│     ├─ src/

│     │  ├─ main.ts

│     │  ├─ app.module.ts

│     │  ├─ modules/

│     │  │  ├─ ingest/

│     │  │  │  ├─ ingest.controller.ts

│     │  │  │  ├─ ingest.saga.ts

│     │  │  │  └─ ingest.module.ts

│     │  │  ├─ compare/

│     │  │  │  ├─ compare.controller.ts

│     │  │  │  ├─ compare.saga.ts

│     │  │  │  └─ compare.module.ts

│     │  │  ├─ consolidate/

│     │  │  │  ├─ consolidate.controller.ts

│     │  │  │  ├─ consolidate.saga.ts

│     │  │  │  └─ consolidate.module.ts

│     │  │  ├─ audit/

│     │  │  │  ├─ audit.controller.ts

│     │  │  │  └─ audit.module.ts

│     │  │  ├─ providers/

│     │  │  │  ├─ llm.provider.ts

│     │  │  │  ├─ gpt.adapter.ts

│     │  │  │  ├─ gemini.adapter.ts

│     │  │  │  ├─ claude.adapter.ts

│     │  │  │  ├─ mistral.adapter.ts

│     │  │  │  └─ providers.module.ts

│     │  │  ├─ storage/

│     │  │  │  ├─ storage.service.ts

│     │  │  │  └─ storage.module.ts

│     │  │  └─ eventstore/

│     │  │     ├─ eventstore.service.ts

│     │  │     ├─ projections.service.ts

│     │  │     └─ eventstore.module.ts

│     │  └─ config/

│     │     └─ config.module.ts

│     └─ tsconfig.json

├─ packages/

│  ├─ domain/

│  │  ├─ dto.ts

│  │  ├─ events.ts

│  │  ├─ aggregate.ts

│  │  └─ utils.ts

│  └─ prompts/

│     ├─ limpieza\_ocr.md

│     ├─ comparacion\_rapida.md

│     └─ comparacion\_detallada.md

├─ infra/

│  ├─ docker-compose.yml

│  └─ migrations/ (opcional)

├─ .env.example

├─ package.json

└─ README.md

```



\- \*\*Tecnologías:\*\* Nest.js, @nestjs/cqrs, PostgreSQL (event store), archivos .md como artefactos, adaptadores de proveedores.

\- \*\*Instalación rápida:\*\*

&nbsp; - \*\*Variables:\*\* copia .env.example a .env y ajusta credenciales.

&nbsp; - \*\*Servicios:\*\* `docker compose -f infra/docker-compose.yml up -d`

&nbsp; - \*\*API:\*\* `npm i \&\& npm run start:dev`



---



\## Dependencias y configuración



\*\*package.json\*\*

```json

{

&nbsp; "name": "llm-pipeline",

&nbsp; "private": true,

&nbsp; "workspaces": \["apps/\*", "packages/\*"],

&nbsp; "scripts": {

&nbsp;   "start:dev": "nest start --watch -p apps/api",

&nbsp;   "build": "nest build -p apps/api",

&nbsp;   "lint": "eslint .",

&nbsp;   "format": "prettier --write .",

&nbsp;   "db:up": "docker compose -f infra/docker-compose.yml up -d",

&nbsp;   "db:down": "docker compose -f infra/docker-compose.yml down"

&nbsp; },

&nbsp; "devDependencies": {

&nbsp;   "@nestjs/cli": "^10.0.0",

&nbsp;   "typescript": "^5.4.0",

&nbsp;   "prettier": "^3.0.0",

&nbsp;   "eslint": "^8.0.0"

&nbsp; },

&nbsp; "dependencies": {

&nbsp;   "@nestjs/common": "^10.0.0",

&nbsp;   "@nestjs/core": "^10.0.0",

&nbsp;   "@nestjs/cqrs": "^10.2.6",

&nbsp;   "@nestjs/platform-express": "^10.0.0",

&nbsp;   "class-validator": "^0.14.0",

&nbsp;   "class-transformer": "^0.5.1",

&nbsp;   "pg": "^8.11.3",

&nbsp;   "typeorm": "^0.3.19",

&nbsp;   "dotenv": "^16.4.0",

&nbsp;   "uuid": "^9.0.1",

&nbsp;   "dayjs": "^1.11.11"

&nbsp; }

}

```



\*\*infra/docker-compose.yml\*\*

```yaml

version: '3.8'

services:

&nbsp; postgres:

&nbsp;   image: postgres:15

&nbsp;   environment:

&nbsp;     POSTGRES\_USER: pipeline

&nbsp;     POSTGRES\_PASSWORD: pipeline

&nbsp;     POSTGRES\_DB: eventstore

&nbsp;   ports: \[ "5432:5432" ]

&nbsp;   volumes:

&nbsp;     - pgdata:/var/lib/postgresql/data

volumes:

&nbsp; pgdata: {}

```



\*\*apps/api/src/main.ts\*\*

```ts

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';



async function bootstrap() {

&nbsp; const app = await NestFactory.create(AppModule, { cors: true });

&nbsp; await app.listen(process.env.PORT || 3000);

}

bootstrap();

```



\*\*apps/api/src/app.module.ts\*\*

```ts

import { Module } from '@nestjs/common';

import { CqrsModule } from '@nestjs/cqrs';

import { EventStoreModule } from './modules/eventstore/eventstore.module';

import { StorageModule } from './modules/storage/storage.module';

import { ProvidersModule } from './modules/providers/providers.module';

import { IngestModule } from './modules/ingest/ingest.module';

import { CompareModule } from './modules/compare/compare.module';

import { ConsolidateModule } from './modules/consolidate/consolidate.module';

import { AuditModule } from './modules/audit/audit.module';



@Module({

&nbsp; imports: \[

&nbsp;   CqrsModule,

&nbsp;   EventStoreModule,

&nbsp;   StorageModule,

&nbsp;   ProvidersModule,

&nbsp;   IngestModule,

&nbsp;   CompareModule,

&nbsp;   ConsolidateModule,

&nbsp;   AuditModule

&nbsp; ],

})

export class AppModule {}

```



---



\## Dominio: DTOs, eventos y aggregate



\*\*packages/domain/dto.ts\*\*

```ts

export interface IngestRequestDto {

&nbsp; sourceId: string;

&nbsp; ocrText: string;

&nbsp; referenceText?: string;

&nbsp; metadata?: Record<string, any>;

}



export interface CompareRequestDto {

&nbsp; aggregateId: string;

&nbsp; mode: 'quick' | 'detailed';

&nbsp; provider: 'gpt' | 'gemini' | 'claude' | 'mistral' | 'cohere';

&nbsp; referenceText?: string;

}



export interface ConsolidateRequestDto {

&nbsp; aggregateId: string;

}

```



\*\*packages/domain/events.ts\*\*

```ts

export interface BaseEvent<T = any> {

&nbsp; type: string;

&nbsp; aggregateId: string;

&nbsp; occurredAt: string;

&nbsp; payload: T;

}



export const now = () => new Date().toISOString();



export const E = {

&nbsp; TextIngested: 'TextIngested',

&nbsp; OcrCleanRequested: 'OcrCleanRequested',

&nbsp; OcrCleanCompleted: 'OcrCleanCompleted',

&nbsp; ComparisonRequested: 'ComparisonRequested',

&nbsp; ComparisonCompleted: 'ComparisonCompleted',

&nbsp; ConsolidationRequested: 'ConsolidationRequested',

&nbsp; ConsolidationCompleted: 'ConsolidationCompleted',

} as const;

```



\*\*packages/domain/aggregate.ts\*\*

```ts

import { BaseEvent, E } from './events';



export type ComparisonEntry = { provider: string; mode: 'quick'|'detailed'; verdict: string; artifactPath?: string };



export class DocumentPipelineAggregate {

&nbsp; constructor(public readonly id: string) {}

&nbsp; ocrHash: string | null = null;

&nbsp; cleanedTextPath: string | null = null;

&nbsp; comparisons: ComparisonEntry\[] = \[];



&nbsp; apply(event: BaseEvent) {

&nbsp;   switch (event.type) {

&nbsp;     case E.TextIngested:

&nbsp;       this.ocrHash = event.payload.hash;

&nbsp;       break;

&nbsp;     case E.OcrCleanCompleted:

&nbsp;       this.cleanedTextPath = event.payload.artifactPath;

&nbsp;       break;

&nbsp;     case E.ComparisonCompleted:

&nbsp;       this.comparisons.push({

&nbsp;         provider: event.payload.provider,

&nbsp;         mode: event.payload.mode,

&nbsp;         verdict: event.payload.verdict,

&nbsp;         artifactPath: event.payload.tablePath

&nbsp;       });

&nbsp;       break;

&nbsp;   }

&nbsp; }



&nbsp; canRunDetailed(): boolean {

&nbsp;   return this.comparisons.some(c => c.mode === 'quick' \&\& c.verdict !== 'Coinciden sustancialmente');

&nbsp; }

}

```



\*\*packages/domain/utils.ts\*\*

```ts

import crypto from 'crypto';

export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');



export const parseVerdict = (s: string) => {

&nbsp; const m = s.match(/Coinciden sustancialmente|No coinciden sustancialmente/i);

&nbsp; return m ? (m\[0]\[0].toUpperCase() + m\[0].slice(1)) : 'No concluyente';

};



export const majorityVerdict = (arr: Array<{ verdict: string }>) => {

&nbsp; const counts = arr.reduce((a, x) => ({ ...a, \[x.verdict]: (a\[x.verdict] || 0) + 1 }), {} as Record<string, number>);

&nbsp; return Object.entries(counts).sort((a,b)=>b\[1]-a\[1])\[0]?.\[0] ?? 'No concluyente';

};

```



---



\## Infra: event store, storage y prompts



\*\*apps/api/src/modules/eventstore/eventstore.service.ts\*\*

```ts

import { Injectable } from '@nestjs/common';

import { BaseEvent } from '../../../../packages/domain/events';

import { Pool } from 'pg';



@Injectable()

export class EventStoreService {

&nbsp; private pool = new Pool({

&nbsp;   connectionString: process.env.DATABASE\_URL || 'postgres://pipeline:pipeline@localhost:5432/eventstore',

&nbsp; });



&nbsp; async append(event: BaseEvent) {

&nbsp;   const client = await this.pool.connect();

&nbsp;   try {

&nbsp;     await client.query(

&nbsp;       `INSERT INTO events(aggregate\_id, type, occurred\_at, payload) VALUES ($1,$2,$3,$4)`,

&nbsp;       \[event.aggregateId, event.type, event.occurredAt, JSON.stringify(event.payload)]

&nbsp;     );

&nbsp;   } finally {

&nbsp;     client.release();

&nbsp;   }

&nbsp; }



&nbsp; async load(aggregateId: string): Promise<BaseEvent\[]> {

&nbsp;   const { rows } = await this.pool.query(

&nbsp;     `SELECT type, aggregate\_id, occurred\_at, payload FROM events WHERE aggregate\_id=$1 ORDER BY occurred\_at ASC`,

&nbsp;     \[aggregateId]

&nbsp;   );

&nbsp;   return rows.map(r => ({ type: r.type, aggregateId: r.aggregate\_id, occurredAt: r.occurred\_at, payload: r.payload }));

&nbsp; }

}

```



\*\*apps/api/src/modules/eventstore/projections.service.ts\*\*

```ts

import { Injectable } from '@nestjs/common';

import { EventStoreService } from './eventstore.service';

import { DocumentPipelineAggregate } from '../../../../packages/domain/aggregate';



@Injectable()

export class ProjectionsService {

&nbsp; constructor(private readonly store: EventStoreService) {}



&nbsp; async getSnapshot(aggregateId: string) {

&nbsp;   const events = await this.store.load(aggregateId);

&nbsp;   const agg = new DocumentPipelineAggregate(aggregateId);

&nbsp;   events.forEach(e => agg.apply(e));

&nbsp;   return {

&nbsp;     aggregateId,

&nbsp;     ocrHash: agg.ocrHash,

&nbsp;     cleanedTextPath: agg.cleanedTextPath,

&nbsp;     comparisons: agg.comparisons

&nbsp;   };

&nbsp; }

}

```



\*\*apps/api/src/modules/storage/storage.service.ts\*\*

```ts

import { Injectable, Inject } from '@nestjs/common';

import { promises as fs } from 'fs';

import { join } from 'path';



@Injectable()

export class StorageService {

&nbsp; constructor(@Inject('ARTIFACTS\_ROOT') private root: string = 'artifacts') {}



&nbsp; private dir(aggId: string) { return join(this.root, aggId); }



&nbsp; async writeMarkdown(aggId: string, name: string, content: string) {

&nbsp;   await fs.mkdir(this.dir(aggId), { recursive: true });

&nbsp;   const p = join(this.dir(aggId), name);

&nbsp;   await fs.writeFile(p, content, 'utf8');

&nbsp;   return p;

&nbsp; }



&nbsp; async readText(aggId: string, name: string) {

&nbsp;   const p = join(this.dir(aggId), name);

&nbsp;   return fs.readFile(p, 'utf8');

&nbsp; }



&nbsp; async writeReference(aggId: string, content: string) {

&nbsp;   return this.writeMarkdown(aggId, 'reference.md', content);

&nbsp; }



&nbsp; async readReference(aggId: string) {

&nbsp;   try { return this.readText(aggId, 'reference.md'); }

&nbsp;   catch { return null; }

&nbsp; }

}

```



\*\*apps/api/src/modules/storage/storage.module.ts\*\*

```ts

import { Module } from '@nestjs/common';

import { StorageService } from './storage.service';



@Module({

&nbsp; providers: \[

&nbsp;   StorageService,

&nbsp;   { provide: 'ARTIFACTS\_ROOT', useValue: process.env.ARTIFACTS\_ROOT || 'artifacts' }

&nbsp; ],

&nbsp; exports: \[StorageService],

})

export class StorageModule {}

```



\*\*packages/prompts/limpieza\_ocr.md\*\*

```

Recibirás un texto extraído mediante OCR que puede contener errores de reconocimiento...

1\. Corrige ortografía y gramática evidentes.

2\. Elimina encabezados repetitivos, números de página y elementos ajenos.

3\. Unifica párrafos que pertenezcan a la misma idea.

4\. Elimina saltos de línea innecesarios.

5\. Corrige espaciado y puntuación.

6\. Mantén significado y tono original.

7\. Preserva listas, títulos y estructura lógica.

Devuelve únicamente el texto limpio, sin comentarios.



TEXTO OCR:

{{texto\_ocr}}

```



\*\*packages/prompts/comparacion\_rapida.md\*\*

```

Compara estos dos textos y responde solo con:

\- Coinciden sustancialmente

\- No coinciden sustancialmente

Si no coinciden, lista brevemente las 3 diferencias más relevantes.



TEXTO A:

{{texto\_a}}



TEXTO B:

{{texto\_b}}

```



\*\*packages/prompts/comparacion\_detallada.md\*\*

```

Analiza y compara Texto A (limpio) con Texto B (referencia).

Clasifica diferencias en:

1\) Tipográficos/formato

2\) Abreviaturas sin cambio de sentido

3\) Omisiones/adiciones

4\) Cambios sustanciales

Devuelve tabla: Categoría | Descripción | Texto en A | Texto en B

Cierra con veredicto: “Coinciden sustancialmente” o “No coinciden sustancialmente”.



TEXTO A:

{{texto\_a}}



TEXTO B:

{{texto\_b}}

```



---



\## Aplicación: módulos, sagas y adaptadores



\*\*apps/api/src/modules/providers/llm.provider.ts\*\*

```ts

export interface LlmProvider {

&nbsp; name(): string;

&nbsp; complete(prompt: string, opts?: { temperature?: number; maxTokens?: number }): Promise<string>;

}



export class LlmRegistry {

&nbsp; constructor(private readonly providers: LlmProvider\[]) {}

&nbsp; pick(name?: string) {

&nbsp;   if (!name) return this.providers\[0];

&nbsp;   const p = this.providers.find(p => p.name() === name);

&nbsp;   if (!p) throw new Error(`Provider not found: ${name}`);

&nbsp;   return p;

&nbsp; }

&nbsp; pickLight() { return this.providers\[0]; }

}

```



\*\*apps/api/src/modules/providers/gpt.adapter.ts\*\*

```ts

import { Injectable } from '@nestjs/common';

import { LlmProvider } from './llm.provider';



@Injectable()

export class GptAdapter implements LlmProvider {

&nbsp; name() { return 'gpt'; }

&nbsp; async complete(prompt: string) {

&nbsp;   // TODO: integrar SDK del proveedor

&nbsp;   return `MOCK\_GPT\_RESPONSE\\n${prompt.slice(0, 2000)}`;

&nbsp; }

}

```



\*\*apps/api/src/modules/providers/gemini.adapter.ts\*\*

```ts

import { Injectable } from '@nestjs/common';

import { LlmProvider } from './llm.provider';

@Injectable()

export class GeminiAdapter implements LlmProvider {

&nbsp; name() { return 'gemini'; }

&nbsp; async complete(prompt: string) { return `MOCK\_GEMINI\_RESPONSE\\n${prompt.slice(0, 2000)}`; }

}

```



\*\*apps/api/src/modules/providers/claude.adapter.ts\*\*

```ts

import { Injectable } from '@nestjs/common';

import { LlmProvider } from './llm.provider';

@Injectable()

export class ClaudeAdapter implements LlmProvider {

&nbsp; name() { return 'claude'; }

&nbsp; async complete(prompt: string) { return `MOCK\_CLAUDE\_RESPONSE\\n${prompt.slice(0, 2000)}`; }

}

```



\*\*apps/api/src/modules/providers/mistral.adapter.ts\*\*

```ts

import { Injectable } from '@nestjs/common';

import { LlmProvider } from './llm.provider';

@Injectable()

export class MistralAdapter implements LlmProvider {

&nbsp; name() { return 'mistral'; }

&nbsp; async complete(prompt: string) { return `MOCK\_MISTRAL\_RESPONSE\\n${prompt.slice(0, 2000)}`; }

}

```



\*\*apps/api/src/modules/providers/providers.module.ts\*\*

```ts

import { Module } from '@nestjs/common';

import { GptAdapter } from './gpt.adapter';

import { GeminiAdapter } from './gemini.adapter';

import { ClaudeAdapter } from './claude.adapter';

import { MistralAdapter } from './mistral.adapter';

import { LlmRegistry } from './llm.provider';



@Module({

&nbsp; providers: \[

&nbsp;   GptAdapter, GeminiAdapter, ClaudeAdapter, MistralAdapter,

&nbsp;   {

&nbsp;     provide: LlmRegistry,

&nbsp;     useFactory: (gpt: GptAdapter, gemini: GeminiAdapter, claude: ClaudeAdapter, mistral: MistralAdapter) =>

&nbsp;       new LlmRegistry(\[mistral, gpt, claude, gemini]) // primero = light por defecto

&nbsp;     , inject: \[GptAdapter, GeminiAdapter, ClaudeAdapter, MistralAdapter]

&nbsp;   }

&nbsp; ],

&nbsp; exports: \[LlmRegistry],

})

export class ProvidersModule {}

```



\*\*apps/api/src/modules/ingest/ingest.controller.ts\*\*

```ts

import { Body, Controller, Post } from '@nestjs/common';

import { EventStoreService } from '../eventstore/eventstore.service';

import { E, now } from '../../../../packages/domain/events';

import { sha256 } from '../../../../packages/domain/utils';

import { StorageService } from '../storage/storage.service';

import { v4 as uuid } from 'uuid';



@Controller('ingest')

export class IngestController {

&nbsp; constructor(private readonly store: EventStoreService, private readonly storage: StorageService) {}



&nbsp; @Post()

&nbsp; async ingest(@Body() body: { sourceId: string; ocrText: string; referenceText?: string }) {

&nbsp;   const aggregateId = uuid();

&nbsp;   const ocrHash = sha256(body.ocrText);

&nbsp;   await this.storage.writeMarkdown(aggregateId, 'ocr\_raw.md', body.ocrText);

&nbsp;   if (body.referenceText) await this.storage.writeReference(aggregateId, body.referenceText);

&nbsp;   await this.store.append({ type: E.TextIngested, aggregateId, occurredAt: now(), payload: { hash: ocrHash, sourceId: body.sourceId }});

&nbsp;   await this.store.append({ type: E.OcrCleanRequested, aggregateId, occurredAt: now(), payload: { model: 'light' }});

&nbsp;   return { aggregateId };

&nbsp; }

}

```



\*\*apps/api/src/modules/ingest/ingest.saga.ts\*\*

```ts

import { Injectable } from '@nestjs/common';

import { EventStoreService } from '../eventstore/eventstore.service';

import { StorageService } from '../storage/storage.service';

import { LlmRegistry } from '../providers/llm.provider';

import { E, now } from '../../../../packages/domain/events';

import { promises as fs } from 'fs';

import { join } from 'path';



@Injectable()

export class IngestSaga {

&nbsp; constructor(private store: EventStoreService, private storage: StorageService, private llms: LlmRegistry) {

&nbsp;   this.poll();

&nbsp; }



&nbsp; private async poll() {

&nbsp;   // Simplificado: en producción usaría un bus/suscripción; aquí se simula sondeo periódico

&nbsp;   setInterval(() => this.tick().catch(() => {}), 1000);

&nbsp; }



&nbsp; private async tick() {

&nbsp;   // Consulta eventos OcrCleanRequested no procesados (simplificado: omitir filtro)

&nbsp; }



&nbsp; async handleOcrCleanRequested(aggregateId: string) {

&nbsp;   const prompt = await fs.readFile(join(process.cwd(), 'packages/prompts/limpieza\_ocr.md'), 'utf8');

&nbsp;   const ocrRaw = await this.storage.readText(aggregateId, 'ocr\_raw.md');

&nbsp;   const finalPrompt = prompt.replace('{{texto\_ocr}}', ocrRaw);

&nbsp;   const provider = this.llms.pickLight();

&nbsp;   const cleaned = await provider.complete(finalPrompt);

&nbsp;   const path = await this.storage.writeMarkdown(aggregateId, 'cleaned.md', cleaned);

&nbsp;   await this.store.append({ type: E.OcrCleanCompleted, aggregateId, occurredAt: now(), payload: { artifactPath: path, textHash: 'TBD' }});

&nbsp; }

}

```



\*\*apps/api/src/modules/ingest/ingest.module.ts\*\*

```ts

import { Module } from '@nestjs/common';

import { IngestController } from './ingest.controller';

import { EventStoreModule } from '../eventstore/eventstore.module';

import { StorageModule } from '../storage/storage.module';

import { ProvidersModule } from '../providers/providers.module';

import { IngestSaga } from './ingest.saga';



@Module({

&nbsp; imports: \[EventStoreModule, StorageModule, ProvidersModule],

&nbsp; controllers: \[IngestController],

&nbsp; providers: \[IngestSaga],

})

export class IngestModule {}

```



\*\*apps/api/src/modules/compare/compare.controller.ts\*\*

```ts

import { Body, Controller, Post } from '@nestjs/common';

import { EventStoreService } from '../eventstore/eventstore.service';

import { E, now } from '../../../../packages/domain/events';



@Controller('compare')

export class CompareController {

&nbsp; constructor(private readonly store: EventStoreService) {}

&nbsp; @Post()

&nbsp; async request(@Body() body: { aggregateId: string; mode: 'quick'|'detailed'; provider: string; referenceText?: string }) {

&nbsp;   await this.store.append({ type: E.ComparisonRequested, aggregateId: body.aggregateId, occurredAt: now(),

&nbsp;     payload: { mode: body.mode, provider: body.provider, referenceText: body.referenceText }});

&nbsp;   return { ok: true };

&nbsp; }

}

```



\*\*apps/api/src/modules/compare/compare.saga.ts\*\*

```ts

import { Injectable } from '@nestjs/common';

import { EventStoreService } from '../eventstore/eventstore.service';

import { StorageService } from '../storage/storage.service';

import { LlmRegistry } from '../providers/llm.provider';

import { E, now } from '../../../../packages/domain/events';

import { parseVerdict } from '../../../../packages/domain/utils';

import { readFile } from 'fs/promises';

import { join } from 'path';



@Injectable()

export class CompareSaga {

&nbsp; constructor(private store: EventStoreService, private storage: StorageService, private llms: LlmRegistry) {

&nbsp;   this.poll();

&nbsp; }



&nbsp; private async poll() { setInterval(() => this.tick().catch(() => {}), 1000); }

&nbsp; private async tick() { /\* idem: capturar ComparisonRequested \*/ }



&nbsp; async handleComparisonRequested(aggregateId: string, mode: 'quick'|'detailed', providerName: string, refOverride?: string) {

&nbsp;   const cleaned = await this.storage.readText(aggregateId, 'cleaned.md');

&nbsp;   const ref = refOverride ?? await this.storage.readReference(aggregateId);

&nbsp;   const promptFile = mode === 'quick' ? 'comparacion\_rapida.md' : 'comparacion\_detallada.md';

&nbsp;   const promptTpl = await readFile(join(process.cwd(), 'packages/prompts', promptFile), 'utf8');

&nbsp;   const prompt = promptTpl.replace('{{texto\_a}}', cleaned).replace('{{texto\_b}}', ref || '');

&nbsp;   const provider = this.llms.pick(providerName);

&nbsp;   const result = await provider.complete(prompt);

&nbsp;   const verdict = parseVerdict(result);

&nbsp;   let tablePath: string | undefined;

&nbsp;   if (mode === 'detailed') {

&nbsp;     tablePath = await this.storage.writeMarkdown(aggregateId, `comparison\_${provider.name()}.md`, result);

&nbsp;   }

&nbsp;   await this.store.append({ type: E.ComparisonCompleted, aggregateId, occurredAt: now(),

&nbsp;     payload: { provider: provider.name(), mode, verdict, tablePath }});

&nbsp; }

}

```



\*\*apps/api/src/modules/compare/compare.module.ts\*\*

```ts

import { Module } from '@nestjs/common';

import { CompareController } from './compare.controller';

import { EventStoreModule } from '../eventstore/eventstore.module';

import { StorageModule } from '../storage/storage.module';

import { ProvidersModule } from '../providers/providers.module';

import { CompareSaga } from './compare.saga';



@Module({

&nbsp; imports: \[EventStoreModule, StorageModule, ProvidersModule],

&nbsp; controllers: \[CompareController],

&nbsp; providers: \[CompareSaga],

})

export class CompareModule {}

```



\*\*apps/api/src/modules/consolidate/consolidate.controller.ts\*\*

```ts

import { Body, Controller, Post } from '@nestjs/common';

import { EventStoreService } from '../eventstore/eventstore.service';

import { E, now } from '../../../../packages/domain/events';



@Controller('consolidate')

export class ConsolidateController {

&nbsp; constructor(private readonly store: EventStoreService) {}

&nbsp; @Post()

&nbsp; async req(@Body() body: { aggregateId: string }) {

&nbsp;   await this.store.append({ type: E.ConsolidationRequested, aggregateId: body.aggregateId, occurredAt: now(), payload: {} });

&nbsp;   return { ok: true };

&nbsp; }

}

```



\*\*apps/api/src/modules/consolidate/consolidate.saga.ts\*\*

```ts

import { Injectable } from '@nestjs/common';

import { EventStoreService } from '../eventstore/eventstore.service';

import { ProjectionsService } from '../eventstore/projections.service';

import { StorageService } from '../storage/storage.service';

import { E, now } from '../../../../packages/domain/events';

import { majorityVerdict } from '../../../../packages/domain/utils';



@Injectable()

export class ConsolidateSaga {

&nbsp; constructor(private store: EventStoreService, private proj: ProjectionsService, private storage: StorageService) {

&nbsp;   this.poll();

&nbsp; }



&nbsp; private async poll() { setInterval(() => this.tick().catch(() => {}), 1000); }

&nbsp; private async tick() { /\* idem: capturar ConsolidationRequested \*/ }



&nbsp; async handleConsolidationRequested(aggregateId: string) {

&nbsp;   const snap = await this.proj.getSnapshot(aggregateId);

&nbsp;   const consensus = majorityVerdict(snap.comparisons);

&nbsp;   const md =

`# Informe final



\*\*Aggregate:\*\* ${aggregateId}

\*\*Consensus:\*\* ${consensus}



\## Comparaciones

${snap.comparisons.map(c => `- \*\*Proveedor:\*\* ${c.provider} — \*\*Modo:\*\* ${c.mode} — \*\*Veredicto:\*\* ${c.verdict}`).join('\\n')}

`;

&nbsp;   const path = await this.storage.writeMarkdown(aggregateId, 'final\_report.md', md);

&nbsp;   await this.store.append({ type: E.ConsolidationCompleted, aggregateId, occurredAt: now(), payload: { finalReportPath: path, summary: { consensus } }});

&nbsp; }

}

```



\*\*apps/api/src/modules/consolidate/consolidate.module.ts\*\*

```ts

import { Module } from '@nestjs/common';

import { ConsolidateController } from './consolidate.controller';

import { EventStoreModule } from '../eventstore/eventstore.module';

import { ConsolidateSaga } from './consolidate.saga';

import { StorageModule } from '../storage/storage.module';



@Module({

&nbsp; imports: \[EventStoreModule, StorageModule],

&nbsp; controllers: \[ConsolidateController],

&nbsp; providers: \[ConsolidateSaga],

})

export class ConsolidateModule {}

```



\*\*apps/api/src/modules/audit/audit.controller.ts\*\*

```ts

import { Controller, Get, Param } from '@nestjs/common';

import { EventStoreService } from '../eventstore/eventstore.service';

import { ProjectionsService } from '../eventstore/projections.service';



@Controller('audit')

export class AuditController {

&nbsp; constructor(private readonly store: EventStoreService, private readonly proj: ProjectionsService) {}



&nbsp; @Get(':aggregateId/events')

&nbsp; events(@Param('aggregateId') id: string) { return this.store.load(id); }



&nbsp; @Get(':aggregateId/snapshot')

&nbsp; snapshot(@Param('aggregateId') id: string) { return this.proj.getSnapshot(id); }

}

```



\*\*apps/api/src/modules/audit/audit.module.ts\*\*

```ts

import { Module } from '@nestjs/common';

import { AuditController } from './audit.controller';

import { EventStoreModule } from '../eventstore/eventstore.module';



@Module({

&nbsp; imports: \[EventStoreModule],

&nbsp; controllers: \[AuditController],

})

export class AuditModule {}

```



\*\*apps/api/src/modules/eventstore/eventstore.module.ts\*\*

```ts

import { Module } from '@nestjs/common';

import { EventStoreService } from './eventstore.service';

import { ProjectionsService } from './projections.service';



@Module({

&nbsp; providers: \[EventStoreService, ProjectionsService],

&nbsp; exports: \[EventStoreService, ProjectionsService],

})

export class EventStoreModule {}

```



---



\## Runbook: primeros pasos y requests



\- \*\*Preparación:\*\*

&nbsp; - \*\*Instala dependencias:\*\* npm i

&nbsp; - \*\*Levanta DB:\*\* npm run db:up

&nbsp; - \*\*Crea tabla de eventos\*\* (rápido):

&nbsp;   ```

&nbsp;   psql -h localhost -U pipeline -d eventstore -c "CREATE TABLE IF NOT EXISTS events(

&nbsp;     id SERIAL PRIMARY KEY,

&nbsp;     aggregate\_id TEXT NOT NULL,

&nbsp;     type TEXT NOT NULL,

&nbsp;     occurred\_at TIMESTAMP NOT NULL,

&nbsp;     payload JSONB NOT NULL

&nbsp;   );"

&nbsp;   ```

&nbsp; - \*\*Arranca API:\*\* npm run start:dev



\- \*\*Flujo mínimo:\*\*

&nbsp; - \*\*Ingesta + limpieza OCR\*\*

&nbsp;   ```

&nbsp;   curl -X POST http://localhost:3000/ingest \\

&nbsp;     -H "Content-Type: application/json" \\

&nbsp;     -d '{"sourceId":"prov-ocr-01","ocrText":"TEXTO OCR...", "referenceText":"TEXTO REFERENCIA..."}'

&nbsp;   ```

&nbsp;   Respuesta: `{ "aggregateId": "..." }`



&nbsp; - \*\*Comparación rápida\*\*

&nbsp;   ```

&nbsp;   curl -X POST http://localhost:3000/compare \\

&nbsp;     -H "Content-Type: application/json" \\

&nbsp;     -d '{"aggregateId":"<ID>","mode":"quick","provider":"mistral"}'

&nbsp;   ```



&nbsp; - \*\*Comparación detallada (si procede)\*\*

&nbsp;   ```

&nbsp;   curl -X POST http://localhost:3000/compare \\

&nbsp;     -H "Content-Type: application/json" \\

&nbsp;     -d '{"aggregateId":"<ID>","mode":"detailed","provider":"gpt"}'

&nbsp;   ```



&nbsp; - \*\*Consolidación\*\*

&nbsp;   ```

&nbsp;   curl -X POST http://localhost:3000/consolidate \\

&nbsp;     -H "Content-Type: application/json" \\

&nbsp;     -d '{"aggregateId":"<ID>"}'

&nbsp;   ```



&nbsp; - \*\*Auditoría\*\*

&nbsp;   ```

&nbsp;   curl http://localhost:3000/audit/<ID>/events

&nbsp;   curl http://localhost:3000/audit/<ID>/snapshot

&nbsp;   ```



---



Si quieres, te preparo un repositorio inicial con estos archivos ya listos, más scripts de migración y un watcher que consuma eventos nuevos y dispare las sagas sin sondeo manual. También puedo añadir validaciones, colas y retries en los adaptadores para producción.

