export interface User {
    id: string;
    /** Angular's model field name (sic). Kept for parity; the HNPWA API actually sends `created_time`. */
    crated_time?: number;
    created_time?: number;
    /** e.g. "20 years ago". */
    created: string;
    karma: number;
    avg?: number;
    /** HTML. Sanitize before rendering. */
    about?: string;
}
