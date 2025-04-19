async function expectToastVisibility(shouldBeVisible, toastComponent) {
  expect(
    await toastComponent.evaluate((el) => el.classList.contains('show')),
  ).toBe(shouldBeVisible);
  expect(
    await toastComponent.evaluate((el) => el.classList.contains('hide')),
  ).toBe(!shouldBeVisible);
}

module.exports = {
  expectToastVisibility,
};
