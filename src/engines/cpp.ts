import { cppEarlyReductionPerMonth, cppLateIncreasePerMonth } from '../data/taxBrackets';

/**
 * Calculates the annual CPP benefit given a start age.
 * @param estimatedMonthlyAt65 - Service Canada estimate at age 65
 * @param startAge - age at which CPP begins (60–70)
 */
export function calcAnnualCPP(estimatedMonthlyAt65: number, startAge: number): number {
  const monthsFromBase = (startAge - 65) * 12;
  let factor: number;

  if (monthsFromBase < 0) {
    // Early: reduce by 0.6% per month before 65
    factor = 1 + monthsFromBase * cppEarlyReductionPerMonth;
  } else {
    // Late: increase by 0.7% per month after 65
    factor = 1 + monthsFromBase * cppLateIncreasePerMonth;
  }

  return estimatedMonthlyAt65 * factor * 12;
}

/**
 * Returns the break-even age between two CPP start ages (approximately).
 * Useful for showing "at what age does deferring pay off".
 */
export function cppBreakEvenAge(
  estimatedMonthlyAt65: number,
  earlyAge: number,
  lateAge: number
): number {
  const earlyAnnual = calcAnnualCPP(estimatedMonthlyAt65, earlyAge);
  const lateAnnual = calcAnnualCPP(estimatedMonthlyAt65, lateAge);

  const earlyTotal = (age: number) => earlyAnnual * Math.max(0, age - earlyAge);
  const lateTotal = (age: number) => lateAnnual * Math.max(0, age - lateAge);

  // Binary search for break-even
  for (let age = lateAge; age <= 100; age++) {
    if (lateTotal(age) >= earlyTotal(age)) return age;
  }
  return 100;
}
