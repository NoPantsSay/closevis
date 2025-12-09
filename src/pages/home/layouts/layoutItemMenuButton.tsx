import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { downloadDir, sep } from "@tauri-apps/api/path";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { clsx } from "clsx";
import { useState } from "react";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import { FormattedMessage, useIntl } from "react-intl";
import { DeleteLayoutDialog } from "../../../components/dialogs/deleteLayoutDialog";
import { RenameLayoutDialog } from "../../../components/dialogs/renameLayoutDialog";
import {
  type LayoutsInfo,
  LayoutTypeEnum,
  useLayouts,
} from "../../../stores/useLayouts";
import { eventBus } from "../../../utils/eventBus";

export function LayoutItemMenuButton({
  uuid,
  data,
}: {
  uuid: string;
  data: LayoutsInfo;
}) {
  const intl = useIntl();
  const [isDeleteLayoutOpen, setIsDeleteLayoutOpen] = useState(false);
  const [isRenameLayoutOpen, setIsRenameLayoutOpen] = useState(false);
  const { delLayout, updateLayout, duplicateLayout, getSnapshotAsJSON } =
    useLayouts();

  const downloadOnClick = async () => {
    const downloadsDir = await downloadDir();
    const seps = sep();
    const path = await save({
      filters: [
        {
          name: "json",
          extensions: ["json"],
        },
      ],
      defaultPath: `${downloadsDir}${seps}${data.name}.json`,
    });
    // console.log(path);
    if (path) {
      await writeTextFile(path, getSnapshotAsJSON(uuid));
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: just ignore
    // biome-ignore lint/a11y/useKeyWithClickEvents: just ignore
    <div
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <Menu>
        <MenuButton
          className={clsx(
            "outline-none items-center p-2.5 cursor-pointer",
            "text-description hover:text-foreground hover:bg-hover-background",
          )}
        >
          <IoEllipsisVerticalSharp size={20} />
        </MenuButton>
        <MenuItems
          anchor={{ to: "bottom end" }}
          className="flex flex-col py-1 bg-second-background z-10 shadow-lg outline-none"
        >
          <MenuItem>
            <Button
              onClick={() => {
                void downloadOnClick();
              }}
              className="flex flex-row py-1.5 px-4 items-center data-focus:bg-hover-background cursor-pointer"
            >
              <span className="text-sm">
                <FormattedMessage id={"common.download"} />
              </span>
            </Button>
          </MenuItem>
          <MenuItem>
            <Button
              onClick={() => {
                duplicateLayout(uuid);
              }}
              className="flex flex-row py-1.5 px-4 items-center data-focus:bg-hover-background cursor-pointer"
            >
              <span className="text-sm">
                <FormattedMessage id={"layouts.local_copy"} />
              </span>
            </Button>
          </MenuItem>
          {data.type === LayoutTypeEnum.Local && (
            <MenuItem>
              <Button className="flex flex-row py-1.5 px-4 items-center data-focus:bg-hover-background cursor-pointer">
                <span className="text-sm">
                  <FormattedMessage id={"common.upload"} />
                </span>
              </Button>
            </MenuItem>
          )}
          <MenuItem>
            <Button
              onClick={() => {
                setIsRenameLayoutOpen(true);
              }}
              className="flex flex-row py-1.5 px-4 items-center data-focus:bg-hover-background cursor-pointer"
            >
              <span className="text-sm">
                <FormattedMessage id={"common.rename"} />
              </span>
            </Button>
          </MenuItem>
          <MenuItem>
            <hr className="border-t-0 border-b border-b-border my-2" />
          </MenuItem>
          <MenuItem>
            <Button
              onClick={() => {
                setIsDeleteLayoutOpen(true);
              }}
              className="flex flex-row py-1.5 px-4 items-center data-focus:bg-hover-background cursor-pointer"
            >
              <span className="text-sm text-red-500">
                <FormattedMessage id={"common.delete"} />
              </span>
            </Button>
          </MenuItem>
        </MenuItems>
      </Menu>
      {isDeleteLayoutOpen && (
        <DeleteLayoutDialog
          open={isDeleteLayoutOpen}
          onClose={() => {
            setIsDeleteLayoutOpen(false);
          }}
          title={intl.formatMessage(
            { id: "layouts.delete_{name}?" },
            { name: data.name },
          )}
          onDelete={() => {
            delLayout(uuid);
            eventBus.emit("deletelayoutchecked", uuid);
          }}
        />
      )}
      {isRenameLayoutOpen && (
        <RenameLayoutDialog
          open={isRenameLayoutOpen}
          onClose={() => {
            setIsRenameLayoutOpen(false);
          }}
          originalName={data.name}
          onChangeName={(newName) => {
            updateLayout(uuid, { name: newName, lastUpdated: new Date() });
          }}
        />
      )}
    </div>
  );
}
