import React, { useState, useEffect } from "react";
import MoleculeInput from "./MoleculeInput/MoleculeInput";
import MoleculeVisualization from "./MoleculeVisualization/MoleculeVisualization";
import PredictionResult from "./PredictionResult/PredictionResult";
import { predictToxicity, checkApiHealth } from "../MoleculeApiPredictorService/PredictorService.jsx";
import "./MoleculePredictor.css";

const MoleculePredictor = () => {
  const [moleculeName, setMoleculeName] = useState("");
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [predictedValue, setPredictedValue] = useState(null);
  const [toxicityClass, setToxicityClass] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  
  useEffect(() => {
    async function checkAPI() {
      try {
        const isAvailable = await checkApiHealth();
        setApiAvailable(isAvailable);
        if (!isAvailable) {
          setApiError("API is unavailable. Please check your connection to the server.");
        }
      } catch (error) {
        setApiAvailable(false);
        setApiError("Failed to check API status.");
      }
    }

    checkAPI();
  }, []);

  const handleMoleculeChange = (smiles, molecule = null) => {
    setMoleculeName(smiles);
    if (molecule) {
      setSelectedMolecule(molecule);
    }
    
    setApiError(null);
  };

  const handlePredictToxicity = async () => {
    if (!moleculeName.trim()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      
      const result = await predictToxicity(moleculeName);

      console.log("API response:", result); 

      
      setPredictedValue(parseFloat(result.ld50.toFixed(2)));
      setToxicityClass(result.toxicity_class);

      
      if (selectedMolecule) {
        setSelectedMolecule({
          ...selectedMolecule,
          molecular_weight: result.molecular_weight,
          xlogp: result.xlogp,
          hbond_donors: result.hbond_donors,
          hbond_acceptors: result.hbond_acceptors,
          rotatable_bonds: result.rotatable_bonds
        });
      } else {
        
        setSelectedMolecule({
          name: "Unknown",
          smiles: moleculeName,
          molecular_weight: result.molecular_weight,
          xlogp: result.xlogp,
          hbond_donors: result.hbond_donors,
          hbond_acceptors: result.hbond_acceptors,
          rotatable_bonds: result.rotatable_bonds
        });
      }

      
      setPredictionHistory((prev) => [
        {
          smiles: moleculeName,
          name: selectedMolecule?.name || "Unknown",
          ld50: parseFloat(result.ld50.toFixed(2)),
          toxicityClass: result.toxicity_class, 
          timestamp: new Date().toLocaleTimeString(),
          cid: selectedMolecule?.cid,
        },
        ...prev.slice(0, 4),
      ]);
    } catch (error) {
      console.error("Prediction error:", error);
      setApiError(error.message || "Error while getting toxicity prediction");
    } finally {
      setIsLoading(false);
    }
  };

  const clearPredictionResults = () => {
    setPredictedValue(null);
    setToxicityClass(null);
    setSelectedMolecule(null);
    setApiError(null);
  };

  const exportResult = () => {
    if (!predictedValue) return;

    const moleculeNameValue = selectedMolecule?.name || "Unknown";
    const moleculeSmiles = moleculeName; 
    const csvContent = `Molecule,SMILES,LD50 (mg/kg),Toxicity Class,CID\n${moleculeNameValue},${moleculeSmiles},${predictedValue},${toxicityClass || "Unknown"},${selectedMolecule?.cid || "N/A"}`;

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
    
    setToxicityClass(item.toxicityClass || item.toxicity_class || "Unknown");
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

              {apiError && (
                  <div className="api-error-message">
                    <p>{apiError}</p>
                  </div>
              )}

              <div className="button-group">
                <button
                    className={`predictor-button ${(isLoading || !moleculeName.trim() || !apiAvailable) ? "predictor-button-disabled" : ""}`}
                    onClick={handlePredictToxicity}
                    disabled={isLoading || !moleculeName.trim() || !apiAvailable}
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
                      toxicityClass={toxicityClass}
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
                                  {typeof item.ld50 === 'number' ? item.ld50.toFixed(2) : item.ld50} mg/kg
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
            <p className="version-info">v1.3.0</p>
          </div>
        </div>
      </div>
  );
};

export default MoleculePredictor;