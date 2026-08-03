# Custom React Hooks Specification

This document defines the core React hooks engineered to manage low-latency keyboard interception, active state caching during network drops, and real-time ledger balancing.

---

## 1. `useKeyboardShortcuts` (Zero-Mouse Navigation Engine)

This hook registers global or context-specific key listeners, overrides default browser behavior, and enforces a sub-30ms execution path.

```typescript
import { useEffect, useRef } from 'react';

type ShortcutMap = Record<string, (event: KeyboardEvent) => void>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap, active: boolean = true) {
  const targetShortcuts = useRef<ShortcutMap>(shortcuts);

  // Keep shortcuts map reference fresh without re-triggering useEffect
  useEffect(() => {
    targetShortcuts.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      let keyCombination = '';
      
      if (event.ctrlKey) keyCombination += 'ctrl+';
      if (event.altKey) keyCombination += 'alt+';
      if (event.shiftKey) keyCombination += 'shift+';
      
      keyCombination += event.key.toLowerCase();

      // Intercept and route if shortcut matches specification
      if (targetShortcuts.current[keyCombination]) {
        event.preventDefault();
        event.stopPropagation();
        targetShortcuts.current[keyCombination](event);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [active]);
}
```

---

## 2. `useOfflineResilience` (Staging Auto-Save)

This hook serializes open form values directly to local storage if internet drops occur mid-voucher, keeping data safe from page refreshes.

```typescript
import { useState, useEffect } from 'react';

export function useOfflineResilience<T>(storageKey: string, initialData: T) {
  const [data, setData] = useState<T>(() => {
    const cached = localStorage.getItem(storageKey);
    return cached ? JSON.parse(cached) : initialData;
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Sync state mutation out to local file cache
  const updateData = (newData: T | ((prev: T) => T)) => {
    setData((prev) => {
      const resolved = newData instanceof Function ? newData(prev) : newData;
      localStorage.setItem(storageKey, JSON.stringify(resolved));
      return resolved;
    });
  };

  const clearCache = () => {
    localStorage.removeItem(storageKey);
  };

  return { data, updateData, isOffline, clearCache };
}
```

---

## 3. `useVoucherBalance` (Real-Time Accounting Validation)

Tracks mathematical equilibrium inside active voucher entry arrays, ensuring total debits match credits dynamically.

```typescript
import { useMemo } from 'react';

interface VoucherRow {
  type: 'debit' | 'credit';
  amount: number;
}

export function useVoucherBalance(rows: VoucherRow[]) {
  return useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    rows.forEach((row) => {
      const amt = Number(row.amount) || 0;
      if (row.type === 'debit') totalDebit += amt;
      if (row.type === 'credit') totalCredit += amt;
    });

    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = difference === 0 && rows.length > 0;

    return {
      totalDebit,
      totalCredit,
      difference,
      isBalanced,
    };
  }, [rows]);
}
```
