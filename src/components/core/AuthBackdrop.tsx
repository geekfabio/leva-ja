import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";

/** Mapa decorativo e ténue no topo dos ecrãs de acesso (ref. 06, 08). */
export function AuthBackdrop() {
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, right: 0, left: 0, height: 360 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 400 360" preserveAspectRatio="xMaxYMin slice">
        <Path d="M400 0 L250 0 C 230 60, 300 90, 280 150 C 260 210, 330 240, 400 260 Z" fill={colors.primarySoft} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Path key={i} d={`M${200 + i * 40} 0 L ${140 + i * 50} 360`} stroke="#E4ECE7" strokeWidth={1.5} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <Path key={`h${i}`} d={`M120 ${40 + i * 80} L 400 ${10 + i * 85}`} stroke="#E4ECE7" strokeWidth={1.5} />
        ))}
        <Circle cx={336} cy={92} r={7} fill={colors.deep} />
      </Svg>
    </View>
  );
}
