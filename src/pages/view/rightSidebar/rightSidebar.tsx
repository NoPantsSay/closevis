import {
  DockviewReact,
  type DockviewReadyEvent,
  themeDark,
  themeLight,
} from "dockview-react";
import { useTheme } from "../../../stores/useTheme";
import { eventBus } from "../../../utils/eventBus";
import { DockviewCloseButton } from "../buttons/dockviewCloseButton";
import { tabComponents } from "../components/tabComponents";

const components = {
  variables: () => {
    return null;
  },
  events: () => {
    return null;
  },
};

const rightSidebarRightComponent = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <DockviewCloseButton
        onClick={() => {
          eventBus.emit("setrightsidebar", false);
        }}
      />
    </div>
  );
};

export function RightSidebar() {
  const { currentTheme } = useTheme();

  const onReady = (event: DockviewReadyEvent) => {
    event.api.addPanel({
      id: "variables",
      title: "Variables",
      component: "variables",
      tabComponent: "sidebar",
    });

    event.api.addPanel({
      id: "events",
      title: "Events",
      component: "events",
      tabComponent: "sidebar",
    });
  };

  return (
    <DockviewReact
      theme={currentTheme === "DARK" ? themeDark : themeLight}
      onReady={onReady}
      components={components}
      tabComponents={tabComponents}
      rightHeaderActionsComponent={rightSidebarRightComponent}
      disableFloatingGroups={true}
      disableDnd={true}
    />
  );
}
