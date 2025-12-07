FROM golang:1.25.4 AS builder_backend
WORKDIR /backend


COPY . .

RUN go mod init backend
RUN go get 


ENV GOEXPERIMENT=greenteagc

RUN go build -o backend .

FROM debian:trixie-slim

WORKDIR /backend
COPY --from=builder_backend /backend .

EXPOSE 8080
CMD ["./backend"]