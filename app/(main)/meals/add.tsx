import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("meals.db");

export default function AddFoodScreen() {
  const router = useRouter();
  const { mealId, barcode } = useLocalSearchParams();
  const [searchTerm, setSearchTerm] = useState(barcode || "");
  const [foodResults, setFoodResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (barcode) {
      console.log("QR Code reçu :", barcode);
      searchFoodByBarcode(barcode);
    }
  }, [barcode]);

  // 🔎 Recherche d'un aliment via un code-barres
  const searchFoodByBarcode = async (barcode) => {
    if (!barcode) return;
    setLoading(true);

    try {
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

  // 🔎 Recherche d'un aliment via un texte
  const searchFoodByText = async (query) => {
    if (!query) return;
    setLoading(true);

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_EDAMAM_BASE_URL}/api/food-database/v2/parser?upc=${barcode}&app_id=${process.env.EXPO_PUBLIC_EDAMAM_APP_ID}&app_key=${process.env.EXPO_PUBLIC_EDAMAM_KEY}`
      );

      setFoodResults(response.data.hints.map((item) => item.food));
    } catch (error) {
      console.error("Erreur lors de la recherche par texte :", error);
    }

    setLoading(false);
  };

  // ✅ Ajoute un aliment avec ses nutriments (calories, protéines, glucides, lipides)
  const addFoodToMeal = (food) => {
    const calories = Math.round(food.nutrients?.ENERC_KCAL || 0);
    const proteins = Math.round(food.nutrients?.PROCNT || 0);
    const carbs = Math.round(food.nutrients?.CHOCDF || 0);
    const fats = Math.round(food.nutrients?.FAT || 0);

    db.execSync(`
      INSERT INTO meal_items (meal_id, idFood, name, calories, proteins, carbs, fats) 
      VALUES (${mealId}, '${food.foodId}', '${food.label}', ${calories}, ${proteins}, ${carbs}, ${fats});
    `);

    router.replace(`/meals/${mealId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un aliment</Text>

      {/* Champ de recherche */}
      <TextInput
        style={styles.input}
        placeholder="Rechercher un aliment..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={() => searchFoodByText(searchTerm)}
      />

      {/* Bouton Scan QR Code */}
      <TouchableOpacity style={styles.button} onPress={() => router.push(`/meals/camera?mealId=${mealId}`)}>
        <Text style={styles.buttonText}>📷 Scanner un Code-Barres</Text>
      </TouchableOpacity>

      {/* Affichage des résultats */}
      <FlatList
        data={foodResults}
        keyExtractor={(item, index) => item.foodId || item.label || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.foodItem} onPress={() => addFoodToMeal(item)}>
            <View>
              <Text style={styles.foodName}>{item.label}</Text>
              <Text style={styles.foodCalories}>Calories : {Math.round(item.nutrients?.ENERC_KCAL || 0)} kcal</Text>
              <Text style={styles.foodInfo}>Protéines : {Math.round(item.nutrients?.PROCNT || 0)} g</Text>
              <Text style={styles.foodInfo}>Glucides : {Math.round(item.nutrients?.CHOCDF || 0)} g</Text>
              <Text style={styles.foodInfo}>Lipides : {Math.round(item.nutrients?.FAT || 0)} g</Text>
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
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
  },
  foodName: { fontSize: 18, fontWeight: "bold" },
  foodCalories: { fontSize: 16, color: "#888" },
  foodInfo: { fontSize: 14, color: "#555" },
});
