"use client";

import React from "react";
import { A11ySyncProvider, A11ySyncHUD, A11ySyncDrawer } from "@a11ysync/react";

export function A11ySyncClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <A11ySyncProvider options={{ speechEnabled: true, safeStopEnabled: true }}>
      {children}
      <A11ySyncHUD />
      <A11ySyncDrawer />
    </A11ySyncProvider>
  );
}
