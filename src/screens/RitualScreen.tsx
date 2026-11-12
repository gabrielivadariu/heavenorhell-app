import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTranslation } from "../context/LanguageContext";
import { Button, Icon, IconButton, ui } from "../components/Primitives";
import { useReducedMotion } from "../components/useReducedMotion";
import { palette, serif } from "../theme/tokens";

type Props=NativeStackScreenProps<RootStackParamList,"Ritual">;
export default function RitualScreen({navigation}:Props) {
  const {t}=useTranslation(); const insets=useSafeAreaInsets(); const reduced=useReducedMotion();
  const [running,setRunning]=useState(false);const [elapsed,setElapsed]=useState(0);
  const started=useRef(0);const breath=useRef(new Animated.Value(0)).current;
  const phase=elapsed%10<4?"inhale":elapsed%10<6?"hold":"exhale";
  useEffect(()=>{
    if(!running)return;
    const timer=setInterval(()=>{
      const value=Math.min(60,Math.floor((Date.now()-started.current)/1000));setElapsed(value);
      if(value>=60)setRunning(false);
    },250);return()=>clearInterval(timer);
  },[running]);
  useEffect(()=>{
    if(!running||reduced){breath.setValue(0);return;}
    const animation=Animated.timing(breath,{toValue:phase==="exhale"?0:1,duration:phase==="hold"?0:4000,useNativeDriver:true});animation.start();return()=>animation.stop();
  },[running,phase,reduced,breath]);
  const complete=elapsed>=60;
  return <View style={ui.screen}><ScrollView contentContainerStyle={[ui.content,{paddingTop:insets.top+12,paddingBottom:insets.bottom+24}]}>
    <View style={ui.between}><IconButton name="chevron-back" label={t("common.back")} onPress={()=>navigation.goBack()}/><Text style={ui.eyebrow}>{t("experience.ritual")}</Text><View style={{width:44}}/></View>
    <View style={{gap:12,paddingTop:20}}><Text style={[ui.title,{textAlign:"center"}]}>{t("experience.ritualTitle")}</Text><Text style={[ui.body,{textAlign:"center"}]}>{t("experience.ritualBody")}</Text></View>
    <View style={styles.breathArea}><View style={styles.outerRing}/><Animated.View style={[styles.orb,{transform:[{scale:breath.interpolate({inputRange:[0,1],outputRange:[1,1.2]})}]}]}><Icon name="leaf-outline" color={palette.gold} size={34}/><Text accessibilityLiveRegion="polite" style={styles.phase}>{t(complete?"experience.breath.done":running?`experience.breath.${phase}`:"experience.breath.ready")}</Text><Text style={styles.time}>{String(Math.max(0,60-elapsed)).padStart(2,"0")}s</Text></Animated.View></View>
    {!complete&&<Button label={t(running?"experience.breath.pause":"experience.breath.start")} onPress={()=>{
      if(running)setRunning(false);else{started.current=Date.now()-elapsed*1000;setRunning(true);}
    }} secondary={running}/>}
    <View style={ui.card}><Text style={[ui.eyebrow,{letterSpacing:1.5}]}>{t("experience.carryForward")}</Text><Text style={[ui.body,{color:palette.text}]}>{t("experience.ritualQuestion")}</Text><Button secondary label={t("experience.talkAboutIt")} onPress={()=>navigation.navigate("Chat",{role:"god",initialPrompt:t("experience.ritualPrompt")})}/></View>
    <Text style={[ui.body,{fontSize:11,textAlign:"center"}]}>{t("experience.breath.note")}</Text>
  </ScrollView></View>;
}
const styles=StyleSheet.create({breathArea:{height:300,justifyContent:"center",alignItems:"center"},outerRing:{position:"absolute",width:280,height:280,borderRadius:140,borderWidth:1,borderColor:"#302D28"},orb:{width:220,height:220,borderRadius:110,borderWidth:1,borderColor:"#79664B",backgroundColor:"#24241F",justifyContent:"center",alignItems:"center",gap:16},phase:{fontFamily:serif,fontSize:25,color:palette.text},time:{fontSize:12,color:palette.gold,letterSpacing:2}});
