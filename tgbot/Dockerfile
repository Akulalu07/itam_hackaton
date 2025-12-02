FROM rust:1.82-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./


RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release || true

COPY . .
RUN cargo build --release

FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN useradd -m appuser
USER appuser

COPY --from=builder /app/target/release/tgbot /usr/local/bin/tgbot

ENV RUST_LOG=info

CMD ["tgbot"]