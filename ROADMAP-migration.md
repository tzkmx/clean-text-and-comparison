# Migration Roadmap: From Express.js to a Full Nest.js CQRS Architecture

This document outlines a practical, phased migration strategy to evolve the application from a simple modular Express.js service to the full-featured, event-sourced architecture powered by Nest.js.

## Phase 0: The Starting Point - Modular Express.js

We begin with the architecture defined in our initial roadmap: a simple Express server (`api.js`) that consumes a reusable, framework-agnostic module (`src/core.js`). All business logic is contained within the core module, and the API layer is just a thin wrapper.

```
/src/
  |- core.js
  |- main.js  (Express App)
```

---

## Phase 1: Preparation & TypeScript Conversion

**Goal:** Introduce static typing and professionalize the codebase in preparation for Nest.js.

#### Implementation Steps:
1.  **Introduce TypeScript:** Add `typescript` and `ts-node` to `devDependencies` and create a `tsconfig.json` file.
2.  **Convert Files:** Rename all `.js` files to `.ts` (e.g., `main.js` -> `main.ts`, `core.js` -> `core.ts`).
3.  **Add Types:** Define interfaces for function options and return values within `core.ts`. Type the Express request and response handlers in `main.ts`.

#### Conceptual Shift:
- We move from dynamic JavaScript to a statically-typed codebase. This doesn't change the runtime logic but provides compile-time safety and enables the decorators and metadata features that Nest.js relies on.

---

## Phase 2: Introducing Nest.js (Hybrid Mode)

**Goal:** Run a minimal Nest.js application *inside* our existing Express server. This allows us to migrate features one by one without any downtime.

#### Implementation Steps:
1.  **Install Nest.js:** Add Nest.js core dependencies (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`).
2.  **Create Hybrid Server:** Modify `main.ts` to mount a Nest.js application onto our existing Express instance using the `ExpressAdapter`.
    ```typescript
    // In main.ts
    const expressApp = express(); // Our existing server
    // ... keep old Express routes for now ...

    // Create a Nest app on top of the Express instance
    const nestApp = await NestFactory.create(
      AppModule, // A new, minimal Nest module
      new ExpressAdapter(expressApp),
    );
    await nestApp.init();
    
    // The server now handles both Express and Nest routes
    expressApp.listen(3000);
    ```
3.  **Migrate One Endpoint:** Create a new `CleanModule` in Nest.js with a `CleanController`. Define a new route, e.g., `POST /v2/clean`. For now, this new controller will still call the functions from our original `core.ts` file.

#### Conceptual Shift:
- The application is now a hybrid. The Express server acts as the primary router, but it delegates specific routes (e.g., `/v2/*`) to the Nest.js runtime for processing. This allows for safe, gradual feature migration.

---

## Phase 3: Adopting Nest.js Idioms (Dependency Injection)

**Goal:** Refactor the core logic from simple functions into Nest.js services (Providers) and use Dependency Injection (DI).

#### Implementation Steps:
1.  **Create a `CoreService`:** Create a new `core.service.ts` file. Mark the class with `@Injectable()`. Move the logic from the old `core.ts` functions into methods within this class.
2.  **Inject the Service:** In the `CleanController`, inject `CoreService` via the constructor.
    ```typescript
    // In clean.controller.ts
    constructor(private readonly coreService: CoreService) {}

    @Post()
    handleCleanRequest(@Body() data: CleanDto) {
      return this.coreService.executeClean(data);
    }
    ```
3.  **Deprecate `core.ts`:** Once all logic is moved into services, the original `core.ts` file can be deleted.

#### Conceptual Shift:
- This is the most significant mental shift. We are no longer manually importing and calling functions. We are defining **classes** (`CoreService`) and **declaring dependencies** in constructors. The Nest.js framework is now responsible for instantiating and "injecting" these dependencies for us. This decouples our components from each other.

---

## Phase 4: Implementing CQRS & Event Sourcing

**Goal:** Introduce the full CQRS/ES pattern for the migrated `clean` feature.

#### Implementation Steps:
1.  **Install CQRS:** Add `@nestjs/cqrs` to the project.
2.  **Introduce Commands:** The `CleanController` will no longer call the service directly. Instead, it will use a `CommandBus` to dispatch a `CleanTextCommand`.
3.  **Create a Command Handler:** A new `CleanTextCommandHandler` will be created. This handler will contain the business logic that was previously in the `CoreService` method. It will process the command.
4.  **Introduce Events:** After successfully processing the command, the handler will use an `EventBus` to publish a `TextCleanedEvent`.
5.  **Create an Event Store:** Implement a basic `EventStoreService` that writes these events to our Markdown files or a simple database.

#### Conceptual Shift:
- We separate **write operations (Commands)** from **read operations (Queries)**. Controllers become simple dispatchers of intent. The core logic lives in handlers. We introduce **Events** as a record of things that have happened, which enables advanced patterns like Sagas and projections.

---

## Phase 5: Full Migration & Deprecation

**Goal:** Complete the migration of all features and transition to a pure Nest.js application.

#### Implementation Steps:
1.  **Repeat:** Follow phases 2-4 for all other features (e.g., `compare`).
2.  **Remove Hybrid Mode:** Once all routes are handled by Nest.js controllers, the Express-specific code and the `ExpressAdapter` can be removed from `main.ts`.
3.  **Evolve Event Store:** Replace the simple Markdown-based event store with the robust PostgreSQL implementation from the advanced proposal.

By following these phases, we can incrementally evolve the application, managing complexity at each step and ensuring the system remains stable throughout the migration process.
