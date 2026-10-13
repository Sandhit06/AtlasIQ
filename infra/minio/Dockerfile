# Upstream Docker Hub repositories were unavailable when verified on 2026-10-11.
# Build the official RELEASE.2025-10-15T17-29-55Z source commit instead.
FROM golang:1.24-alpine@sha256:8bee1901f1e530bfb4a7850aa7a479d17ae3a18beb6e09064ed54cfd245b7191 AS build
ENV CGO_ENABLED=0
RUN go install -trimpath github.com/minio/minio@9e49d5e7a648f00e26f2246f4dc28e6b07f8c84a
RUN mkdir -p /data /licenses /runtime-tmp && chmod 1777 /runtime-tmp && chown 10001:10001 /data && cp /go/pkg/mod/github.com/minio/minio@*/LICENSE /licenses/minio-LICENSE
FROM scratch
COPY --from=build /go/bin/minio /minio
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /data /data
COPY --from=build /runtime-tmp /tmp
COPY --from=build /licenses /licenses
ENV HOME=/tmp
USER 10001:10001
EXPOSE 9000
ENTRYPOINT ["/minio"]
CMD ["server", "/data"]
