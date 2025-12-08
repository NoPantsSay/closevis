import {
  Button,
  Field,
  Input,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { clsx } from "clsx";
import { formatDistance } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { HiArrowDown, HiArrowUp } from "react-icons/hi2";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdIndeterminateCheckBox,
} from "react-icons/md";
import { FormattedMessage, useIntl } from "react-intl";
import { Tooltip } from "react-tooltip";
import { useImmer } from "use-immer";
import { UpDownIcon } from "../../../components/icons/upDownIcon";
import { useTitle } from "../../../globals/useTitle";
import {
  LayoutTypeEnum,
  LayoutUpdateFilterEnum,
  layoutTypes,
  layoutUpdateFilters,
  useLayouts,
} from "../../../stores/useLayouts";
import { useTimeZoneStore } from "../../../stores/useTimeZoneStore";
import { LayoutItemMenuButton } from "./layoutItemMenuButton";
import { LayoutItemOpenButton } from "./layoutItemOpenButton";
import { SelecetItemInterface } from "./selecetItemInterface";
import { TopAddButton } from "./topAddButton";

enum SortTypeEnum {
  NAME_UP,
  NAME_DOWN,
  UPDATE_UP,
  UPDATE_DOWN,
  OPEN_UP,
  OPEN_DOWN,
}

