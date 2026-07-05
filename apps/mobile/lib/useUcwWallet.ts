"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getUcwRedirectUri, hasOAuthHash, cleanOAuthHash, type UcwLoginState, type UcwWallet, type UcwBalance } from "./ucw";

const STORAGE_KEY = "mintova_ucw_session";

type StoredSession = {
  deviceId: string;
  deviceToken: string;
  deviceEncryptionKey: string;
  userToken: string;
  encryptionKey: string;
};

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session: StoredSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useUcwWallet() {
  const sdkRef = useRef<any>(null);
  const [state, setState] = useState<UcwLoginState>("idle");
  const [wallet, setWallet] = useState<UcwWallet | null>(null);
  const [balances, setBalances] = useState<UcwBalance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<StoredSession | null>(null);

  // Initialize SDK on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const saved = loadSession();
      if (saved) {
        setSession(saved);
      }

      try {
        const { W3SSdk } = await import("@circle-fin/w3s-pw-web-sdk");
        if (cancelled) return;

        const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID;
        if (!appId) {
          setError("NEXT_PUBLIC_CIRCLE_APP_ID not configured");
          setState("error");
          return;
        }

        const onLoginComplete = (err: unknown, result: unknown) => {
          if (cancelled) return;
          if (err) {
            setError("Login failed");
            setState("error");
            return;
          }
          const { userToken, encryptionKey } = result as { userToken: string; encryptionKey: string };
          const newSession: StoredSession = {
            deviceId: saved?.deviceId || "",
            deviceToken: saved?.deviceToken || "",
            deviceEncryptionKey: saved?.deviceEncryptionKey || "",
            userToken,
            encryptionKey,
          };
          saveSession(newSession);
          setSession(newSession);
          setState("ready");
          cleanOAuthHash();
        };

        const sdk = new W3SSdk(
          {
            appSettings: { appId },
            loginConfigs: {
              deviceToken: saved?.deviceToken || "",
              deviceEncryptionKey: saved?.deviceEncryptionKey || "",
              google: {
                clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
                redirectUri: getUcwRedirectUri(),
                selectAccountPrompt: true,
              },
            },
          },
          onLoginComplete,
        );
        sdkRef.current = sdk;

        // Get device ID (Pitfall 5: always call getDeviceId)
        if (!saved?.deviceId) {
          const id = await sdk.getDeviceId();
          if (cancelled) return;
          const updatedSession: StoredSession = {
            ...saved!,
            deviceId: id,
          };
          saveSession(updatedSession);
          setSession(updatedSession);
        }

        // If we have OAuth hash, we're returning from login
        if (hasOAuthHash()) {
          setState("logging_in");
        } else if (saved?.userToken) {
          // Try to restore session
          setState("ready");
          await loadWallets(saved.userToken);
        } else {
          setState("ready");
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to initialize");
          setState("error");
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Load wallets after login
  const loadWallets = useCallback(async (userToken: string) => {
    try {
      const res = await fetch("/api/wallet/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken }),
      });
      const data = await res.json();

      if (data.wallets && data.wallets.length > 0) {
        const w = data.wallets[0];
        setWallet({
          id: w.id,
          address: w.address,
          blockchain: w.blockchain,
          accountType: w.accountType,
          state: w.state,
        });
        setState("connected");

        // Fetch balances
        await loadBalances(userToken, w.id);
      }
    } catch (err: any) {
      console.error("Failed to load wallets:", err);
    }
  }, []);

  // Load balances
  const loadBalances = useCallback(async (userToken: string, walletId: string) => {
    try {
      const res = await fetch("/api/wallet/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken, walletId }),
      });
      const data = await res.json();

      if (data.balances) {
        setBalances(data.balances.map((b: any) => ({
          token: {
            symbol: b.token?.symbol || "USDC",
            name: b.token?.name || "USD Coin",
            decimals: b.token?.decimals || 6,
          },
          amount: b.amount || "0",
          blockchain: b.blockchain || "",
        })));
      }
    } catch (err) {
      console.error("Failed to load balances:", err);
    }
  }, []);

  // Create device token (Step 1)
  const createDeviceToken = useCallback(async () => {
    if (!session?.deviceId) return;
    setState("initializing");
    setError(null);

    try {
      const res = await fetch("/api/wallet/device-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: session.deviceId }),
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const updated: StoredSession = {
        ...session,
        deviceToken: data.deviceToken,
        deviceEncryptionKey: data.deviceEncryptionKey,
      };
      saveSession(updated);
      setSession(updated);
      setState("ready");

      // Update SDK config
      if (sdkRef.current) {
        sdkRef.current.updateConfigs({
          loginConfigs: {
            deviceToken: data.deviceToken,
            deviceEncryptionKey: data.deviceEncryptionKey,
            google: {
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
              redirectUri: getUcwRedirectUri(),
              selectAccountPrompt: true,
            },
          },
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to create device token");
      setState("error");
    }
  }, [session]);

  // Login with Google (Step 2)
  const loginWithGoogle = useCallback(async () => {
    if (!sdkRef.current) return;

    // Create device token first if needed
    if (!session?.deviceToken) {
      await createDeviceToken();
    }

    setState("logging_in");
    setError(null);

    try {
      sdkRef.current.performLogin(/* SocialLoginProvider.GOOGLE */ 1);
    } catch (err: any) {
      setError(err.message || "Google login failed");
      setState("error");
    }
  }, [session, createDeviceToken]);

  // Initialize user + create wallet (Step 3)
  const initializeUser = useCallback(async () => {
    if (!session?.userToken) return;
    setState("creating_wallet");
    setError(null);

    try {
      const res = await fetch("/api/wallet/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: session.userToken }),
      });
      const data = await res.json();

      if (data.code === 155106) {
        // Already initialized, load wallets
        await loadWallets(session.userToken);
        return;
      }

      if (data.challengeId && sdkRef.current) {
        // Execute wallet creation challenge
        sdkRef.current.setAuthentication({
          userToken: session.userToken,
          encryptionKey: session.encryptionKey,
        });

        sdkRef.current.execute(data.challengeId, (err: unknown) => {
          if (err) {
            setError("Wallet creation failed");
            setState("error");
            return;
          }
          // Wallet created, load it
          loadWallets(session.userToken);
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize");
      setState("error");
    }
  }, [session, loadWallets]);

  // Logout
  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setWallet(null);
    setBalances([]);
    setState("idle");
    setError(null);
  }, []);

  // Refresh balances
  const refreshBalances = useCallback(async () => {
    if (session?.userToken && wallet?.id) {
      await loadBalances(session.userToken, wallet.id);
    }
  }, [session, wallet, loadBalances]);

  // ── Phase 4.7: Execute a UCW challenge (e.g. approve) ──
  const executeChallenge = useCallback(
    (challengeId: string): Promise<{ error: unknown; result: unknown }> => {
      return new Promise((resolve) => {
        if (!sdkRef.current || !session?.userToken || !session?.encryptionKey) {
          resolve({ error: new Error("SDK not initialized or no session"), result: undefined });
          return;
        }

        sdkRef.current.setAuthentication({
          userToken: session.userToken,
          encryptionKey: session.encryptionKey,
        });

        sdkRef.current.execute(challengeId, (err: unknown, result: unknown) => {
          resolve({ error: err, result });
        });
      });
    },
    [session],
  );

  return {
    state,
    wallet,
    balances,
    error,
    isConnected: state === "connected" && !!wallet,
    /** User token for API calls (NOT the encryptionKey) */
    userToken: session?.userToken || null,
    loginWithGoogle,
    initializeUser,
    logout,
    refreshBalances,
    executeChallenge,
    clearError: () => setError(null),
  };
}
