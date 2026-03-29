/**
 * Logic for calculating final user splits, admin extra and cashback
 * @param {Number} amount - The deposit amount
 * @param {Object} config - The system configuration from DB
 */
const calculateFinancials = (amount, config) => {
  // 1. Find custom rule if it exists
  const customRule = config.stockPlans.find(plan => plan.amount === amount);
  
  let userParts = [];
  let adminExtra = 0;
  let cashback = (amount * config.globalCashbackPercent) / 100;

  if (customRule && customRule.splitEnabled) {
    userParts = customRule.splitParts;
    adminExtra = customRule.adminExtra;
  } else {
    // Default Logic
    if (amount < 500) {
      userParts = [amount]; // No split
      adminExtra = 100;
    } else {
      // Amount >= 500
      userParts = [amount / 2, amount / 2]; // 50/50 split
      adminExtra = 100;
    }
  }

  // Check global toggles
  if (!config.adminExtraEnabled) adminExtra = 0;

  return {
    userParts,
    adminExtra,
    cashback
  };
};

module.exports = { calculateFinancials };
