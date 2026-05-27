type Resolver = () => void;
let pending: Resolver | null = null;

export function createNavSignal(): Promise<void> {
  pending?.(); // resolve any stale signal before creating a new one
  return new Promise(r => { pending = r; });
}

export function resolveNavSignal(): void {
  pending?.();
  pending = null;
}
