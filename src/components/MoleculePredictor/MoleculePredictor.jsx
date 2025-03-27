import React, { useState } from "react";
import MoleculeInput from "./MoleculeInput/MoleculeInput";
import MoleculeVisualization from "./MoleculeVisualization/MoleculeVisualization";
import PredictionResult from "./PredictionResult/PredictionResult";
import "./MoleculePredictor.css";

const MoleculePredictor = () => {
  const [moleculeName, setMoleculeName] = useState("");
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [predictedValue, setPredictedValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleMoleculeChange = (smiles, molecule = null) => {
    setMoleculeName(smiles);
    if (molecule) {
      setSelectedMolecule(molecule);
    }
  };

  const predictToxicity = () => {
    if (!moleculeName.trim()) return;

    setIsLoading(true);

    setTimeout(() => {
      const randomLD50 = Math.floor(Math.random() * 1000) + 1;
      setPredictedValue(randomLD50);
      setIsLoading(false);

      setPredictionHistory((prev) => [
        {
          smiles: moleculeName,
          name: selectedMolecule?.name || "Unknown",
          ld50: randomLD50,
          timestamp: new Date().toLocaleTimeString(),
          cid: selectedMolecule?.cid,
        },
        ...prev.slice(0, 4),
      ]);
    }, 1500);
  };

  const clearPredictionResults = () => {
    setPredictedValue(null);
    setSelectedMolecule(null);
  };

  const exportResult = () => {
    if (!predictedValue) return;

    const moleculeName = selectedMolecule?.name || "Unknown";
    const moleculeSmiles = selectedMolecule?.smiles || this.moleculeName;
    const csvContent = `Molecule,SMILES,LD50 (mg/kg),CID\n${moleculeName},${moleculeSmiles},${predictedValue},${selectedMolecule?.cid || "N/A"}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", "toxicity_prediction.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectFromHistory = (item) => {
    setMoleculeName(item.smiles);
    setSelectedMolecule({
      name: item.name,
      smiles: item.smiles,
      cid: item.cid,
    });
    setPredictedValue(item.ld50);
  };

  return (
    <div className="predictor-container">
      <div className="predictor-card">
        <h1 className="predictor-header">MOLECULAR PREDICTOR OF TOXICITY</h1>
        <div className="pubchem-badge">Powered by PubChem API</div>

        <div className="predictor-content">
          <div className="predictor-input-column">
            <div className="molecule-ai">MoleculeAI</div>
            <MoleculeInput
              moleculeName={moleculeName}
              setMoleculeName={handleMoleculeChange}
              onClear={clearPredictionResults}
            />

            <div className="button-group">
              <button
                className={`predictor-button ${isLoading || !moleculeName.trim() ? "predictor-button-disabled" : ""}`}
                onClick={predictToxicity}
                disabled={isLoading || !moleculeName.trim()}
              >
                {isLoading ? (
                  <div className="spinner-container">
                    <div className="spinner"></div>
                    <span>PREDICTING</span>
                  </div>
                ) : (
                  "PREDICT"
                )}
              </button>

              {predictedValue !== null && (
                <button className="secondary-button" onClick={exportResult}>
                  EXPORT
                </button>
              )}
            </div>

            {predictedValue !== null && (
              <PredictionResult
                value={predictedValue}
                moleculeData={selectedMolecule}
              />
            )}

            {predictionHistory.length > 0 && (
              <div className="history-section">
                <div
                  className="history-header"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <span>Recent Predictions</span>
                  <span className="toggle-icon">{showHistory ? "▲" : "▼"}</span>
                </div>

                {showHistory && (
                  <div className="history-list">
                    {predictionHistory.map((item, index) => (
                      <div
                        key={index}
                        className="history-item"
                        onClick={() => selectFromHistory(item)}
                      >
                        <div className="history-item-name truncate">
                          {item.name}
                        </div>
                        <div className="history-item-value">
                          <span
                            className={`toxicity-badge ${
                              item.ld50 < 50
                                ? "high"
                                : item.ld50 < 500
                                  ? "medium"
                                  : "low"
                            }`}
                          ></span>
                          {item.ld50} mg/kg
                        </div>
                        <div className="history-item-time">
                          {item.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="predictor-visual-column">
            <MoleculeVisualization moleculeName={moleculeName} />
          </div>
        </div>

        <div className="predictor-footer">
          <p>
            This is a predictive tool only. Results should be verified by
            laboratory testing.
          </p>
          <p className="pubchem-credit">
            Molecule data from{" "}
            <a
              href="https://pubchem.ncbi.nlm.nih.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              PubChem
            </a>
          </p>
          <p className="version-info">v1.2.0</p>
        </div>
      </div>
    </div>
  );
};

export default MoleculePredictor;
