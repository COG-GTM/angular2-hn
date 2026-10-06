export interface User {
    id: string;
    /** Typo kept from the Angular model for parity. */
    crated_time?: number;
    created: string;
    karma: number;
    avg?: number;
    about?: string;
}
