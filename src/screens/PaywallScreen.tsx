import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ImageBackground, Pressable, Alert, Linking, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTranslation } from "../context/LanguageContext";
import { usePremium } from "../context/PremiumContext";
import { fetchPackageDetails, PackageDetails, purchasePremium, restorePurchases } from "../services/revenuecat";
import { getCapabilities } from "../services/chatApi";
import { APPLE_EULA_URL, TERMS_OF_USE_URL, PRIVACY_POLICY_URL } from "../constants/legal";
import { Brand, Button, Icon, IconButton, ui } from "../components/Primitives";
import { palette, portalArt, serif } from "../theme/tokens";

type Props=NativeStackScreenProps<RootStackParamList,"Paywall">;
export default function PaywallScreen({navigation}:Props) {
  const {t}=useTranslation();const insets=useSafeAreaInsets();const {isPremium,setPremium,isChecking}=usePremium();
  const [details,setDetails]=useState<PackageDetails|null>(null);
  const [loadingPrice,setLoadingPrice]=useState(true);const [busy,setBusy]=useState(false);
  const [pricingError,setPricingError]=useState<string|null>(null);const [backendReady,setBackendReady]=useState(false);const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let active=true;setLoadingPrice(true);setDetails(null);setPricingError(null);setBackendReady(false);
    Promise.all([fetchPackageDetails(),getCapabilities()]).then(([product,capabilities])=>{
      if(!active)return;
      setDetails(product.details||null);setPricingError(product.reason||null);setBackendReady(capabilities.paidChatReady);setLoadingPrice(false);
    }).catch(()=>{if(active){setPricingError("unavailable");setLoadingPrice(false);}});
    return()=>{active=false;};
  },[attempt]);
  const purchase=async()=>{
    if(busy||!details||!backendReady||isPremium||isChecking)return;
    setBusy(true);
    try{const result=await purchasePremium();if(result.success){setPremium(true);navigation.navigate("RoleSelection");}else if(result.reason){Alert.alert(t("paywall.purchaseErrorTitle"),t(`paywall.errors.${result.reason}`));}}finally{setBusy(false);}
  };
  const restore=async()=>{
    if(busy)return;setBusy(true);
    try{const result=await restorePurchases();if(result.success){setPremium(true);Alert.alert(t("paywall.ctaActive"),t("experience.restoreSuccess"));navigation.navigate("RoleSelection");}else if(result.reason){Alert.alert(t("paywall.restoreErrorTitle"),t(`paywall.errors.${result.reason}`));}}finally{setBusy(false);}
  };
  const open=(url:string)=>{Linking.openURL(url).catch(()=>Alert.alert(t("experience.errors.service_unavailable")));};
  const benefits=t("experience.premiumBenefits") as string[];
  return <View style={ui.screen}><ScrollView contentContainerStyle={{paddingBottom:insets.bottom+24}}>
    <ImageBackground source={portalArt} resizeMode="cover" imageStyle={{width:"100%",height:"100%"}} style={[styles.hero,{paddingTop:insets.top+12}]}>
      <LinearGradient colors={["rgba(11,14,18,0.25)","rgba(11,14,18,0.05)",palette.background]} style={StyleSheet.absoluteFill}/>
      <View style={ui.between}><Brand small/><IconButton name="close" label={t("common.close")} onPress={()=>navigation.canGoBack()?navigation.goBack():navigation.navigate("RoleSelection")}/></View>
      <View style={styles.heroBadge}><Icon name="sparkles-outline" size={15} color={palette.gold}/><Text style={styles.badgeText}>PREMIUM</Text></View>
    </ImageBackground>
    <View style={[ui.content,{gap:20,paddingTop:4}]}>
      <Text style={[ui.eyebrow,{textAlign:"center"}]}>{t("experience.premiumEyebrow")}</Text>
      <Text style={styles.title}>{t("experience.premiumTitle")}</Text>
      <Text style={[ui.body,{textAlign:"center"}]}>{t("experience.premiumSubtitle")}</Text>
      <View style={{gap:17,marginVertical:8}}>{benefits.map((benefit,index)=><View key={index} style={ui.row}><View style={styles.check}><Icon name="checkmark" size={15} color={palette.gold}/></View><Text style={styles.benefit}>{benefit}</Text></View>)}</View>
      <View style={[ui.card,{borderColor:"#63543C",backgroundColor:"#201F1B"}]}>
        <View style={ui.between}><View style={{flex:1,gap:6}}><Text style={styles.planName}>{t("paywall.subscriptionTitle")}</Text><Text style={styles.planDescription}>{t("experience.premiumDescription")}</Text></View><Icon name="checkmark-circle" color={palette.gold} size={24}/></View>
        {loadingPrice?<ActivityIndicator color={palette.gold}/>:details?<Text style={styles.price}>{details.price}<Text style={styles.period}>{details.period?` / ${details.periodCount&&details.periodCount>1?details.periodCount+" × ":""}${t(`paywall.period.${details.period}`)}`:""}</Text></Text>:<Text style={styles.planDescription}>{t(`paywall.errors.${pricingError||"unavailable"}`)}</Text>}
      </View>
      {!loadingPrice&&!backendReady&&<Text style={styles.notice}>{t("experience.backendUnavailable")}</Text>}
      <Pressable accessibilityRole="button" disabled={busy} onPress={restore} style={styles.linkButton}><Text style={styles.link}>{t("paywall.restore")}</Text></Pressable>
      <View style={styles.preview}><Icon name="sunny-outline" size={20} color={palette.gold}/><Text style={styles.previewText}>{t("experience.premiumFree")}</Text></View>
      <Pressable accessibilityRole="button" onPress={()=>navigation.navigate("RoleSelection")} style={styles.linkButton}><Text style={[styles.link,{color:palette.text}]}>{t("experience.premiumPreview")}</Text></Pressable>
      <View style={styles.legal}>{[{label:t("paywall.termsLink"),url:TERMS_OF_USE_URL},{label:t("paywall.privacyLink"),url:PRIVACY_POLICY_URL},{label:t("paywall.appleEula"),url:APPLE_EULA_URL}].map(item=><Pressable accessibilityRole="link" key={item.url} onPress={()=>open(item.url)} style={{minHeight:44,justifyContent:"center"}}><Text style={styles.legalText}>{item.label}</Text></Pressable>)}</View>
    </View>
  </ScrollView>
    <View style={[styles.purchaseBar,{paddingBottom:Math.max(insets.bottom,12)}]}>
      {details&&<Text style={styles.footerPrice}>{details.price}{details.period?` / ${details.periodCount&&details.periodCount>1?details.periodCount+" × ":""}${t(`paywall.period.${details.period}`)}`:""}</Text>}
      {!loadingPrice&&(!details||!backendReady)&&<Text style={styles.footerNotice}>{t(details?"experience.backendUnavailable":`paywall.errors.${pricingError||"unavailable"}`)}</Text>}
      <Button label={t(isPremium?"paywall.ctaActive":loadingPrice?"paywall.loadingPrice":(!details||!backendReady)?"paywall.unavailable":"experience.purchaseReady")} onPress={purchase} disabled={loadingPrice||!details||!backendReady||isPremium||isChecking} loading={busy}/>
      {!loadingPrice&&(!details||!backendReady)&&<Pressable accessibilityRole="button" accessibilityLabel={t("paywall.retry")} disabled={busy} onPress={()=>setAttempt(v=>v+1)} style={styles.linkButton}><Text style={styles.link}>{t("paywall.retry")}</Text></Pressable>}
      {details&&backendReady&&<Text style={styles.reassurance}>{t("paywall.reassurance")}</Text>}
    </View>
  </View>;
}
const styles=StyleSheet.create({purchaseBar:{paddingHorizontal:24,paddingTop:14,gap:10,borderTopWidth:1,borderTopColor:palette.border,backgroundColor:palette.background},footerPrice:{fontSize:18,color:palette.ivory,textAlign:"center",fontWeight:"600"},footerNotice:{fontSize:11,lineHeight:17,textAlign:"center",color:palette.ember},hero:{width:"100%",height:210,paddingHorizontal:24,justifyContent:"space-between",paddingBottom:20},heroBadge:{alignSelf:"center",flexDirection:"row",alignItems:"center",gap:8,paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:"#716049",backgroundColor:"rgba(30,26,20,0.8)"},badgeText:{color:palette.gold,fontSize:10,letterSpacing:2},title:{fontFamily:serif,color:palette.text,fontSize:36,lineHeight:44,textAlign:"center"},check:{width:24,height:24,borderRadius:12,alignItems:"center",justifyContent:"center",backgroundColor:"#2B2921"},benefit:{color:palette.text,fontSize:14,lineHeight:22,flex:1},planName:{color:palette.ivory,fontSize:14,fontWeight:"600"},planDescription:{color:palette.muted,fontSize:12,lineHeight:19},price:{fontFamily:serif,color:palette.text,fontSize:30},period:{fontFamily:undefined,fontSize:13,color:palette.muted},notice:{color:palette.ember,fontSize:12,lineHeight:19,textAlign:"center"},reassurance:{color:palette.muted,fontSize:11,lineHeight:18,textAlign:"center"},linkButton:{minHeight:44,alignItems:"center",justifyContent:"center"},link:{color:palette.gold,fontSize:12},preview:{flexDirection:"row",alignItems:"center",gap:12,padding:16,backgroundColor:palette.surface,borderRadius:16},previewText:{flex:1,color:palette.muted,fontSize:12,lineHeight:20},legal:{flexDirection:"row",flexWrap:"wrap",justifyContent:"center",gap:18},legalText:{color:palette.muted,fontSize:10}});
