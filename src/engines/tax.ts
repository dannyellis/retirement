import { Province } from '../types';
import {
  federalBrackets,
  provincialBrackets,
  federalBasicPersonalAmount,
  federalAgeAmount,
  federalAgeAmountThreshold,
  federalAgeAmountPhaseoutRate,
  federalPensionCreditMax,
  federalPensionCreditRate,
  provincialBasicPersonalAmounts,
} from '../data/taxBrackets';

function applyBrackets(income: number, brackets: { min: number; max: number; rate: number }[]): number {
  let tax = 0;
  for (const b of brackets) {
    if (income <= b.min) break;
    const taxable = Math.min(income, b.max) - b.min;
    tax += taxable * b.rate;
  }
  return tax;
}

export interface TaxResult {
  federalTax: number;
  provincialTax: number;
  totalTax: number;
  marginalFederalRate: number;
  effectiveRate: number;
}

/**
 * Calculates combined federal + provincial income tax.
 * @param income - total taxable income (RRSP/RRIF withdrawals, CPP, OAS, eligible dividends grossed up, etc.)
 * @param province
 * @param age - for age amount credit
 * @param pensionIncome - eligible pension income for pension income credit (RRIF, annuity, DB pension ≥65)
 */
export function calcIncomeTax(
  income: number,
  province: Province,
  age: number,
  pensionIncome: number = 0
): TaxResult {
  if (income <= 0) {
    return { federalTax: 0, provincialTax: 0, totalTax: 0, marginalFederalRate: 0, effectiveRate: 0 };
  }

  // --- Federal ---
  let federalTax = applyBrackets(income, federalBrackets);

  // Basic personal amount credit
  federalTax -= federalBasicPersonalAmount * 0.15;

  // Age amount credit (age ≥ 65)
  if (age >= 65) {
    const reduction = Math.max(0, (income - federalAgeAmountThreshold) * federalAgeAmountPhaseoutRate);
    const ageAmount = Math.max(0, federalAgeAmount - reduction);
    federalTax -= ageAmount * 0.15;
  }

  // Pension income credit (up to $2,000 at 15%)
  if (age >= 65 && pensionIncome > 0) {
    federalTax -= Math.min(pensionIncome, federalPensionCreditMax) * federalPensionCreditRate;
  }

  federalTax = Math.max(0, federalTax);

  // --- Provincial ---
  const provBrackets = provincialBrackets[province];
  let provincialTax = applyBrackets(income, provBrackets);
  provincialTax -= provincialBasicPersonalAmounts[province] * provBrackets[0].rate;
  provincialTax = Math.max(0, provincialTax);

  const totalTax = federalTax + provincialTax;

  // Marginal federal rate
  const marginalFederalRate = federalBrackets.find(
    (b) => income > b.min && income <= b.max
  )?.rate ?? federalBrackets[federalBrackets.length - 1].rate;

  return {
    federalTax,
    provincialTax,
    totalTax,
    marginalFederalRate,
    effectiveRate: income > 0 ? totalTax / income : 0,
  };
}
