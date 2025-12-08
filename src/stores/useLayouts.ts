import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
} from "date-fns";
import SuperJSON from "superjson";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createSuperJSONStorage } from "./utils/superJsonStorage";
import { defaultTauriStorage } from "./utils/tauriStoreState";

export enum LayoutTypeEnum {
  Local = "local",
  Online = "online",
  All = "all",
}

interface LayoutTypeInfo {
  type: LayoutTypeEnum;
  display: string;
}

export const layoutTypes: LayoutTypeInfo[] = [
  {
    type: LayoutTypeEnum.All,
    display: "layouts.types.all",
  },
  {
    type: LayoutTypeEnum.Local,
    display: "layouts.types.local",
  },
  {
    type: LayoutTypeEnum.Online,
    display: "layouts.types.online",
  },
];

const layoutTypesMap = new Map(layoutTypes.map((data) => [data.type, data]));

export enum LayoutUpdateFilterEnum {
  All = "all",
  Today = "today",
  Yesterday = "yesterday",
  Last7Days = "last7Days",
  Last30Days = "last30Days",
  ThisMonth = "thisMonth",
  LastMonth = "lastMonth",
  ThisYear = "thisYear",
}

interface LayoutUpdateFilterInfo {
  type: LayoutUpdateFilterEnum;
  display: string;
  filter: (laterDate: Date, earlierDate: Date) => boolean;
}

export const layoutUpdateFilters: LayoutUpdateFilterInfo[] = [
  {
    type: LayoutUpdateFilterEnum.All,
    display: "layouts.update_filters.all_time",
    filter: (_laterDate: Date, _earlierDate: Date) => {
      return true;
    },
  },
  {
    type: LayoutUpdateFilterEnum.Today,
    display: "layouts.update_filters.today",
    filter: (laterDate: Date, earlierDate: Date) => {
      return differenceInCalendarDays(laterDate, earlierDate) === 0;
    },
  },
  {
    type: LayoutUpdateFilterEnum.Yesterday,
    display: "layouts.update_filters.yesterday",
    filter: (laterDate: Date, earlierDate: Date) => {
      return differenceInCalendarDays(laterDate, earlierDate) === 1;
    },
  },
  {
    type: LayoutUpdateFilterEnum.Last7Days,
    display: "layouts.update_filters.last_7_days",
    filter: (laterDate: Date, earlierDate: Date) => {
      return differenceInCalendarDays(laterDate, earlierDate) <= 7;
    },
  },
  {
    type: LayoutUpdateFilterEnum.Last30Days,
    display: "layouts.update_filters.last_30_days",
    filter: (laterDate: Date, earlierDate: Date) => {
      return differenceInCalendarDays(laterDate, earlierDate) <= 30;
    },
  },
  {
    type: LayoutUpdateFilterEnum.ThisMonth,
    display: "layouts.update_filters.this_month",
    filter: (laterDate: Date, earlierDate: Date) => {
      return differenceInCalendarMonths(laterDate, earlierDate) === 0;
    },
  },
  {
    type: LayoutUpdateFilterEnum.LastMonth,
    display: "layouts.update_filters.last_month",
    filter: (laterDate: Date, earlierDate: Date) => {
      return differenceInCalendarMonths(laterDate, earlierDate) === 1;
    },
  },
  {
    type: LayoutUpdateFilterEnum.ThisYear,
    display: "layouts.update_filters.this_year",
    filter: (laterDate: Date, earlierDate: Date) => {
      return differenceInCalendarYears(laterDate, earlierDate) === 0;
    },
  },
];

const layoutUpdateFiltersMap = new Map(
  layoutUpdateFilters.map((data) => [data.type, data]),
);

export interface LayoutsInfo {
  uuid: string;
  name: string;
  type: LayoutTypeEnum;
  lastUpdated: Date;
  lastOpened?: Date;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
}

interface LayoutsState {
  recentlayouts: string[];
  layouts: Map<string, LayoutsInfo>;
  addLayout: (name: string, type?: LayoutTypeEnum) => string;
  delLayout: (uuid: string) => void;
  updateLayout: (
    uuid: string,
    updates: Omit<Partial<LayoutsInfo>, "uuid">,
  ) => void;
  getLayout: (uuid: string) => LayoutsInfo | null;
  duplicateLayout: (uuid: string) => void;
  getSnapshotAsJSON: (uuid: string) => string;
  loadDataFromJSON: (jsonString: string) => string | null;
  pushRecentLayout: (uuid: string) => void;
  getRecentLayouts: () => LayoutsInfo[];
  getCurrentLayout: () => LayoutsInfo | null;
  getLayoutTypeDisplay: (type: LayoutTypeEnum) => string;
  getlayoutUpdateFilterDisplay: (type: LayoutUpdateFilterEnum) => string;
  getlayoutUpdateFilterFilter: (
    type: LayoutUpdateFilterEnum,
  ) => (laterDate: Date, earlierDate: Date) => boolean;
}

