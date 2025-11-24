import AsyncStorage from "@react-native-async-storage/async-storage";
import cancelScheduledNotificationAsync from "expo-notifications/build/cancelScheduledNotificationAsync";
import getAllScheduledNotificationsAsync from "expo-notifications/build/getAllScheduledNotificationsAsync";
import { AndroidImportance } from "expo-notifications/build/NotificationChannelManager.types";
import { IosAuthorizationStatus } from "expo-notifications/build/NotificationPermissions.types";
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-notifications/build/NotificationPermissions";
import scheduleNotificationAsync from "expo-notifications/build/scheduleNotificationAsync";
import setNotificationChannelAsync from "expo-notifications/build/setNotificationChannelAsync";
import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";
import { Platform } from "react-native";

const STORAGE_PREFIX = "fastaid:scheduled-notification:";
const REMINDER_CHANNEL_ID = "fastaid-reminders";

// Use deep imports to avoid loading push-token side effects that are blocked in Expo Go.
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
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
