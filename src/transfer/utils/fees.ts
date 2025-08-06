
const feeTiers = [
  { max: 5, rate: 0.15 },
  { max: 10, rate: 0.1 },
  { max: 20, rate: 0.095 },
  { max: 50, rate: 0.085 },
  { max: 100, rate: 0.065 },
  { max: 200, rate: 0.055 },
  { max: 500, rate: 0.045 },
  { max: 1000, rate: 0.035 },
  { max: 1500, rate: 0.025 },
  { max: 2000, rate: 0.015 },
  { max: 2500, rate: 0.01 },
  { max: 3000, rate: 0.0095 },
  { max: 3500, rate: 0.0085 },
  { max: 4000, rate: 0.0075 },
  { max: 4500, rate: 0.0065 },
  { max: 5000, rate: 0.0055 },
  { max: 5500, rate: 0.0045 },
  { max: 6000, rate: 0.0035 },
  { max: 6500, rate: 0.0025 },
  { max: 7000, rate: 0.0015 },
  { max: 7500, rate: 0.001 },
];

export const calculateTransferFee = (amount: number): number => {
  for (const tier of feeTiers) {
    if (amount < tier.max) {
      return Math.round(amount * tier.rate * 100) / 100;
    }
  }
  // Au-delà de 7500, frais nuls
  return 0;
};
