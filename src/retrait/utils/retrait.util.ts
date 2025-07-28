export enum ModeRetrait {
  MOBILE = 'MOBILE',
  AGENT = 'AGENT',
}

export const calculateFees = (amount: number, mode: ModeRetrait) => {
  const applyTranche = (amount: number, tranches: [number, number, number][]) => {
    for (const [min, max, taux] of tranches) {
      if (amount >= min && (amount <= max || max === Infinity)) {
        return amount * taux;
      }
    }
    return amount * 0.01;
  };

  const agentTranches: [number, number, number][] = [
    [0.1, 10, 0.07], [10.01, 20, 0.05], [20.01, 50, 0.028],
    [50.01, 400, 0.017], [400.01, 2500, 0.0099], [2500.01, Infinity, 0.01]
  ];

  const mobileTranches: [number, number, number][] = [
    [0.1, 10, 0.10], [10.01, 20, 0.08], [20.01, 50, 0.058],
    [50.01, 400, 0.047], [400.01, 2500, 0.0399], [2500.01, Infinity, 0.04]
  ];

  const selectedTranches = mode === ModeRetrait.MOBILE ? mobileTranches : agentTranches;
  const fee = applyTranche(amount, selectedTranches);

  return {
    amount,
    fees: parseFloat(fee.toFixed(2)),
    total: parseFloat((amount + fee).toFixed(2)),
    percentage: parseFloat((fee / amount * 100).toFixed(2))
  };
};

export const generateWithdrawalCode = (): string => {
  const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
  const letters = Array.from({ length: 6 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  return `${digits}${letters}`;
};

export const calculateExpiration = (hours = 6): Date => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
};
