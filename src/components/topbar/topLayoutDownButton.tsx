import {
  Button,
  Input,
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { useEffectEvent, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { HiChevronDown, HiChevronRight } from "react-icons/hi2";
import { RiLayoutMasonryLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { LayoutTypeEnum, useLayouts } from "../../stores/useLayouts";
import { AddLayoutDialog } from "../dialogs/addLayoutDialog";
import { TooltipWithPortal } from "../tooltips/tooltipWithPortal";
import { importLayout } from "../utils/importLayout";

type TopLayoutDownItem = {
  type: string;
  name: string;
  uuid?: string;
  layoutType?: LayoutTypeEnum;
  Icon?: IconType;
  onclick?: () => void;
};

function TopLayoutDownPanel({
  close,
  setIsNewLayoutOpen,
}: {
  close: () => void;
  setIsNewLayoutOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const parentRef = useRef(null);
  const { layouts, getRecentLayouts, getCurrentLayout, loadDataFromJSON } =
    useLayouts();
  const [isRecentExpend, setIsRecentExpend] = useState(false);
  const [isLocalExpend, setIsLocalExpend] = useState(false);
  const [isOnlineExpend, setIsOnlineExpend] = useState(false);
  const recentLayouts = getRecentLayouts();
  const currentLayoutUUID = getCurrentLayout()?.uuid;
  const tooltipId = "TopLayoutDownPanelTooltipId";

  const handleImportLayout = useEffectEvent(async () => {
    const str = await importLayout();
    if (str) {
      const uuid = loadDataFromJSON(str);
      if (uuid) {
        const params = new URLSearchParams({
          layoutId: uuid,
        });
        navigate(`/view?${params.toString()}`);
      }
    }
  });

  const filteredLayouts = useMemo(() => {
    if (query === "") {
      const result: TopLayoutDownItem[] = [
        {
          type: "button",
          name: "Create New Layout",
          onclick: () => {
            setIsNewLayoutOpen(true);
            close();
          },
        },
        {
          type: "button",
          name: "Import from file",
          onclick: () => {
            void handleImportLayout();
            close();
          },
        },
        {
          type: "button",
          name: "Manage layouts",
          onclick: () => {
            navigate("/home/layouts");
          },
        },
      ];

      result.push({ type: "separator", name: "" });

      result.push({
        type: "expand",
        name: "RECENT",
        Icon: isRecentExpend ? HiChevronDown : HiChevronRight,
        onclick: () => {
          setIsRecentExpend(!isRecentExpend);
        },
      });

      if (isRecentExpend) {
        recentLayouts.forEach((info) => {
          result.push({
            type: "item",
            name: info.name,
            uuid: info.uuid,
            layoutType: info.type,
          });
        });
      }

      result.push({ type: "separator", name: "" });

      result.push({
        type: "expand",
        name: "LOCAL",
        Icon: isLocalExpend ? HiChevronDown : HiChevronRight,
        onclick: () => {
          setIsLocalExpend(!isLocalExpend);
        },
      });

      if (isLocalExpend) {
        layouts.forEach((info, uuid) => {
          if (info.type === LayoutTypeEnum.Local) {
            result.push({
              type: "item",
              name: info.name,
              uuid,
              layoutType: info.type,
            });
          }
        });
      }

      result.push({ type: "separator", name: "" });

      result.push({
        type: "expand",
        name: "ONLINE",
        Icon: isOnlineExpend ? HiChevronDown : HiChevronRight,
        onclick: () => {
          setIsOnlineExpend(!isOnlineExpend);
        },
      });

      if (isOnlineExpend) {
        layouts.forEach((info, uuid) => {
          if (info.type === LayoutTypeEnum.Online) {
            result.push({
              type: "item",
              name: info.name,
              uuid,
              layoutType: info.type,
            });
          }
        });
      }

      return result;
    } else {
      const result: TopLayoutDownItem[] = [];

      layouts.forEach((info, uuid) => {
        if (info.name.toLowerCase().includes(query.toLowerCase())) {
          result.push({
            type: "item",
            name: info.name,
            uuid,
            layoutType: info.type,
          });
        }
      });

      if (result.length === 0) {
        result.push({
          type: "none",
          name: "",
        });
      }

      return result;
    }
  }, [
    query,
    layouts,
    recentLayouts,
    isRecentExpend,
    isLocalExpend,
    isOnlineExpend,
    navigate,
    setIsNewLayoutOpen,
    close,
  ]);

  const rowVirtualizer = useVirtualizer({
    count: filteredLayouts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const { type } = filteredLayouts[index];
      return type === "separator" ? 17 : 32;
    },
    overscan: 5,
  });

  return (
    <>
      <div className="w-75 ">
        <div className="w-full p-1.5">
          <Input
            autoFocus
            className="w-full py-1.5 px-2 text-xs/4.5 outline-none bg-input-background"
            placeholder={`Search layouts...`}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            value={query}
          />
        </div>
        <div ref={parentRef} className="w-full min-h-8 overflow-y-auto">
          <div
            className={`relative w-full`}
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const { type, name, Icon, uuid, layoutType, onclick } =
                filteredLayouts[virtualItem.index];

              if (type === "separator") {
                return (
                  <div
                    key={virtualItem.key}
                    className={clsx("absolute top-0 left-0 w-full px-4 py-2")}
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <hr className="w-full border-border" />
                  </div>
                );
              } else if (type === "none") {
                return (
                  <div
                    key={virtualItem.key}
                    className={clsx(
                      "absolute top-0 left-0 h-8 w-full",
                      " items-center px-4 py-1.5 text-xs/5 text-description",
                    )}
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <span>No options</span>
                  </div>
                );
              } else if (type === "button") {
                return (
                  <Button
                    key={virtualItem.key}
                    className={clsx(
                      "absolute top-0 left-0 h-8 w-full",
                      "flex cursor-pointer justify-between items-center px-4 py-1.5 gap-1 text-xs/5",
                      "hover:bg-hover-background",
                    )}
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                    onClick={onclick}
                  >
                    {Icon && <Icon size={12} />}
                    <span>{name}</span>
                  </Button>
                );
              } else if (type === "expand") {
                return (
                  <Button
                    key={virtualItem.key}
                    className={clsx(
                      "absolute top-0 left-0 h-8 w-full",
                      "flex cursor-pointer justify-start items-center px-4 py-1.5 gap-1 text-xs/5 text-description",
                      "hover:bg-hover-background",
                    )}
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                    onClick={onclick}
                  >
                    {Icon && <Icon size={12} />}
                    <span>{name}</span>
                  </Button>
                );
              } else {
                return (
                  <Button
                    key={virtualItem.key}
                    className={clsx(
                      "absolute top-0 left-0 h-8 w-full",
                      "flex cursor-pointer justify-between items-center px-4 py-1.5 text-xs/5",
                      uuid === currentLayoutUUID
                        ? "bg-scheme-background hover:bg-scheme-hover-background"
                        : "hover:bg-hover-background",
                    )}
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                    onClick={() => {
                      if (uuid) {
                        const params = new URLSearchParams({
                          layoutId: uuid,
                        });
                        navigate(`/view?${params.toString()}`);
                        close();
                      }
                    }}
                    data-tooltip-id={tooltipId}
                    data-tooltip-content={`${name}(${layoutType})`}
                    data-tooltip-place="bottom"
                  >
                    <span>{name}</span>
                  </Button>
                );
              }
            })}
          </div>
        </div>
      </div>
      <TooltipWithPortal id={tooltipId} />
    </>
  );
}

