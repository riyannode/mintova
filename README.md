# Mintova

> Move stablecoins across chains.

Standalone Android APK for USDC bridge, swap, and AI-assisted CCTP commands.

## ⚠️ V1 Testnet Only

Mintova V1 is testnet-first. Mainnet is disabled by default and will not be enabled without explicit user confirmation and live chain validation.

## Supported Testnet Chains

| Chain | Chain ID | Bridge | Swap | Status |
|-------|----------|--------|------|--------|
| Arc Testnet | 5042002 | Unverified | ❌ | Enabled |
| Ethereum Sepolia | 11155111 | Unverified | ❌ | Enabled |
| Base Sepolia | 84532 | Unverified | ❌ | Enabled |
| Arbitrum Sepolia | 421614 | Unverified | ❌ | Enabled |
| Avalanche Fuji | 43113 | Unverified | ❌ | Enabled |
| OP Sepolia | 11155420 | Unverified | ❌ | Enabled |
| Polygon Amoy | 80002 | Unverified | ❌ | Enabled |

**Bridge status**: All 7 chains are registered in the SDK but none are verified for end-to-end bridge execution yet. Bridge execution is disabled (HTTP 501) until UCW user-signing is wired. Once signing is validated, individual routes will be promoted to "verified" after a successful testnet transfer.

## ⚠️ Bridge Execution Status

Bridge execution is **disabled** (Phase 4). The backend will return HTTP 501 for all bridge execute and retry requests.

**Why**: UCW (User-Controlled Wallet) signing is not wired yet. We refuse to use `CIRCLE_ENTITY_SECRET` for user bridge execution because that would move user funds without user signing authority.

**What's needed**: UCW user-signing integration where the user's wallet signs the bridge transaction client-side, then submits to the backend for relay.

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
- `CIRCLE_ENTITY_SECRET` — entity secret for DCW admin operations only (NOT used for user bridge execution)
- `AI_API_KEY` — OpenAI API key for LangChain agent
- `NEXT_PUBLIC_CIRCLE_APP_ID` — Circle App ID for client-side UCW SDK
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client ID for UCW login

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
  -> UCW wallet signs (NOT WIRED YET)
  -> [DISABLED] CCTP bridge executes
  -> [DISABLED] Activity tracks approve/burn/attestation/mint
```

## Security

- No raw private keys in APK
- No seed phrases in APK
- No CIRCLE_API_KEY exposed client-side
- No AI_API_KEY exposed client-side
- Every transfer requires user confirmation
- AI agent never signs or executes transactions
- **CIRCLE_ENTITY_SECRET is never used for user bridge execution** — user bridge requires UCW user signing
- Bridge execution returns 501 until UCW signing is validated

## Features

### Bridge
Cross-chain USDC transfer via CCTP V2. All 7 testnet chains registered. Execution disabled until UCW signing is wired. Quote shows "pending verification" for fee and time — no fake data.

### Swap
Same-chain token swap. V1 is UI shell only (disabled). Enable after App Kit swap route verification.

### Agent
AI-powered natural language commands:
- "kirim 3 USDC ke Base ke 0xabc..."
- "bridge 10 USDC dari Sepolia ke Base"
- "swap 5 USDC ke ETH di Base"

Agent parses intent → shows confirmation → user confirms → wallet signs.

### Activity
Full bridge history with step-by-step progress. Blocked executions stored with `errorCode: "UCW_BRIDGE_SIGNING_NOT_READY"`. Retry disabled (no saved SDK result).

### Wallet
UCW login with Google or Email. View USDC balances, copy address, access testnet faucets.

## Validation Checklist

1. APK installs on Android
2. Google login works
3. Email login works
4. UCW wallet address created/restored
5. USDC balance fetchable
6. Bridge page shows 7 target testnets
7. All routes show as "unverified" — bridge form hidden (no bridgeEnabled chains)
8. ~~Supported routes quote correctly~~ → Quote shows "pending verification"
9. Confirmation sheet before signing
10. ~~Wallet signing after Confirm~~ → Returns 501 blocked state
11. ~~Bridge creates real testnet tx(s)~~ → Blocked until UCW signing wired
12. Activity stores blocked status with error code
13. ~~Retry works from saved result~~ → Returns 501
14. Agent parses commands into JSON intent
15. Agent asks clarification for missing fields
16. Agent does not execute without Confirm
17. No raw private key in repo/APK
18. No CIRCLE_API_KEY in client bundle
19. No AI_API_KEY in client bundle
20. No fake tx hashes or fake success states
21. No fake fee ("~0.001 USDC") or fake time ("8-20 seconds")
22. No backend entity secret used for user bridge execution

## License

Private. All rights reserved.


## Planned UCW Manual CCTP Path

Mintova will bridge USDC via **manual CCTP V2 + Forwarding Service** using
Circle User-Controlled Wallets (UCW) contract execution. This is **not** the
Bridge Kit / App Kit `kit.bridge()` path — that adapter model requires direct
signing capability which UCW does not provide.

### Architecture

```
Frontend                    Backend                     Circle / Iris
────────                    ───────                     ─────────────
1. User initiates bridge
   ↓
2. sdk.setAuth(userToken)
   ↓
3. Backend: create approve challenge → challengeId
   ↓
4. sdk.execute(challengeId) → user PIN → approve tx on-chain
   ↓
5. Backend: create burnWithHook challenge → challengeId
   ↓
6. sdk.execute(challengeId) → user PIN → burn tx on-chain
                                               ↓
                              7. Iris signs attestation
                                               ↓
                              8. Forwarding Service mints on dest chain
                                               ↓
                              9. Poll Iris messages → forwardTxHash
```

### What's NOT used

- ❌ `kit.bridge()` — Bridge Kit adapter model incompatible with UCW
- ❌ `CIRCLE_ENTITY_SECRET` for user fund movement
- ❌ Raw private keys
- ❌ DCW (Developer-Controlled Wallets) for user bridge funds
- ❌ Destination chain wallet (Forwarding Service handles mint)

### UCW Contract Execution Steps

| Step | Contract | Function | Purpose |
|------|----------|----------|---------|
| 1 | USDC | `approve(address,uint256)` | Approve TokenMessengerV2 to spend USDC |
| 2 | TokenMessengerV2 | `depositForBurnWithHook(...)` | Burn USDC + request forwarding |

### Status

- **Contract addresses**: Fetched from Circle docs (testnet)
- **Fee API**: Iris sandbox (`iris-api-sandbox.circle.com`)
- **UCW challenge flow**: Scaffold types + builders created
- **Execution**: **Disabled** (HTTP 501) until end-to-end validated
