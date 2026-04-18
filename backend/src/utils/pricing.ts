export const calculatePricing = (ticketPrice: number) => {
  const safeTicketPrice = Math.max(ticketPrice, 0);
  const serviceFee = safeTicketPrice === 0 ? 0 : Math.max(250, Math.round(safeTicketPrice * 0.075));
  const totalPaid = safeTicketPrice + serviceFee;
  const organizerShare = safeTicketPrice;
  const platformRevenue = serviceFee;

  return {
    ticketPrice: safeTicketPrice,
    serviceFee,
    totalPaid,
    organizerShare,
    platformRevenue
  };
};