export const useLayouts = create<LayoutsState>()(
  persist(
    immer((set, get) => ({
      recentlayouts: [],
      layouts: new Map(),
      addLayout: (name: string, type?: LayoutTypeEnum) => {
        const uuid = uuidv4();
        set((state: LayoutsState) => {
          state.layouts.set(uuid, {
            uuid,
            name,
            type: type ? type : LayoutTypeEnum.Local,
            lastUpdated: new Date(),
            isLeftSidebarOpen: true,
            isRightSidebarOpen: true,
          });
        });
        return uuid;
      },
      delLayout: (uuid: string) => {
        set((state: LayoutsState) => {
          state.layouts.delete(uuid);
          state.recentlayouts = state.recentlayouts.filter((id) => id !== uuid);
        });
      },
      updateLayout: (
        uuid: string,
        updates: Omit<Partial<LayoutsInfo>, "uuid">,
      ) => {
        set((state: LayoutsState) => {
          const layout = state.layouts.get(uuid);
          if (layout) {
            state.layouts.set(uuid, {
              ...layout,
              ...updates,
            });
          }
        });
      },
      getLayout: (uuid: string) => {
        const layout = get().layouts.get(uuid);
        return layout ? layout : null;
      },
      duplicateLayout: (uuid: string) => {
        set((state: LayoutsState) => {
          const layout = state.layouts.get(uuid);
          const newUuid = uuidv4();
          if (layout) {
            state.layouts.set(newUuid, {
              ...layout,
              uuid: newUuid,
              name: `${layout.name} copy`,
              type: LayoutTypeEnum.Local,
              lastUpdated: new Date(),
              lastOpened: undefined,
            });
          }
        });
      },
      getSnapshotAsJSON: (uuid: string) => {
        const layout = get().layouts.get(uuid);
        return SuperJSON.stringify(layout);
      },
      loadDataFromJSON: (jsonString: string) => {
        let parsedLayout: LayoutsInfo | null = null;

        try {
          parsedLayout = SuperJSON.parse(jsonString);
        } catch (error) {
          console.error("Failed to parse imported state:", error);
        }

        if (parsedLayout) {
          const uuid = uuidv4();
          set((state: LayoutsState) => {
            state.layouts.set(uuid, {
              ...parsedLayout,
              uuid,
              type: LayoutTypeEnum.Local,
              lastUpdated: new Date(),
              lastOpened: undefined,
            });
          });

          return uuid;
        }

        return null;
      },
      pushRecentLayout: (uuid: string) => {
        set((state: LayoutsState) => {
          state.recentlayouts = state.recentlayouts.filter((id) => id !== uuid);
          state.recentlayouts.unshift(uuid);
          if (state.recentlayouts.length > 2) {
            state.recentlayouts.pop();
          }
        });
      },
      getRecentLayouts: () => {
        const recentLayouts: LayoutsInfo[] = [];
        const { recentlayouts, layouts } = get();
        recentlayouts.forEach((uuid) => {
          const layout = layouts.get(uuid);
          if (layout) {
            recentLayouts.push(layout);
          }
        });
        return recentLayouts;
      },
      getCurrentLayout: () => {
        const { recentlayouts, layouts } = get();
        if (recentlayouts.length > 0) {
          const layout = layouts.get(recentlayouts[0]);
          if (layout) {
            return layout;
          }
        }
        return null;
      },
      getLayoutTypeDisplay: (type: LayoutTypeEnum) => {
        const info = layoutTypesMap.get(type);
        return info ? info.display : layoutTypes[0].display;
      },
      getlayoutUpdateFilterDisplay: (type: LayoutUpdateFilterEnum) => {
        const info = layoutUpdateFiltersMap.get(type);
        return info ? info.display : layoutUpdateFilters[0].display;
      },
      getlayoutUpdateFilterFilter: (type: LayoutUpdateFilterEnum) => {
        const info = layoutUpdateFiltersMap.get(type);
        return info ? info.filter : layoutUpdateFilters[0].filter;
      },
    })),
    {
      name: "layouts", // unique name
      storage: createSuperJSONStorage(() => defaultTauriStorage),
      merge: (persistedState, currentState) => {
        const layouts = (persistedState as LayoutsState).layouts;
        layouts.forEach((value, key) => {
          if (value.uuid !== key) {
            value.uuid = key;
          }
        });

        return {
          ...currentState,
          ...(persistedState as LayoutsState),
        };
      },
    },
  ),
);
