import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("meals.db");

export default function AddMealScreen() {
  const router = useRouter();
  const { barcode } = useLocalSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (barcode) {
      console.log("QR Code reçu :", barcode);
      setSearchTerm(barcode);
      searchFoodByBarcode(barcode);
    }
  }, [barcode]);

  const searchFoodByBarcode = async (barcode) => {
    if (!barcode) return;
    setLoading(true);

    try {
        console.log(`${process.env.EXPO_PUBLIC_EDAMAM_BASE_URL}/api/food-database/v2/parser?upc=${barcode}&app_id=${process.env.EXPO_PUBLIC_EDAMAM_APP_ID}&app_key=${process.env.EXPO_PUBLIC_EDAMAM_KEY}`)
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_EDAMAM_BASE_URL}/api/food-database/v2/parser?upc=${barcode}&app_id=${process.env.EXPO_PUBLIC_EDAMAM_APP_ID}&app_key=${process.env.EXPO_PUBLIC_EDAMAM_KEY}`
      );

      if (response.data.hints.length === 0) {
        console.log("Aucun aliment trouvé pour ce code-barres.");
        setFoodResults([]);
      } else {
        setFoodResults(response.data.hints.map((item) => item.food));
      }
    } catch (error) {
      console.error("Erreur lors de la recherche par code-barres :", error);
    }

    setLoading(false);
  };

  const searchFoodByText = async (query) => {
    if (!query) return;
    setLoading(true);

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_EDAMAM_BASE_URL}/auto-complete?q=${query}&app_id=${process.env.EXPO_PUBLIC_EDAMAM_APP_ID}&app_key=${process.env.EXPO_PUBLIC_EDAMAM_KEY}`
      );

      if (response.data.length === 0) {
        console.log("Aucun résultat trouvé.");
        setFoodResults([]);
      } else {
        setFoodResults(response.data.map((name) => ({ label: name }))); // Simule un objet food
      }
    } catch (error) {
      console.error("Erreur lors de la recherche par texte :", error);
    }

    setLoading(false);
  };

  const addFoodToDatabase = (food) => {
    db.execSync(
      `INSERT INTO meals (idFood, name, calories) VALUES ('${food.foodId}', '${food.label}', ${food.nutrients?.ENERC_KCAL ? Math.round(food.nutrients.ENERC_KCAL) : 0});`
    );
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un repas</Text>

      {/* Champ de recherche */}
      <TextInput
        style={styles.input}
        placeholder="Rechercher un aliment..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={() => searchFoodByText(searchTerm)}
      />

      {/* Bouton Scan QR Code */}
      <TouchableOpacity style={styles.button} onPress={() => router.push("/camera")}>
        <Text style={styles.buttonText}>📷 Scanner un Code-Barres</Text>
      </TouchableOpacity>

      {/* Affichage du chargement */}
      {loading && <Text style={styles.loadingText}>Chargement...</Text>}

      {!loading && foodResults.length === 0 && searchTerm !== "" && (
        <Text style={styles.notFoundText}>❌ Aucun aliment trouvé.</Text>
      )}


      {/* Liste des résultats */}
      <FlatList
        data={foodResults}
        keyExtractor={(item, index) => item.foodId || item.label || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.foodItem} onPress={() => addFoodToDatabase(item)}>
            {item.image && <Image source={{ uri: item.image }} style={styles.foodImage} />}
            <View>
              <Text style={styles.foodName}>{item.label}</Text>
              {item.nutrients?.ENERC_KCAL && <Text style={styles.foodCalories}>{Math.round(item.nutrients.ENERC_KCAL)} kcal</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#005f57" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#005f57",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  loadingText: { fontSize: 16, textAlign: "center", marginVertical: 10 },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  foodImage: { width: 50, height: 50, marginRight: 10, borderRadius: 25 },
  foodName: { fontSize: 18, fontWeight: "bold" },
  foodCalories: { fontSize: 16, color: "#888" },
});
