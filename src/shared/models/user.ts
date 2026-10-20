/**
 * User profile as returned by HNPWA `https://api.hnpwa.com/v0/user/{id}.json`
 * (Angular's model, `src/app/shared/models/user.ts`, declared `id`, `crated_time` (sic), `karma`, `about`, `avg`; HNPWA actually sends `created_time` + `created`).
 */
export interface User {
    id: string;
    /** Unix seconds. */
    created_time: number;
    /** Human readable, e.g. `"13 years ago"`. */
    created: string;
    karma: number;
    avg?: number;
    /** HTML: render via `sanitizeHtml`. */
    about?: string;
}
