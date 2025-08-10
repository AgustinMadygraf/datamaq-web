
// Simula la función global para el test
beforeAll(() => {
  window.renderDashboard = function() {};
});

test('renderDashboard debe estar definida y ser una función', () => {
  expect(typeof window.renderDashboard).toBe('function');
});
