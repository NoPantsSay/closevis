import { Button } from "@headlessui/react";
import { clsx } from "clsx";
import { useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import { FormattedMessage, useIntl } from "react-intl";
import { DeleteLayoutDialog } from "../../../components/dialogs/deleteLayoutDialog";
import { useLayouts } from "../../../stores/useLayouts";
import { eventBus } from "../../../utils/eventBus";

export function SelecetItemInterface({
  layoutsCheckedSet,
}: {
  layoutsCheckedSet: Set<string>;
}) {
  const intl = useIntl();
  const [isDeleteLayoutOpen, setIsDeleteLayoutOpen] = useState(false);
  const { delLayout } = useLayouts();

  return (
    <>
      <div
        className={clsx(
          "absolute left-12.5 top-1px right-0 h-9.5 z-2 flex flex-row gap-3 items-center bg-data-grid-border",
        )}
      >
        <Button
          onClick={() => {
            setIsDeleteLayoutOpen(true);
          }}
          className="flex flex-row items-center border border-red-500/50 text-red-500 hover:border-red-500 hover:bg-hover-background py-1.5 pl-2 pr-3 gap-2 cursor-pointer"
        >
          <IoTrashOutline size={16} />
          <span className="text-xs">
            <FormattedMessage id={"common.delete"} />
          </span>
        </Button>
        <span className="text-xs text-description">
          <FormattedMessage
            id={"layouts.{num}_selected_layout"}
            values={{ num: `${layoutsCheckedSet.size}` }}
          />
        </span>
      </div>
      {isDeleteLayoutOpen && (
        <DeleteLayoutDialog
          open={isDeleteLayoutOpen}
          onClose={() => {
            setIsDeleteLayoutOpen(false);
          }}
          title={intl.formatMessage(
            { id: "layouts.delete_{num}_selected_layouts?" },
            { num: layoutsCheckedSet.size },
          )}
          onDelete={() => {
            layoutsCheckedSet.forEach((uuid) => {
              delLayout(uuid);
              eventBus.emit("deletelayoutchecked", uuid);
            });
          }}
        />
      )}
    </>
  );
}
