import { Tabs, useRouter } from "expo-router";
import { tokenCache } from "../../cache";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  
  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env");
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <AuthGate>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: "#005f57" },
            tabBarActiveTintColor: "#fff",
            tabBarInactiveTintColor: "#ccc",
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Accueil",
              tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: "Profil",
              tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
            }}
          />

          {/* 🚫 On cache ces routes de la barre */}
          <Tabs.Screen name="add" options={{ href: null }} />
          <Tabs.Screen name="meals/add" options={{ href: null }} />
          <Tabs.Screen name="meals" options={{ href: null }} />
          <Tabs.Screen name="meals/[id]" options={{ href: null }} />
          <Tabs.Screen name="product/[id]" options={{ href: null }} />
          <Tabs.Screen name="meals/camera" options={{ href: null }} />
        </Tabs>
      </AuthGate>
    </ClerkProvider>
  );
}

function AuthGate({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#005f57" />
      </View>
    );
  }

  return children;
}
