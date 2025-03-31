import React, { useState, useRef, useEffect, useCallback } from "react";
import { searchMoleculesByName } from "../../PubChemService/PubChemService.jsx";
import "./MoleculeInput.css";

const MoleculeInput = ({ moleculeName, setMoleculeName, onClear }) => {
  const [nameQuery, setNameQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState({ name: false, smiles: false });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [hasSelected, setHasSelected] = useState(false);
  const suggestionRef = useRef(null);
  const timeoutRef = useRef(null);

  const debouncedSearch = useCallback((query) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!query || query.trim() === "") {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchMoleculesByName(query, 10);
        console.log("Search results:", results);
        setSuggestions(results);
      } catch (error) {
        console.error("Error during search:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setNameQuery(value);
    setHasSelected(false);

    if (!value.trim()) {
      setMoleculeName("");
      setSelectedMolecule(null);
      setSuggestions([]);
      setIsLoading(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      debouncedSearch(value);
    }

    setIsActive(true);
  };

  const handleSelectMolecule = (molecule) => {
    setNameQuery(molecule.name);

    setMoleculeName(molecule.smiles, molecule);
    setSelectedMolecule(molecule);
    setSuggestions([]);
    setIsActive(false);
    setHasSelected(true);
  };

  const handleSmilesChange = (e) => {
    const smiles = e.target.value;
    setMoleculeName(smiles);

    if (selectedMolecule && smiles !== selectedMolecule.smiles) {
      setNameQuery("");
      setSelectedMolecule(null);
      setHasSelected(false);
    }
  };

  const handleClear = () => {
    setMoleculeName("", null);
    setNameQuery("");
    setSelectedMolecule(null);
    setHasSelected(false);

    if (onClear && typeof onClear === "function") {
      onClear();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleNameFocus = () => {
    if (hasSelected) {
      setIsActive(false);
    } else {
      setIsActive(true);
    }
    setIsFocused((prev) => ({ ...prev, name: true }));
  };

  const isQueryTooShort =
    nameQuery.trim().length > 0 && nameQuery.trim().length < 3;

  const showSuggestions = isActive && !hasSelected;

  return (
    <div className="molecule-input-group">
      <div className="input-field">
        <label
          className={`input-label ${isFocused.name || nameQuery ? "input-label-active" : ""}`}
        >
          Molecule Name
        </label>
        <div className="molecule-name-input-wrapper">
          <input
            type="text"
            className="molecule-name-input"
            placeholder=""
            value={nameQuery}
            onChange={handleNameChange}
            onFocus={handleNameFocus}
            onBlur={() => setIsFocused((prev) => ({ ...prev, name: false }))}
          />
          {isLoading && (
            <div className="input-loading-indicator">
              <div className="spinner-small"></div>
            </div>
          )}
          {showSuggestions && (
            <div className="suggestions-container" ref={suggestionRef}>
              {isLoading && suggestions.length === 0 ? (
                <div className="suggestion-loading">
                  Searching in PubChem...
                </div>
              ) : isQueryTooShort ? (
                <div className="suggestion-no-results">
                  Please enter at least 3 characters
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((molecule, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSelectMolecule(molecule)}
                  >
                    <div className="suggestion-name">{molecule.name}</div>
                    <div className="suggestion-smiles">{molecule.smiles}</div>
                    <div className="suggestion-info">
                      PubChem CID: {molecule.cid}
                    </div>
                  </div>
                ))
              ) : nameQuery && !isLoading ? (
                <div className="suggestion-no-results">No molecules found</div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="input-field">
        <label
          className={`input-label ${isFocused.smiles || moleculeName ? "input-label-active" : ""}`}
        >
          SMILES Code
        </label>
        <div className="molecule-input-wrapper">
          <input
            type="text"
            className="molecule-input"
            placeholder=""
            value={moleculeName}
            onChange={handleSmilesChange}
            onFocus={() => setIsFocused((prev) => ({ ...prev, smiles: true }))}
            onBlur={() => setIsFocused((prev) => ({ ...prev, smiles: false }))}
          />
          {moleculeName ? (
            <button
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear input"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      {nameQuery &&
        suggestions.length === 0 &&
        !isLoading &&
        !isQueryTooShort &&
        !hasSelected && (
          <div className="input-info-message">
            You can also directly enter a SMILES code in the field below.
          </div>
        )}
    </div>
  );
};

export default MoleculeInput;
