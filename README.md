# Mintova

> Move stablecoins across chains.

Standalone Android APK for USDC bridge, swap, and AI-assisted CCTP commands.

## ⚠️ V1 Testnet Only

Mintova V1 is testnet-first. Mainnet is disabled by default and will not be enabled without explicit user confirmation and live chain validation.

## Supported Testnet Chains

| Chain | Chain ID | Bridge | Swap | Status |
|-------|----------|--------|------|--------|
| Arc Testnet | 5042002 | ✅ | ❌ | Enabled |
| Ethereum Sepolia | 11155111 | ✅ | ❌ | Enabled |
| Base Sepolia | 84532 | ✅ | ❌ | Enabled |
| Arbitrum Sepolia | 421614 | ❌ | ❌ | Coming soon |
| Avalanche Fuji | 43113 | ❌ | ❌ | Coming soon |

Bridge support requires verification against installed Circle App Kit / Bridge Kit SDK before enabling.

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Mobile**: Capacitor (Android)
- **Bridge**: Circle App Kit / Bridge Kit (CCTP V2)
- **Wallet**: Circle User-Controlled Wallets (UCW)
- **AI**: LangChain JS + Zod
- **Validation**: Zod schemas

## Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Android Studio (for APK build)
- Circle Developer Account

### Install

```bash
cd apps/mobile
npm install
```

### Environment

```bash
cp .env.example .env.local
```

Fill in:
- `CIRCLE_API_KEY` — from Circle Developer Console
- `CIRCLE_APP_ID` — from Wallets > User Controlled > Configurator
- `CIRCLE_ENTITY_SECRET` — entity secret for DCW (admin only)
- `AI_API_KEY` — OpenAI API key for LangChain agent

### Run

```bash
npm run dev
```

### Typecheck

```bash
npm run typecheck
```

### Build

```bash
npm run build
```

### Android APK

```bash
npm run build
npx cap sync android
npx cap open android
```

From Android Studio: Build > Generate Signed Bundle / APK

App ID: `com.mintova.app`

## Architecture

```
User chat
  -> LangChain parses intent
  -> App validates route, amount, address, balance
  -> App shows confirmation sheet
  -> User confirms
  -> UCW wallet signs
  -> CCTP bridge executes
  -> Activity tracks approve/burn/attestation/mint
```

## Security

- No raw private keys in APK
- No seed phrases in APK
- No CIRCLE_API_KEY exposed client-side
- No AI_API_KEY exposed client-side
- Every transfer requires user confirmation
- AI agent never signs or executes transactions

## Features

### Bridge
Cross-chain USDC transfer via CCTP V2. Full lifecycle tracking: approve → burn → attestation → mint.

### Swap
Same-chain token swap. V1 is UI shell only (disabled). Enable after App Kit swap route verification.

### Agent
AI-powered natural language commands:
- "kirim 3 USDC ke Base ke 0xabc..."
- "bridge 10 USDC dari Sepolia ke Base"
- "swap 5 USDC ke ETH di Base"

Agent parses intent → shows confirmation → user confirms → wallet signs.

### Activity
Full bridge history with step-by-step progress, explorer links, and retry support for soft failures.

### Wallet
UCW login with Google or Email. View USDC balances, copy address, access testnet faucets.

## Validation Checklist

1. APK installs on Android
2. Google login works
3. Email login works
4. UCW wallet address created/restored
5. USDC balance fetchable
6. Bridge page shows 5 target testnets
7. Unsupported routes disabled
8. Supported routes quote correctly
9. Confirmation sheet before signing
10. Wallet signing after Confirm
11. Bridge creates real testnet tx(s)
12. Activity stores approve/burn/attestation/mint steps
13. Retry works from saved result
14. Agent parses commands into JSON intent
15. Agent asks clarification for missing fields
16. Agent does not execute without Confirm
17. No raw private key in repo/APK
18. No CIRCLE_API_KEY in client bundle
19. No AI_API_KEY in client bundle
20. No fake tx hashes or fake success states

## License

Private. All rights reserved.
