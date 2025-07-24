let i = 0;
/** deterministic but unique-looking IDs for tests */
export const nanoid = () => `test-id-${++i}`;
