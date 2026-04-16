import pandas as pd
import json
import os

output_file = r"C:\Users\kapni\OneDrive\Documents\Projet dev frontend\darshboard\src\data\vente.json"
input_file = "all_data.csv" 

try:
    print(f"🚀 Lecture du fichier : {input_file}")
    df = pd.read_csv(input_file, sep=None, engine='python')
    
    # Nettoyage strict des lignes vides
    df = df.dropna(subset=['Order Date', 'Price Each', 'Quantity Ordered', 'Purchase Address'])

    # Conversion des types
    df['Order Date'] = pd.to_datetime(df['Order Date'], errors='coerce')
    df['Price Each'] = pd.to_numeric(df['Price Each'], errors='coerce')
    df['Quantity Ordered'] = pd.to_numeric(df['Quantity Ordered'], errors='coerce')
    df['Total_Vente'] = df['Quantity Ordered'] * df['Price Each']

    # Extraction du Pays (Dernier mot de l'adresse)
    df['Pays'] = df['Purchase Address'].str.split(',').str[-1].str.strip().str.split(' ').str[0]

    # Création des colonnes de temps
    df['mois_num'] = df['Order Date'].dt.month
    df['mois'] = df['Order Date'].dt.strftime('%B')

    # Suppression des erreurs de date (lignes NaT)
    df = df.dropna(subset=['Order Date', 'Total_Vente', 'mois_num'])

    # --- AGRÉGATION : On garde tout dans le groupe ---
    print("📊 Calcul des statistiques par région...")
    # On groupe par Pays, Numéro de mois ET Nom de mois
    df_complet = df.groupby(['Pays', 'mois_num', 'mois']).agg({'Total_Vente': 'sum'}).reset_index()
    
    # On trie proprement par Pays puis par ordre chronologique
    df_complet = df_complet.sort_values(by=['Pays', 'mois_num'])

    # --- TOP PRODUITS (Global) ---
    top_p = df.groupby('Product')['Quantity Ordered'].sum().sort_values(ascending=False).head(5).reset_index()
    top_p_final = top_p.rename(columns={'Product': 'nom', 'Quantity Ordered': 'quantite'}).to_dict(orient='records')

    # --- LISTE DES PAYS AVEC TOTAUX (Filtre) ---
    # 1. On calcule le CA pour chaque région
    ca_par_region = df.groupby('Pays')['Total_Vente'].sum().sort_values(ascending=False).reset_index()
    
    # 2. On calcule le CA GLOBAL de toute l'entreprise
    total_entreprise = df['Total_Vente'].sum()
    
    # 3. On crée l'option "Global" avec son montant total
    liste_pour_filtre = [
        {
            "nom": "Global", 
            "label": f"Global ({round(total_entreprise):,} $)"
        }
    ]
    
    # 4. On ajoute les autres régions à la suite
    for _, row in ca_par_region.iterrows():
        liste_pour_filtre.append({
            "nom": row['Pays'],
            "label": f"{row['Pays']} ({round(row['Total_Vente']):,} $)"
        })

    # --- STRUCTURE FINALE ---
    donnees_finales = {
        "ventes_par_pays": df_final_ventes[['Pays', 'mois', 'ventes']].to_dict(orient='records'),
        "top_produits": top_p_final,
        "liste_pays": liste_pour_filtre  # Cette liste contient maintenant le label "Global (montant $)"
    }

    # --- FORMATAGE POUR REACT ---
    # On renomme 'Total_Vente' en 'ventes' pour ton code React
    donnees_finales = {
        "ventes_par_pays": df_complet.rename(columns={'Total_Vente': 'ventes'}).to_dict(orient='records'),
        "top_produits": top_p_final,
        "liste_pays": liste_pays
    }

    # Écriture
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(donnees_finales, f, indent=2)

    print(f"✅ Succès ! {len(liste_pays)} régions prêtes.")

except Exception as e:
    print(f"❌ Erreur : {e}")
