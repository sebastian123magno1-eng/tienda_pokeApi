# Semantic Versioning (SemVer) & Docker Hub Strategy

This project adheres to the **Semantic Versioning 2.0.0** (`MAJOR.MINOR.PATCH`) standard for all container images published to [Docker Hub](https://hub.docker.com/u/sebas11221).

---

## 1. Tagging Standard

| Tag | Purpose | Description |
|---|---|---|
| `sebas11221/tienda-pokeapi:v1.0.0` | **Release Version** | Base release identifying `MAJOR.MINOR.PATCH` changes. |
| `sebas11221/tienda-pokeapi:v1.0.0-qa` | **QA Environment** | Validated build for quality assurance and automated E2E tests. |
| `sebas11221/tienda-pokeapi:v1.0.0-prod` | **Production** | Hardened, tested artifact deployed to AWS EC2. |
| `sebas11221/tienda-pokeapi:latest` | **Convenience** | Points to the most recent stable build. |

---

## 2. Publish Commands

```bash
# 1. Authenticate with Docker Hub
docker login -u sebas11221

# 2. Build and tag all environments
bash scripts/release-semver.sh

# 3. Push all tags to Docker Hub
docker push --all-tags sebas11221/tienda-pokeapi
```