export function Layouts() {
  const setTitle = useTitle((state) => state.setTitle);
  const intl = useIntl();
  useEffect(() => {
    setTitle(intl.formatMessage({ id: "home.layouts" }));
  }, [setTitle, intl]);
  const parentRef = useRef(null);

  const date = useMemo(() => new Date(), []);

  const { getDateFormat } = useTimeZoneStore();

  const {
    getLayoutTypeDisplay,
    getlayoutUpdateFilterDisplay,
    getlayoutUpdateFilterFilter,
    layouts,
  } = useLayouts();
  const [inputValue, setInputValue] = useState("");
  const [layoutType, setLayoutType] = useState(LayoutTypeEnum.All);
  const [layoutUpdateFilter, setLayoutUpdateFilter] = useState(
    LayoutUpdateFilterEnum.All,
  );
  const [layoutsSort, setLayoutsSort] = useState(SortTypeEnum.OPEN_DOWN);

  const LayoutsSortIconComponent =
    layoutsSort === SortTypeEnum.NAME_UP ? HiArrowUp : HiArrowDown;
  const LastUpdatedSortIconComponent =
    layoutsSort === SortTypeEnum.UPDATE_UP ? HiArrowUp : HiArrowDown;
  const LastOpenedSortIconComponent =
    layoutsSort === SortTypeEnum.OPEN_UP ? HiArrowUp : HiArrowDown;

  const filteredLayouts = useMemo(() => {
    return Array.from(layouts.values())
      .filter((data) => {
        if (inputValue.length > 0 && !data.name.includes(inputValue)) {
          return false;
        }

        if (layoutType !== LayoutTypeEnum.All && data.type !== layoutType) {
          return false;
        }

        if (
          !getlayoutUpdateFilterFilter(layoutUpdateFilter)(
            new Date(),
            data.lastUpdated,
          )
        ) {
          return false;
        }

        return true;
      })
      .sort((data_left, data_right) => {
        if (layoutsSort === SortTypeEnum.NAME_UP) {
          return data_left.name.localeCompare(data_right.name);
        } else if (layoutsSort === SortTypeEnum.NAME_DOWN) {
          return data_right.name.localeCompare(data_left.name);
        } else if (layoutsSort === SortTypeEnum.UPDATE_UP) {
          return (
            data_left.lastUpdated.getTime() - data_right.lastUpdated.getTime()
          );
        } else if (layoutsSort === SortTypeEnum.UPDATE_DOWN) {
          return (
            data_right.lastUpdated.getTime() - data_left.lastUpdated.getTime()
          );
        } else if (layoutsSort === SortTypeEnum.OPEN_UP) {
          if (
            data_left.lastOpened === undefined &&
            data_right.lastOpened === undefined
          )
            return 0;
          if (data_left.lastOpened === undefined) return -1;
          if (data_right.lastOpened === undefined) return 1;

          return (
            data_left.lastOpened.getTime() - data_right.lastOpened.getTime()
          );
        } else {
          if (
            data_left.lastOpened === undefined &&
            data_right.lastOpened === undefined
          )
            return 0;
          if (data_left.lastOpened === undefined) return 1;
          if (data_right.lastOpened === undefined) return -1;

          return (
            data_right.lastOpened.getTime() - data_left.lastOpened.getTime()
          );
        }
      });
  }, [
    layouts,
    inputValue,
    layoutType,
    layoutUpdateFilter,
    getlayoutUpdateFilterFilter,
    layoutsSort,
  ]);

  const rowVirtualizer = useVirtualizer({
    count: filteredLayouts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const [layoutsCheckedSet, setLayoutsCheckedSet] = useImmer(new Set<string>());

  const itemToggle = (uuid: string) => {
    const checked = layoutsCheckedSet.has(uuid);

    if (!checked) {
      setLayoutsCheckedSet((draft) => {
        draft.add(uuid);
      });
    } else {
      setLayoutsCheckedSet((draft) => {
        draft.delete(uuid);
      });
    }
  };

  const itemDelete = (uuid: string) => {
    setLayoutsCheckedSet((draft) => {
      draft.delete(uuid);
    });
  };

  const itemAllToggle = () => {
    const checked = layoutsCheckedSet.size !== 0;

    if (!checked) {
      const newSet = new Set<string>();
      filteredLayouts.forEach((value) => {
        newSet.add(value.uuid);
      });
      setLayoutsCheckedSet(newSet);
    } else {
      setLayoutsCheckedSet(new Set<string>());
    }
  };

  const SelectAllIconComponent =
    layoutsCheckedSet.size === 0
      ? MdCheckBoxOutlineBlank
      : layoutsCheckedSet.size === filteredLayouts.length
        ? MdCheckBox
        : MdIndeterminateCheckBox;

  return (
    <div className="grid grid-rows-1 grid-cols-1 p-6">
      <div className="grid grid-rows-[auto_auto_1fr] border border-border">
        {
          // 标题栏
        }
        <div className="flex flex-row justify-between items-center p-3 border-b border-b-border">
          <span className="text-base">
            <FormattedMessage id={"layouts.layout"} />
          </span>
          <TopAddButton />
        </div>
        {
          // 过滤栏
        }
        <div
          className={clsx(
            "grid grid-cols-[minmax(100px,1fr)_minmax(100px,1fr)_minmax(100px,1fr)] gap-3 justify-between items-center p-3 overflow-x-auto",
          )}
        >
          {
            // 名字
          }
          <Field className="flex flex-col ">
            <Label className="py-1 text-sm text-description">
              <FormattedMessage id={"common.search"} />
            </Label>
            <Input
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
              }}
              placeholder={intl.formatMessage({ id: "layouts.layout_name" })}
              className={clsx(
                "py-2 px-2.5 text-sm border border-border hover:border-foreground focus:border-scheme outline-none",
              )}
            />
          </Field>
          {
            // 类型
          }
          <Field className="flex flex-col">
            <Label className="py-1 text-sm text-description ">
              <FormattedMessage id={"common.type"} />
            </Label>
            <Listbox value={layoutType} onChange={setLayoutType}>
              <ListboxButton
                className={clsx(
                  "relative py-2 px-2.5 text-sm text-description border border-border hover:border-foreground focus:border-scheme data-open:border-scheme rounded-none outline-none text-left cursor-pointer",
                )}
              >
                {({ open }) => {
                  return (
                    <>
                      <FormattedMessage id={getLayoutTypeDisplay(layoutType)} />
                      <UpDownIcon
                        open={open}
                        className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-foreground"
                        aria-hidden="true"
                      />
                    </>
                  );
                }}
              </ListboxButton>
              <ListboxOptions
                anchor="bottom"
                className={clsx(
                  "w-(--button-width) py-2 bg-second-background outline-none z-10",
                )}
              >
                {layoutTypes.map((data) => (
                  <ListboxOption
                    key={data.type}
                    value={data.type}
                    className={clsx(
                      "py-1.5 px-4 cursor-pointer hover:bg-hover-background data-focus:bg-hover-background data-selected:bg-scheme-background data-selected:hover:bg-scheme-hover-background data-selected:data-focus:bg-scheme-hover-background",
                    )}
                  >
                    <Label className="text-sm pointer-events-none">
                      <FormattedMessage id={data.display} />
                    </Label>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </Field>
          {
            // 过滤更新时间
          }
          <Field className="flex flex-col">
            <Label className="py-1 text-sm text-description ">
              <FormattedMessage id={"layouts.last_updated"} />
            </Label>
            <Listbox
              value={layoutUpdateFilter}
              onChange={setLayoutUpdateFilter}
            >
              <ListboxButton
                className={clsx(
                  "relative py-2 px-2.5 text-sm text-description border border-border hover:border-foreground focus:border-scheme data-open:border-scheme rounded-none outline-none text-left cursor-pointer",
                )}
              >
                {({ open }) => {
                  return (
                    <>
                      <FormattedMessage
                        id={getlayoutUpdateFilterDisplay(layoutUpdateFilter)}
                      />
                      <UpDownIcon
                        open={open}
                        className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-foreground"
                        aria-hidden="true"
                      />
                    </>
                  );
                }}
              </ListboxButton>
              <ListboxOptions
                anchor="bottom"
                className={clsx(
                  "w-(--button-width) py-2 bg-second-background outline-none z-10",
                )}
              >
                {layoutUpdateFilters.map((data) => (
                  <ListboxOption
                    key={data.type}
                    value={data.type}
                    className={clsx(
                      "py-1.5 px-4 cursor-pointer hover:bg-hover-background data-focus:bg-hover-background data-selected:bg-scheme-background data-selected:hover:bg-scheme-hover-background data-selected:data-focus:bg-scheme-hover-background",
                    )}
                  >
                    <Label className="text-sm pointer-events-none">
                      <FormattedMessage id={data.display} />
                    </Label>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
          </Field>
        </div>
        {
          // 列表栏
        }
        <div className="relative grid grid-rows-1 grid-cols-1 mt-2 border-t border-t-border min-h-0 overflow-hidden">
          {layoutsCheckedSet.size !== 0 && (
            <SelecetItemInterface
              layoutsCheckedSet={layoutsCheckedSet}
              setLayoutsCheckedSet={setLayoutsCheckedSet}
            />
          )}
          <div ref={parentRef} className="flex flex-col overflow-auto">
            <div
              className={clsx(
                "grid grid-cols-[40px_minmax(150px,1fr)_140px_120px_120px_minmax(90px,1fr)_60px] sticky top-0 h-10 items-center bg-background z-1",
              )}
            >
              <div className="flex h-full items-center justify-center border-b border-border">
                <Button
                  onClick={itemAllToggle}
                  className={clsx(
                    "size-5 rounded-xs outline-none items-center cursor-pointer",
                    layoutsCheckedSet.size === 0
                      ? "text-description"
                      : "text-scheme",
                  )}
                >
                  <SelectAllIconComponent size={20} />
                </Button>
              </div>
              <Button
                onClick={() => {
                  if (layoutsSort === SortTypeEnum.NAME_UP) {
                    setLayoutsSort(SortTypeEnum.NAME_DOWN);
                  } else {
                    setLayoutsSort(SortTypeEnum.NAME_UP);
                  }
                }}
                className="group flex flex-row h-full items-center px-2.5 border-b border-border outline-none"
              >
                <span className="text-xs">
                  <FormattedMessage id={"layouts.layouts"} />
                </span>
                <div className="flex size-6 p-1 items-center cursor-pointer hover:bg-hover-background">
                  <LayoutsSortIconComponent
                    className={clsx(
                      layoutsSort === SortTypeEnum.NAME_UP ||
                        layoutsSort === SortTypeEnum.NAME_DOWN
                        ? "block"
                        : "hidden group-hover:block",
                    )}
                    size={20}
                  />
                </div>
              </Button>
              <div className="flex flex-row h-full items-center px-2.5 border-b border-border">
                <span className="text-xs">
                  <FormattedMessage id={"common.type"} />
                </span>
              </div>
              <Button
                onClick={() => {
                  if (layoutsSort === SortTypeEnum.UPDATE_UP) {
                    setLayoutsSort(SortTypeEnum.UPDATE_DOWN);
                  } else {
                    setLayoutsSort(SortTypeEnum.UPDATE_UP);
                  }
                }}
                className="group flex flex-row h-full items-center px-2.5 border-b border-border outline-none"
              >
                <span className="text-xs">
                  <FormattedMessage id={"layouts.last_updated"} />
                </span>
                <div className="flex size-6 p-1 items-center cursor-pointer hover:bg-hover-background">
                  <LastUpdatedSortIconComponent
                    className={clsx(
                      layoutsSort === SortTypeEnum.UPDATE_UP ||
                        layoutsSort === SortTypeEnum.UPDATE_DOWN
                        ? "block"
                        : "hidden group-hover:block",
                    )}
                    size={20}
                  />
                </div>
              </Button>
              <Button
                onClick={() => {
                  if (layoutsSort === SortTypeEnum.OPEN_UP) {
                    setLayoutsSort(SortTypeEnum.OPEN_DOWN);
                  } else {
                    setLayoutsSort(SortTypeEnum.OPEN_UP);
                  }
                }}
                className="group flex flex-row h-full items-center px-2.5 border-b border-border outline-none"
              >
                <span className="text-xs">
                  <FormattedMessage id={"layouts.last_opened"} />
                </span>
                <div className="flex size-6 p-1 items-center cursor-pointer hover:bg-hover-background">
                  <LastOpenedSortIconComponent
                    className={clsx(
                      layoutsSort === SortTypeEnum.OPEN_UP ||
                        layoutsSort === SortTypeEnum.OPEN_DOWN
                        ? "block"
                        : "hidden group-hover:block",
                    )}
                    size={20}
                  />
                </div>
              </Button>
              <div className="h-full px-2.5 border-b border-border" />
              <div className="h-full px-2.5 border-b border-border" />
            </div>
            <div
              className={`relative w-full`}
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const data = filteredLayouts[virtualItem.index];
                const index = virtualItem.index;

                return (
                  // biome-ignore lint/a11y/noStaticElementInteractions: just ignore
                  // biome-ignore lint/a11y/useKeyWithClickEvents:  just ignore
                  <div
                    onClick={() => {
                      itemToggle(data.uuid);
                    }}
                    key={data.uuid}
                    className={clsx(
                      "absolute top-0 left-0 w-full",
                      "group grid grid-cols-[40px_minmax(150px,1fr)_140px_120px_120px_minmax(90px,1fr)_60px] h-10 items-center",
                    )}
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <div
                      className={clsx(
                        "group flex h-full items-center justify-center ",
                        layoutsCheckedSet.has(data.uuid)
                          ? "bg-scheme-background group-hover:bg-scheme-hover-background"
                          : "group-hover:bg-hover-background",
                        {
                          "border-t border-data-grid-border": index !== 0,
                        },
                      )}
                    >
                      <Button
                        onClick={(event) => {
                          event.stopPropagation();
                          itemToggle(data.uuid);
                        }}
                        className={clsx(
                          "size-5 rounded-xs outline-none items-center cursor-pointer",
                          layoutsCheckedSet.has(data.uuid)
                            ? "text-scheme "
                            : "text-description",
                        )}
                      >
                        {layoutsCheckedSet.has(data.uuid) ? (
                          <MdCheckBox size={20} />
                        ) : (
                          <MdCheckBoxOutlineBlank
                            className="hidden group-hover:block"
                            size={20}
                          />
                        )}
                      </Button>
                    </div>
                    <div
                      className={clsx(
                        "flex h-full px-2.5 items-center",
                        layoutsCheckedSet.has(data.uuid)
                          ? "bg-scheme-background group-hover:bg-scheme-hover-background"
                          : "group-hover:bg-hover-background",
                        {
                          "border-t border-data-grid-border": index !== 0,
                        },
                      )}
                    >
                      <span className="text-xs text-description ">
                        {data.name}
                      </span>
                    </div>
                    <div
                      className={clsx(
                        "flex h-full px-2.5 items-center",
                        layoutsCheckedSet.has(data.uuid)
                          ? "bg-scheme-background group-hover:bg-scheme-hover-background"
                          : "group-hover:bg-hover-background",
                        {
                          "border-t border-data-grid-border": index !== 0,
                        },
                      )}
                    >
                      <span className="text-xs text-description ">
                        <FormattedMessage
                          id={getLayoutTypeDisplay(data.type)}
                        />
                      </span>
                    </div>
                    <div
                      className={clsx(
                        "flex h-full px-2.5 items-center",
                        layoutsCheckedSet.has(data.uuid)
                          ? "bg-scheme-background group-hover:bg-scheme-hover-background"
                          : "group-hover:bg-hover-background",
                        {
                          "border-t border-data-grid-border": index !== 0,
                        },
                      )}
                    >
                      <span
                        className="text-xs text-description"
                        data-tooltip-id={`lastUpdated:${data.uuid}`}
                        data-tooltip-content={getDateFormat(data.lastUpdated)}
                        data-tooltip-place="bottom"
                      >
                        {formatDistance(data.lastUpdated, date, {
                          addSuffix: true,
                        })}
                      </span>

                      <Tooltip
                        id={`lastUpdated:${data.uuid}`}
                        style={{
                          fontSize: "12px",
                          lineHeight: "1.333",
                          backgroundColor: `var(--color-tooltip-background)`,
                          color: `var(--color-tooltip-foreground)`,
                        }}
                      />
                    </div>
                    <div
                      className={clsx(
                        "flex h-full px-2.5 items-center",
                        layoutsCheckedSet.has(data.uuid)
                          ? "bg-scheme-background group-hover:bg-scheme-hover-background"
                          : "group-hover:bg-hover-background",
                        {
                          "border-t border-data-grid-border": index !== 0,
                        },
                      )}
                    >
                      {data.lastOpened && (
                        <>
                          <span
                            className="text-xs text-description"
                            data-tooltip-id={`lastOpened:${data.uuid}`}
                            data-tooltip-content={getDateFormat(
                              data.lastOpened,
                            )}
                            data-tooltip-place="bottom"
                          >
                            {formatDistance(data.lastOpened, date, {
                              addSuffix: true,
                            })}
                          </span>

                          <Tooltip
                            id={`lastOpened:${data.uuid}`}
                            style={{
                              fontSize: "12px",
                              lineHeight: "1.333",
                              backgroundColor: `var(--color-tooltip-background)`,
                              color: `var(--color-tooltip-foreground)`,
                            }}
                          />
                        </>
                      )}
                    </div>
                    <div
                      className={clsx(
                        "flex h-full px-2.5 items-center justify-end",
                        layoutsCheckedSet.has(data.uuid)
                          ? "bg-scheme-background group-hover:bg-scheme-hover-background"
                          : "group-hover:bg-hover-background",
                        {
                          "border-t border-data-grid-border": index !== 0,
                        },
                      )}
                    >
                      <LayoutItemOpenButton uuid={data.uuid} />
                    </div>
                    <div
                      className={clsx(
                        "flex h-full px-2.5 items-center justify-center",
                        layoutsCheckedSet.has(data.uuid)
                          ? "bg-scheme-background group-hover:bg-scheme-hover-background"
                          : "group-hover:bg-hover-background",
                        {
                          "border-t border-data-grid-border": index !== 0,
                        },
                      )}
                    >
                      <LayoutItemMenuButton
                        uuid={data.uuid}
                        data={data}
                        onDelete={itemDelete}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
