import { Image, View } from "react-native";

type Props = {
  size: number;
  className?: string;
};

export default function KlaraAvatar({ size, className = "bg-tint-2" }: Props) {
  const imageSize = size * 1.6;

  return (
    <View
      className={`rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        source={require("../../../assets/klara.png")}
        style={{
          width: imageSize,
          height: imageSize,
          marginLeft: (size - imageSize) / 2,
          marginTop: -size * 0.2,
        }}
      />
    </View>
  );
}
