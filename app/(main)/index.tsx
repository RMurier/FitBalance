import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("meals.db");

// Création des tables si elles n'existent pas
db.execSync(`
  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL,
    date TEXT NOT NULL
  );`
);

db.execSync(`
  CREATE TABLE IF NOT EXISTS meal_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_id INTEGER NOT NULL,
    idFood TEXT NOT NULL,
    name TEXT NOT NULL, 
    calories INTEGER NOT NULL,
    FOREIGN KEY(meal_id) REFERENCES meals(id)
  );`
);

export default function MealListScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState([]);

  // Fonction pour récupérer les repas avec leurs aliments
  const fetchMeals = async () => {
    try {
      const result = await db.getAllAsync(`
        SELECT meals.id, meals.name, meals.date, meal_items.name AS food_name, meal_items.calories
        FROM meals 
        LEFT JOIN meal_items ON meals.id = meal_items.meal_id
        ORDER BY meals.date DESC;
      `);

      const groupedMeals = result.reduce((acc, row) => {
        if (!acc[row.id]) {
          acc[row.id] = { id: row.id, name: row.name, date: row.date, items: [], totalCalories: 0 };
        }
        if (row.food_name) {
          acc[row.id].items.push({ name: row.food_name, calories: row.calories });
          acc[row.id].totalCalories += row.calories;
        }
        return acc;
      }, {});

      setMeals(Object.values(groupedMeals));
    } catch (error) {
      console.error("Erreur de récupération des repas:", error);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Mes repas</Text>

      {meals.length === 0 ? (
        <Text style={styles.noMeals}>Aucun repas enregistré.</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.mealItem}
              onPress={() => router.push(`/meals/${item.id}`)}
            >
              <Text style={styles.mealName}>{item.name} - {item.date}</Text>
              <Text>Calories : {item.totalCalories} kcal</Text>
              {item.items.map((food, index) => (
                <Text key={index} style={styles.foodItem}>🍽 {food.name} ({food.calories} kcal)</Text>
              ))}
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add")}>
        <Text style={styles.addButtonText}>➕ Ajouter un repas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#005f57" },
  noMeals: { fontSize: 16, color: "#888", textAlign: "center", marginTop: 20 },
  mealItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
  },
  mealName: { fontSize: 18, fontWeight: "bold" },
  foodItem: { fontSize: 16, color: "#555", marginLeft: 10 },
  addButton: {
    backgroundColor: "#005f57",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
