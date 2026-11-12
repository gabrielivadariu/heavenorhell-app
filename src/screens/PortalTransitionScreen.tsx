import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTranslation } from "../context/LanguageContext";
import { useReducedMotion } from "../components/useReducedMotion";
import { palette, portalArt, personaColors, serif } from "../theme/tokens";

type Props=NativeStackScreenProps<RootStackParamList,"PortalTransition">;
export default function PortalTransitionScreen({route,navigation}:Props) {
  const {role}=route.params;
  const {t}=useTranslation();
  const reduced=useReducedMotion();
  const entrance=useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    const animation=Animated.timing(entrance,{toValue:1,duration:reduced?0:800,useNativeDriver:true});animation.start();
    const timer=setTimeout(()=>navigation.replace("Chat",{role}),reduced?200:1000);
    return ()=>{clearTimeout(timer);animation.stop();};
  },[entrance,navigation,role,reduced]);
  return <ImageBackground source={portalArt} resizeMode="cover" imageStyle={{width:"100%",height:"100%"}} style={styles.screen}>
    <LinearGradient colors={["rgba(11,14,18,0.1)","rgba(11,14,18,0.9)"]} style={StyleSheet.absoluteFill}/>
    <Animated.View style={[styles.halo,{borderColor:personaColors[role],opacity:entrance,transform:[{scale:entrance.interpolate({inputRange:[0,1],outputRange:reduced?[1,1]:[0.8,1.12]})}]}]}/>
    <View style={styles.caption}><Text style={styles.eyebrow}>HEAVEN & HELL</Text><Text style={styles.title}>{t(`experience.portal.${role}`)}</Text></View>
  </ImageBackground>;
}
const styles=StyleSheet.create({screen:{flex:1,width:"100%",backgroundColor:palette.background,alignItems:"center",justifyContent:"center"},halo:{width:220,height:290,borderRadius:120,borderWidth:1,backgroundColor:"rgba(233,198,139,0.03)"},caption:{position:"absolute",bottom:90,left:32,right:32,alignItems:"center",gap:16},eyebrow:{color:palette.gold,fontSize:10,letterSpacing:4},title:{color:palette.text,fontFamily:serif,fontSize:29,textAlign:"center",lineHeight:38}});
