# Portfolio Data

## Experience
- **2026 —** | **Acting Head of Engineering** | **ELELEM AI · UK, Remote**
  CTO-level ownership of product and engineering roadmap after the founding CTO's departure. Own architecture, quality, and delivery for two live AI products; lead a 3-engineer team.

- **2025–26** | **Lead Engineer** | **ELELEM AI**
  Built the Dhaka engineering team from scratch. Owned the full GCP infrastructure stack across two production products.

- **2024–25** | **Software Engineer, Backend** | **ELELEM AI**
  Built the hybrid-search RAG engine and LLM-based analytics pipelines. Scaled the platform from zero to 8 active enterprise clients.

- **2023–24** | **Back-end Developer** | **ELELEM AI (formerly CONCURED)**
  Decomposed a monolithic GCP pipeline into independent microservices. Rebuilt the recommendation engine for a 50% lift in CTA/click-through.

- **2024** | **Software Engineer, Backend (Contract)** | **EBLICT — Bangladesh Ministry of ICT**
  Led backend and ML delivery for a Virtual Private Assistant project across a 10-person cross-functional team.

- **2023–24** | **AI Engineer (Contract)** | **Hiperdyne Corporation — Tokyo, Japan**
  Built a computer-vision face-privacy pipeline. Researched LLM jailbreaking vulnerabilities to inform secure production deployment.

- **2022–23** | **Junior Back-end Developer → NLP Intern** | **CONCURED**
  Replaced a paid keyword-extraction service with an in-house open-source solution, cutting a recurring monthly cost.

## Projects
- **Hybrid RAG Engine** | **100s of queries/day** | tags: rag | tech: FastAPI, ElasticSearch, RAG
  A hybrid-search retrieval engine ("Snippets API") with origin-tracked URL redirection, serving live traffic across 8 enterprise clients from client websites in real time.

- **Centralized Auth (JWKS)** | **Zero-downtime key rotation** | tags: auth | tech: ES256, GCP Secret Manager, Auth
  An issuer service minting ES256 JWTs with rotating JWKS, backed by GCP Secret Manager and verified by an in-process caching library across every downstream service.

- **PII Redaction Pipeline** | **Client: Sony / SIE** | tags: privacy | tech: Presidio, NLP, Privacy
  Custom Microsoft Presidio recognizers and a product-specific allow-list scrubbing personally identifiable information from enterprise conversation logs before they reach analytics.

- **Attribution & Analytics** | **elelem_cid pipeline** | tags: analytics | tech: BigQuery, Cookies, Analytics
  A first-party click-ID attribution system connecting widget engagement to backend conversion events, built for enterprise-grade reporting and BigQuery dashboards.

- **Recommendation Engine Rebuild** | **+50% CTA / click-through** | tags: ml, analytics | tech: Embeddings, A/B Testing, ML
  Re-architected a recommendation engine on sentence embeddings, validated against the incumbent model through a live A/B test on real enterprise traffic.

- **Benchmarking Pipeline** | **RAGAS · DeepEval · TruLens** | tags: rag, ml | tech: Evaluation, RAG, Automation
  An automated report-generation pipeline for evaluating RAG and agentic systems against multiple frameworks, producing ACM-formatted research output.

## Skills
### AI / GenAI
LLM production integration, RAG pipelines, LangChain, LangGraph, OpenAI SDK, Anthropic SDK, RAGAS, DeepEval, TruLens

### Backend
Python, FastAPI, Django, Flask, AsyncIO

### Cloud & Infra
GCP — Cloud Run, GKE, Pub/Sub, Cloud Build, AWS, Docker, Kubernetes, GitHub Actions

### Data
MongoDB, ElasticSearch, Redis, BigQuery, MySQL, PostgreSQL

### ML
TensorFlow, PyTorch, ONNX, Pandas, Scikit-Learn
