export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

export type Result<T, E = string> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
}

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <T, E = string>(error: E): Result<T, E> => ({ ok: false, error });