export const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const totalAmtToBePaid = (investment) => {
  // here we can keep 5% or any number
  // return investment + 0.05*investment
  return investment;
}

export const getReturnAmount = (investment, stackFactor) => {
  return investment*stackFactor;
}
