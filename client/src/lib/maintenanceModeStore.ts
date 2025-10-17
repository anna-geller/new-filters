import type { MaintenanceState } from "@/types/maintenanceMode";

const STORAGE_KEY = "kestra-maintenance-mode";

type Listener = (state: MaintenanceState | null) => void;

let currentState: MaintenanceState | null = null;

if (typeof window !== "undefined") {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      currentState = JSON.parse(stored) as MaintenanceState;
    }
  } catch (error) {
    console.warn("Failed to read maintenance mode state", error);
  }
}

const listeners = new Set<Listener>();

function persist(state: MaintenanceState | null) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (state) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn("Failed to persist maintenance state", error);
  }
}

function notify() {
  listeners.forEach((listener) => {
    listener(currentState ? { ...currentState } : null);
  });
}

export function getMaintenanceState(): MaintenanceState | null {
  return currentState ? { ...currentState } : null;
}

export function setMaintenanceState(state: MaintenanceState | null): void {
  currentState = state ? { ...state } : null;
  persist(currentState);
  notify();
}

export function subscribeToMaintenanceState(listener: Listener): () => void {
  listeners.add(listener);
  listener(currentState ? { ...currentState } : null);
  return () => {
    listeners.delete(listener);
  };
}
