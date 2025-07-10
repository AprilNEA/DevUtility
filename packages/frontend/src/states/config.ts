import { load } from "@tauri-apps/plugin-store";
import superjson from "superjson";
import { create } from "zustand";
import { combine, type PersistStorage, persist } from "zustand/middleware";
import { IS_TAURI } from "@/utilities/invoke";

const store = IS_TAURI && (await load("config.json"));

const persistStorage: PersistStorage<ConfigStore> = store
  ? {
      getItem: async (name) => {
        const str = await store.get<string>(name);
        if (!str) return null;
        return superjson.parse(str);
      },
      setItem: (name, value) => {
        store.set(name, superjson.stringify(value));
      },
      removeItem: store.delete,
    }
  : {
      getItem: (name) => {
        const str = localStorage.getItem(name);
        if (!str) return null;
        return superjson.parse(str);
      },
      setItem: (name, value) => {
        localStorage.setItem(name, superjson.stringify(value));
      },
      removeItem: localStorage.removeItem,
    };

type Theme = "light" | "dark" | "system";

type ConfigState = {
  theme: Theme;
};
type ConfigActions = {
  setTheme: (theme: Theme) => void;
};
type ConfigStore = ConfigState & ConfigActions;

const initialState: ConfigState = {
  theme: "system",
} as const;

export const useConfigStore = create<ConfigStore>()(
  persist(
    combine(initialState, (set, get) => ({
      setTheme: (theme: Theme) => set({ theme }),
    })),
    {
      name: "config",
      storage: persistStorage,
    },
  ),
);
