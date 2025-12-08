import {
  type AddPanelPositionOptions,
  type DockviewApi,
  DockviewReact,
  type DockviewReadyEvent,
  type IWatermarkPanelProps,
  themeDark,
  themeLight,
} from "dockview-react";
import { useEffect, useEffectEvent, useState } from "react";
import { useTheme } from "../../../stores/useTheme";
import { eventBus } from "../../../utils/eventBus";
import { tabComponents } from "../components/tabComponents";

const components = {
  default: () => {
    return null;
  },
};

const watermark = (_props: IWatermarkPanelProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none pointer-events-none">
      <span> Watermark </span>
    </div>
  );
};

export function MainPanel() {
  const { currentTheme } = useTheme();
  const [api, setApi] = useState<DockviewApi>();

  const onReady = (event: DockviewReadyEvent) => {
    setApi(event.api);
  };

  useEffect(() => {
    const disposable = api?.onDidActivePanelChange((panel) => {
      eventBus.emit("setActiveMainPanelId", panel ? panel.id : "");
    });

    return () => {
      disposable?.dispose();
    };
  }, [api]);

  const addpanel = useEffectEvent(
    (component: string, position?: AddPanelPositionOptions) => {
      if (!api) {
        return;
      }

      const positionOption = position ? position : { direction: "left" };

      const panel = api.addPanel({
        id: Date.now().toString(),
        component,
        tabComponent: "default",
        position: positionOption,
      });

      panel.group.locked = true;
    },
  );

  useEffect(() => {
    eventBus.on("addpanel", ({ component, position }) => {
      addpanel(component, position);
    });

    // 组件卸载时自动清理（防止内存泄漏）
    return () => {
      eventBus.off("addpanel");
    };
  }, []);

  return (
    <DockviewReact
      theme={currentTheme === "DARK" ? themeDark : themeLight}
      onReady={onReady}
      components={components}
      tabComponents={tabComponents}
      watermarkComponent={watermark}
      disableFloatingGroups={true}
      singleTabMode="fullwidth"
      disableTabsOverflowList={true}
    />
  );
}
