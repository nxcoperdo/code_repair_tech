document.addEventListener("DOMContentLoaded", () => {
  const introVideo = document.querySelector(".hero__video");
  const form = document.querySelector(".contact-form");
  const feedback = document.getElementById("form-feedback");
  const revealElements = document.querySelectorAll(".reveal");

  const finishIntro = () => {
    document.body.classList.remove("intro-active");
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishIntro();
  } else if (introVideo) {
    introVideo.addEventListener("animationend", finishIntro, { once: true });
    setTimeout(finishIntro, 5200);
  } else {
    finishIntro();
  }


  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.2 },
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  if (!form || !feedback) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    feedback.textContent = "Nuestro equipo analizará tu caso y te contactará para una videollamada";
    feedback.hidden = false;
    form.reset();
  });
});

