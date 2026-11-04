# k6 Load & Concurrency Testing Suite

This suite evaluates the performance, latency, and fault tolerance of the application and the AWS Application Load Balancer (ALB) under high concurrent load.

---

## 1. Test Architecture

The `k6/load-test.js` script simulates realistic virtual users (VUs) querying the infrastructure:
- **Ramp-up:** Progressively increases load from 0 to 20 users.
- **Sustained Load:** Maintains 50 concurrent users exercising endpoints.
- **Spike Load:** Reaches 100 concurrent users to test Load Balancer traffic distribution.
- **Ramp-down:** Gracefully steps down traffic to analyze resource recovery.

---

## 2. Key Metrics & Thresholds

- **`http_req_failed < 1%`**: Enforces system reliability and fault tolerance.
- **`p(95) < 500ms`**: Ensures 95% of requests complete within 500 milliseconds.
- **`p(99) < 1000ms`**: Guarantees worst-case latency stays under 1 second.

---

## 3. Running the Test

### Locally or against Local Docker
```bash
# Using k6 CLI:
k6 run k6/load-test.js

# Or using Docker without installing k6 locally:
docker run --rm -i -v ${PWD}/k6:/scripts grafana/k6 run /scripts/load-test.js
```

### Against AWS Application Load Balancer (ALB)
```bash
# Pass the public ALB DNS name via TARGET_URL:
k6 run -e TARGET_URL=http://<ALB_DNS_NAME> k6/load-test.js
```
