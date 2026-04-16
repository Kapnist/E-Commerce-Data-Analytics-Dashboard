import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import data_globale from './data/vente.json';
import MapChart from './MapChart';

const data_ventes_globales = data_globale.ventes_par_pays;
const data_produits_top = data_globale.top_produits;
const liste_pays = data_globale.liste_pays;

function KpiCard({ titre, valeur, couleur }) {
  return (
    <div style={{ 
      flex: '1 1 250px', // Permet aux cartes de s'étirer mais de passer à la ligne à moins de 250px
      backgroundColor: 'white', padding: '20px', borderRadius: '10px', 
      borderLeft: `8px solid ${couleur}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
    }}>
      <h4 style={{ margin: 0, color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>{titre}</h4>
      <p style={{ margin: '10px 0 0', fontSize: '22px', fontWeight: 'bold' }}>{valeur}</p>
    </div>
  );
}

function App() {
  const [paysChoisi, setPaysChoisi] = useState(liste_pays[0]);
  const data_filtree = data_ventes_globales.filter(item => item.Pays === paysChoisi);
  const totalVentes = data_filtree.reduce((acc, curr) => acc + curr.ventes, 0);
  const isMobile = window.innerWidth < 768; // Détecte si on est sur mobile

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fc',
     minHeight: '100vh', fontFamily: 'Arial, sans-serif' 
     padding: isMobile ? '10px' : '30px', // Moins d'espace sur les bords du téléphone
      // ... reste du style
     }}>
      
      {/* Header Responsive */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '30px', flexWrap: 'wrap', gap: '15px' 
      }}>
        <h1 style={{ color: '#4e73df', margin: 0, fontSize: '1.5rem' }}>Dashboard Analytics</h1>
        <div style={{ backgroundColor: 'white', padding: '10px 20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Région :</label>
          <select value={paysChoisi} onChange={(e) => setPaysChoisi(e.target.value)}>
            {liste_pays.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* KPI CARDS : flexWrap est crucial ici */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <KpiCard titre={`CA Total - ${paysChoisi}`} valeur={`${Math.round(totalVentes).toLocaleString()} $`} couleur="#4e73df" />
        <KpiCard titre="Moyenne Mensuelle" valeur={`${Math.round(totalVentes / (data_filtree.length || 1)).toLocaleString()} $`} couleur="#1cc88a" />
        <KpiCard titre="Régions Actives" valeur={liste_pays.length} couleur="#36b9cc" />
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* GRAPHIQUE - On ajoute minWidth: 0 pour empêcher le débordement Flexbox */}
        <div style={{ 
          flex: '2 1 600px', 
          minWidth: 0, // CRUCIAL : empêche le graphique de pousser les murs
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '15px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ color: '#5a5c69', fontSize: '1.1rem' }}>Évolution des revenus ({paysChoisi})</h3>
          
          {/* On s'assure que cette div prend TOUTE la largeur disponible et rien de plus */}
          <div style={{ height: 350, minWidth: 0, backgroundColor: 'white', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="99%" height="100%">
              <LineChart 
                data={data_filtree} 
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }} // left négatif si tes chiffres sont petits
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="mois" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  interval={0} 
                  tick={{fontSize: 10}} 
                />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="ventes" 
                  stroke="#4e73df" 
                  strokeWidth={4} 
                  dot={{ r: 4 }} 
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLONNE DROITE : Top Produits */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#5a5c69', fontSize: '1.1rem' }}>Top 5 Produits</h3>
                {data_produits_top.map((item, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{maxWidth: '70%'}}>{item.nom}</span>
                      <span style={{ fontWeight: 'bold' }}>{item.quantite}</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#eee', height: '5px', borderRadius: '5px', marginTop: '5px' }}>
                      <div style={{ width: `${(item.quantite / data_produits_top[0].quantite) * 100}%`, backgroundColor: '#4e73df', height: '100%' }}></div>
                    </div>
                  </div>
                ))}
            </div>
            {/* Décommenter MapChart quand le bug de bibliothèque sera résolu */}
            {/* <MapChart etatSelectionne={paysChoisi} /> */}
        </div>
      </div>
    </div>
  );
}

export default App;
