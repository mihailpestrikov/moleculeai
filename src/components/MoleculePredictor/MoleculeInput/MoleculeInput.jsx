import React, { useState, useRef, useEffect } from 'react';
import { searchMolecules } from '../MoleculeDatabase/MoleculeDatabase.jsx';
import './MoleculeInput.css';

const MoleculeInput = ({ moleculeName, setMoleculeName }) => {
    const [nameQuery, setNameQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [isFocused, setIsFocused] = useState({ name: false, smiles: false });
    const suggestionRef = useRef(null);

    // Отслеживаем, какая молекула была выбрана последней из поиска
    const [lastSelectedSmiles, setLastSelectedSmiles] = useState('');

    // Обработка ввода в поле названия
    const handleNameChange = (e) => {
        const value = e.target.value;
        setNameQuery(value);

        // Если поле названия пустое, очищаем также SMILES
        if (!value.trim()) {
            setMoleculeName('');
            setLastSelectedSmiles('');
        }

        // Поиск подходящих молекул
        const results = searchMolecules(value);
        setSuggestions(results);
        setIsActive(true);
    };

    // Выбор молекулы из списка подсказок
    const handleSelectMolecule = (molecule) => {
        setNameQuery(molecule.name);
        setMoleculeName(molecule.smiles);
        setLastSelectedSmiles(molecule.smiles);
        setSuggestions([]);
        setIsActive(false);
    };

    // Обработка изменения SMILES напрямую
    const handleSmilesChange = (e) => {
        setMoleculeName(e.target.value);

        // Если SMILES был изменен вручную и не соответствует последнему выбранному из списка,
        // очищаем поле названия, чтобы избежать несоответствия
        if (lastSelectedSmiles && e.target.value !== lastSelectedSmiles) {
            setNameQuery('');
            setLastSelectedSmiles('');
        }
    };

    // Обработка клика вне списка подсказок
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setIsActive(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="molecule-input-group">
            {/* Поле ввода названия молекулы */}
            <div className="input-field">
                <label className={`input-label ${isFocused.name || nameQuery ? 'input-label-active' : ''}`}>
                    Molecule Name
                </label>
                <div className="molecule-name-input-wrapper">
                    <input
                        type="text"
                        className="molecule-name-input"
                        placeholder=""
                        value={nameQuery}
                        onChange={handleNameChange}
                        onFocus={() => {
                            setIsActive(true);
                            setIsFocused(prev => ({ ...prev, name: true }));
                        }}
                        onBlur={() => setIsFocused(prev => ({ ...prev, name: false }))}
                    />
                    {isActive && suggestions.length > 0 && (
                        <div className="suggestions-container" ref={suggestionRef}>
                            {suggestions.map((molecule, index) => (
                                <div
                                    key={index}
                                    className="suggestion-item"
                                    onClick={() => handleSelectMolecule(molecule)}
                                >
                                    <div className="suggestion-name">{molecule.name}</div>
                                    <div className="suggestion-smiles">{molecule.smiles}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Поле ввода SMILES */}
            <div className="input-field">
                <label className={`input-label ${isFocused.smiles || moleculeName ? 'input-label-active' : ''}`}>
                    SMILES Code
                </label>
                <div className="molecule-input-wrapper">
                    <input
                        type="text"
                        className="molecule-input"
                        placeholder=""
                        value={moleculeName}
                        onChange={handleSmilesChange}
                        onFocus={() => setIsFocused(prev => ({ ...prev, smiles: true }))}
                        onBlur={() => setIsFocused(prev => ({ ...prev, smiles: false }))}
                    />
                    {moleculeName ? (
                        <button
                            className="clear-button"
                            onClick={() => {
                                setMoleculeName('');
                                setNameQuery('');
                                setLastSelectedSmiles('');
                            }}
                            aria-label="Clear input"
                        >
                            ×
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default MoleculeInput;