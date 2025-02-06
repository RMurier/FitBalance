import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("meals.db");

export default function AddMealScreen() {
  const router = useRouter();
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");

  const addMealToDatabase = () => {
    if (mealName.trim() === "" || calories.trim() === "") return;

    db.execSync(
        `INSERT INTO meals (name, calories) VALUES ('${mealName}', ${parseInt(calories)});`
    );

    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un repas</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom du repas"
        value={mealName}
        onChangeText={setMealName}
      />

      <TextInput
        style={styles.input}
        placeholder="Calories"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={addMealToDatabase}>
        <Text style={styles.buttonText}>Enregistrer</Text>
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
  button: {
    backgroundColor: "#005f57",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
