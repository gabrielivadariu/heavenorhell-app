import React, { useEffect } from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Brand } from "../components/Primitives";
import { palette, portalArt } from "../theme/tokens";
type Props=NativeStackScreenProps<RootStackParamList,"Splash">;
export default function SplashScreen({navigation}:Props) {
  useEffect(()=>{const timer=setTimeout(()=>navigation.replace("RoleSelection"),650);return()=>clearTimeout(timer);},[navigation]);
  return <ImageBackground source={portalArt} resizeMode="cover" imageStyle={{width:"100%",height:"100%"}} style={{width:"100%",flex:1,backgroundColor:palette.background}}><LinearGradient colors={["transparent",palette.background]} style={StyleSheet.absoluteFill}/><View style={styles.brand}><Brand/></View></ImageBackground>;
}
const styles=StyleSheet.create({brand:{position:"absolute",bottom:90,left:0,right:0,alignItems:"center"}});
