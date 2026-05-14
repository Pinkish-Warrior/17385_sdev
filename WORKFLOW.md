# WORKFLOW.md — HMCTS Task Manager

## 1. Stack Decision Flow

```mermaid
flowchart TD
    START([Choose a stack for the challenge]) --> Q1

    Q1{"Does the framework<br/>auto-generate<br/>Swagger/OpenAPI docs?"}

    Q1 -->|No| Q1_NO["Full TS/JS or Go<br/>Requires manual annotation<br/>(swagger-jsdoc / swaggo)"]
    Q1 -->|Yes| Q1_YES["FastAPI ✓<br/>Auto-generated at /docs<br/>from type hints"]

    Q1_NO --> Q2{"Does the framework<br/>provide built-in<br/>request validation?"}
    Q1_YES --> Q3{"Does the framework<br/>provide built-in<br/>request validation?"}

    Q2 -->|No — needs extra lib| GOPATH["Go + TypeScript<br/>Requires go-playground/validator<br/>More boilerplate"]
    Q2 -->|Partial — needs zod/joi| TSPATH["Full TypeScript<br/>Requires express-validator or zod<br/>Additional wiring"]

    Q3 -->|Yes — Pydantic| PYPATH["Python FastAPI ✓<br/>Pydantic validates automatically<br/>Same model = docs + validation + serialisation"]

    GOPATH --> EVAL1{"Time to build<br/>vs impressiveness"}
    TSPATH --> EVAL2{"Boilerplate<br/>vs alignment<br/>with HMCTS repos"}
    PYPATH --> EVAL3{"Frontend<br/>language choice"}

    EVAL1 -->|Go is verbose,<br/>more ceremony| GORISK["Risk: Slowest to build<br/>Docs + validation manual<br/>Runtime perf irrelevant at this scale"]
    EVAL2 -->|More setup than needed<br/>for a timed assessment| TSRISK["Risk: Manual work for<br/>two of four spec requirements"]
    EVAL3 -->|Type-safe, GOV.UK<br/>Frontend compatible| TSFRONT["TypeScript (Express + Nunjucks) ✓<br/>Compile-time safety<br/>Nunjucks = GOV.UK macros"]

    GORISK -->|Ruled out| REJECTED1(["Go backend — rejected<br/>High effort, low return<br/>for this challenge"])
    TSRISK -->|Ruled out| REJECTED2(["Full TypeScript — ruled out<br/>Solid but more boilerplate<br/>for docs + validation"])
    TSFRONT --> CHOSEN

    CHOSEN(["✓ Chosen Stack<br/>Python FastAPI backend<br/>+ TypeScript frontend"])

    style CHOSEN fill:#006435,color:#fff
    style REJECTED1 fill:#b10e1e,color:#fff
    style REJECTED2 fill:#f47738,color:#fff
    style PYPATH fill:#d4edda
    style TSFRONT fill:#d4edda
```

---

## 2. Stack Requirements Coverage

```mermaid
flowchart LR
    subgraph REQ["Challenge Requirements"]
        R1["Unit tests"]
        R2["Store data in a database"]
        R3["Validation & error handling"]
        R4["Document API endpoints"]
    end

    subgraph FULL_TS["Full TypeScript"]
        TS1["Jest ✓"]
        TS2["Sequelize / Knex ✓"]
        TS3["zod / express-validator<br/>(manual setup) ⚠️"]
        TS4["swagger-jsdoc<br/>(manual annotation) ⚠️"]
    end

    subgraph GO["Go + TypeScript"]
        G1["Built-in testing ✓"]
        G2["database/sql + lib ✓"]
        G3["go-playground/validator<br/>(manual setup) ⚠️"]
        G4["swaggo annotations<br/>(manual, verbose) ⚠️"]
    end

    subgraph CHOSEN["Python + TypeScript ✓"]
        P1["pytest ✓"]
        P2["SQLAlchemy + Alembic ✓"]
        P3["Pydantic — automatic ✅"]
        P4["FastAPI /docs — automatic ✅"]
    end

    R1 --- TS1 & G1 & P1
    R2 --- TS2 & G2 & P2
    R3 --- TS3 & G3 & P3
    R4 --- TS4 & G4 & P4

    style CHOSEN fill:#006435,color:#fff
    style P3 fill:#d4edda
    style P4 fill:#d4edda
```

---

## 3. Development Phases

```mermaid
flowchart TD
    A([Start]) --> B

    subgraph PHASE1["Phase 1 — Backend (FastAPI)"]
        B[Scaffold FastAPI app] --> C[Configure PostgreSQL + SQLAlchemy]
        C --> D[Write Alembic migrations]
        D --> E[Define Pydantic schemas]
        E --> F[Implement CRUD endpoints]
        F --> G[Add validation & error handling]
        G --> H[Write pytest unit + integration tests]
        H --> I[Verify Swagger UI at /docs]
    end

    subgraph PHASE2["Phase 2 — Frontend (TypeScript)"]
        I --> J[Scaffold Express + Nunjucks app]
        J --> K[Install GOV.UK Frontend assets]
        K --> L[Task list page]
        L --> M[Create task form]
        M --> N[Detail / edit page]
        N --> O[Delete flow]
        O --> P[Inline error display]
    end

    subgraph PHASE3["Phase 3 — Polish & Submission"]
        P --> Q[Write README.md for each repo]
        Q --> R[Add .env.example files]
        R --> S[Docker Compose setup]
        S --> T[Final test pass]
        T --> U[Push to GitHub]
    end

    U --> V([Done])
```

---

## 4. System Architecture Flow

