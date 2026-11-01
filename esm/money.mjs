// Learning copy for the ESM exercise. The real one is lib/money.js
export const MAX_KOBO = 99900000000000;

export const isValidAmount = (kobo) => {
  if (typeof kobo !== "number") return false;

  return Number.isSafeInteger(kobo) && kobo >= 1 && kobo <= MAX_KOBO;
};
