import React, { useState } from 'react';
import './PredictionResult.css';

const PredictionResult = ({ value }) => {
    const [showExplanation, setShowExplanation] = useState(false);

    // Определение токсичности на основе LD50
    const getToxicityLevel = (value) => {
        if (value < 50) return { level: 'Highly toxic', color: '#bf616a', class: 'high' };
        if (value < 500) return { level: 'Moderately toxic', color: '#d08770', class: 'medium' };
        return { level: 'Low toxicity', color: '#8fbcbb', class: 'low' };
    };

    const toxicity = getToxicityLevel(value);

    // Вычисление дополнительных свойств (для демонстрации)
    const getAdditionalProperties = () => {
        return {
            molecularWeight: (value * 0.57 + 125).toFixed(2),
            logP: (value * 0.005 - 1.2).toFixed(2),
            waterSolubility: value < 200 ? 'Low' : value < 600 ? 'Moderate' : 'High'
        };
    };

    const properties = getAdditionalProperties();

    return (
        <div className="prediction-result">
            <div className="prediction-header">
                <div className="prediction-title-group">
                    <h2 className="prediction-title">Prediction Results</h2>
                    <div className={`toxicity-indicator ${toxicity.class}`}></div>
                </div>
                <button
                    className="info-button"
                    onClick={() => setShowExplanation(!showExplanation)}
                    aria-label="More information"
                >
                    ?
                </button>
            </div>

            <div className="prediction-main">
                <div className="prediction-primary">
                    <div className="prediction-label">LD50 toxicity on mice:</div>
                    <p className="prediction-value" style={{ color: toxicity.color }}>
                        {value} mg/kg
                    </p>
                </div>

                <div className="prediction-secondary">
                    <p className="toxicity-level" style={{ color: toxicity.color }}>
                        {toxicity.level}
                    </p>

                    <div className="property-grid">
                        <div className="property-item">
                            <span className="property-label">Molecular Weight</span>
                            <span className="property-value">{properties.molecularWeight} g/mol</span>
                        </div>
                        <div className="property-item">
                            <span className="property-label">LogP</span>
                            <span className="property-value">{properties.logP}</span>
                        </div>
                        <div className="property-item">
                            <span className="property-label">Water Solubility</span>
                            <span className="property-value">{properties.waterSolubility}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showExplanation && (
                <div className="prediction-explanation">
                    <p><strong>LD50</strong> - The dose required to kill half of a test population.</p>
                    <ul>
                        <li><strong>&lt;50 mg/kg</strong>: Highly toxic substances</li>
                        <li><strong>50-500 mg/kg</strong>: Moderately toxic substances</li>
                        <li><strong>&gt;500 mg/kg</strong>: Substances with low toxicity</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PredictionResult;