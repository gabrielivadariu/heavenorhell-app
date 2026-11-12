import React from "react";
import { View, Text, ScrollView, Pressable, Linking, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTranslation } from "../context/LanguageContext";
import { APPLE_EULA_URL, CONTACT_EMAIL, PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from "../constants/legal";
import { Icon, IconButton, ui } from "../components/Primitives";
import { palette } from "../theme/tokens";
type Props=NativeStackScreenProps<RootStackParamList,"Legal">;
export default function LegalScreen({navigation}:Props) {
  const {t}=useTranslation();const insets=useSafeAreaInsets();
  const open=(url:string)=>Linking.openURL(url).catch(()=>Alert.alert(t("experience.errors.service_unavailable")));
  const links=[{title:t("legal.termsTitle"),url:TERMS_OF_USE_URL},{title:t("legal.privacyTitle"),url:PRIVACY_POLICY_URL},{title:t("paywall.appleEula"),url:APPLE_EULA_URL},{title:t("experience.support"),url:`mailto:${CONTACT_EMAIL}`}];
  return <View style={ui.screen}><ScrollView contentContainerStyle={[ui.content,{paddingTop:insets.top+12,paddingBottom:insets.bottom+24}]}>
    <View style={ui.between}><IconButton name="chevron-back" label={t("common.back")} onPress={()=>navigation.goBack()}/><Text style={ui.eyebrow}>{t("legal.title")}</Text><View style={{width:44}}/></View>
    <Text style={ui.title}>{t("experience.legal")}</Text>
    <View style={ui.card}><Icon name="shield-checkmark-outline" color={palette.gold}/><Text style={ui.body}>{t("experience.disclaimer")}</Text><Text style={ui.body}>{t("experience.dataBody")}</Text></View>
    <View style={ui.card}><Text style={[ui.body,{color:palette.text}]}>{t("experience.premiumDescription")}</Text><Text style={ui.body}>{t("paywall.reassurance")}</Text></View>
    {links.map(link=><Pressable accessibilityRole="link" key={link.url} onPress={()=>open(link.url)} style={[ui.card,ui.between]}><Text style={{color:palette.text,fontSize:14,flex:1}}>{link.title}</Text><Icon name="open-outline" color={palette.muted} size={18}/></Pressable>)}
  </ScrollView></View>;
}
