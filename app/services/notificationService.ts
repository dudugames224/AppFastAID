import AsyncStorage from "@react-native-async-storage/async-storage";
import cancelScheduledNotificationAsync from "expo-notifications/build/cancelScheduledNotificationAsync";
import getAllScheduledNotificationsAsync from "expo-notifications/build/getAllScheduledNotificationsAsync";
import { AndroidImportance } from "expo-notifications/build/NotificationChannelManager.types";
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-notifications/build/NotificationPermissions";
import { IosAuthorizationStatus } from "expo-notifications/build/NotificationPermissions.types";
import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";
import scheduleNotificationAsync from "expo-notifications/build/scheduleNotificationAsync";
import setNotificationChannelAsync from "expo-notifications/build/setNotificationChannelAsync";
import { Platform } from "react-native";

const STORAGE_PREFIX = "fastaid:scheduled-notification:";
const REMINDER_CHANNEL_ID = "fastaid-reminders";
const INACTIVITY_REMINDER_IDENTIFIER = "daily-inactivity-reminder";
const LAST_ACTIVITY_STORAGE_KEY = `${STORAGE_PREFIX}last-activity`;
const INACTIVITY_INTERVAL_IN_HOURS = 24;

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // Substitui shouldShowAlert
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowList: true,   // Opcional: mostra na central de notificações
  }),
});


const ensureAndroidChannel = async () => {
  if (Platform.OS !== "android") {
    return;
  }

  await setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "Lembretes FastAid",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF4B4B",
  });
};

export const ensureNotificationPermissions = async (): Promise<boolean> => {
  const currentSettings = await getPermissionsAsync();
  if (
    currentSettings.granted ||
    currentSettings.ios?.status === IosAuthorizationStatus.PROVISIONAL
  ) {
    await ensureAndroidChannel();
    return true;
  }

  const requestResult = await requestPermissionsAsync();
  const granted =
    requestResult.granted ||
    requestResult.ios?.status === IosAuthorizationStatus.PROVISIONAL;

  if (granted) {
    await ensureAndroidChannel();
  }

  return granted;
};

export type ReminderMessage = {
  emoji: string;
  title: string;
  body: string;
};

const REMINDER_MESSAGES: ReminderMessage[] = [
  {
    emoji: "🚨",
    title: "Modo Resgate",
    body: "Faça uma lição relâmpago e mantenha sua ofensiva viva!",
  },
  {
    emoji: "🧠",
    title: "Neurônios em ação",
    body: "Estude 60 segundos e desbloqueie mais XP hoje.",
  },
  {
    emoji: "🔥",
    title: "Ofensiva pegando fogo",
    body: "Só falta você revisar um módulo para manter a chama acesa.",
  },
  {
    emoji: "⏰",
    title: "Ping da vida",
    body: "Hora de praticar primeiros socorros antes que o cronômetro zere.",
  },
  {
    emoji: "🛟",
    title: "Socorro divertido",
    body: "Relembre uma dica do FastAid e salve seu streak com estilo 😎",
  },
];

export const getRandomReminderMessage = (): ReminderMessage => {
  const index = Math.floor(Math.random() * REMINDER_MESSAGES.length);
  return REMINDER_MESSAGES[index];
};

type ScheduleReminderParams = {
  identifier: string;
  message?: ReminderMessage;
  data?: Record<string, unknown>;
  intervalInMinutes?: number;
};

const getStorageKey = (identifier: string) => `${STORAGE_PREFIX}${identifier}`;

export const isReminderScheduled = async (identifier: string): Promise<boolean> => {
  const storedId = await AsyncStorage.getItem(getStorageKey(identifier));
  if (!storedId) {
    return false;
  }
  const allScheduled = await getAllScheduledNotificationsAsync();
  return allScheduled.some((item) => item.identifier === storedId);
};

export const scheduleRepeatingReminder = async ({
  identifier,
  message,
  data,
  intervalInMinutes = 1,
}: ScheduleReminderParams): Promise<string> => {
  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) {
    throw new Error("notifications-permission-denied");
  }

  const storageKey = getStorageKey(identifier);
  const storedId = await AsyncStorage.getItem(storageKey);

  if (storedId) {
    await cancelScheduledNotificationAsync(storedId).catch(() => {});
    await AsyncStorage.removeItem(storageKey);
  }

  const reminderMessage = message ?? getRandomReminderMessage();
  const secondsInterval = Math.max(60, Math.round(intervalInMinutes * 60));

  const newId = await scheduleNotificationAsync({
    content: {
      title: `${reminderMessage.emoji} ${reminderMessage.title}`,
      body: reminderMessage.body,
      sound: true,
      data,
    },
    trigger: {
      seconds: secondsInterval,
      repeats: true,
      channelId: Platform.OS === "android" ? REMINDER_CHANNEL_ID : undefined,
    },
  });

  await AsyncStorage.setItem(storageKey, newId);
  return newId;
};

export const cancelReminder = async (identifier: string): Promise<void> => {
  const storageKey = getStorageKey(identifier);
  const storedId = await AsyncStorage.getItem(storageKey);
  if (!storedId) {
    return;
  }
  await cancelScheduledNotificationAsync(storedId).catch(() => {});
  await AsyncStorage.removeItem(storageKey);
};

type InactivityReminderMessage = {
  title: string;
  body: string;
};

const INACTIVITY_MESSAGES: InactivityReminderMessage[] = [
  {
    title: "Ofensiva em risco",
    body: "Voce ainda nao entrou hoje. Abra o FastAid e mantenha o ritmo.",
  },
  {
    title: "Chamada do socorro",
    body: "Faz um dia sem treino. Revise um modulo rapido e ganhe XP agora.",
  },
  {
    title: "Seu streak precisa de voce",
    body: "Volte para o FastAid hoje e nao deixe a ofensiva cair.",
  },
];

const getRandomInactivityMessage = (): InactivityReminderMessage => {
  const index = Math.floor(Math.random() * INACTIVITY_MESSAGES.length);
  return INACTIVITY_MESSAGES[index];
};

const updateLastActivityTimestamp = async () => {
  await AsyncStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, Date.now().toString());
};

export const refreshInactivityReminder = async (): Promise<void> => {
  await updateLastActivityTimestamp();

  const hasPermission = await ensureNotificationPermissions();
  if (!hasPermission) {
    return;
  }

  const storageKey = getStorageKey(INACTIVITY_REMINDER_IDENTIFIER);
  const storedId = await AsyncStorage.getItem(storageKey);
  if (storedId) {
    await cancelScheduledNotificationAsync(storedId).catch(() => {});
  }

  const reminderMessage = getRandomInactivityMessage();

  const newId = await scheduleNotificationAsync({
    content: {
      title: reminderMessage.title,
      body: reminderMessage.body,
      sound: true,
      data: { type: "inactivity-reminder" },
    },
    trigger: {
      seconds: INACTIVITY_INTERVAL_IN_HOURS * 60 * 60,
      repeats: true,
      channelId: Platform.OS === "android" ? REMINDER_CHANNEL_ID : undefined,
    },
  });

  await AsyncStorage.setItem(storageKey, newId);
};
