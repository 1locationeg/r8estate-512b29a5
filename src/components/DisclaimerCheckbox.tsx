import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { DisclaimerModal } from "@/components/DisclaimerModal";

interface DisclaimerCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const DisclaimerCheckbox = ({ checked, onCheckedChange }: DisclaimerCheckboxProps) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-start gap-2">
        <Checkbox
          id="disclaimer-agree"
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(!!v)}
          className="mt-0.5"
        />
        <label htmlFor="disclaimer-agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          {t("disclaimer.agreePrefix", "I have read and agree to the")}{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setModalOpen(true);
            }}
            className="text-primary underline hover:text-primary/80"
          >
            {t("disclaimer.agreeLinkText", "Platform Disclaimer")}
          </button>
        </label>
      </div>

      <DisclaimerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
