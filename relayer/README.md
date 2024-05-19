# Hermes Relayer

## Quick Start

Relayer utilizes the simple relayer example available [here](https://github.com/wormhole-foundation/relayer-engine/tree/main/examples/simple).

It was developed following the wormhole simple relayer tutorial available [here](https://docs.wormhole.com/wormhole/quick-start/tutorials/relayer).

## Prerequisites

You must have Rust, Solana 1.16.16, Yarn, and Anchor 0.28.0 installed. Installation page available [here](https://www.anchor-lang.com/docs/installation).

## Install Packages

`npm install`

## Start Background Processes

### Wormhole Testnet Spy

```bash
docker run --platform=linux/amd64 \
-p 7073:7073 \
--entrypoint /guardiand ghcr.io/wormhole-foundation/guardiand:latest \
spy \
--nodeKey /node.key \
--spyRPC "[::]:7073" \
--env testnet
```

### Redis Persistence

`docker run --rm -p 6379:6379 --name redis-docker -d redis`

## **Start Relayer**

`anchor test`
