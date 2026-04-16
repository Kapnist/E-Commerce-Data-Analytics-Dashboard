import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import data_globale from "./data/vente.json";
import "./App.css"; // ⚠️ Assure-toi d'avoir ajouté le CSS fourni

// --- Extraction sécurisée ---
const ventes = Array.isArray(data_globale?.ventes_par_pays)
  ? data_globale.ventes_par_pays
  : [];

const topProduits = Array.isArray(data_globale?.top_produits)
  ? data_globale.top_produits
  : [];

const listePays = Array.isArray(data_globale?.liste_pays)
  ? data_globale.liste_pays
  : [];

function App() {
  const [pays, setPays] = useState("Global");

  // --- Filtrage optimisé ---
  const dataFiltre = useMemo(() => {
    return ventes.filter(
      (d) => String(d.Pays).trim().toLowerCase() === pays.toLowerCase()
    );
  }, [pays]);

  // --- Calculs optimisés ---
  const total = useMemo(() => {
    return dataFiltre.reduce((acc, curr) => acc + (curr.ventes || 0), 0);
  }, [dataFiltre]);

  const moyenne = useMemo(() => {
    return dataFiltre.length > 0 ? total / dataFiltre.length : 0;
  }, [total, dataFiltre]);

  // Format compact : 1 200 → 1.2k, 3 500 000 → 3.5M
const formatCA = (value) => {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "k";
  return value.toString();
};


  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "30px"
        }}
      >
        <h1 style={{ color: "#4e73df", margin: 0 }}>Analytics Dashboard</h1>

        <select
          value={pays}
          onChange={(e) => setPays(e.target.value)}
          style={{ padding: "8px", borderRadius: "5px" }}
        >
          {listePays.map((p, idx) => (
            <option key={idx} value={p.nom || p}>
              {p.label || p}
            </option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="kpi-container" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <KpiCard
          titre={`CA TOTAL - ${pays.toUpperCase()}`}
          valeur={`${Math.round(total).toLocaleString()} $`}
          couleur="#4e73df"
        />

        <KpiCard
          titre="MOYENNE"
          valeur={`${Math.round(moyenne).toLocaleString()} $`}
          couleur="#1cc88a"
        />
      </div>

      {/* GRAPHIQUE + TOP PRODUITS */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* GRAPH */}
        <div className="chart-card"
          style={{
            flex: "2 1 600px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "15px",
            height: "450px",
            minWidth: "300px"
          }}
        >
          <h3>Évolution mensuelle ({pays})</h3>

          <div className="chart-wrapper" style={{ height: "350px", width: "100%"}}>
            {dataFiltre.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" >
                <LineChart data={dataFiltre} margin={{ top: 10, right: 10, left: 40, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="mois"
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                    height={80}
                  />

                  <YAxis tickFormatter={(v) => formatCA(v)} />

                  <Tooltip formatter={(v) => formatCA(v)} />
                  <Line
                    type="monotone"
                    dataKey="ventes"
                    stroke="#4e73df"
                    strokeWidth={4}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: "center", paddingTop: "100px" }}>
                Aucune donnée disponible
              </p>
            )}
          </div>
        </div>

        {/* TOP PRODUITS */}
        <div
          style={{
            flex: "1 1 300px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "15px"
          }}
        >
          <h3>Top 5 Produits</h3>

          {topProduits.map((item, idx) => (
            <div key={idx} style={{ marginBottom: "15px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px"
                }}
              >
                <span>{item.nom}</span>
                <strong>{item.quantite.toLocaleString()}</strong>
              </div>

              <div
                style={{
                  width: "100%",
                  backgroundColor: "#eee",
                  height: "8px",
                  borderRadius: "4px",
                  marginTop: "5px"
                }}
              >
                <div
                  style={{
                    width: `${
                      (item.quantite / topProduits[0].quantite) * 100
                    }%`,
                    backgroundColor: "#4e73df",
                    height: "100%",
                    borderRadius: "4px"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ titre, valeur, couleur }) {
  return (
    <div
      style={{
        flex: "1 1 250px",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        borderLeft: `8px solid ${couleur}`,
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
      }}
    >
      <h4
        style={{
          margin: 0,
          color: "#888",
          fontSize: "11px",
          textTransform: "uppercase"
        }}
      >
        {titre}
      </h4>
      <p className="kpi-card-value" style={{ margin: "10px 0 0", fontSize: "22px", fontWeight: "bold" }}>
        {valeur}
      </p>
    </div>
  );
}

export default App;
