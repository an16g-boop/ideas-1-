document.addEventListener("DOMContentLoaded", function () {
  const tiltElements = document.querySelectorAll(".box, .detail-image");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reduceMotion.matches) {
    return;
  }

  tiltElements.forEach(function (element) {
    element.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") {
        return;
      }

      const bounds = element.getBoundingClientRect();
      const horizontalPosition = (event.clientX - bounds.left) / bounds.width;
      const verticalPosition = (event.clientY - bounds.top) / bounds.height;

      element.style.setProperty(
        "--tilt-x",
        `${(0.5 - verticalPosition) * 12}deg`
      );
      element.style.setProperty(
        "--tilt-y",
        `${(horizontalPosition - 0.5) * 12}deg`
      );
    });

    element.addEventListener("pointerleave", function () {
      element.style.removeProperty("--tilt-x");
      element.style.removeProperty("--tilt-y");
    });
  });
});
