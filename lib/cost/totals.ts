export type CostLine = {
  budget: number;
  committed: number;
  actual: number;
};

export type CostTotals = {
  budget: number;
  committed: number;
  actual: number;
  variance: number;
};

export function summarizeCostLines(rows: CostLine[]): CostTotals {
  const totals = rows.reduce(
    (sum, row) => {
      sum.budget += row.budget;
      sum.committed += row.committed;
      sum.actual += row.actual;
      return sum;
    },
    { budget: 0, committed: 0, actual: 0 },
  );

  return {
    budget: roundMoney(totals.budget),
    committed: roundMoney(totals.committed),
    actual: roundMoney(totals.actual),
    variance: roundMoney(totals.budget - totals.actual),
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
