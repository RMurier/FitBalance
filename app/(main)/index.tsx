import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import Meal from "../../interfaces/meal";

const db = openDatabaseSync("meals.db");

db.execAsync(
  `CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    idFood TEXT NOT NULL,
    name TEXT NOT NULL, 
    calories INTEGER NOT NULL
  );`
);

export default function MealListScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);

  // Fonction pour récupérer les repas
  const fetchMeals = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM meals;");
      setMeals(result);
    } catch (error) {
      console.error("Erreur de récupération des repas:", error);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes repas</Text>

      {meals.length === 0 ? (
        <Text style={styles.noMeals}>Aucun repas enregistré.</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.mealItem}
              onPress={() => {console.log(item);router.push(`/(main)/${item.id}`)}}
            >
              <Text style={styles.mealName}>{item.name}</Text>
              <Text style={styles.calories}>{item.calories} kcal</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add")}>
        <Text style={styles.addButtonText}>+ Ajouter un repas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#005f57" },
  noMeals: { fontSize: 16, color: "#888", textAlign: "center", marginTop: 20 },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  mealName: { fontSize: 18, fontWeight: "bold" },
  calories: { fontSize: 16, color: "#888" },
  addButton: {
    backgroundColor: "#005f57",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
