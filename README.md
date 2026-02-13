
# URL Shortener & Analytics Dashboard (System Design Project)

A production-style URL shortener + analytics **dashboard** built as a **system design / architecture project**.  
Includes a polished SaaS UI, link creation + management, and simulated click analytics to demonstrate how a real distributed system would work at scale.

> ✅ Focus: UI + system design + distributed architecture explanation  
> ⏳ Backend (FastAPI + Postgres + Redis + Kafka) planned as a next phase

---

## ✨ What’s Included

### ✅ Working (Current)
- Create a short code for a long URL (simulation)
- Dashboard UI with KPI cards:
  - Total Links
  - Total Clicks
  - Cache Hit Rate (simulated)
  - Avg Latency (simulated)
- Recent links table + copy link button
- System design documentation and AWS scaling notes

### 🔜 Planned (Backend Phase)
- FastAPI backend with real endpoints:
  - `POST /shorten`
  - `GET /r/{code}` (real 302 redirect)
  - `GET /metrics`
- PostgreSQL persistence
- Redis caching for hot links
- Kafka-based async click stream for analytics
- Deploy to Render with real public short URLs

---

## 🧱 Architecture (Design)

### Redirect Path (Low Latency)
1. Client hits `GET /r/{code}`
2. Cache-first lookup in Redis (`code -> long_url`)
3. Cache miss falls back to Postgres and writes-through to Redis
4. Service returns `302 Redirect` immediately

### Analytics Path (Async / Event Driven)
1. Redirect service publishes click events to Kafka topic `click_events`
2. Consumer aggregates clicks and writes to analytics store
3. Dashboard queries aggregates (not raw events)

---

## ☁️ Scaling Strategy (AWS Plan)

- **Compute:** ECS/Fargate or EKS behind an ALB
- **Cache:** ElastiCache (Redis) for hot redirects
- **DB:** RDS PostgreSQL + read replicas for analytics reads
- **Streaming:** MSK (Kafka) for click ingestion
- **Analytics Store (optional at scale):** ClickHouse / Redshift
- **Edge:** CloudFront + potential Lambda@Edge for global latency optimization

---

## ⚠️ Note About Redirect Links in AI Studio

This project runs inside a preview/sandbox environment.  
For a **real working short URL domain**, the FastAPI backend must be deployed (Render/AWS).  
The current build demonstrates the UI + system architecture and simulates redirect behavior.

---

## 📌 Resume Bullet (Honest + Strong)

- Designed a Bitly-style URL shortener and analytics platform, building a production-style SaaS dashboard and defining a scalable distributed architecture (cache-first redirects, Kafka-based click ingestion, and AWS deployment strategy).

---

## License
MIT
