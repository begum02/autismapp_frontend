import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";

type Props = {
  visible?: boolean; // kontrol edilen görünürlük
  date?: Date | undefined;
  mode?: "single" | "range" | "multiple";
  locale?: string;
  saveLabel?: string;
  label?: string;
  animationType?: "slide" | "fade" | "none";
  onConfirm?: (payload: { date: Date } | any) => void;
  onDismiss?: () => void;
  // opsiyonel: tetikleyici buton gösterilsin mi (parent içinde açmak istemezseniz)
  showTrigger?: boolean;
  triggerLabel?: string;
};

export default function PaperDatePicker({
  visible: controlledVisible,
  date: controlledDate,
  mode = "single",
  locale = "tr",
  saveLabel = "Kaydet",
  label = "Tarih Seç",
  animationType = "slide",
  onConfirm,
  onDismiss,
  showTrigger = false,
  triggerLabel = "Tarih Seç",
}: Props) {
  const [internalVisible, setInternalVisible] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(controlledDate);

  const isControlled = typeof controlledVisible === "boolean";

  const visible = isControlled ? controlledVisible! : internalVisible;
  const date = controlledDate ?? internalDate;

  const handleOpen = () => {
    if (!isControlled) setInternalVisible(true);
  };

  const handleDismiss = () => {
    if (onDismiss) onDismiss();
    if (!isControlled) setInternalVisible(false);
  };

  const handleConfirm = (payload: any) => {
    // payload shape depends on mode; for 'single' it's { date: Date }
    if (!controlledDate && payload?.date) setInternalDate(payload.date);
    if (onConfirm) onConfirm(payload);
    if (!isControlled) setInternalVisible(false);
  };

  return (
    <View style={styles.container}>
      {showTrigger && (
        <Button mode="contained" onPress={handleOpen} style={styles.button}>
          {triggerLabel}
        </Button>
      )}

      {date && (
       null
      )}

      {mode === "single" && (
        <DatePickerModal
          locale={locale}
          mode="single"
          visible={visible}
          date={date}
          onDismiss={handleDismiss}
          onConfirm={handleConfirm}
          saveLabel={saveLabel}
          label={label}
          animationType={animationType}
        />
      )}

      {mode === "range" && (
        <DatePickerModal
          locale={locale}
          mode="range"
          visible={visible}
          // provide start/end placeholders or manage them in state if needed
          startDate={undefined}
          endDate={undefined}
          onDismiss={handleDismiss}
          onConfirm={handleConfirm}
          saveLabel={saveLabel}
          label={label}
          animationType={animationType}
        />
      )}

      {mode === "multiple" && (
        <DatePickerModal
          locale={locale}
          mode="multiple"
          visible={visible}
          // convert single internal date into an array for multiple mode if present
          dates={date ? [date] : undefined}
          onDismiss={handleDismiss}
          onConfirm={handleConfirm}
          saveLabel={saveLabel}
          label={label}
          animationType={animationType}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // component içinde tetikleyici gösterilecekse merkezde gösterir
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffffff",
  },
  button: {
    backgroundColor: "#2F3C7E",
    borderRadius: 12,
  },
  dateText: {
    marginTop: 12,
    fontSize: 14,
    color: "#333",
  },
});
