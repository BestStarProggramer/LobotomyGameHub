FROM golang:1.25.4-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -ldflags "-s -w" -o /email-sender cmd/email-sender/main.go

FROM alpine:latest

RUN apk update && apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /email-sender .

#COPY .env~ .env

ENTRYPOINT ["/app/email-sender"]
