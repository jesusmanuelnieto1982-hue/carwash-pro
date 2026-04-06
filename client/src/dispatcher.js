export const dispatcherLogic = {
  // Configuración de costos para Nieto Sync
  costs: {
    avgDieselPrice: 3.85,
    mpg: 18,
    insurancePerMile: 0.15,
    maintenancePerMile: 0.1,
  },

  calculateNetProfit: (amount, miles) => {
    const numAmount = parseFloat(amount) || 0;
    const numMiles = parseFloat(miles) || 0;

    const fuelCost =
      (numMiles / dispatcherLogic.costs.mpg) *
      dispatcherLogic.costs.avgDieselPrice;
    const operationalCosts =
      numMiles *
      (dispatcherLogic.costs.insurancePerMile +
        dispatcherLogic.costs.maintenancePerMile);
    const totalExpenses = fuelCost + operationalCosts;

    return {
      net: numAmount - totalExpenses,
      expenses: totalExpenses,
      rpm: numMiles > 0 ? numAmount / numMiles : 0, // Rate Per Mile
    };
  },
};
