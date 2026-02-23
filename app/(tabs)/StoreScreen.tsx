import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import { HeartIcon } from "../components/Icons";
import { useTheme } from "../context/ThemeContext";
import { auth, db, doc, getDoc, updateDoc } from "../firebaseConfig";
import { fetchAppSettings } from "../services/lessonService";
import { applyLifeRegeneration, LIFE_INTERVAL_MINUTES_VALUE, startLifeCountdown } from "../services/lifeService";

const DEFAULT_LIVES = 5;
const REFILL_COST = 600;
const POTION_COST = 350;
const POTION_DOUBLE_XP_MINUTES = 15;

const coerceToMs = (value: any): number | null => {
  if (!value) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value < 1e12 ? value * 1000 : value;
  }
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null;
  if (typeof value === "string") {
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === "object") {
    if (typeof (value as any).toDate === "function") {
      const date = (value as any).toDate();
      return date instanceof Date && Number.isFinite(date.getTime()) ? date.getTime() : null;
    }
    if (typeof (value as any).seconds === "number") return (value as any).seconds * 1000;
    if (typeof (value as any)._seconds === "number") return (value as any)._seconds * 1000;
  }
  return null;
};

const PotionSvg = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="#F2C94C" stroke="#F2C94C" />
    <Path
      d="M9 6h6v5.5c0 1.38.77 2.65 2 3.32l0 0c-.84 2.45-3.16 4.18-6 4.18s-5.16-1.73-6-4.18l0 0c1.23-.67 2-1.94 2-3.32V6Z"
      fill="#F2C94C"
      stroke="#DAA520"
      strokeWidth={1.2}
    />
    <Path d="M10 11h4" stroke="#DAA520" strokeWidth={1.4} strokeLinecap="round" />
    <Path d="M11 14h2" stroke="#DAA520" strokeWidth={1.4} strokeLinecap="round" />
  </Svg>
);

