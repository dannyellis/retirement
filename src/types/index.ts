export type Province =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU'
  | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export interface Profile {
  name: string;
  birthYear: number;
  province: Province;
  retirementAge: number;
}

export interface SpouseProfile {
  name: string;
  birthYear: number;
  retirementAge: number;
  // Shares province with primary for tax purposes
}

export interface CPPInputs {
  /** Estimated monthly benefit at age 65 (from Service Canada statement) */
  estimatedMonthlyAt65: number;
  startAge: number; // 60–70
}

export interface OASInputs {
  startAge: number; // 65–70
  /** Years of Canadian residency (partial OAS if < 40) */
  residencyYears: number;
}

export interface AccountBalances {
  rrsp: number;
  tfsa: number;
  nonReg: number;
  /** DB/DC pension: monthly amount starting at pensionStartAge */
  employerPension: number;
  employerPensionStartAge: number;
}

export interface SpouseAccountBalances {
  rrsp: number;
  tfsa: number;
  nonReg: number;
  /** DB/DC pension: monthly amount starting at pensionStartAge */
  employerPension: number;
  employerPensionStartAge: number;
}

export interface GrowthRates {
  rrsp: number;   // annual rate, e.g. 0.05
  tfsa: number;
  nonReg: number;
  /** Inflation for CPP/OAS indexing and expense growth */
  inflation: number;
}

export interface MeltdownSettings {
  enabled: boolean;
  /**
   * Target annual gross taxable income for the primary person during meltdown years (today's dollars).
   * The engine draws extra RRSP to bring taxable income up to this level.
   * Common choices: $55,867 (top of 1st federal bracket), $90,997 (OAS clawback threshold), $111,733 (top of 2nd bracket).
   */
  targetIncome: number;
  /** Same target for the spouse's RRSP meltdown (if hasSpouse). */
  spouseTargetIncome: number;
  /** Reinvest after-tax meltdown surplus into TFSA each year. */
  reinvestInTFSA: boolean;
}

export interface ScenarioInputs {
  id: string;
  label: string;
  profile: Profile;
  cpp: CPPInputs;
  oas: OASInputs;
  accounts: AccountBalances;
  growthRates: GrowthRates;
  /** Annual household spending in retirement (today's dollars) */
  annualSpending: number;

  // Spouse
  hasSpouse: boolean;
  spouse: SpouseProfile;
  spouseCPP: CPPInputs;
  spouseOAS: OASInputs;
  spouseAccounts: SpouseAccountBalances;
  /** Elect T1032 pension income splitting (up to 50% of eligible pension income) */
  pensionIncomeSplitting: boolean;
  meltdown: MeltdownSettings;
}

export interface YearlyProjection {
  age: number;          // primary person's age
  spouseAge: number;    // spouse's age (0 if no spouse)
  year: number;

  // Primary income (pre-tax, pre-split)
  cppIncome: number;
  oasIncome: number;        // net of clawback
  oasClawback: number;
  employerPension: number;
  rrspWithdrawal: number;        // total (mandatory minimum + meltdown extra + gap fill)
  meltdownRrspWithdrawal: number; // portion that is purely the meltdown extra draw
  tfsaWithdrawal: number;
  nonRegWithdrawal: number;

  // Account growth (interest/returns earned during the year, before withdrawals)
  rrspGrowth: number;
  tfsaGrowth: number;
  nonRegGrowth: number;
  spouseRrspGrowth: number;
  spouseTfsaGrowth: number;
  spouseNonRegGrowth: number;

  // Primary account balances (end of year, after growth and withdrawals)
  rrspBalance: number;
  tfsaBalance: number;
  nonRegBalance: number;

  // Primary tax (after pension splitting)
  federalTax: number;
  provincialTax: number;
  totalTax: number;

  // Spouse income (pre-tax, pre-split)
  spouseCPP: number;
  spouseOAS: number;        // net of clawback
  spouseOASClawback: number;
  spouseEmployerPension: number;
  spouseRrspWithdrawal: number;
  spouseMeltdownRrspWithdrawal: number;
  spouseTfsaWithdrawal: number;
  spouseNonRegWithdrawal: number;

  // Spouse balances
  spouseRrspBalance: number;
  spouseTfsaBalance: number;
  spouseNonRegBalance: number;

  // Pension income split amount (positive = shifted from primary to spouse)
  pensionIncomeSplit: number;

  // Spouse tax (after pension splitting)
  spouseFederalTax: number;
  spouseProvincialTax: number;
  spouseTotalTax: number;

  // Household totals
  totalGrossIncome: number;
  householdTax: number;
  householdNetIncome: number;
  spending: number;
  surplus: number;
}

export interface ProjectionResult {
  scenarioId: string;
  label: string;
  projections: YearlyProjection[];
  /** Age (primary) at which accounts are depleted (undefined if never) */
  depletionAge?: number;
  /** Sum of household after-tax income over projection period */
  lifetimeAfterTaxIncome: number;
}

export interface OptimizationResult {
  bestCppStartAge: number;
  bestOasStartAge: number;
  bestSpouseCppStartAge: number;
  bestSpouseOasStartAge: number;
  lifetimeAfterTaxIncome: number;
}
