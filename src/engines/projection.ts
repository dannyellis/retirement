import { ScenarioInputs, YearlyProjection, ProjectionResult } from '../types';
import { calcAnnualCPP } from './cpp';
import { calcAnnualOAS, calcOASClawback } from './oas';
import { calcIncomeTax } from './tax';
import { rrifMinimumFactors } from '../data/taxBrackets';

const MAX_AGE = 95;

function getRRIFMinimum(balance: number, age: number): number {
  const factor = rrifMinimumFactors[Math.min(age, 95)] ?? 0.2;
  return balance * factor;
}

/**
 * Calculates the optimal pension income split amount.
 * Tries 41 fractions from −50% to +50% of the donor's eligible pension,
 * returning the amount that minimizes combined household tax.
 * Positive = primary donates to spouse. Negative = spouse donates to primary.
 */
function calcOptimalPensionSplit(
  primaryEligiblePension: number,
  spouseEligiblePension: number,
  primaryOtherIncome: number,
  spouseOtherIncome: number,
  province: import('../types').Province,
  primaryAge: number,
  spouseAge: number
): number {
  if (primaryEligiblePension === 0 && spouseEligiblePension === 0) return 0;

  let bestSplit = 0;
  let bestTax = Infinity;

  for (let i = -20; i <= 20; i++) {
    const fraction = i / 20;
    const splitAmount = fraction >= 0
      ? fraction * 0.5 * primaryEligiblePension
      : fraction * 0.5 * spouseEligiblePension;

    const pIncome = primaryOtherIncome + primaryEligiblePension - splitAmount;
    const sIncome = spouseOtherIncome + spouseEligiblePension + splitAmount;
    if (pIncome < 0 || sIncome < 0) continue;

    const { totalTax: pTax } = calcIncomeTax(pIncome, province, primaryAge, primaryEligiblePension - splitAmount);
    const { totalTax: sTax } = calcIncomeTax(sIncome, province, spouseAge, spouseEligiblePension + splitAmount);

    if (pTax + sTax < bestTax) {
      bestTax = pTax + sTax;
      bestSplit = splitAmount;
    }
  }

  return bestSplit;
}

/**
 * Given a person's existing taxable income, calculates how much extra RRSP to
 * withdraw to reach the inflation-adjusted meltdown target without exceeding it.
 */
function calcMeltdownExtra(
  existingTaxableIncome: number,
  targetToday: number,
  inflationFactor: number,
  rrspAvailable: number
): number {
  const adjustedTarget = targetToday * inflationFactor;
  const gap = adjustedTarget - existingTaxableIncome;
  if (gap <= 0 || rrspAvailable <= 0) return 0;
  return Math.min(gap, rrspAvailable);
}

