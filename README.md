# AI Multi-User Maternity Journal Backend

Production-grade NestJS backend scaffold for a medical + emotional pregnancy journaling platform.

## Stack

- NestJS + TypeScript
- PostgreSQL + TypeORM
- Redis + BullMQ
- MinIO (S3 compatible object storage)
- OCR + LLM integration adapters (OpenRouter GPT-OSS-120B)

## Core Domains

- IAM / RBAC (multi-user, profile-scoped permissions)
- Pregnancy profiles (shared by mother/father/family/doctor)
- Medical records (file upload, OCR, AI extraction, timeline)
- Daily journals (mood, symptoms, vitals, notes)
- Memories + timeline
- Search + audit logs

## Async Pipeline

`upload -> normalize -> OCR -> LLM -> persist structured data -> timeline -> search index`

Queues:

- `document.normalize.queue`
- `document.ocr.queue`
- `document.llm.queue`
- `document.persist.queue`
- `timeline.build.queue`
- `search.index.queue`
- `media.transcode.queue`

## Quick Start

1. Copy envs:

```bash
cp .env.example .env
```

2. Start backend + infra with Docker:

```bash
docker compose -f docker/docker-compose.yml up --build -d
```

3. Run migrations and seed data inside backend container:

```bash
docker compose -f docker/docker-compose.yml exec backend npm run migration:run
docker compose -f docker/docker-compose.yml exec backend npm run seed:rbac
```

4. Open API docs:

`http://localhost:3000/docs`

## Security Defaults

- JWT access + rotating refresh tokens
- RBAC with profile-scoped checks
- Signed object URLs
- Malware scanning adapter hook
- Rate limiting + global validation
- Structured logging + audit trail entities

## Notes

- OCR and LLM integrations are implemented as adapters with production-oriented interfaces and placeholder logic where external providers are required.
- File normalization/transcoding is represented in worker processors and should be connected to concrete libraries/services in deployment.
