import {
  oasMonthlyAt65,
  oasDeferralIncreasePerMonth,
  oasClawbackThreshold,
  oasClawbackRate,
} from '../data/taxBrackets';

/**
 * Annual OAS benefit before clawback, adjusted for deferral and residency.
 * @param startAge - 65 to 70
 * @param residencyYears - years of Canadian residency (40 = full benefit)
 */
export function calcAnnualOAS(startAge: number, residencyYears: number): number {
  const residencyFactor = Math.min(residencyYears, 40) / 40;
  const monthsDeferred = (startAge - 65) * 12;
  const deferralFactor = 1 + monthsDeferred * oasDeferralIncreasePerMonth;
  return oasMonthlyAt65 * 12 * residencyFactor * deferralFactor;
}

/**
 * OAS clawback (recovery tax) based on net income.
 * Returns the amount clawed back (reduces OAS dollar-for-dollar above threshold at 15%).
 */
export function calcOASClawback(grossOAS: number, netIncome: number): number {
  if (netIncome <= oasClawbackThreshold) return 0;
  const clawback = (netIncome - oasClawbackThreshold) * oasClawbackRate;
  return Math.min(clawback, grossOAS);
}
