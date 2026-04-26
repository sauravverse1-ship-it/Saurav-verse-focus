import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          tasks: "Tasks",
          habits: "Habits",
          analytics: "Analytics",
          settings: "Settings",
          done: "Done",
          urgent: "Urgent",
          add_task: "Add Task",
          add_habit: "Add New Habit",
          home: "Home",
          timer: "Timer",
          streak: "Current Streak",
          best_streak: "Best Streak",
          days_ago_format: "{{count}} Days ago...",
          too_long: "Too Long",
          categories: "Categories",
          look_and_feel: "Look and Feel",
          language: "Language"
        }
      },
      ru: {
        translation: {
          tasks: "Задачи",
          habits: "Привычки",
          analytics: "Аналитика",
          settings: "Настройки",
          done: "Готово",
          urgent: "Срочно",
          add_task: "Добавить задачу",
          add_habit: "Добавить привычку",
          home: "Главная",
          timer: "Таймер",
          streak: "Текущая серия",
          best_streak: "Лучшая серия в днях",
          days_ago_format: "{{count}} дней назад…",
          too_long: "Слишком долго",
          categories: "Категории",
          look_and_feel: "Внешний вид",
          language: "Язык"
        }
      },
      fr: {
        translation: {
          tasks: "Tâches",
          habits: "Habitudes",
          analytics: "Données",
          settings: "Paramètres",
          done: "Fini",
          urgent: "Urgent",
          add_task: "Ajouter une tâche",
          add_habit: "Ajouter une nouvelle habitude",
          home: "Accueil",
          timer: "Minuteur",
          streak: "Série",
          best_streak: "Meilleure série",
          days_ago_format: "Il y a {{count}}…",
          too_long: "Trop long",
          categories: "Catégories",
          look_and_feel: "Apparence",
          language: "Langue"
        }
      },
      es: {
        translation: {
          tasks: "Tareas",
          habits: "Hábitos",
          analytics: "Estadísticas",
          settings: "Ajustes",
          done: "Hecho",
          urgent: "Urgente",
          add_task: "Agregar Tarea",
          add_habit: "Agregar Nuevo Hábito",
          home: "Inicio",
          timer: "Temporizador",
          streak: "Racha Actual",
          best_streak: "Mejor Racha",
          days_ago_format: "Hace {{count}} día(s)…",
          too_long: "Demasiado Largo",
          categories: "Categorías",
          look_and_feel: "Apariencia",
          language: "Idioma"
        }
      }
    }
  });

export default i18n;
