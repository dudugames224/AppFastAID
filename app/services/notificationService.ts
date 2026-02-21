import AsyncStorage from "@react-native-async-storage/async-storage";
import cancelScheduledNotificationAsync from "expo-notifications/build/cancelScheduledNotificationAsync";
import getAllScheduledNotificationsAsync from "expo-notifications/build/getAllScheduledNotificationsAsync";
import { AndroidImportance } from "expo-notifications/build/NotificationChannelManager.types";
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-notifications/build/NotificationPermissions";
import { IosAuthorizationStatus } from "expo-notifications/build/NotificationPermissions.types";
import { SchedulableTriggerInputTypes } from "expo-notifications/build/Notifications.types";
import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";
import scheduleNotificationAsync from "expo-notifications/build/scheduleNotificationAsync";
import setNotificationChannelAsync from "expo-notifications/build/setNotificationChannelAsync";
import { Platform } from "react-native";

const STORAGE_PREFIX = "fastaid:scheduled-notification:";
const REMINDER_CHANNEL_ID = "fastaid-reminders";
const INACTIVITY_REMINDER_IDENTIFIER = "daily-inactivity-reminder";
const LAST_ACTIVITY_STORAGE_KEY = `${STORAGE_PREFIX}last-activity`;
const INACTIVITY_INTERVAL_IN_HOURS = 8;
const INACTIVITY_IDS_KEY = `${STORAGE_PREFIX}inactivity-ids`;
const NAG_START_HOUR = 9; // 9:00 AM
const NAG_COUNT = 2; // Notificações às 9, 11, 13, 15, 17
const NAG_DAYS = 2; // Insiste por 3 dias seguidos se não abrir

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
    name: "Lembretes FastAID",
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
    emoji: "🚑",
    title: "Hora de praticar!",
    body: "Mantenha seus conhecimentos de primeiros socorros em dia.",
  },
  {
    emoji: "🔥",
    title: "Não perca o ritmo!",
    body: "Complete uma lição rápida para manter sua ofensiva.",
  },
  {
    emoji: "📚",
    title: "Aprenda algo novo",
    body: "Que tal revisar um módulo hoje?",
  },
  {
    emoji: "🛟",
    title: "Socorro divertido",
    body: "Relembre uma dica do FastAID e salve seu streak com estilo 😎",
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
  intervalInMinutes = 24 * 60,
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
  const secondsInterval = Math.max(60 * 60, Math.round(intervalInMinutes * 60));

  const newId = await scheduleNotificationAsync({
    content: {
      title: `${reminderMessage.emoji} ${reminderMessage.title}`,
      body: reminderMessage.body,
      sound: true,
      data,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
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
    body: "Voce ainda nao entrou hoje. Abra o FastAID e mantenha o ritmo.",
  },
  {
    title: "Chamada do socorro",
    body: "Faz um dia sem treino. Revise um modulo rapido e ganhe XP agora.",
  },
  {
    title: "Seu streak precisa de voce",
    body: "Volte para o FastAID hoje e nao deixe a ofensiva cair.",
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

  // CORREÇÃO: Limpeza robusta baseada no tipo da notificação.
  // Em vez de confiar no AsyncStorage (que pode falhar e deixar notificações órfãs),
  // buscamos todas as agendadas no sistema e removemos as de inatividade.
  const allScheduled = await getAllScheduledNotificationsAsync();
  const cancelPromises = allScheduled
    .filter((n) => n.content.data?.type === "inactivity-reminder")
    .map((n) => cancelScheduledNotificationAsync(n.identifier).catch(() => {}));
  
  await Promise.all(cancelPromises);

  // Limpa chaves antigas do storage para manter consistência
  const legacyKey = getStorageKey(INACTIVITY_REMINDER_IDENTIFIER);
  await AsyncStorage.removeItem(legacyKey);
  await AsyncStorage.removeItem(INACTIVITY_IDS_KEY);

  // 3. Agenda sequência para o dia seguinte (Nagging)
  const now = new Date();

  // Loop para agendar para Amanhã, Depois de Amanhã, etc.
  for (let day = 1; day <= NAG_DAYS; day++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + day);
    targetDate.setHours(NAG_START_HOUR, 0, 0, 0); // Começa às 09:00 de cada dia

    for (let i = 0; i < NAG_COUNT; i++) {
      // Calcula o horário de cada notificação (9h, 11h, 13h...) para aquele dia
      const nagTime = new Date(targetDate.getTime() + i * INACTIVITY_INTERVAL_IN_HOURS * 60 * 60 * 1000);
      const secondsUntil = Math.floor((nagTime.getTime() - now.getTime()) / 1000);

      if (secondsUntil > 0) {
        const reminderMessage = getRandomInactivityMessage();
        await scheduleNotificationAsync({
          content: {
            title: reminderMessage.title,
            body: reminderMessage.body,
            sound: true,
            data: { type: "inactivity-reminder" },
          },
          trigger: {
            type: SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsUntil,
            repeats: false, // Dispara uma vez naquele horário específico
            channelId: Platform.OS === "android" ? REMINDER_CHANNEL_ID : undefined,
          },
        });
      }
    }
  }
};



