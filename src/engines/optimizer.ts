import { ScenarioInputs, OptimizationResult } from '../types';
import { runProjection } from './projection';

/**
 * Brute-force grid search over CPP/OAS start ages for both primary and spouse
 * to find the combination maximizing lifetime household after-tax income.
 */
export function optimizeCPPOAS(baseInputs: ScenarioInputs): OptimizationResult {
  let best: OptimizationResult = {
    bestCppStartAge: 65,
    bestOasStartAge: 65,
    bestSpouseCppStartAge: 65,
    bestSpouseOasStartAge: 65,
    lifetimeAfterTaxIncome: -Infinity,
  };

  const spouseCPPAges = baseInputs.hasSpouse ? [60,61,62,63,64,65,66,67,68,69,70] : [65];
  const spouseOASAges = baseInputs.hasSpouse ? [65,66,67,68,69,70] : [65];

  for (let cppAge = 60; cppAge <= 70; cppAge++) {
    for (let oasAge = 65; oasAge <= 70; oasAge++) {
      for (const sCppAge of spouseCPPAges) {
        for (const sOasAge of spouseOASAges) {
          const inputs: ScenarioInputs = {
            ...baseInputs,
            cpp: { ...baseInputs.cpp, startAge: cppAge },
            oas: { ...baseInputs.oas, startAge: oasAge },
            spouseCPP: { ...baseInputs.spouseCPP, startAge: sCppAge },
            spouseOAS: { ...baseInputs.spouseOAS, startAge: sOasAge },
          };
          const result = runProjection(inputs);
          if (result.lifetimeAfterTaxIncome > best.lifetimeAfterTaxIncome) {
            best = {
              bestCppStartAge: cppAge,
              bestOasStartAge: oasAge,
              bestSpouseCppStartAge: sCppAge,
              bestSpouseOasStartAge: sOasAge,
              lifetimeAfterTaxIncome: result.lifetimeAfterTaxIncome,
            };
          }
        }
      }
    }
  }

  return best;
}
