const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080";

/**
 * Предсказание токсичности по SMILES коду молекулы
 * @param {string} smiles - SMILES код молекулы
 * @returns {Promise<Object>} - Объект с предсказанием токсичности
 */
export async function predictToxicity(smiles) {
    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ smiles }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                detail: `Ошибка сервера: ${response.status} ${response.statusText}`,
            }));

            throw new Error(errorData.detail || "Ошибка при получении предсказания");
        }

        return await response.json();
    } catch (error) {
        console.error("Ошибка API предсказания:", error);
        throw error;
    }
}

/**
 * Проверка доступности API
 * @returns {Promise<boolean>} - true если API доступен
 */
export async function checkApiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) return false;

        const data = await response.json();
        return data.status === "ok";
    } catch (error) {
        console.error("Ошибка проверки API:", error);
        return false;
    }
}