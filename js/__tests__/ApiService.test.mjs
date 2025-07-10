// __tests__/ApiService.test.mjs
// Test unitario para ApiService usando Jest

import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import ApiService from '../services/ApiService.js';

// Mock de appState para evitar efectos colaterales
jest.mock('../state/AppState.js', () => ({
    setLoading: jest.fn(),
    setChartData: jest.fn(),
    getInitialData: jest.fn(() => ({ periodo: 'semana', conta: 123 })),
    addError: jest.fn(),
    setInitialData: jest.fn(),
    getChartData: jest.fn(() => ({})),
}));

describe('ApiService', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debería obtener datos del dashboard correctamente', async () => {
        const mockResponse = {
            status: 'success',
            data: { periodo: 'semana', conta: 123, ls_periodos: { semana: 1, turno: 2, hora: 3 } }
        };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const result = await ApiService.getDashboardData('semana');
        expect(result.status).toBe('success');
        expect(result.data.periodo).toBe('semana');
        expect(fetch).toHaveBeenCalled();
    });

    it('debería manejar errores HTTP', async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 500 });
        const result = await ApiService.getDashboardData('semana');
        expect(result.status).toBe('error');
    });

    it('debería manejar excepciones de red', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));
        const result = await ApiService.getDashboardData('semana');
        expect(result.status).toBe('error');
    });
});
