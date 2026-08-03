
---

### `Architecture.md`
*(Note: This uses standard Markdown text structures along with native **Mermaid.js** code blocks, which render as rich visual flowcharts on GitHub, GitLab, VS Code, and modern markdown viewers).*

```markdown
# High-Level Architecture Blueprint: SmartBooks AI ERP

This document outlines the cloud-native, microservices-driven architecture required to meet the strict sub-50ms user interface requirements and data-isolation paradigms of SmartBooks AI ERP.

---

## 1. System Topology Map

The system utilizes an API Gateway layer to abstract microservices, routing compute-heavy asynchronous tasks (like AI parsing) into separate workers via message queues to avoid locking the transactional accounting thread.

```mermaid
graph TD
    %% Client Layer
    subgraph Client_Layer [Client Applications & Access]
        A[Web App - React/Next.js SPA]
        B[Mobile App - React Native]
        C[WhatsApp Integration Client]
    end

    %% Network & Protection Layer
    D[Cloudflare WAF / CDN]
    E[Kong / AWS API Gateway]

    %% Microservices Mesh
    subgraph Compute_Mesh [Core Application Microservices]
        F[Auth & RBAC Service]
        G[Accounting Engine Engine]
        H[Inventory & Order Service]
        I[Indian Compliance Engine]
        J[AI Processing Proxy]
    end

    %% Async & AI Queue Processing
    K[RabbitMQ / Apache Kafka]
    L[AI Worker Module - Python/OCR/LLM]

    %% External Connections
    subgraph Government_Bank_End [External Systems]
        M[GSTN / NIC Sandbox APIs]
        N[Banking APIs - ICICI/HDFC/SBI]
    end

    %% Database Strategy
    subgraph Persistence_Tier [Data Tier]
        O[(PostgreSQL Master DB - Multi-tenant Isolation)]
        P[(Redis - Session Cache & Form Staging)]
        Q[(Immutable Audit Store)]
    end

    %% Data Flow Directions
    A --> D
    B --> D
    C --> D
    D --> E
    
    E --> F
    E --> G
    E --> H
    E --> I
    E --> J

    %% State persistence calls
    Compute_Mesh --> O
    Compute_Mesh --> P
    G --> Q

    %% Third party pipelines
    I --> M
    G --> N

    %% AI Work Split
    J --> K
    K --> L
    L --> O
```

---

## 2. Structural Layer Breakdowns

### 2.1 UI Entry Layer (Engineered for Low Latency)
* **Technology Stack:** Next.js Single Page Application (SPA) deployed to edge cloud networks.
* **Input Interceptor Cache:** Intercepts every local user keystroke event. Prioritizes state modification inside local JavaScript memory state arrays *before* sending network confirmation. This ensures the 50ms user entry target requirement is reached irrespective of regional cloud round-trip hops.

### 2.2 Microservices Fabric
* **Core Application Services:** Developed utilizing high-concurrency runtimes (Go or optimized Node.js clusters).
* **Service Isolation Principle:** The `Accounting Engine Engine` remains structurally detached from inventory updates. It consumes data streams from the `Inventory & Order Service` asynchronously via webhook events to guarantee book accuracy during volume traffic spikes.

### 2.3 AI Document Ingestion Engine (Asynchronous Queue)
```mermaid
sequenceDiagram
    autonumber
    User/WhatsApp->>API Gateway: Upload PDF Invoice / Bill Image
    API Gateway->>AI Processing Proxy: Stage Document Content
    AI Processing Proxy->>Database (Blob Storage): Save raw attachment
    AI Processing Proxy->>Message Queue (Kafka): Publish 'DOCUMENT_RECEIVED' event
    API Gateway-->>User/WhatsApp: Return HTTP 202 (Accepted for processing)
    
    Note over Message Queue (Kafka), AI Worker Module: Process occurs asynchronously out of thread
    Message Queue (Kafka)->>AI Worker Module: Consume 'DOCUMENT_RECEIVED' task
    AI Worker Module->>AI Worker Module: Run OCR & LLM Extraction Mapping
    AI Worker Module->>Database (PostgreSQL): Insert Draft Voucher Entry
    AI Worker Module->>Client WebSocket: Broadcast 'VOUCHER_DRAFT_READY' alert
```

### 2.4 Persistence & Audit Strategy
* **Operational Relational Database:** PostgreSQL clusters configured using Row-Level Security (RLS) tracking tables to isolate data records matching separate corporate workspace configurations (`Tenant IDs`).
* **Session Staging DB:** Redis in-memory storage holding temporary un-saved form lines. If an internet drop hits, local data sets sync up directly with this structure.
* **The Ledger Audit Ledger:** PostgreSQL tables bound to internal immutable