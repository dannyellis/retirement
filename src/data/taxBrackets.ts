import { Province } from '../types';

export interface TaxBracket {
  min: number;
  max: number; // Infinity for top bracket
  rate: number;
}

// 2026 Federal brackets
export const federalBrackets: TaxBracket[] = [
  { min: 0,       max: 58523,   rate: 0.14   },
  { min: 58523,   max: 117045,  rate: 0.205  },
  { min: 117045,  max: 181440,  rate: 0.26   },
  { min: 181440,  max: 258482,  rate: 0.29   },
  { min: 258482,  max: Infinity, rate: 0.33  },
];

export const federalBasicPersonalAmount = 16452; // 2026 (maximum; phases down to $14,829 above $181,440)
export const federalAgeAmount = 9208;            // 2026, reduced above $46,432
export const federalAgeAmountThreshold = 46432;
export const federalAgeAmountPhaseoutRate = 0.15;
export const federalPensionCreditMax = 2000;
export const federalPensionCreditRate = 0.14;   // reduced from 15% to 14% for 2026

// 2026 Provincial brackets (income tax only, excluding surtaxes/reductions for simplicity)
export const provincialBrackets: Record<Province, TaxBracket[]> = {
  AB: [
    { min: 0,       max: 61200,   rate: 0.08   },
    { min: 61200,   max: 154259,  rate: 0.10   },
    { min: 154259,  max: 185111,  rate: 0.12   },
    { min: 185111,  max: 246813,  rate: 0.13   },
    { min: 246813,  max: 370220,  rate: 0.14   },
    { min: 370220,  max: Infinity, rate: 0.15  },
  ],
  BC: [
    { min: 0,       max: 50363,   rate: 0.056  },
    { min: 50363,   max: 100728,  rate: 0.077  },
    { min: 100728,  max: 115648,  rate: 0.105  },
    { min: 115648,  max: 140430,  rate: 0.1229 },
    { min: 140430,  max: 190405,  rate: 0.147  },
    { min: 190405,  max: 265545,  rate: 0.168  },
    { min: 265545,  max: Infinity, rate: 0.205 },
  ],
  MB: [
    { min: 0,       max: 47000,   rate: 0.108  },
    { min: 47000,   max: 100000,  rate: 0.1275 },
    { min: 100000,  max: Infinity, rate: 0.174 },
  ],
  NB: [
    { min: 0,       max: 52333,   rate: 0.094  },
    { min: 52333,   max: 104666,  rate: 0.14   },
    { min: 104666,  max: 193861,  rate: 0.16   },
    { min: 193861,  max: Infinity, rate: 0.195 },
  ],
  NL: [
    { min: 0,       max: 44678,   rate: 0.087  },
    { min: 44678,   max: 89354,   rate: 0.145  },
    { min: 89354,   max: 159528,  rate: 0.158  },
    { min: 159528,  max: 223340,  rate: 0.178  },
    { min: 223340,  max: 285319,  rate: 0.198  },
    { min: 285319,  max: Infinity, rate: 0.208 },
  ],
  NS: [
    { min: 0,       max: 30995,   rate: 0.0879 },
    { min: 30995,   max: 61991,   rate: 0.1495 },
    { min: 61991,   max: 97417,   rate: 0.1667 },
    { min: 97417,   max: 157124,  rate: 0.175  },
    { min: 157124,  max: Infinity, rate: 0.21  },
  ],
  NT: [
    { min: 0,       max: 53003,   rate: 0.059  },
    { min: 53003,   max: 106009,  rate: 0.086  },
    { min: 106009,  max: 172346,  rate: 0.122  },
    { min: 172346,  max: Infinity, rate: 0.1405},
  ],
  NU: [
    { min: 0,       max: 55801,   rate: 0.04   },
    { min: 55801,   max: 111602,  rate: 0.07   },
    { min: 111602,  max: 181439,  rate: 0.09   },
    { min: 181439,  max: Infinity, rate: 0.115 },
  ],
  ON: [
    { min: 0,       max: 53891,   rate: 0.0505 },
    { min: 53891,   max: 107785,  rate: 0.0915 },
    { min: 107785,  max: 150000,  rate: 0.1116 },
    { min: 150000,  max: 220000,  rate: 0.1216 },
    { min: 220000,  max: Infinity, rate: 0.1316},
  ],
  PE: [
    { min: 0,       max: 33928,   rate: 0.095  },
    { min: 33928,   max: 65820,   rate: 0.1347 },
    { min: 65820,   max: 106890,  rate: 0.166  },
    { min: 106890,  max: 142250,  rate: 0.1762 },
    { min: 142250,  max: Infinity, rate: 0.19  },
  ],
  QC: [
    { min: 0,       max: 54345,   rate: 0.14   },
    { min: 54345,   max: 108680,  rate: 0.19   },
    { min: 108680,  max: 132245,  rate: 0.24   },
    { min: 132245,  max: Infinity, rate: 0.2575},
  ],
  SK: [
    { min: 0,       max: 54532,   rate: 0.105  },
    { min: 54532,   max: 155805,  rate: 0.125  },
    { min: 155805,  max: Infinity, rate: 0.145 },
  ],
  YT: [
    { min: 0,       max: 58523,   rate: 0.064  },
    { min: 58523,   max: 117045,  rate: 0.09   },
    { min: 117045,  max: 181440,  rate: 0.109  },
    { min: 181440,  max: 258482,  rate: 0.1293 },
    { min: 258482,  max: 500000,  rate: 0.128  },
    { min: 500000,  max: Infinity, rate: 0.15  },
  ],
};

