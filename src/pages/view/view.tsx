import clsx from "clsx";
import {
  LayoutPriority,
  Orientation,
  type SplitviewApi,
  SplitviewReact,
  type SplitviewReadyEvent,
  themeDark,
  themeLight,
} from "dockview-react";
import { useEffect, useEffectEvent, useState } from "react";
import { useTitle } from "../../globals/useTitle";
import { type LayoutsInfo, useLayouts } from "../../stores/useLayouts";
import "dockview-react/dist/styles/dockview.css";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../stores/useTheme";
import { eventBus } from "../../utils/eventBus";
import { LeftSidebar } from "./leftSidebar/leftSidebar";
import { MainPanel } from "./mainPanel/mainPanel";
import { RightSidebar } from "./rightSidebar/rightSidebar";

const components = {
  mainpanel: MainPanel,
  leftsidebar: LeftSidebar,
  rightsidebar: RightSidebar,
};

export function View() {
  const [searchParams, setSearchParams] = useSearchParams();
  const layoutId = searchParams.get("layoutId");

  const { currentTheme } = useTheme();
  const setTitle = useTitle((state) => state.setTitle);
  useEffect(() => {
    setTitle("view");
  }, [setTitle]);

  const [api, setApi] = useState<SplitviewApi>();

  const { pushRecentLayout, addLayout, updateLayout, getLayout } = useLayouts();
  const [currentlayout, setCurrentlayout] = useState<LayoutsInfo | null>();

  const init = useEffectEvent((id: string | null) => {
    const layout = id ? getLayout(id) : null;
    setCurrentlayout(layout);

    if (!layout) {
      const uuid = addLayout("default");
      setSearchParams((prev) => {
        prev.set("layoutId", uuid);
        return prev;
      });
      console.log(`No layout found ${id}, creating a default layout ${uuid}.`);
    } else {
      updateLayout(layout.uuid, { lastOpened: new Date() });
      pushRecentLayout(layout.uuid);
      console.log(`Opened layout: ${layout.name}, with ID: ${layout.uuid}`);
    }
  });

  useEffect(() => {
    init(layoutId);
  }, [layoutId]);

  const onReady = (event: SplitviewReadyEvent) => {
    setApi(event.api);

    event.api.addPanel({
      index: 1,
      id: "mainpanel",
      component: "mainpanel",
      size: event.api.width * 0.6,
      minimumSize: 100,
      priority: LayoutPriority.High,
    });
    const leftplane = event.api.addPanel({
      index: 0,
      id: "leftsidebar",
      component: "leftsidebar",
      size: event.api.width * 0.2,
      minimumSize: 100,
    });

    leftplane.api.setVisible(
      currentlayout ? currentlayout.isLeftSidebarOpen : true,
    );

    const rightplane = event.api.addPanel({
      index: 2,
      id: "rightsidebar",
      component: "rightsidebar",
      size: event.api.width * 0.2,
      minimumSize: 100,
    });

    rightplane.api.setVisible(
      currentlayout ? currentlayout.isRightSidebarOpen : true,
    );
  };

  const setleftsidebar = useEffectEvent((isOpen: boolean) => {
    if (!currentlayout) {
      return;
    }
    if (!api) {
      return;
    }

    const leftplane = api.getPanel("leftsidebar");
    if (leftplane) {
      leftplane.api.setVisible(isOpen);
    }

    updateLayout(currentlayout.uuid, {
      isLeftSidebarOpen: isOpen,
    });
  });

  const setrightsidebar = useEffectEvent((isOpen: boolean) => {
    if (!currentlayout) {
      return;
    }
    if (!api) {
      return;
    }

    const rightplane = api.getPanel("rightsidebar");
    if (rightplane) {
      rightplane.api.setVisible(isOpen);
    }

    updateLayout(currentlayout.uuid, {
      isRightSidebarOpen: isOpen,
    });
  });

  useEffect(() => {
    eventBus.on("setleftsidebar", (isOpen) => {
      setleftsidebar(isOpen);
    });

    eventBus.on("setrightsidebar", (isOpen) => {
      setrightsidebar(isOpen);
    });

    // 组件卸载时自动清理（防止内存泄漏）
    return () => {
      eventBus.off("setleftsidebar");
      eventBus.off("setrightsidebar");
    };
  }, []);

  return (
    <SplitviewReact
      className={clsx(
        currentTheme === "DARK" ? themeDark.className : themeLight.className,
      )}
      orientation={Orientation.HORIZONTAL}
      onReady={onReady}
      components={components}
    />
  );
}
