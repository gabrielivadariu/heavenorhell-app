import React from "react";
import { Text, View, Pressable, StyleSheet, ViewStyle, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { palette, serif } from "../theme/tokens";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
export function Icon({ name, color = palette.text, size = 22 }: {name: IconName; color?: string; size?: number}) {
  return <Ionicons name={name} color={color} size={size} />;
}
export function IconButton({ name, label, onPress, disabled = false }: { name: IconName; label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} disabled={disabled} style={({pressed}) => [ui.iconButton, (pressed || disabled) && {opacity: 0.45}]}><Icon name={name}/></Pressable>;
}
export function Button({ label, onPress, secondary = false, disabled = false, loading = false, style }: {label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; loading?: boolean; style?: ViewStyle}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled: disabled || loading, busy: loading}} disabled={disabled || loading} onPress={onPress} style={({pressed}) => [ui.button, secondary && ui.secondary, style, (pressed || disabled) && {opacity: 0.45}]}>{loading ? <ActivityIndicator color={secondary ? palette.gold : palette.background}/> : <><Text style={[ui.buttonText, secondary && {color:palette.text}]}>{label}</Text><Icon name="arrow-forward" color={secondary ? palette.gold : palette.background} size={18}/></>}</Pressable>;
}
export function Brand({ small = false }: { small?: boolean }) {
  return <View style={ui.brand}><View style={[ui.brandMark, small && {width:28,height:28,borderRadius:14}]}><Icon name="sparkles-outline" size={small ? 16 : 20} color={palette.gold}/></View><Text style={[ui.brandText, small && {fontSize:10,letterSpacing:1.5}]}>HEAVEN <Text style={{color:palette.muted}}>&</Text> HELL</Text></View>;
}
export const ui = StyleSheet.create({
  screen: {flex:1, backgroundColor:palette.background},
  content: {paddingHorizontal:24, paddingBottom:32, gap:24, width:"100%", maxWidth:700, alignSelf:"center"},
  row: {flexDirection:"row", alignItems:"center", gap:12},
  between: {flexDirection:"row", alignItems:"center", justifyContent:"space-between", gap:12},
  eyebrow: {color:palette.gold, fontSize:10, letterSpacing:2.5, fontWeight:"700"},
  title: {fontFamily:serif, color:palette.text, fontSize:38, lineHeight:46},
  body: {color:palette.muted, fontSize:14, lineHeight:22},
  card: {backgroundColor:palette.surface, borderWidth:1, borderColor:palette.border, borderRadius:22, padding:20, gap:12},
  iconButton: {width:44, height:44, borderRadius:22, borderWidth:1, borderColor:palette.border, alignItems:"center", justifyContent:"center", backgroundColor:"rgba(15,18,23,0.7)"},
  button: {minHeight:54, borderRadius:16, padding:16, gap:12, flexDirection:"row", justifyContent:"center", alignItems:"center", backgroundColor:palette.gold},
  secondary: {backgroundColor:palette.surface, borderWidth:1, borderColor:palette.border},
  buttonText: {fontSize:14, color:palette.background, fontWeight:"700", flexShrink:1},
  brand: {flexDirection:"row", alignItems:"center", gap:9},
  brandMark: {width:32,height:32,borderRadius:16,borderWidth:1,borderColor:"#5D5140",alignItems:"center",justifyContent:"center"},
  brandText: {fontSize:13, letterSpacing:2, color:palette.text, fontWeight:"600"}
});
