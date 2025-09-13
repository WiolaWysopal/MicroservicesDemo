/** Human‑readable library identifier. */
export const SHARED_INTERFACES_LIB_NAME = 'shared-interfaces' as const;

export function sharedInterfaces(): string {
    return SHARED_INTERFACES_LIB_NAME;
}