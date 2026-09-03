/**
 * Dynamic billing calculator for service bookings.
 *
 * serviceCharge = sum of selected repair service charges
 * spareCharge   = sum of (spare part price * quantity)
 * tax           = (visiting + service + spare) * taxRate%
 * totalAmount   = visiting + service + spare + tax
 *
 * Returns normalized spare line items (with computed `amount`) alongside totals.
 */
export const calculateBill = ({
  repairServices = [],
  spareParts = [],
  visitingCharge = 0,
  taxRate = 18,
}) => {
  const serviceCharge = repairServices.reduce(
    (sum, r) => sum + (Number(r.charge) || 0),
    0
  );

  const spareLines = spareParts.map((s) => {
    const price = Number(s.price) || 0;
    const quantity = Math.max(1, Number(s.quantity) || 1);
    return { ...s, price, quantity, amount: price * quantity };
  });

  const spareCharge = spareLines.reduce((sum, s) => sum + s.amount, 0);

  const taxable = Number(visitingCharge || 0) + serviceCharge + spareCharge;
  const tax = Math.round((taxable * (Number(taxRate) || 0)) / 100 * 100) / 100;
  const totalAmount = Math.round((taxable + tax) * 100) / 100;

  return {
    visitingCharge: Number(visitingCharge) || 0,
    serviceCharge,
    spareCharge,
    taxRate: Number(taxRate) || 0,
    tax,
    totalAmount,
    spareLines,
  };
};
