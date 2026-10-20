export interface User {
    id: string;
    /** Unix seconds. Angular's model misspelled this `crated_time`; the HNPWA API returns `created_time`. */
    created_time: number;
    /** Pre-formatted by the API (e.g. "20 years ago"). */
    created: string;
    karma: number;
    avg?: number;
    /** HTML. Sanitize before rendering. */
    about?: string;
}
