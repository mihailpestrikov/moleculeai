import React, { useEffect, useRef, useState } from "react";
import "./MoleculeVisualization.css";

const MoleculeVisualization = ({ moleculeName }) => {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.SmilesDrawer) {
      setStatus("ready");
      return;
    }

    setStatus("loading");
    setError(null);

    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/smiles-drawer@1.2.0/dist/smiles-drawer.min.js";
    script.async = true;

    script.onload = () => {
      if (window.SmilesDrawer) {
        setStatus("ready");
      } else {
        setStatus("error");
        setError("Failed to initialize SmilesDrawer");
      }
    };

    script.onerror = () => {
      setStatus("error");
      setError("Failed to load SmilesDrawer library");
    };

    document.head.appendChild(script);

    return () => {
      if (status === "loading") {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (status !== "ready" || !moleculeName || !canvasRef.current) return;

    try {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setError(null);

      const smilesDrawer = new window.SmilesDrawer.Drawer({
        width: 340,
        height: 320,
        padding: 35,
        scale: 0.85,

        bondThickness: 1.4,
        bondLength: 20,
        bondSpacing: 5.5,
        bondColor: "#4c566a",

        atomVisualization: "default",
        fontFamily: "Inter, Helvetica, Arial, sans-serif",
        fontSizeLarge: 11,
        fontSizeSmall: 9,

        themes: {
          light: {
            C: "#4c566a",
            H: "#7b88a1",
            O: "#bf616a",
            N: "#5e81ac",
            F: "#a3be8c",
            Cl: "#88c0d0",
            Br: "#d08770",
            I: "#b48ead",
            S: "#ebcb8b",
            P: "#d08770",
            background: "#ffffff",
          },
        },

        terminalCarbons: false,
        explicitHydrogens: true,
        compactDrawing: false,
        debug: false,

        atomColoring: true,
        weighted: true,
        circularBonds: true,
        highQuality: true,
        rotation: 0,
        isotopes: true,
        isomeric: true,
      });

      window.SmilesDrawer.parse(
        moleculeName,
        function (tree) {
          smilesDrawer.draw(tree, canvasRef.current, "light");
        },
        function (error) {
          setError("Invalid SMILES code");
          ctx.font = '14px "Inter", Arial';
          ctx.fillStyle = "#bf616a";
          ctx.textAlign = "center";
          ctx.fillText(
            "Incorrect SMILES code",
            canvasRef.current.width / 2,
            canvasRef.current.height / 2,
          );
        },
      );
    } catch (error) {
      setError("Failed to render molecule");
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.font = '14px "Inter", Arial';
      ctx.fillStyle = "#bf616a";
      ctx.textAlign = "center";
      ctx.fillText(
        "Rendering error",
        canvasRef.current.width / 2,
        canvasRef.current.height / 2,
      );
    }
  }, [status, moleculeName]);

  return (
    <div className="molecule-container">
      {status === "loading" && (
        <div className="molecule-loading">
          <div className="molecule-spinner"></div>
          <p>Loading visualization...</p>
        </div>
      )}

      {status === "error" && !moleculeName && (
        <div className="molecule-error-state">
          <p className="molecule-error-message">
            {error || "Error loading library"}
          </p>
          <button
            className="reload-button"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      )}

      {status === "ready" && moleculeName ? (
        <div className="molecule-visualization">
          <canvas
            ref={canvasRef}
            width="340"
            height="320"
            className="molecule-canvas"
          ></canvas>
          {error ? (
            <p className="molecule-error">{error}</p>
          ) : (
            <div className="molecule-info">
              <p className="molecule-name">{moleculeName}</p>
            </div>
          )}
        </div>
      ) : status === "ready" ? (
        <div className="molecule-placeholder">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <p className="placeholder-text">
            Enter SMILES code to visualize molecule
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default MoleculeVisualization;
