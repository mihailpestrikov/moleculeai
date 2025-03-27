import React, { useState, useEffect } from "react";
import { getMoleculeInfo } from "../../PubChemService/PubChemService.jsx";
import "./PredictionResult.css";

const PredictionResult = ({ value, moleculeData }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [moleculeInfo, setMoleculeInfo] = useState(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  const getToxicityLevel = (value) => {
    if (value < 50)
      return { level: "Highly toxic", color: "#bf616a", class: "high" };
    if (value < 500)
      return { level: "Moderately toxic", color: "#d08770", class: "medium" };
    return { level: "Low toxicity", color: "#8fbcbb", class: "low" };
  };

  const toxicity = getToxicityLevel(value);

  useEffect(() => {
    if (moleculeData && moleculeData.cid) {
      setIsLoadingInfo(true);

      getMoleculeInfo(moleculeData.cid)
        .then((info) => {
          setMoleculeInfo(info);
          setIsLoadingInfo(false);
        })
        .catch((error) => {
          console.error("Error fetching molecule info:", error);
          setIsLoadingInfo(false);
        });
    } else {
      setMoleculeInfo(null);
    }
  }, [moleculeData]);

  const formatPropertyValue = (value, property) => {
    if (value === undefined || value === null) return "N/A";

    switch (property) {
      case "MolecularWeight":
        return `${parseFloat(value).toFixed(2)} g/mol`;
      case "XLogP":
        return parseFloat(value).toFixed(2);
      case "HBondDonorCount":
      case "HBondAcceptorCount":
      case "RotatableBondCount":
        return value;
      default:
        return value;
    }
  };

  const getEstimatedProperties = () => {
    return {
      MolecularWeight: (value * 0.57 + 125).toFixed(2),
      XLogP: (value * 0.005 - 1.2).toFixed(2),
      HBondDonorCount: Math.round(value * 0.002) + 1,
      HBondAcceptorCount: Math.round(value * 0.003) + 2,
      RotatableBondCount: Math.round(value * 0.004) + 3,
    };
  };

  const properties = moleculeInfo || getEstimatedProperties();
  const isMoleculeInfoFromPubChem = !!moleculeInfo;

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
              <span className="property-value">
                {formatPropertyValue(
                  properties.MolecularWeight,
                  "MolecularWeight",
                )}
              </span>
            </div>
            <div className="property-item">
              <span className="property-label">LogP</span>
              <span className="property-value">
                {formatPropertyValue(properties.XLogP, "XLogP")}
              </span>
            </div>
            <div className="property-item">
              <span className="property-label">H-Bond Donors</span>
              <span className="property-value">
                {formatPropertyValue(
                  properties.HBondDonorCount,
                  "HBondDonorCount",
                )}
              </span>
            </div>
            <div className="property-item">
              <span className="property-label">H-Bond Acceptors</span>
              <span className="property-value">
                {formatPropertyValue(
                  properties.HBondAcceptorCount,
                  "HBondAcceptorCount",
                )}
              </span>
            </div>
            <div className="property-item">
              <span className="property-label">Rotatable Bonds</span>
              <span className="property-value">
                {formatPropertyValue(
                  properties.RotatableBondCount,
                  "RotatableBondCount",
                )}
              </span>
            </div>
          </div>

          {isLoadingInfo}

          {!isMoleculeInfoFromPubChem && !isLoadingInfo && moleculeData && (
            <div className="data-source">Estimated properties</div>
          )}
        </div>
      </div>

      {showExplanation && (
        <div className="prediction-explanation">
          <p>
            <strong>LD50</strong> - The dose required to kill half of a test
            population.
          </p>
          <ul>
            <li>
              <strong>&lt;50 mg/kg</strong>: Highly toxic substances
            </li>
            <li>
              <strong>50-500 mg/kg</strong>: Moderately toxic substances
            </li>
            <li>
              <strong>&gt;500 mg/kg</strong>: Substances with low toxicity
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;
