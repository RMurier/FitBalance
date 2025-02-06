import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("meals.db");

export default function AddMealScreen() {
  const router = useRouter();
  const [mealName, setMealName] = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchFood = async (query: string) => {
    if (!query) return;
    setLoading(true);

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_EDAMAM_BASE_URL}/auto-complete?q=${query}&app_id=${process.env.EXPO_PUBLIC_EDAMAM_APP_ID}&app_key=${process.env.EXPO_PUBLIC_EDAMAM_KEY}`
      );

      setFoodResults(response.data.map((name: any) => ({ label: name })));
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
    }

    setLoading(false);
  };

  const createMeal = () => {
    if (!mealName) return alert("Le nom du repas est requis !");
    const date = new Date().toISOString().split("T")[0];
    db.execSync(`INSERT INTO meals (name, date) VALUES ('${mealName}', '${date}');`);
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un repas</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom du repas (ex: Déjeuner)"
        value={mealName}
        onChangeText={setMealName}
      />

      <TouchableOpacity style={styles.addButton} onPress={createMeal}>
        <Text style={styles.addButtonText}>Créer le repas</Text>
      </TouchableOpacity>
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
  addButton: {
    backgroundColor: "#005f57",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
