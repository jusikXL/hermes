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

`npm run spy`

### Redis Persistence

`npm run redis`

### Refetch EVM contracts ABI

`npx wagmi generate --watch`

## Start Relayer

`npm run start`