export function runProjection(inputs: ScenarioInputs): ProjectionResult {
  const { profile, cpp, oas, accounts, growthRates, annualSpending, hasSpouse, meltdown } = inputs;
  const currentYear = new Date().getFullYear();
  const primaryBirthYear = profile.birthYear;

  let rrspBalance = accounts.rrsp;
  let tfsaBalance = accounts.tfsa;
  let nonRegBalance = accounts.nonReg;
  let spouseRrspBalance = hasSpouse ? inputs.spouseAccounts.rrsp : 0;
  let spouseTfsaBalance = hasSpouse ? inputs.spouseAccounts.tfsa : 0;
  let spouseNonRegBalance = hasSpouse ? (inputs.spouseAccounts.nonReg ?? 0) : 0;

  const projections: YearlyProjection[] = [];
  let depletionAge: number | undefined;
  let lifetimeAfterTaxIncome = 0;

  for (let age = profile.retirementAge; age <= MAX_AGE; age++) {
    const year = currentYear + (age - (currentYear - primaryBirthYear));
    const spouseAge = hasSpouse ? (primaryBirthYear + age) - inputs.spouse.birthYear : 0;
    const yearsInRetirement = age - profile.retirementAge;
    const inflationFactor = Math.pow(1 + growthRates.inflation, yearsInRetirement);

    // --- Grow accounts (capture growth for reporting) ---
    const rrspGrowth = rrspBalance * growthRates.rrsp;
    const tfsaGrowth = tfsaBalance * growthRates.tfsa;
    const nonRegGrowth = nonRegBalance * growthRates.nonReg;
    const spouseRrspGrowth = hasSpouse ? spouseRrspBalance * growthRates.rrsp : 0;
    const spouseTfsaGrowth = hasSpouse ? spouseTfsaBalance * growthRates.tfsa : 0;
    const spouseNonRegGrowth = hasSpouse ? spouseNonRegBalance * growthRates.nonReg : 0;
    rrspBalance += rrspGrowth;
    tfsaBalance += tfsaGrowth;
    nonRegBalance += nonRegGrowth;
    if (hasSpouse) {
      spouseRrspBalance += spouseRrspGrowth;
      spouseTfsaBalance += spouseTfsaGrowth;
      spouseNonRegBalance += spouseNonRegGrowth;
    }

    // --- Government income ---
    const cppIncome = age >= cpp.startAge
      ? calcAnnualCPP(cpp.estimatedMonthlyAt65, cpp.startAge) : 0;
    const grossOAS = age >= oas.startAge
      ? calcAnnualOAS(oas.startAge, oas.residencyYears) : 0;
    const employerPensionIncome = age >= accounts.employerPensionStartAge
      ? accounts.employerPension * 12 : 0;

    const spouseCPPIncome = hasSpouse && spouseAge >= inputs.spouseCPP.startAge
      ? calcAnnualCPP(inputs.spouseCPP.estimatedMonthlyAt65, inputs.spouseCPP.startAge) : 0;
    const spouseGrossOAS = hasSpouse && spouseAge >= inputs.spouseOAS.startAge
      ? calcAnnualOAS(inputs.spouseOAS.startAge, inputs.spouseOAS.residencyYears) : 0;
    const spouseEmployerPensionIncome = hasSpouse && spouseAge >= inputs.spouseAccounts.employerPensionStartAge
      ? inputs.spouseAccounts.employerPension * 12 : 0;

    // --- Spending ---
    const spending = annualSpending * inflationFactor;

    // --- Mandatory RRIF minimums ---
    const primaryIsRRIF = age >= 71;
    const spouseIsRRIF = hasSpouse && spouseAge >= 71;
    const primaryRRIFMin = primaryIsRRIF ? getRRIFMinimum(rrspBalance, age) : 0;
    const spouseRRIFMin = spouseIsRRIF ? getRRIFMinimum(spouseRrspBalance, spouseAge) : 0;

    let rrspWithdrawal = primaryRRIFMin;
    let spouseRrspWithdrawal = spouseRRIFMin;
    let nonRegWithdrawal = 0;
    let spouseNonRegWithdrawal = 0;
    let tfsaWithdrawal = 0;
    let spouseTfsaWithdrawal = 0;

    // --- Fill spending gap + meltdown extra ---
    // Order: non-reg → extra RRSP (gap fill + meltdown bracket fill) → TFSA (last resort)
    // TFSA is drawn last because it is the most tax-advantaged account to preserve.
    const totalGuaranteed =
      cppIncome + grossOAS + employerPensionIncome
      + spouseCPPIncome + spouseGrossOAS + spouseEmployerPensionIncome;
    let remaining = Math.max(0, spending - totalGuaranteed - rrspWithdrawal - spouseRrspWithdrawal);

    // 1. Non-registered (primary then spouse)
    if (remaining > 0 && nonRegBalance > 0) {
      nonRegWithdrawal = Math.min(remaining, nonRegBalance);
      remaining -= nonRegWithdrawal;
    }
    if (remaining > 0 && hasSpouse && spouseNonRegBalance > 0) {
      spouseNonRegWithdrawal = Math.min(remaining, spouseNonRegBalance);
      remaining -= spouseNonRegWithdrawal;
    }

    // 2. Extra RRSP (pre-71): covers gap fill AND meltdown bracket fill in one pass.
    //    Target is the larger of (spending gap) and (meltdown income target).
    let meltdownExtra = 0;
    let spouseMeltdownExtra = 0;

    if (!primaryIsRRIF && rrspBalance > rrspWithdrawal) {
      const existingTaxable = cppIncome + grossOAS + rrspWithdrawal
        + nonRegWithdrawal * 0.5 + employerPensionIncome;

      // How much RRSP is needed just to cover spending gap
      const gapDraw = remaining;

      // How much RRSP is needed to reach meltdown target (may be 0 if not enabled)
      const meltdownDraw = meltdown?.enabled
        ? calcMeltdownExtra(existingTaxable + gapDraw, meltdown.targetIncome, inflationFactor,
            rrspBalance - rrspWithdrawal - gapDraw)
        : 0;

      const totalExtra = Math.min(gapDraw + meltdownDraw, rrspBalance - rrspWithdrawal);
      rrspWithdrawal += totalExtra;
      meltdownExtra = Math.max(0, totalExtra - gapDraw);
      remaining = Math.max(0, remaining - (totalExtra - meltdownExtra));
    }

    if (hasSpouse && !spouseIsRRIF && spouseAge > 0 && spouseRrspBalance > spouseRrspWithdrawal) {
      const spouseExistingTaxable = spouseCPPIncome + spouseGrossOAS
        + spouseRrspWithdrawal + spouseEmployerPensionIncome;
      spouseMeltdownExtra = meltdown?.enabled
        ? calcMeltdownExtra(spouseExistingTaxable, meltdown.spouseTargetIncome, inflationFactor,
            spouseRrspBalance - spouseRrspWithdrawal)
        : 0;
      spouseRrspWithdrawal += spouseMeltdownExtra;
    }

    // 3. TFSA — only if gap still not covered after non-reg + RRSP
    if (remaining > 0 && tfsaBalance > 0) {
      tfsaWithdrawal = Math.min(remaining, tfsaBalance);
      remaining -= tfsaWithdrawal;
    }
    if (remaining > 0 && hasSpouse && spouseTfsaBalance > 0) {
      spouseTfsaWithdrawal = Math.min(remaining, spouseTfsaBalance);
      remaining -= spouseTfsaWithdrawal;
    }

    // --- Pension income eligible for credit / splitting ---
    const primaryEligiblePension = (age >= 65 ? rrspWithdrawal : 0) + employerPensionIncome;
    const spouseEligiblePension = hasSpouse
      ? (spouseAge >= 65 ? spouseRrspWithdrawal : 0) + spouseEmployerPensionIncome
      : 0;

    // --- Pension income splitting ---
    let pensionIncomeSplit = 0;
    if (hasSpouse && inputs.pensionIncomeSplitting && spouseAge > 0) {
      pensionIncomeSplit = calcOptimalPensionSplit(
        primaryEligiblePension,
        spouseEligiblePension,
        cppIncome + grossOAS + nonRegWithdrawal * 0.5,
        spouseCPPIncome + spouseGrossOAS,
        profile.province,
        age,
        spouseAge
      );
    }

    // --- Tax: primary ---
    const primaryTaxableIncome = cppIncome + grossOAS
      + (primaryEligiblePension - pensionIncomeSplit)
      + (pensionIncomeSplit < 0 ? -pensionIncomeSplit : 0)
      + nonRegWithdrawal * 0.5;
    const primaryPensionForCredit = Math.max(0, primaryEligiblePension - pensionIncomeSplit);
    const oasClawback = calcOASClawback(grossOAS, primaryTaxableIncome);
    const netOAS = grossOAS - oasClawback;
    const { federalTax, provincialTax } = calcIncomeTax(
      primaryTaxableIncome - oasClawback,
      profile.province,
      age,
      primaryPensionForCredit
    );

    // --- Tax: spouse ---
    let spouseFederalTax = 0;
    let spouseProvincialTax = 0;
    let spouseOASClawback = 0;
    let netSpouseOAS = spouseGrossOAS;

    if (hasSpouse && spouseAge > 0) {
      const spouseTaxableIncome = spouseCPPIncome + spouseGrossOAS
        + (spouseEligiblePension + pensionIncomeSplit)
        + (pensionIncomeSplit > 0 ? pensionIncomeSplit : 0);
      const spousePensionForCredit = spouseEligiblePension + Math.max(0, pensionIncomeSplit);
      spouseOASClawback = calcOASClawback(spouseGrossOAS, spouseTaxableIncome);
      netSpouseOAS = spouseGrossOAS - spouseOASClawback;
      const spouseTax = calcIncomeTax(
        spouseTaxableIncome - spouseOASClawback,
        profile.province,
        spouseAge,
        spousePensionForCredit
      );
      spouseFederalTax = spouseTax.federalTax;
      spouseProvincialTax = spouseTax.provincialTax;
    }

    const primaryTotalTax = federalTax + provincialTax;
    const spouseTotalTax = spouseFederalTax + spouseProvincialTax;
    const householdTax = primaryTotalTax + spouseTotalTax;

    const totalGrossIncome =
      cppIncome + netOAS + rrspWithdrawal + nonRegWithdrawal + tfsaWithdrawal + employerPensionIncome
      + spouseCPPIncome + netSpouseOAS + spouseRrspWithdrawal + spouseNonRegWithdrawal + spouseTfsaWithdrawal + spouseEmployerPensionIncome;

    const householdNetIncome = totalGrossIncome - householdTax;
    const surplus = householdNetIncome - spending;

    // --- Update balances ---
    rrspBalance = Math.max(0, rrspBalance - rrspWithdrawal);
    tfsaBalance = Math.max(0, tfsaBalance - tfsaWithdrawal);
    nonRegBalance = Math.max(0, nonRegBalance - nonRegWithdrawal);
    spouseRrspBalance = Math.max(0, spouseRrspBalance - spouseRrspWithdrawal);
    spouseTfsaBalance = Math.max(0, spouseTfsaBalance - spouseTfsaWithdrawal);
    spouseNonRegBalance = Math.max(0, spouseNonRegBalance - spouseNonRegWithdrawal);

    // Reinvest meltdown surplus into TFSA
    if (meltdown?.enabled && meltdown.reinvestInTFSA && surplus > 0) {
      // The surplus is the after-tax result of the meltdown draws above spending;
      // deposit it into TFSA (simplified: no contribution room enforcement)
      tfsaBalance += surplus;
    }

    lifetimeAfterTaxIncome += householdNetIncome;

    const allDepleted =
      rrspBalance <= 0 && tfsaBalance <= 0 && nonRegBalance <= 0
      && spouseRrspBalance <= 0 && spouseTfsaBalance <= 0 && spouseNonRegBalance <= 0;
    if (allDepleted && surplus < 0 && !depletionAge) {
      depletionAge = age;
    }

    projections.push({
      age,
      spouseAge,
      year,
      cppIncome,
      oasIncome: netOAS,
      oasClawback,
      employerPension: employerPensionIncome,
      rrspWithdrawal,
      meltdownRrspWithdrawal: meltdownExtra,
      tfsaWithdrawal,
      nonRegWithdrawal,
      rrspGrowth,
      tfsaGrowth,
      nonRegGrowth,
      spouseRrspGrowth,
      spouseTfsaGrowth,
      spouseNonRegGrowth,
      rrspBalance,
      tfsaBalance,
      nonRegBalance,
      federalTax,
      provincialTax,
      totalTax: primaryTotalTax,
      spouseCPP: spouseCPPIncome,
      spouseOAS: netSpouseOAS,
      spouseOASClawback,
      spouseEmployerPension: spouseEmployerPensionIncome,
      spouseRrspWithdrawal,
      spouseMeltdownRrspWithdrawal: spouseMeltdownExtra,
      spouseTfsaWithdrawal,
      spouseNonRegWithdrawal,
      spouseRrspBalance,
      spouseTfsaBalance,
      spouseNonRegBalance,
      pensionIncomeSplit,
      spouseFederalTax,
      spouseProvincialTax,
      spouseTotalTax,
      totalGrossIncome,
      householdTax,
      householdNetIncome,
      spending,
      surplus,
    });
  }

  return {
    scenarioId: inputs.id,
    label: inputs.label,
    projections,
    depletionAge,
    lifetimeAfterTaxIncome,
  };
}
