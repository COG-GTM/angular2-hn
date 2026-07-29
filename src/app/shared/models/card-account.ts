export type CardAccountStatus = 'active' | 'frozen' | 'closed';

export interface CardAccount {
    id: string;
    productName: string;
    cardholderName: string;
    /** Last four digits of the card number — the full PAN never leaves the backend. */
    last4: string;
    network: 'visa' | 'mastercard' | 'amex' | 'discover';
    currency: string;
    currentBalance: number;
    statementBalance: number;
    creditLimit: number;
    availableCredit: number;
    /** ISO-8601 date of the next payment due date. */
    paymentDueDate: string;
    status: CardAccountStatus;
}
