import { AccumulationInputs, ScenarioInputs } from '../types';

const CURRENT_YEAR = 2026;

export interface AccumulationYearRow {
  year: number;
  age: number;
  rrsp: number;
  tfsa: number;
  nonReg: number;
  total: number;
  spouseAge?: number;
  spouseRrsp?: number;
  spouseTfsa?: number;
  spouseNonReg?: number;
  spouseTotal?: number;
}

export interface AccumulationResult {
  rows: AccumulationYearRow[];
  retirementRrsp: number;
  retirementTfsa: number;
  retirementNonReg: number;
  spouseRetirementRrsp: number;
  spouseRetirementTfsa: number;
  spouseRetirementNonReg: number;
  currentAge: number;
  yearsToRetirement: number;
}

export function defaultAccumulation(): AccumulationInputs {
  return {
    currentRrsp: 0,
    currentTfsa: 0,
    currentNonReg: 0,
    annualRrspContribution: 10000,
    annualTfsaContribution: 7000,
    annualNonRegContribution: 0,
    spouseCurrentRrsp: 0,
    spouseCurrentTfsa: 0,
    spouseCurrentNonReg: 0,
    spouseAnnualRrspContribution: 10000,
    spouseAnnualTfsaContribution: 7000,
    spouseAnnualNonRegContribution: 0,
  };
}

export function runAccumulation(scenario: ScenarioInputs): AccumulationResult {
  const { profile, spouse, hasSpouse, growthRates } = scenario;
  const acc = scenario.accumulation ?? defaultAccumulation();

  const currentAge = CURRENT_YEAR - profile.birthYear;
  const yearsToRetirement = profile.retirementAge - currentAge;

  const spouseCurrentAge = hasSpouse ? CURRENT_YEAR - spouse.birthYear : 0;
  const spouseYearsToRetirement = hasSpouse ? spouse.retirementAge - spouseCurrentAge : 0;

  if (yearsToRetirement <= 0) {
    return {
      rows: [],
      retirementRrsp: acc.currentRrsp,
      retirementTfsa: acc.currentTfsa,
      retirementNonReg: acc.currentNonReg,
      spouseRetirementRrsp: acc.spouseCurrentRrsp,
      spouseRetirementTfsa: acc.spouseCurrentTfsa,
      spouseRetirementNonReg: acc.spouseCurrentNonReg,
      currentAge,
      yearsToRetirement: 0,
    };
  }

  const rows: AccumulationYearRow[] = [];
  let rrsp = acc.currentRrsp;
  let tfsa = acc.currentTfsa;
  let nonReg = acc.currentNonReg;
  let spouseRrsp = acc.spouseCurrentRrsp;
  let spouseTfsa = acc.spouseCurrentTfsa;
  let spouseNonReg = acc.spouseCurrentNonReg;

  for (let i = 0; i < yearsToRetirement; i++) {
    // Balance grows first, then year-end contribution added
    rrsp = rrsp * (1 + growthRates.rrsp) + acc.annualRrspContribution;
    tfsa = tfsa * (1 + growthRates.tfsa) + acc.annualTfsaContribution;
    nonReg = nonReg * (1 + growthRates.nonReg) + acc.annualNonRegContribution;

    if (hasSpouse && i < spouseYearsToRetirement) {
      spouseRrsp = spouseRrsp * (1 + growthRates.rrsp) + acc.spouseAnnualRrspContribution;
      spouseTfsa = spouseTfsa * (1 + growthRates.tfsa) + acc.spouseAnnualTfsaContribution;
      spouseNonReg = spouseNonReg * (1 + growthRates.nonReg) + acc.spouseAnnualNonRegContribution;
    }

    const row: AccumulationYearRow = {
      year: CURRENT_YEAR + i + 1,
      age: currentAge + i + 1,
      rrsp,
      tfsa,
      nonReg,
      total: rrsp + tfsa + nonReg,
    };

    if (hasSpouse) {
      row.spouseAge = spouseCurrentAge + i + 1;
      row.spouseRrsp = spouseRrsp;
      row.spouseTfsa = spouseTfsa;
      row.spouseNonReg = spouseNonReg;
      row.spouseTotal = spouseRrsp + spouseTfsa + spouseNonReg;
    }

    rows.push(row);
  }

  return {
    rows,
    retirementRrsp: rrsp,
    retirementTfsa: tfsa,
    retirementNonReg: nonReg,
    spouseRetirementRrsp: spouseRrsp,
    spouseRetirementTfsa: spouseTfsa,
    spouseRetirementNonReg: spouseNonReg,
    currentAge,
    yearsToRetirement,
  };
}
