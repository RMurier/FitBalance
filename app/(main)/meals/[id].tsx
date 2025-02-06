import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import Meal from "../../../interfaces/meal";
import MealRow from "../../../interfaces/mealrow";

const db = openDatabaseSync("meals.db");

export default function MealDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [meal, setMeal] = useState(null);
  const [items, setItems] = useState([]);

  const fetchMealDetails = useCallback(async () => {
    try {
      const result = db.getAllSync(`
        SELECT meals.name AS meal_name, meals.date, 
               meal_items.id, meal_items.idFood, meal_items.name AS food_name, meal_items.calories
        FROM meals 
        LEFT JOIN meal_items ON meals.id = meal_items.meal_id
        WHERE meals.id = ${id};
      `) as MealRow[];

      if (result.length > 0) {
        setMeal({
          name: result[0].meal_name,
          date: result[0].date,
        });

        const foodItems = result
          .filter((row) => row.food_name)
          .map((row) => ({
            id: row.id,
            idFood: row.idFood,
            name: row.food_name,
            calories: row.calories,
          }));

        setItems(foodItems);
      }
    } catch (error) {
      console.error("Erreur de récupération du repas :", error);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchMealDetails();
    }, [fetchMealDetails])
  );

  const deleteMeal = () => {
    Alert.alert(
      "Supprimer ce repas ?",
      "Voulez-vous vraiment supprimer ce repas et tous ses aliments associés ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: () => {
            try {
              db.execSync(`DELETE FROM meal_items WHERE meal_id = ${id};`);
              db.execSync(`DELETE FROM meals WHERE id = ${id};`);
              router.replace("/");
            } catch (error) {
              console.error("Erreur lors de la suppression du repas :", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {meal ? (
        <>
          <Text style={styles.title}>{meal.name}</Text>
          <Text style={styles.date}>📅 {meal.date}</Text>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.foodItem}
                onPress={() => router.push(`/product/${item.idFood}?mealId=${id}&mealItemId=${item.id}&productName=${item.name}`)}
              >
                <View>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodCalories}>{item.calories} kcal</Text>
                </View>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={styles.button} onPress={() => router.push(`/meals/add?mealId=${id}`)}>
            <Text style={styles.buttonText}>➕ Ajouter un aliment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={deleteMeal}>
            <Text style={styles.deleteButtonText}>🗑️ Supprimer le repas</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Chargement...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#005f57" },
  date: { fontSize: 16, color: "#888", marginBottom: 20 },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
  },
  foodName: { fontSize: 18 },
  foodCalories: { fontSize: 16, color: "#888" },
  button: {
    backgroundColor: "#005f57",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  deleteButton: {
    marginTop: 20,
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
