import pandas as pd
import json
import os

# --- CHEMINS ---
INPUT_FILE = "all_data.csv"
OUTPUT_FILE = "src/data/vente.json"

print(f"🚀 Chargement et nettoyage de {INPUT_FILE}...")

# --- CHARGEMENT ---
df = pd.read_csv(INPUT_FILE, sep=None, engine="python")

# --- NETTOYAGE ---
df = df[df["Quantity Ordered"] != "Quantity Ordered"]              # Supprime les lignes d'en-tête dupliquées
df = df.dropna(subset=["Order Date", "Purchase Address"])          # Supprime les lignes vides

# Conversion numérique vectorisée
df["Quantity Ordered"] = pd.to_numeric(df["Quantity Ordered"], errors="coerce")
df["Price Each"] = pd.to_numeric(df["Price Each"], errors="coerce")

# Calcul du CA
df["Total_Vente"] = df["Quantity Ordered"] * df["Price Each"]

# Conversion date
df["Order Date"] = pd.to_datetime(df["Order Date"], errors="coerce")

# --- EXTRACTION FIABLE DE L'ÉTAT ---
def extract_state(address):
    try:
        last = address.split(",")[-1].strip()   # ex: "CA 90001"
        return last.split(" ")[0]               # ex: "CA"
    except:
        return "Inconnu"

df["Pays"] = df["Purchase Address"].apply(extract_state)

# Extraction mois
df["mois_num"] = df["Order Date"].dt.month
df["mois"] = df["Order Date"].dt.strftime("%B")   # Mois en anglais

# Nettoyage final
df = df.dropna(subset=["Total_Vente", "mois_num", "Pays"])

# --- VENTES PAR PAYS ---
df_reg = (
    df.groupby(["Pays", "mois_num", "mois"])["Total_Vente"]
    .sum()
    .reset_index(name="ventes")
)

# --- VENTES GLOBALES ---
df_glob = (
    df.groupby(["mois_num", "mois"])["Total_Vente"]
    .sum()
    .reset_index(name="ventes")
)
df_glob["Pays"] = "Global"

# Fusion
all_ventes = pd.concat([df_reg, df_glob]).sort_values(["Pays", "mois_num"])


# --- LISTE DES PAYS ---
total_ca = df["Total_Vente"].sum()

liste_pays = [{"nom": "Global", "label": f"Global ({round(total_ca):,} $)"}]

ca_par_pays = (
    df.groupby("Pays")["Total_Vente"]
    .sum()
    .sort_values(ascending=False)
    .reset_index()
)

liste_pays.extend([
    {"nom": row.Pays, "label": f"{row.Pays} ({round(row.Total_Vente):,} $)"}
    for _, row in ca_par_pays.iterrows()
    if row.Pays != "Inconnu"
])

# --- TOP PRODUITS ---
top_produits = (
    df.groupby("Product")["Quantity Ordered"]
    .sum()
    .nlargest(5)
    .reset_index()
    .rename(columns={"Product": "nom", "Quantity Ordered": "quantite"})
    .to_dict(orient="records")
)

# --- EXPORT ---
donnees = {
    "ventes_par_pays": all_ventes.to_dict(orient="records"),
    "top_produits": top_produits,
    "liste_pays": liste_pays
}

os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(donnees, f, indent=2)

print(f"✅ Export terminé : CA global = {round(total_ca):,} $")
