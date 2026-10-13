# Initial threat model

This scaffold processes no tenant documents. It is not an enterprise security implementation.

Current controls: loopback-only public ports, isolated internal service network, private
MinIO bucket initialization, non-root API/worker/web containers, guarded readiness,
JSON-only Celery messages, no document fetching, no arbitrary shell/SQL tool endpoints,
redacted dependency failures, ignored environment files and staging/production startup guard.

Development database and storage credentials are intentionally public examples and must
never be used outside a local stack. Redis lacks authentication in this local-only network.
The MinIO root credentials are used for local bootstrap only. Production must separate
administration from least-privilege application identities.

Outstanding mandatory work includes OIDC/JWKS, tenant isolation, document ACLs and grants,
audit events, upload safety, parser isolation, revocation, citation verification, budgets,
rate limiting, secret rotation, dependency/image security scans and backup restore drills.
No security result beyond the explicit tests in the implementation log is claimed.
