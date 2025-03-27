import React, { useState } from 'react';
import MoleculeInput from './MoleculeInput/MoleculeInput';
import MoleculeVisualization from './MoleculeVisualization/MoleculeVisualization';
import PredictionResult from './PredictionResult/PredictionResult';
import './MoleculePredictor.css';

const MoleculePredictor = () => {
    const [moleculeName, setMoleculeName] = useState('');
    const [predictedValue, setPredictedValue] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [predictionHistory, setPredictionHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    // Функция для предсказания токсичности
    const predictToxicity = () => {
        if (!moleculeName.trim()) return;

        setIsLoading(true);

        // Имитация API-запроса
        setTimeout(() => {
            // Случайное значение между 1-1000 мг/кг для демонстрации
            const randomLD50 = Math.floor(Math.random() * 1000) + 1;
            setPredictedValue(randomLD50);
            setIsLoading(false);

            // Добавляем в историю
            setPredictionHistory(prev => [
                {
                    smiles: moleculeName,
                    ld50: randomLD50,
                    timestamp: new Date().toLocaleTimeString()
                },
                ...prev.slice(0, 4) // Храним только 5 последних результатов
            ]);
        }, 1500);
    };

    // Экспорт результата в CSV
    const exportResult = () => {
        if (!predictedValue) return;

        const csvContent = `SMILES,LD50 (mg/kg)\n${moleculeName},${predictedValue}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', 'toxicity_prediction.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="predictor-container">
            <div className="predictor-card">
                <h1 className="predictor-header">MOLECULAR PREDICTOR OF TOXICITY</h1>

                <div className="predictor-content">
                    {/* Левая колонка - Ввод и кнопка предсказания */}
                    <div className="predictor-input-column">
                        <div className="input-label">MoleculeAI</div>
                        <MoleculeInput
                            moleculeName={moleculeName}
                            setMoleculeName={setMoleculeName}
                        />

                        <div className="button-group">
                            <button
                                className={`predictor-button ${isLoading || !moleculeName.trim() ? 'predictor-button-disabled' : ''}`}
                                onClick={predictToxicity}
                                disabled={isLoading || !moleculeName.trim()}
                            >
                                {isLoading ? (
                                    <div className="spinner-container">
                                        <div className="spinner"></div>
                                        <span>PREDICTING</span>
                                    </div>
                                ) : 'PREDICT'}
                            </button>

                            {predictedValue !== null && (
                                <button
                                    className="secondary-button"
                                    onClick={exportResult}
                                >
                                    EXPORT
                                </button>
                            )}
                        </div>

                        {predictedValue !== null && (
                            <PredictionResult value={predictedValue} />
                        )}

                        {/* История предсказаний */}
                        {predictionHistory.length > 0 && (
                            <div className="history-section">
                                <div
                                    className="history-header"
                                    onClick={() => setShowHistory(!showHistory)}
                                >
                                    <span>Recent Predictions</span>
                                    <span className="toggle-icon">{showHistory ? '▲' : '▼'}</span>
                                </div>

                                {showHistory && (
                                    <div className="history-list">
                                        {predictionHistory.map((item, index) => (
                                            <div key={index} className="history-item">
                                                <div className="history-item-smiles truncate">{item.smiles}</div>
                                                <div className="history-item-value">
                                                    <span className={`toxicity-badge ${
                                                        item.ld50 < 50 ? 'high' :
                                                            item.ld50 < 500 ? 'medium' : 'low'
                                                    }`}></span>
                                                    {item.ld50} mg/kg
                                                </div>
                                                <div className="history-item-time">{item.timestamp}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Правая колонка - Визуализация молекулы */}
                    <div className="predictor-visual-column">
                        <MoleculeVisualization moleculeName={moleculeName} />
                    </div>
                </div>

                <div className="predictor-footer">
                    <p>This is a predictive tool only. Results should be verified by laboratory testing.</p>
                    <p className="version-info">v1.1.0</p>
                </div>
            </div>
        </div>
    );
};

export default MoleculePredictor;