export function TopLayoutDownButton() {
  const navigate = useNavigate();
  const { getRecentLayouts } = useLayouts();
  const recentLayouts = getRecentLayouts();
  const [isNewLayoutOpen, setIsNewLayoutOpen] = useState(false);

  const currentLayoutName =
    recentLayouts.length > 0 ? recentLayouts[0].name : "";

  return (
    <>
      <Popover>
        <PopoverButton className="flex flex-row w-30 gap-3 px-3 py-2.5 items-center justify-between hover:bg-hover-background outline-none cursor-pointer">
          <div className="flex flex-row gap-1 items-center">
            <RiLayoutMasonryLine size={20} />
            <span className="text-center text-xs/6">{currentLayoutName}</span>
          </div>
          <HiChevronDown size={12} />
        </PopoverButton>
        <PopoverPanel
          anchor={{ to: "bottom end", padding: "8px" }}
          className="flex flex-col bg-second-background shadow-lg z-10"
        >
          {({ close }) => {
            return (
              <TopLayoutDownPanel
                close={close}
                setIsNewLayoutOpen={setIsNewLayoutOpen}
              />
            );
          }}
        </PopoverPanel>
      </Popover>
      {isNewLayoutOpen && (
        <AddLayoutDialog
          open={isNewLayoutOpen}
          onClose={(uuid) => {
            if (uuid) {
              const params = new URLSearchParams({
                layoutId: uuid,
              });
              navigate(`/view?${params.toString()}`);
            }
            setIsNewLayoutOpen(false);
          }}
        />
      )}
    </>
  );
}
