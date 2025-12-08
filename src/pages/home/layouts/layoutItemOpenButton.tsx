import { Button } from "@headlessui/react";
import { clsx } from "clsx";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";

export function LayoutItemOpenButton({ uuid }: { uuid: string }) {
  const navigate = useNavigate();

  return (
    <Button
      onClick={(event) => {
        event.stopPropagation();

        const params = new URLSearchParams({
          layoutId: uuid,
        });
        navigate(`/view?${params.toString()}`);
      }}
      className={clsx(
        "outline-none border items-center cursor-pointer",
        "hidden group-hover:block text-scheme/50 hover:text-scheme",
      )}
    >
      <span className="text-xs px-4">
        <FormattedMessage id={"common.open"} />
      </span>
    </Button>
  );
}
