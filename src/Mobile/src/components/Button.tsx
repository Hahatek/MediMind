import { LucideIcon } from "lucide-react-native";
import { Pressable, Text } from "react-native";
import { useThemeColor } from "../theme/useThemeColor";

export type ButtonVariant =
  "primary" | "secondary" | "neutral" | "danger" | "dangerSolid" | "ghost";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
};

const containerClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-surface border-[1.5px] border-primary",
  neutral: "bg-surface border border-line-2",
  danger: "bg-danger-bg",
  dangerSolid: "bg-danger-solid",
  ghost: "",
};

const textClasses: Record<ButtonVariant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-primary",
  neutral: "text-ink-3",
  danger: "text-danger-ink",
  dangerSolid: "text-white",
  ghost: "text-primary",
};

const iconColorVars: Record<ButtonVariant, string> = {
  primary: "--on-brand",
  secondary: "--brand-ink",
  neutral: "--ink-3",
  danger: "--danger-ink",
  dangerSolid: "--on-brand",
  ghost: "--brand-ink",
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  iconLeft,
  iconRight,
}: ButtonProps) {
  const IconLeft = iconLeft;
  const IconRight = iconRight;
  const iconColor = useThemeColor(iconColorVars[variant]);

  return (
    <Pressable
      className={`px-4 py-3 rounded-xl flex-row items-center justify-center gap-2 ${containerClasses[variant]} ${disabled ? "opacity-50" : ""}`}
      onPress={onPress}
      disabled={disabled}
    >
      {IconLeft && <IconLeft size={18} color={iconColor} />}
      <Text className={textClasses[variant]}>{title}</Text>
      {IconRight && <IconRight size={18} color={iconColor} />}
    </Pressable>
  );
}
