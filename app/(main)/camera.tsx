import { router } from "expo-router";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import {
  useCameraPermissions,
  CameraView,
  CameraType,
  BarcodeScanningResult,
} from "expo-camera";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // ✅ Fonction qui détecte et envoie le QR Code scanné
  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    // Récupérer le texte du QR Code
    const qrData = result.data;
    console.log("QR Code scanné :", qrData);

    // Envoyer à la page "add" pour lancer la recherche
    router.replace({ pathname: "/add", params: { barcode: qrData } });
  };

  if (!permission?.granted) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {scanned && <Text style={styles.scannedText}>QR Code détecté ! Redirection...</Text>}

      <MaterialIcons
        name="flip-camera-ios"
        size={30}
        color="white"
        style={styles.toggleCamera}
        onPress={toggleCameraFacing}
      />

      <MaterialIcons
        name="close"
        size={30}
        color="white"
        style={styles.close}
        onPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: { flex: 1, width: "100%" },
  scannedText: {
    position: "absolute",
    bottom: 80,
    backgroundColor: "black",
    color: "white",
    padding: 10,
    borderRadius: 5,
  },
  toggleCamera: {
    position: "absolute",
    bottom: 30,
    left: 20,
  },
  close: {
    position: "absolute",
    top: 50,
    left: 20,
  },
});