```mermaid
flowchart LR
    User(["Caseworker<br/>(Browser)"])

    subgraph FE["Frontend — TypeScript :3100"]
        FERoute["Express Router"]
        FEView["Nunjucks Template"]
    end

    subgraph BE["Backend — FastAPI :8000"]
        BERouter["API Router"]
        BESchema["Pydantic Schema<br/>(validate)"]
        BEService["Route Handler"]
        BEDocs["/docs — Swagger UI"]
    end

    subgraph DB["PostgreSQL"]
        Tasks[("tasks table")]
    end

    User -->|HTTP request| FERoute
    FERoute -->|fetch JSON| BERouter
    BERouter --> BESchema
    BESchema -->|valid| BEService
    BESchema -->|invalid 422| FERoute
    BEService -->|SQLAlchemy query| Tasks
    Tasks -->|result| BEService
    BEService -->|JSON response| FERoute
    FERoute --> FEView
    FEView -->|rendered HTML| User
    BEDocs -.->|auto-generated| BERouter
```

---

## 5. API Request Lifecycle

```mermaid
sequenceDiagram
    actor User as Caseworker
    participant FE as Frontend (Express)
    participant BE as Backend (FastAPI)
    participant DB as PostgreSQL

    User->>FE: Submit form / navigate page
    FE->>BE: HTTP request (GET / POST / PATCH / DELETE)
    BE->>BE: Pydantic validates request body
    alt Validation fails
        BE-->>FE: 422 Unprocessable Entity + field errors
        FE-->>User: Render page with inline errors
    else Validation passes
        BE->>DB: SQLAlchemy query
        alt Record not found
            DB-->>BE: Empty result
            BE-->>FE: 404 Not Found
            FE-->>User: Error page
        else Success
            DB-->>BE: Task record(s)
            BE-->>FE: 200 / 201 JSON response
            FE-->>User: Render page with data
        end
    end
```

---

## 6. Frontend User Journey

```mermaid
flowchart TD
    Home["/ — Task List"] -->|Click 'New Task'| NewForm["GET /tasks/new<br/>Create Form"]
    NewForm -->|Submit| CreatePost["POST /tasks"]
    CreatePost -->|Success| Home
    CreatePost -->|Validation error| NewForm

    Home -->|Click task title| Detail["GET /tasks/:id<br/>Task Detail + Edit"]
    Detail -->|Change status + submit| UpdatePost["POST /tasks/:id"]
    UpdatePost -->|Success| Home
    UpdatePost -->|Error| Detail

    Detail -->|Click 'Delete'| DeletePost["POST /tasks/:id/delete"]
    DeletePost -->|Success| Home
```

---

## 7. CRUD Endpoint Map

```mermaid
flowchart LR
    subgraph Endpoints["Backend API Endpoints"]
        POST["POST /tasks<br/>Create task"]
        GETALL["GET /tasks<br/>List all tasks"]
        GETONE["GET /tasks/{id}<br/>Get task by ID"]
        PATCH["PATCH /tasks/{id}<br/>Update status"]
        DELETE["DELETE /tasks/{id}<br/>Delete task"]
        HEALTH["GET /health<br/>Health check"]
        DOCS["GET /docs<br/>Swagger UI"]
    end

    subgraph Responses["HTTP Responses"]
        R201["201 Created<br/>TaskResponse"]
        R200L["200 OK<br/>TaskResponse[]"]
        R200["200 OK<br/>TaskResponse"]
        R200P["200 OK<br/>TaskResponse"]
        R204["204 No Content"]
        ROK["200 OK<br/>{ status: ok }"]
        RSWAG["Swagger UI"]
        R404["404 Not Found"]
        R422["422 Unprocessable Entity<br/>validation detail"]
    end

    POST --> R201
    POST --> R422
    GETALL --> R200L
    GETONE --> R200
    GETONE --> R404
    PATCH --> R200P
    PATCH --> R404
    PATCH --> R422
    DELETE --> R204
    DELETE --> R404
    HEALTH --> ROK
    DOCS --> RSWAG
```

---

## 8. Data Model

```mermaid
erDiagram
    TASK {
        uuid        id          PK
        varchar     title
        text        description "nullable"
        enum        status      "pending | in_progress | done"
        timestamptz due_date
        timestamptz created_at
        timestamptz updated_at
    }
```

---

## 9. Testing Strategy

```mermaid
flowchart TD
    subgraph BE_Tests["Backend Tests — pytest"]
        subgraph BE_UNIT["Unit"]
            UT1["Unit: Pydantic schema validation<br/>(valid + invalid inputs)"]
            UT2["Unit: Route handler logic<br/>(mock SQLAlchemy session)"]
        end
        subgraph BE_INT["Integration"]
            IT1["Integration: POST /tasks<br/>happy path + validation error"]
            IT2["Integration: GET /tasks + GET /tasks/:id<br/>happy path + 404"]
            IT3["Integration: PATCH /tasks/:id<br/>status update + 404"]
            IT4["Integration: DELETE /tasks/:id<br/>delete + re-fetch 404"]
        end
    end

    subgraph FE_Tests["Frontend Tests — Jest + Supertest"]
        subgraph FE_GATE["Compile gate"]
            FT3["tsc --noEmit"]
        end
        subgraph FE_RUNTIME["Runtime"]
            FT1["Unit: route handlers<br/>(mock fetch to backend)"]
            FT2["Smoke: key pages render<br/>(Supertest on Express app)"]
        end
    end

    BE_UNIT --> BE_INT
    FE_RUNTIME --- BE_UNIT
    FT3 --> FT1 --> FT2
```
