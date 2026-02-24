/**
 * Dashboard Utility Functions
 * 
 * Centralized logic for data generation and processing to keep 
 * the UI components focused on rendering.
 */

/**
 * Generates a historical data set for charts.
 * @param days Number of days to generate
 */
export function generateHistory(days: number) {
    const data = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - (days - 1 - i));

        data.push({
            date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            ok: Math.floor(Math.random() * 8) + 12, // Stable success rate
            falha: Math.floor(Math.random() * 2),   // Minimal failures
        });
    }
    return data;
}

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const HOURS = ['00h', '04h', '08h', '12h', '16h', '20h'];

/**
 * Generates activity heatmap data.
 */
export function generateHeatmap() {
    return WEEK_DAYS.map((day) => ({
        day,
        hours: HOURS.map((hour) => ({
            hour,
            value: Math.floor(Math.random() * 6),
        })),
    }));
}

/**
 * Standard fetcher for SWR.
 */
export const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('Erro ao carregar dados do servidor');
        // Attach extra info to the error object.
        (error as any).info = await res.json();
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};
