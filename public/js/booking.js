document.addEventListener("DOMContentLoaded", () => {
  const checkInInput = document.getElementById("checkIn");
  const checkOutInput = document.getElementById("checkOut");
  const priceBreakdown = document.getElementById("priceBreakdown");
  const nightCalculationLabel = document.getElementById("nightCalculationLabel");
  const subtotalDisplay = document.getElementById("subtotalDisplay");
  const serviceFeeDisplay = document.getElementById("serviceFeeDisplay");
  const totalPriceDisplay = document.getElementById("totalPriceDisplay");

  if (!checkInInput || !checkOutInput || typeof listing === "undefined") return;

  const todayStr = new Date().toISOString().split("T")[0];
  checkInInput.min = todayStr;

  function updatePriceBreakdown() {
    const checkInVal = checkInInput.value;
    const checkOutVal = checkOutInput.value;

    if (checkInVal) {
      const minCheckOut = new Date(checkInVal);
      minCheckOut.setDate(minCheckOut.getDate() + 1);
      checkOutInput.min = minCheckOut.toISOString().split("T")[0];
    }

    if (!checkInVal || !checkOutVal) {
      priceBreakdown.classList.add("d-none");
      return;
    }

    const d1 = new Date(checkInVal);
    const d2 = new Date(checkOutVal);

    if (d2 <= d1) {
      priceBreakdown.classList.add("d-none");
      return;
    }

    const nights = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    if (nights < 1) {
      priceBreakdown.classList.add("d-none");
      return;
    }

    const pricePerNight = listing.price || 0;
    const subtotal = Math.round(pricePerNight * nights);
    const serviceFee = Math.round(subtotal * 0.10);
    const totalPrice = subtotal + serviceFee;

    const formattedPrice = pricePerNight.toLocaleString("en-IN");
    const formattedSubtotal = subtotal.toLocaleString("en-IN");
    const formattedFee = serviceFee.toLocaleString("en-IN");
    const formattedTotal = totalPrice.toLocaleString("en-IN");

    nightCalculationLabel.textContent = `₹${formattedPrice} × ${nights} ${nights === 1 ? "night" : "nights"}`;
    subtotalDisplay.textContent = `₹${formattedSubtotal}`;
    serviceFeeDisplay.textContent = `₹${formattedFee}`;
    totalPriceDisplay.textContent = `₹${formattedTotal}`;

    priceBreakdown.classList.remove("d-none");
  }

  checkInInput.addEventListener("change", updatePriceBreakdown);
  checkOutInput.addEventListener("change", updatePriceBreakdown);
});
