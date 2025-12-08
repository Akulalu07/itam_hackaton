FROM rust:1.91-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl\
    libssl3 && \
    rm -rf /var/lib/apt/lists/*


COPY Cargo.toml ./

COPY src/ src/


RUN cargo build --release

ENTRYPOINT [ "cargo", "run", "--release" ]