export const provincialBasicPersonalAmounts: Record<Province, number> = {
  AB: 22769,  // 2026
  BC: 13216,  // 2026
  MB: 15780,  // 2026 (frozen at 2024 level)
  NB: 13664,  // 2026
  NL: 11188,  // 2026
  NS: 11932,  // 2026
  NT: 18198,  // 2026
  NU: 19659,  // 2026
  ON: 12989,  // 2026
  PE: 15000,  // 2026
  QC: 18952,  // 2026
  SK: 20381,  // 2026
  YT: 16452,  // 2026 (mirrors federal BPA)
};

// RRIF minimum withdrawal factors by age (CRA prescribed)
export const rrifMinimumFactors: Record<number, number> = {
  65: 0.0400, 66: 0.0417, 67: 0.0435, 68: 0.0453, 69: 0.0473,
  70: 0.0500, 71: 0.0528, 72: 0.0540, 73: 0.0553, 74: 0.0567,
  75: 0.0582, 76: 0.0598, 77: 0.0617, 78: 0.0636, 79: 0.0658,
  80: 0.0682, 81: 0.0708, 82: 0.0738, 83: 0.0771, 84: 0.0808,
  85: 0.0851, 86: 0.0899, 87: 0.0955, 88: 0.1021, 89: 0.1099,
  90: 0.1192, 91: 0.1306, 92: 0.1449, 93: 0.1634, 94: 0.1879,
  95: 0.2000,
};

// TFSA annual contribution room by calendar year
export const tfsaAnnualRoom: Record<number, number> = {
  2009: 5000, 2010: 5000, 2011: 5000, 2012: 5000, 2013: 5500,
  2014: 5500, 2015: 10000, 2016: 5500, 2017: 5500, 2018: 5500,
  2019: 6000, 2020: 6000, 2021: 6000, 2022: 6000, 2023: 6500,
  2024: 7000, 2025: 7000, 2026: 7000, 2027: 7000, 2028: 7000,
  2029: 7000, 2030: 7500, 2031: 7500, 2032: 7500, 2033: 7500,
  2034: 7500, 2035: 8000,
};

// OAS 2026 annual amounts
export const oasMonthlyAt65 = 742.31; // 2026
export const oasClawbackThreshold = 95323; // 2026
export const oasClawbackRate = 0.15;
export const oasMaxGrossup = 1.36; // max benefit at 70 (36% more than 65)

// CPP deferral adjustments
export const cppEarlyReductionPerMonth = 0.006;  // 0.6% per month before 65
export const cppLateIncreasePerMonth = 0.007;    // 0.7% per month after 65

// OAS deferral
export const oasDeferralIncreasePerMonth = 0.006; // 0.6% per month after 65