const StoreScreen = () => {
  const { styles: globalStyles, colors } = useTheme();
  const storeStyles = useMemo(() => createStyles(colors), [colors]);

  const [loading, setLoading] = useState(true);
  const [userLives, setUserLives] = useState(DEFAULT_LIVES);
  const [isPremium, setIsPremium] = useState(false);
  const [safiras, setSafiras] = useState(0);
  const [processingLives, setProcessingLives] = useState(false);
  const [processingPremium, setProcessingPremium] = useState(false);
  const [processingPotion, setProcessingPotion] = useState(false);
  const [lastLifeUpdate, setLastLifeUpdate] = useState<number | null>(null);
  const [isStoreEnabled, setIsStoreEnabled] = useState(true);
  const [globalInfiniteLives, setGlobalInfiniteLives] = useState(false);
  const [isPremiumModeEnabled, setIsPremiumModeEnabled] = useState(true);

  const parseLives = (data: any) => {
    if (typeof data?.lives === "number") return data.lives;
    if (typeof data?.vidas === "number") return data.vidas;
    return DEFAULT_LIVES;
  };

  const loadUserStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      const settings = await fetchAppSettings();
      setIsStoreEnabled(settings.isStoreEnabled !== false);
      setGlobalInfiniteLives(settings.globalInfiniteLives === true);
      setIsPremiumModeEnabled(settings.isPremiumModeEnabled !== false);

      const user = auth.currentUser;
      if (!user) {
        setUserLives(DEFAULT_LIVES);
        setIsPremium(false);
        setSafiras(0);
        setLastLifeUpdate(Date.now());
        return;
      }
      const userDocRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const baseLives = parseLives(data);
        const regenerated = applyLifeRegeneration({
          lives: baseLives,
          lastLifeUpdate: (data as any)?.lastLifeUpdate ?? null,
        });

        setUserLives(regenerated.lives);
        setIsPremium(Boolean(data?.isPremium));
        setSafiras(
          typeof data?.safiras === "number"
            ? data.safiras
            : typeof data?.safira === "number"
            ? data.safira
            : 0
        );
        setLastLifeUpdate(regenerated.lastLifeUpdate);
      } else {
        setUserLives(DEFAULT_LIVES);
        setIsPremium(false);
        setSafiras(0);
        setLastLifeUpdate(Date.now());
      }
    } catch (error) {
      console.warn("Não foi possível carregar a loja:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserStatus();
  }, [loadUserStatus]);

  useFocusEffect(
    useCallback(() => {
      loadUserStatus();
    }, [loadUserStatus])
  );

  const requireUser = () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert(
        "Conta necessária",
        "Entre ou crie sua conta para pegar vidas e ativar o premium."
      );
    }
    return user;
  };

  const handleRefillLives = async () => {
    if (processingLives) return;
    if (isPremium || globalInfiniteLives) {
      Alert.alert("Premium ativo", "Vidas infinitas não precisam de recarga.");
      return;
    }
    const user = requireUser();
    if (!user) return;
    if (safiras < REFILL_COST) {
      Alert.alert("Safiras insuficientes", `Você precisa de ${REFILL_COST} safiras para recarregar.`);
      return;
    }
    try {
      setProcessingLives(true);
      const fullLives = DEFAULT_LIVES;
      const newSafiras = safiras - REFILL_COST;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        lives: fullLives,
        vidas: fullLives,
        safiras: newSafiras,
        lastLifeUpdate: startLifeCountdown(),
      });
      setUserLives(fullLives);
      setSafiras(newSafiras);
      Alert.alert("Vidas recarregadas", "Voltamos suas vidas para o máximo.");
    } catch (error) {
      console.warn("Não foi possível recarregar vidas:", error);
      Alert.alert("Ops", "Não conseguimos recarregar agora. Tente novamente.");
    } finally {
      setProcessingLives(false);
    }
  };

  const handleActivatePremium = async () => {
    if (processingPremium || isPremium) return;
    const user = requireUser();
    if (!user) return;
    try {
      setProcessingPremium(true);
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { isPremium: true, lives: DEFAULT_LIVES, vidas: DEFAULT_LIVES });
      setIsPremium(true);
      setUserLives(DEFAULT_LIVES);
      Alert.alert("Premium ativo", "Vidas infinitas liberadas no FastAid!");
    } catch (error) {
      console.warn("Não foi possível ativar o premium:", error);
      Alert.alert("Ops", "Não conseguimos ativar agora. Tente novamente.");
    } finally {
      setProcessingPremium(false);
    }
  };

  const handleDeactivatePremium = async () => {
    if (processingPremium || !isPremium) return;
    const user = requireUser();
    if (!user) return;
    try {
      setProcessingPremium(true);
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { isPremium: false, lives: DEFAULT_LIVES, vidas: DEFAULT_LIVES });
      setIsPremium(false);
      setUserLives(DEFAULT_LIVES);
      Alert.alert("Premium desativado", "Vidas infinitas desligadas. Voltamos para 5 vidas.");
    } catch (error) {
      console.warn("Não foi possível desativar o premium:", error);
      Alert.alert("Ops", "Não conseguimos desativar agora. Tente novamente.");
    } finally {
      setProcessingPremium(false);
    }
  };

  const handleUsePotion = async () => {
    if (processingPotion) return;
    const user = requireUser();
    if (!user) return;
    if (safiras < POTION_COST) {
      Alert.alert("Safiras insuficientes", `Você precisa de ${POTION_COST} safiras para usar uma poção.`);
      return;
    }
    try {
      setProcessingPotion(true);
      const newSafiras = safiras - POTION_COST;
      const userDocRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userDocRef);
      const data = snapshot.exists() ? snapshot.data() : null;
      const currentUntilMs = coerceToMs((data as any)?.doubleXpUntil);
      const baseMs =
        currentUntilMs !== null && currentUntilMs > Date.now() ? currentUntilMs : Date.now();
      const expiresAt = new Date(baseMs + POTION_DOUBLE_XP_MINUTES * 60 * 1000).toISOString();
      await updateDoc(userDocRef, {
        safiras: newSafiras,
        doubleXpUntil: expiresAt,
        doubleXpMultiplier: 2,
      });
      setSafiras(newSafiras);
      Alert.alert("Pocao usada", `XP dobrado ativado por ${POTION_DOUBLE_XP_MINUTES} minutos.`);
    } catch (error) {
      console.warn("Não foi possível usar a poção:", error);
      Alert.alert("Ops", "Não conseguimos usar a poção agora. Tente novamente.");
    } finally {
      setProcessingPotion(false);
    }
  };

  const minutesToNextLife = () => {
    if (isPremium || userLives >= DEFAULT_LIVES || !lastLifeUpdate) return null;
    const elapsedMs = Date.now() - lastLifeUpdate;
    const remainingMs =
      LIFE_INTERVAL_MINUTES_VALUE * 60 * 1000 - (elapsedMs % (LIFE_INTERVAL_MINUTES_VALUE * 60 * 1000));
    const minutes = Math.max(0, Math.ceil(remainingMs / 60000));
    return minutes;
  };

  if (!isStoreEnabled) {
    return (
      <SafeAreaView style={globalStyles.safe}>
        <View style={[storeStyles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          <Image source={require("../../assets/images/band_chorando.png")} style={{ width: 150, height: 150, marginBottom: 20 }} />
          <Text style={[storeStyles.heroTitle, { textAlign: 'center' }]}>Loja Fechada</Text>
          <Text style={[storeStyles.heroSubtitle, { textAlign: 'center', marginTop: 10 }]}>
            A loja de itens está temporariamente indisponível. Tente novamente mais tarde.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safe}>
      <ScrollView contentContainerStyle={storeStyles.container}>
        <View style={storeStyles.heroCard}>
          <View style={storeStyles.heroTextArea}>
            <Text style={storeStyles.heroTitle}>Loja FastAid</Text>
            <Text style={storeStyles.heroSubtitle}>
              {isPremiumModeEnabled
                ? "Use safiras para vidas e poções, ou ative o modo Premium."
                : "Use safiras para recarregar vidas e usar poções de energia."}
            </Text>
            <View style={storeStyles.badgeRow}>
              {isPremiumModeEnabled && (
                <View style={[storeStyles.badge, isPremium ? storeStyles.badgeSuccess : storeStyles.badgeMuted]}>
                  <Text style={[storeStyles.badgeText, isPremium && storeStyles.badgeTextOnPrimary]}>
                    {isPremium ? "Premium ativo" : "Premium desligado"}
                  </Text>
                </View>
              )}
              <View style={storeStyles.badge}>
                <Text style={storeStyles.badgeText}>Vidas: {isPremium || globalInfiniteLives ? "∞" : userLives}</Text>
              </View>
              <View style={storeStyles.badge}>
                <Text style={storeStyles.badgeText}>Safiras: {safiras}</Text>
              </View>
            </View>
          </View>
          <Image source={require("../../assets/images/torneios.png")} style={storeStyles.heroImage} />
        </View>

        <View style={storeStyles.card}>
          <View style={storeStyles.cardHeader}>
            <View style={storeStyles.iconBubble}>
              <HeartIcon />
            </View>
            <View>
              <Text style={storeStyles.cardTitle}>Recarga de vidas</Text>
              <Text style={storeStyles.cardSubtitle}>
                {globalInfiniteLives ? "Evento de Vidas Infinitas Ativo!" : "Volte para 5 vidas em um toque."}
              </Text>
            </View>
          </View>
          <View style={storeStyles.bulletList}>
            <Text style={storeStyles.bullet}>- +5 vidas instantaneamente</Text>
            <Text style={storeStyles.bullet}>- Sem esperar regeneração</Text>
            <Text style={storeStyles.bullet}>- Ideal para manter a ofensiva</Text>
          </View>
          <TouchableOpacity
            style={[storeStyles.primaryButton, (processingLives || globalInfiniteLives) && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleRefillLives}
            disabled={processingLives || loading || globalInfiniteLives}
          >
            {processingLives ? (
              <ActivityIndicator color="#fff" />
            ) : globalInfiniteLives ? (
              <Text style={storeStyles.primaryButtonText}>Vidas Infinitas Ativas</Text>
            ) : (
              <Text style={storeStyles.primaryButtonText}>Recarregar 5 vidas (600 safiras)</Text>
            )}
          </TouchableOpacity>
          {minutesToNextLife() !== null && (
            <Text style={storeStyles.helperText}>
              Recarrega sozinho em {minutesToNextLife()} min (1 vida a cada {LIFE_INTERVAL_MINUTES_VALUE} min).
            </Text>
          )}
        </View>

        {isPremiumModeEnabled && (
          <View style={[storeStyles.card, storeStyles.premiumCard]}>
            <View style={storeStyles.cardHeader}>
              <View style={[storeStyles.iconBubble, storeStyles.iconBubblePremium]}>
                <Image source={require("../../assets/images/band_feliz.png")} style={storeStyles.premiumIcon} />
              </View>
              <View>
                <Text style={storeStyles.cardTitle}>Modo Premium</Text>
                <Text style={storeStyles.cardSubtitle}>Vidas infinitas e foco total nas lições.</Text>
              </View>
            </View>
            <View style={storeStyles.bulletList}>
              <Text style={storeStyles.bullet}>- Vidas infinitas para estudar sem parar</Text>
              <Text style={storeStyles.bullet}>- Mantém ofensiva sempre segura</Text>
              <Text style={storeStyles.bullet}>- Ativação imediata no seu perfil</Text>
            </View>
            <TouchableOpacity
              style={[
                storeStyles.primaryButton,
                storeStyles.premiumButton,
                isPremium && storeStyles.premiumButtonActive,
                processingPremium && { opacity: 0.7 },
              ]}
              activeOpacity={0.85}
              onPress={isPremium ? handleDeactivatePremium : handleActivatePremium}
              disabled={processingPremium || loading}
            >
              {processingPremium ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text
                  style={[
                    storeStyles.primaryButtonText,
                    storeStyles.premiumButtonText,
                    isPremium && storeStyles.premiumButtonTextActive,
                  ]}
                >
                  {isPremium ? "Desativar premium" : "Ativar premium"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={storeStyles.card}>
          <View style={storeStyles.cardHeader}>
            <View style={[storeStyles.iconBubble, storeStyles.iconBubblePotion]}>
              <PotionSvg />
            </View>
            <View>
              <Text style={storeStyles.cardTitle}>Pocao de Energia</Text>
              <Text style={storeStyles.cardSubtitle}>XP dobrado por tempo limitado.</Text>
            </View>
          </View>
          <View style={storeStyles.bulletList}>
            <Text style={storeStyles.bullet}>- Custa {POTION_COST} safiras</Text>
            <Text style={storeStyles.bullet}>- Ativa XP x2 por {POTION_DOUBLE_XP_MINUTES} minutos</Text>
          </View>
          <TouchableOpacity
            style={[storeStyles.primaryButton, processingPotion && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleUsePotion}
            disabled={processingPotion || loading}
          >
            {processingPotion ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={storeStyles.primaryButtonText}>Usar poção ({POTION_COST} safiras)</Text>
            )}
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={storeStyles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={storeStyles.loadingText}>Atualizando sua conta...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      padding: 20,
      gap: 18,
      backgroundColor: colors.background,
    },
    heroCard: {
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    heroTextArea: { flex: 1, gap: 6 },
    heroTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.text,
    },
    heroSubtitle: {
      color: colors.text,
      opacity: 0.8,
      fontSize: 14,
      lineHeight: 20,
    },
    heroImage: { width: 96, height: 96, resizeMode: "contain" },
    badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeMuted: {
      backgroundColor: colors.background,
    },
    badgeSuccess: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    badgeText: {
      color: colors.text,
      fontWeight: "600",
    },
    badgeTextOnPrimary: {
      color: colors.background,
    },
    card: {
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 12,
    },
    premiumCard: {
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    iconBubble: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    iconBubblePremium: {
      backgroundColor: colors.card,
      borderColor: colors.primary,
    },
    iconBubblePotion: {
      backgroundColor: colors.background,
      borderColor: colors.primary,
    },
    premiumIcon: { width: 38, height: 38, resizeMode: "contain" },
    cardTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
    cardSubtitle: { color: colors.text, opacity: 0.85 },
    bulletList: { gap: 6, marginTop: 4 },
    bullet: { color: colors.text, opacity: 0.85, fontSize: 14 },
    primaryButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
    },
    premiumButton: {
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    premiumButtonActive: {
      backgroundColor: colors.background,
      borderColor: colors.primary,
    },
    premiumButtonText: { color: colors.primary },
    premiumButtonTextActive: { color: colors.text },
    helperText: { color: colors.text, opacity: 0.7, marginTop: 8, fontSize: 12 },
    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 12,
    },
    loadingText: { color: colors.text, opacity: 0.8 },
  });

export default StoreScreen;
