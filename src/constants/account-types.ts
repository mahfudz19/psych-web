/**
 * Konstanta untuk Account Types
 * Digunakan untuk validasi dan perbandingan di seluruh aplikasi
 */

import type { AccountType } from "../types/user";

/**
 * Account type untuk user individu (B2C / Kandidat)
 * User dengan tipe ini akan diarahkan ke Portal area
 */
export const ACCOUNT_TYPE_INDIVIDUAL: AccountType = "INDIVIDUAL";

/**
 * Account type untuk user organisasi (B2B / HRD / Admin)
 * User dengan tipe ini akan diarahkan ke Dashboard area
 */
export const ACCOUNT_TYPE_ORGANIZATION: AccountType = "ORGANIZATION";

/**
 * Array berisi semua valid account types
 * Berguna untuk validasi dan type checking
 */
export const VALID_ACCOUNT_TYPES: AccountType[] = [
  ACCOUNT_TYPE_INDIVIDUAL,
  ACCOUNT_TYPE_ORGANIZATION,
];

/**
 * Helper function untuk mengecek apakah value adalah valid AccountType
 * @param value - Value yang akan dicek
 * @returns boolean - true jika valid AccountType
 */
export function isValidAccountType(value: string): value is AccountType {
  return VALID_ACCOUNT_TYPES.includes(value as AccountType);
}
