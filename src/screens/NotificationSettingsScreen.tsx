import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Switch, Alert, Linking, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTranslation, Language } from "../context/LanguageContext";
import { usePremium } from "../context/PremiumContext";
import { Icon, IconButton, Button, ui } from "../components/Primitives";
import { palette } from "../theme/tokens";
import { loadReminders, reconcileReminders, ReminderPreferences } from "../services/reminders";
import { clearAllConversations } from "../services/conversations";
import { CONTACT_EMAIL } from "../constants/legal";
type Props=NativeStackScreenProps<RootStackParamList,"Notifications">;
export default function NotificationSettingsScreen({navigation}:Props) {
  const {t,language,setLanguage}=useTranslation();const {isPremium,isChecking}=usePremium();const insets=useSafeAreaInsets();
  const [preferences,setPreferences]=useState<ReminderPreferences>({morning:false,evening:false});const preferencesRef=useRef(preferences);const [loaded,setLoaded]=useState(false);const [busy,setBusy]=useState(false);const [denied,setDenied]=useState(false);
  useEffect(()=>{let active=true;loadReminders().then(value=>{if(active){setPreferences(value);preferencesRef.current=value;setLoaded(true);}}).catch(()=>{if(active)setLoaded(true);});return()=>{active=false;};},[]);
  useEffect(()=>{
    if(!loaded||isChecking||Platform.OS==="web")return;
    let active=true;setBusy(true);
    reconcileReminders(preferencesRef.current,language,isPremium).catch(()=>{if(active)Alert.alert(t("experience.reminderFailed"));}).finally(()=>{if(active)setBusy(false);});
    return()=>{active=false;};
  },[language,isPremium,isChecking,loaded,t]);
  const toggle=async(key:keyof ReminderPreferences)=>{
    if(busy||!loaded||isChecking)return;
    if(key==="evening"&&!isPremium){navigation.navigate("Paywall");return;}
    if(!preferences[key]){
      const permission=await Notifications.requestPermissionsAsync();
      if(permission.status!=="granted"){setDenied(true);return;}setDenied(false);
    }
    const next={...preferences,[key]:!preferences[key]};
    setBusy(true);
    try { await reconcileReminders(next,language,isPremium); preferencesRef.current=next;setPreferences(next); }
    finally { setBusy(false); }
  };
  const deleteData=()=>Alert.alert(t("experience.deleteData"),t("experience.deleteDataConfirm"),[{text:t("experience.cancel"),style:"cancel"},{text:t("experience.clear"),style:"destructive",onPress:()=>clearAllConversations().then(()=>Alert.alert(t("experience.dataDeleted"))).catch(()=>Alert.alert(t("experience.errors.storage")))}]);
  const manage=()=>Linking.openURL(Platform.OS==="ios"?"https://apps.apple.com/account/subscriptions":"https://play.google.com/store/account/subscriptions").catch(()=>Alert.alert(t("experience.errors.service_unavailable")));
  return <View style={ui.screen}><ScrollView contentContainerStyle={[ui.content,{paddingTop:insets.top+12,paddingBottom:insets.bottom+28}]}>
    <View style={ui.between}><IconButton name="chevron-back" label={t("common.back")} onPress={()=>navigation.goBack()}/><Text style={ui.eyebrow}>{t("experience.settings")}</Text><View style={{width:44}}/></View>
    <View style={{gap:12}}><Text style={ui.title}>{t("experience.settingsTitle")}</Text><Text style={ui.body}>{t("experience.settingsBody")}</Text></View>
    <Text style={ui.eyebrow}>{t("experience.language")}</Text>
    <View style={styles.languages}>{([{code:"ro",label:"Română"},{code:"en",label:"English"},{code:"de",label:"Deutsch"},{code:"no",label:"Norsk"}] as {code:Language;label:string}[]).map(item=><Pressable accessibilityRole="button" accessibilityState={{selected:language===item.code}} key={item.code} disabled={busy} onPress={()=>setLanguage(item.code)} style={[styles.language,language===item.code&&styles.languageActive]}><Text style={[styles.languageText,language===item.code&&{color:palette.gold}]}>{item.label}</Text>{language===item.code&&<Icon name="checkmark" color={palette.gold} size={16}/>}</Pressable>)}</View>
    <Text style={ui.eyebrow}>{t("experience.reminders")}</Text>
    <View style={ui.card}><Text style={ui.body}>{t("experience.reminderBody")}</Text>{(["morning","evening"] as const).map(key=><View key={key} style={styles.reminderRow}><View style={{flex:1,gap:4}}><Text style={styles.rowTitle}>{t(`experience.${key}`)}</Text><Text style={styles.muted}>{key==="morning"?"09:00":`19:30${!isPremium?" · Premium":""}`}</Text></View><Switch accessibilityLabel={t(`experience.${key}`)} value={preferences[key]&&(key==="morning"||isPremium)} disabled={busy||!loaded||isChecking||Platform.OS==="web"} onValueChange={()=>{toggle(key).catch(()=>Alert.alert(t("experience.reminderFailed")));}} trackColor={{true:"#7D6A48",false:"#35383E"}} thumbColor={palette.ivory}/></View>)}
      {denied&&<Button secondary label={t("experience.openSettings")} onPress={()=>{Linking.openSettings().catch(()=>{});}}/>}
    </View>
    <View style={ui.card}><View style={ui.row}><Icon name="sparkles-outline" color={palette.gold}/><Text style={styles.rowTitle}>{t(isPremium?"paywall.ctaActive":"common.premium")}</Text></View><Text style={ui.body}>{t("experience.premiumDescription")}</Text><Button secondary label={t(isPremium?"experience.manage":"common.goPremium")} onPress={()=>isPremium?manage():navigation.navigate("Paywall")}/></View>
    <Text style={ui.eyebrow}>{t("experience.localData")}</Text>
    <View style={ui.card}><Icon name="lock-closed-outline" color={palette.muted}/><Text style={ui.body}>{t("experience.dataBody")}</Text><Pressable accessibilityRole="button" onPress={deleteData} style={styles.delete}><Icon name="trash-outline" color={palette.ember} size={17}/><Text style={{color:palette.ember,fontSize:12,flex:1}}>{t("experience.deleteData")}</Text></Pressable></View>
    <Pressable accessibilityRole="button" onPress={()=>navigation.navigate("Legal")} style={[ui.card,ui.between]}><Text style={styles.rowTitle}>{t("experience.legal")}</Text><Icon name="chevron-forward" color={palette.muted} size={18}/></Pressable>
    <Pressable accessibilityRole="button" onPress={()=>{Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(()=>{});}} style={styles.support}><Text style={ui.body}>{t("experience.support")}</Text></Pressable>
    <Text style={[ui.body,{fontSize:10,textAlign:"center"}]}>{t("experience.disclaimer")}</Text>
  </ScrollView></View>;
}
const styles=StyleSheet.create({languages:{flexDirection:"row",flexWrap:"wrap",gap:10},language:{flexBasis:"47%",flexGrow:1,borderRadius:14,borderWidth:1,borderColor:palette.border,backgroundColor:palette.surface,padding:16,flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:8},languageActive:{borderColor:"#82704E",backgroundColor:"#27251F"},languageText:{color:palette.text,fontSize:13},reminderRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:14,paddingVertical:12},rowTitle:{fontSize:14,color:palette.text},muted:{fontSize:11,color:palette.muted},delete:{minHeight:44,flexDirection:"row",alignItems:"center",gap:10},support:{minHeight:44,alignItems:"center",justifyContent:"center"}});
