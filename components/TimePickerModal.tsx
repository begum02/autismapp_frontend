import * as React from "react";
import { TimePickerModal } from "react-native-paper-dates";
type Props = {
  visible: boolean;
  hours?: number;
  minutes?: number;
  locale?: string;
  // yeni prop: hangi input tipi varsayılan olsun
  defaultInputType?: "picker" | "keyboard";
  clockIcon?: string | undefined;
  // if true, don't render the clock toggle icon
  hideClockIcon?: boolean;
  onConfirm: (payload: { hours: number; minutes: number }) => void;
  onDismiss: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  label?: string;
  uppercase?: boolean;
};

export default function PaperTimePicker({
  visible,
  hours = 12,
  minutes = 0,
  locale = "tr",
  defaultInputType = "keyboard", // varsayılan klavye/input modu
  clockIcon,
  hideClockIcon = false,
  onConfirm,
  onDismiss,
  cancelLabel = "İptal",
  confirmLabel = "Tamam",
  label = "Saat Seç",
  uppercase = false,
}: Props) {
  return (
    <TimePickerModal
      visible={visible}
      onDismiss={onDismiss}
      onConfirm={({ hours: h, minutes: m }) => onConfirm({ hours: h, minutes: m })}
      hours={hours}
      minutes={minutes}
      locale={locale}
      use24HourClock={false}
      // önemli: defaultInputType ile çemberli picker (picker) veya klavye/input (keyboard) seçilir
      defaultInputType={defaultInputType}
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      label={label}
       {...(typeof clockIcon !== "undefined" ? { clockIcon } : {})}
          {...(hideClockIcon ? { renderIcon: () => null } : {})}
      uppercase={uppercase}

    />
  );
}
