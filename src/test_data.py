import pandas as pd
import json
import os

output_file = r"C:\Users\kapni\OneDrive\Documents\Projet dev frontend\darshboard\src\data\vente.json"
input_file = "all_data.csv"

try:
    df = pd.read_csv(input_file, sep=None, engine='python')
    df = df[df['Quantity Ordered'] != 'Quantity Ordered']
    df['Total_Vente'] = pd.to_numeric(df['Quantity Ordered']) * pd.to_numeric(df['Price Each'])
    df['Order Date'] = pd.to_datetime(df['Order Date'])
    df['mois'] = df['Order Date'].dt.strftime('%B')
    df['mois_num'] = df['Order Date'].dt.month

    # On ne fait QUE le Global pour tester
    glob = df.groupby(['mois_num', 'mois']).agg({'Total_Vente': 'sum'}).reset_index()
    glob = glob.sort_values('mois_num')
    
    # Données minimales
    data = {
        "ventes_par_pays": glob.rename(columns={'Total_Vente': 'ventes'}).assign(Pays="Global").to_dict(orient='records'),
        "top_produits": [],
        "liste_pays": [{"nom": "Global", "label": "Vue Global"}]
    }

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(data, f)
    
    print("✅ ÉTAPE 1 RÉUSSIE : Fichier vente.json créé avec succès !")

except Exception as e:
    print(f"❌ ERREUR : {e}")
