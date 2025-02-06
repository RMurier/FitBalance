import React, { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("meals.db");

interface Nutrients {
  ENERC_KCAL?: number;
  PROCNT?: number;
  FAT?: number;
  CHOCDF?: number;
}

// Interface pour un produit
interface Product {
  foodId: string;
  label: string;
  image?: string;
  nutrients: Nutrients;
}

export default function ProductDetailScreen() {
  const { id, mealId, mealItemId, productName } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      console.log(id);
      console.log(productName);
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_EDAMAM_BASE_URL}/api/food-database/v2/parser?ingr=${productName}&app_id=${process.env.EXPO_PUBLIC_EDAMAM_APP_ID}&app_key=${process.env.EXPO_PUBLIC_EDAMAM_KEY}`
      );

      if (response.data.hints.length > 0) {
        setProduct(response.data.hints[0].food);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du produit :", error);
    }
    setLoading(false);
  };

  const deleteFoodItem = () => {
    Alert.alert(
      "Supprimer cet aliment ?",
      "Voulez-vous vraiment retirer cet aliment de ce repas ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: () => {
            db.execSync(`DELETE FROM meal_items WHERE id = ${mealItemId};`);
            router.replace(`/meals/${mealId}`);
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      {product ? (
        <>
          <Text style={styles.title}>{product.label}</Text>
          {product.image && <Image source={{ uri: product.image }} style={styles.image} />}
          <Text style={styles.info}>Calories : {Math.round(product.nutrients.ENERC_KCAL ?? 0)} kcal</Text>
          <Text style={styles.info}>Protéines : {Math.round(product.nutrients.PROCNT ?? 0)} g</Text>
          <Text style={styles.info}>Lipides : {Math.round(product.nutrients.FAT ?? 0)} g</Text>
          <Text style={styles.info}>Glucides : {Math.round(product.nutrients.CHOCDF ?? 0)} g</Text>

          <TouchableOpacity style={styles.deleteButton} onPress={deleteFoodItem}>
            <Text style={styles.deleteText}>🗑️ Supprimer cet aliment</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Aucun détail disponible.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#005f57" },
  image: { width: 150, height: 150, marginBottom: 20, borderRadius: 8 },
  info: { fontSize: 18, marginBottom: 5 },
  deleteButton: {
    marginTop: 20,
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
  },
  deleteText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
