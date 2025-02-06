import React, { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("meals.db");

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams(); // ✅ Récupère idFood depuis la navigation
  const router = useRouter();
  const [foodDetails, setFoodDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      console.log("🔍 Récupération des détails pour :", id);
      fetchFoodDetails(id);
    }
  }, [id]);

  // ✅ Requête API Edamam pour récupérer les détails de l'aliment
  const fetchFoodDetails = async (foodId) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_EDAMAM_BASE_URL}/api/food-database/v2/parser?ingr=${foodId}&app_id=${process.env.EXPO_PUBLIC_EDAMAM_APP_ID}&app_key=${process.env.EXPO_PUBLIC_EDAMAM_KEY}`
      );

      if (response.data.hints.length === 0) {
        console.warn("⚠️ Aucune donnée trouvée !");
        setFoodDetails(null);
      } else {
        setFoodDetails(response.data.hints[0].food);
      }
    } catch (error) {
      console.error("❌ Erreur API Edamam :", error);
      setFoodDetails(null);
    }
    setLoading(false);
  };

  const deleteFoodFromDatabase = () => {
    Alert.alert("Confirmation", "Voulez-vous supprimer cet aliment ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          console.log(id);
          db.execSync(`DELETE FROM meals WHERE id = ${id};`,);
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#005f57" />
        <Text>Chargement des détails...</Text>
      </View>
    );
  }

  if (!foodDetails) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>❌ Aucune donnée trouvée pour cet aliment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Image de l'aliment */}
      {foodDetails.image && <Image source={{ uri: foodDetails.image }} style={styles.image} />}

      {/* ✅ Nom de l'aliment */}
      <Text style={styles.title}>{foodDetails.label}</Text>

      {/* ✅ Informations Nutritionnelles */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Calories : {Math.round(foodDetails.nutrients.ENERC_KCAL || 0)} kcal</Text>
        <Text style={styles.infoText}>Protéines : {Math.round(foodDetails.nutrients.PROCNT || 0)} g</Text>
        <Text style={styles.infoText}>Glucides : {Math.round(foodDetails.nutrients.CHOCDF || 0)} g</Text>
        <Text style={styles.infoText}>Lipides : {Math.round(foodDetails.nutrients.FAT || 0)} g</Text>
      </View>

      {/* ✅ Bouton Supprimer */}
      <TouchableOpacity style={styles.button} onPress={deleteFoodFromDatabase}>
        <Text style={styles.buttonText}>🗑 Supprimer l'aliment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, color: "red", fontWeight: "bold" },
  image: { width: 150, height: 150, marginBottom: 20, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#005f57", marginBottom: 10 },
  infoContainer: { marginTop: 10, alignItems: "center" },
  infoText: { fontSize: 18, color: "#333", marginVertical: 5 },
  button: { marginTop: 20, backgroundColor: "red", padding: 12, borderRadius: 8 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
