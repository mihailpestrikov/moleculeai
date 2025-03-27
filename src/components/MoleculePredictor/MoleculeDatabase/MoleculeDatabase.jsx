// Это моковая база данных молекул для демонстрации функционала
const moleculeDatabase = [
    { name: "Paracetamol", smiles: "CC(=O)NC1=CC=C(O)C=C1" },
    { name: "Aspirin", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O" },
    { name: "Ibuprofen", smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O" },
    { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C)C(=O)N2C" },
    { name: "Metformin", smiles: "CN(C)C(=N)NC(=N)N" },
    { name: "Diazepam", smiles: "CN1C(=O)CN=C(C2=CC=CC=C2)C2=C1C=CC=C2Cl" },
    { name: "Fluoxetine", smiles: "CNCCC(OC1=CC=C(C=C1)C(F)(F)F)C1=CC=CC=C1" },
    { name: "Methanol", smiles: "CO" },
    { name: "Ethanol", smiles: "CCO" },
    { name: "Glucose", smiles: "C(C1C(C(C(C(O1)O)O)O)O)O" },
    { name: "Penicillin G", smiles: "CC1(C(N2C(S1)C(C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C" },
    { name: "Dopamine", smiles: "NCCc1ccc(O)c(O)c1" },
    { name: "Serotonin", smiles: "NCCc1c[nH]c2ccc(O)cc12" },
    { name: "Adrenaline", smiles: "CNCC(O)c1ccc(O)c(O)c1" },
    { name: "Morphine", smiles: "CN1CCC23C4C1CC5=C2C(=C(C=C5)O)OC3C(C=C4)O" },
    { name: "Benzene", smiles: "c1ccccc1" },
    { name: "Pyridine", smiles: "c1ccncc1" },
    { name: "Furozenide", smiles: "NS(=O)(=O)c1cc(c(cc1Cl)NCCN)S(=O)(=O)O" },
    { name: "Warfarin", smiles: "CC(=O)CC(c1ccccc1)c2c(c3ccccc3oc2=O)O" },
    { name: "Ciprofloxacin", smiles: "N1CCN(CC1)C2=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)O" }
];

// Функция для поиска молекул по частичному названию
export function searchMolecules(query) {
    if (!query || query.trim() === '') return [];

    const lowerQuery = query.toLowerCase().trim();
    return moleculeDatabase
        .filter(molecule => molecule.name.toLowerCase().includes(lowerQuery))
        .slice(0, 5); // Ограничиваем 5 результатами
}

export default moleculeDatabase;