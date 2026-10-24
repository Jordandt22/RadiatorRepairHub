/** Shared Motion variants for entrance animations. */

export const easeOut = [0.22, 1, 0.36, 1];

/** Hero load — slightly slower than a snap entrance */
export const heroFadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

/** Scroll-triggered fade-up (services, gallery) */
export const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

export const staggerContainer = (stagger = 0.1, delayChildren = 0.08) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const slideFromRight = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: easeOut },
  },
};

export const viewportOnce = { once: true, amount: 0.18 };
