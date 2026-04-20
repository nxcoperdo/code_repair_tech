document.addEventListener("DOMContentLoaded", () => {
  const introVideo = document.querySelector(".hero__video");
  const heroTag = document.querySelector(".hero__tag");
  const form = document.querySelector(".contact-form");
  const feedback = document.getElementById("form-feedback");
  const revealElements = document.querySelectorAll(".reveal");
  let isTicking = false;

  revealElements.forEach((element, index) => {
    const delay = Math.min(index * 90, 420);
    element.style.transitionDelay = `${delay}ms`;
  });

  const animateHeroTag = () => {
    if (!heroTag) {
      return;
    }

    const finalText = heroTag.dataset.text || heroTag.textContent || "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/{}[]()$#@!*+-=_";
    let frame = 0;

    heroTag.classList.add("is-scrambling");

    const tick = () => {
      const revealedCount = Math.floor(frame / 2);
      const scrambled = finalText
        .split("")
        .map((char, index) => {
          if (char === " ") {
            return " ";
          }

          if (index >= finalText.length - revealedCount) {
            return finalText[index];
          }

          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      heroTag.textContent = scrambled;
      frame += 1;

      if (revealedCount <= finalText.length) {
        window.requestAnimationFrame(tick);
        return;
      }

      heroTag.textContent = finalText;
      heroTag.classList.remove("is-scrambling");
      heroTag.classList.add("is-revealed");
    };

    tick();
  };

  const finishIntro = () => {
    document.body.classList.remove("intro-active");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animateHeroTag();
    }
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (heroTag) {
      heroTag.textContent = heroTag.dataset.text || heroTag.textContent;
      heroTag.classList.add("is-revealed");
    }
    finishIntro();
  } else if (introVideo) {
    introVideo.addEventListener("animationend", finishIntro, { once: true });
    setTimeout(finishIntro, 5200);
  } else {
    finishIntro();
  }

  const updateScrollBackground = () => {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(window.scrollY / maxScroll, 1);
    document.body.style.setProperty("--scroll-progress", progress.toFixed(3));
    isTicking = false;
  };

  window.addEventListener("scroll", () => {
    if (isTicking) {
      return;
    }

    isTicking = true;
    window.requestAnimationFrame(updateScrollBackground);
  }, { passive: true });

  updateScrollBackground();


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
      { threshold: 0.16 },
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

