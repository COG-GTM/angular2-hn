export interface User {
    id: string;
    crated_time: number;
    created: string;
    karma: number;
    avg: number;
    about: string;
    // The HNPWA API spells it correctly.
    created_time?: number;
}
