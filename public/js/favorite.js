async function toggleWishlist(event, listingId) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const button = event ? event.currentTarget : null;
  if (!button || button.disabled) return;

  button.disabled = true;
  const icon = button.querySelector("i");

  try {
    const response = await fetch(`/wishlist/toggle/${listingId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (response.status === 401) {
      const data = await response.json();
      window.location.href = data.loginUrl || "/login";
      return;
    }

    const data = await response.json();

    if (data.success) {
      if (data.saved) {
        if (icon) {
          icon.className = "fa-solid fa-heart text-danger fs-5";
        }
        button.setAttribute("title", "Remove from wishlist");
        button.setAttribute("aria-label", "Remove from wishlist");
      } else {
        if (icon) {
          const isShowPage = button.classList.contains("show-fav-btn");
          icon.className = isShowPage
            ? "fa-regular fa-heart text-dark fs-5"
            : "fa-regular fa-heart text-white fs-5";
        }
        button.setAttribute("title", "Add to wishlist");
        button.setAttribute("aria-label", "Add to wishlist");

        // If removed on the wishlist page, fade out and remove card column
        if (window.location.pathname.startsWith("/wishlist")) {
          const cardCol = button.closest(".col");
          if (cardCol) {
            cardCol.style.transition = "all 0.3s ease";
            cardCol.style.opacity = "0";
            cardCol.style.transform = "scale(0.9)";
            setTimeout(() => {
              cardCol.remove();
              const remainingCards = document.querySelectorAll("#wishlistGrid .col");
              if (!remainingCards || remainingCards.length === 0) {
                const emptyContainer = document.getElementById("wishlistEmptyState");
                if (emptyContainer) emptyContainer.classList.remove("d-none");
              }
            }, 300);
          }
        }
      }
    } else {
      console.error("Wishlist error:", data.error);
    }
  } catch (err) {
    console.error("Network or wishlist toggle failure:", err);
  } finally {
    button.disabled = false;
  }
}
