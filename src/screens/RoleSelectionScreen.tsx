import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ImageBackground, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/AppNavigator";
import { usePremium } from "../context/PremiumContext";
import { useTranslation } from "../context/LanguageContext";
import { Brand, Icon, IconButton, ui } from "../components/Primitives";
import { palette, portalArt, serif } from "../theme/tokens";
import type { PersonaRole } from "../config";

type Props = NativeStackScreenProps<RootStackParamList, "RoleSelection">;
export default function RoleSelectionScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { isPremium } = usePremium();
  const insets = useSafeAreaInsets();
  const {width}=useWindowDimensions();
  const enter = (role: PersonaRole) => navigation.navigate("PortalTransition", {role});
  return <View style={ui.screen}>
    <ScrollView contentContainerStyle={[ui.content, {paddingTop:insets.top+12, paddingBottom:insets.bottom+24}]}>
      <View style={ui.between}>
        <Brand small={width<360}/>
        <View style={[ui.row,{gap:width<360?6:12}]}>
          <IconButton name="bookmark-outline" label={t("experience.journal")} onPress={() => navigation.navigate("Journal")}/>
          <IconButton name="options-outline" label={t("experience.settings")} onPress={() => navigation.navigate("Notifications")}/>
        </View>
      </View>
      <ImageBackground source={portalArt} style={styles.hero} imageStyle={{borderRadius:26,width:"100%",height:"100%"}} resizeMode="cover">
        <LinearGradient colors={["rgba(8,11,15,0)","rgba(8,11,15,0.1)","rgba(8,11,15,0.97)"]} locations={[0,0.3,1]} style={styles.heroGradient}>
          <View style={styles.heroPill}><View style={styles.dot}/><Text style={styles.pillText}>{t("experience.sanctuary")}</Text></View>
          <View style={styles.heroCopy}>
            <Text style={ui.eyebrow}>{t("experience.pause")}</Text>
            <Text style={styles.heroTitle}>{t("experience.heroTitle")}</Text>
            <Text style={styles.heroBody}>{t("experience.heroSubtitle")}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
      <View style={[ui.between,{alignItems:"baseline"}]}><Text style={styles.sectionTitle}>{t("experience.chooseVoice")}</Text><Text style={styles.small}>{t("experience.yourChoice")}</Text></View>
      <View style={styles.voices}>
        <Pressable accessibilityRole="button" onPress={() => enter("god")} style={({pressed}) => [styles.voice,{borderColor:"#514533"},pressed&&styles.pressed]}>
          <View style={[styles.symbol,{backgroundColor:"#302A20"}]}><Icon name="sunny-outline" color={palette.gold} size={26}/></View>
          <Text style={styles.voiceTitle}>{t("common.god")}</Text><Text style={styles.voiceSubtitle}>{t("experience.godDescription")}</Text>
          <View style={ui.between}><Text style={[styles.voiceCta,{color:palette.gold}]}>{t("experience.enter")}</Text><Icon name="arrow-forward" color={palette.gold} size={18}/></View>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => enter("devil")} style={({pressed}) => [styles.voice,{borderColor:"#49362F"},pressed&&styles.pressed]}>
          <View style={[styles.symbol,{backgroundColor:"#302321"}]}><Icon name="flame-outline" color={palette.ember} size={26}/></View>
          <Text style={styles.voiceTitle}>{t("common.devil")}</Text><Text style={styles.voiceSubtitle}>{t("experience.devilDescription")}</Text>
          <View style={ui.between}><Text style={[styles.voiceCta,{color:palette.ember}]}>{t("experience.enter")}</Text><Icon name="arrow-forward" color={palette.ember} size={18}/></View>
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" onPress={() => enter("council")} style={({pressed}) => [styles.council,pressed&&styles.pressed]}>
        <View style={ui.between}><View style={styles.councilIcons}><Icon name="sunny-outline" color={palette.gold}/><View style={styles.iconLine}/><Icon name="flame-outline" color={palette.ember}/></View><Text style={styles.newBadge}>{t("experience.signature")}</Text></View>
        <Text style={styles.councilTitle}>{t("experience.council")}</Text><Text style={ui.body}>{t("experience.councilDescription")}</Text>
        <View style={ui.between}><Text style={[styles.voiceCta,{color:palette.violet}]}>{t("experience.askBoth")}</Text><Icon name="arrow-forward" color={palette.violet} size={18}/></View>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Ritual")} style={({pressed}) => [ui.card,ui.between,pressed&&styles.pressed]}>
        <View style={styles.ritualIcon}><Icon name="leaf-outline" color={palette.gold}/></View><View style={{flex:1,gap:4}}><Text style={styles.ritualTitle}>{t("experience.ritual")}</Text><Text style={ui.body}>{t("experience.ritualSubtitle")}</Text></View><Icon name="chevron-forward" color={palette.muted} size={18}/>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Paywall")} style={styles.premium}>
        <View style={ui.row}><Icon name="sparkles-outline" color={palette.gold}/><Text style={styles.premiumText}>{t(isPremium?"paywall.ctaActive":"experience.premiumInvite")}</Text></View><Icon name="arrow-forward" color={palette.gold} size={18}/>
      </Pressable>
      <Text style={styles.disclaimer}>{t("experience.disclaimer")}</Text>
    </ScrollView>
  </View>;
}
const styles=StyleSheet.create({
  hero:{width:"100%",height:365,borderRadius:26,overflow:"hidden",backgroundColor:palette.surface},
  heroGradient:{flex:1,padding:24,justifyContent:"space-between"},heroPill:{alignSelf:"flex-start",paddingHorizontal:10,paddingVertical:7,borderRadius:20,backgroundColor:"rgba(8,11,15,0.66)",flexDirection:"row",alignItems:"center",gap:7,borderWidth:1,borderColor:"#5E5040"},dot:{width:5,height:5,borderRadius:3,backgroundColor:palette.gold},pillText:{color:palette.ivory,fontSize:10,letterSpacing:1},heroCopy:{gap:10},heroTitle:{fontFamily:serif,color:palette.text,fontSize:40,lineHeight:45},heroBody:{color:"#D7D0C4",fontSize:13,lineHeight:20,maxWidth:300},
  sectionTitle:{flex:1,fontFamily:serif,color:palette.text,fontSize:23},small:{color:palette.muted,fontSize:11,maxWidth:95,textAlign:"right"},voices:{flexDirection:"row",gap:12},voice:{flex:1,borderRadius:22,borderWidth:1,padding:18,gap:14,backgroundColor:palette.surface},symbol:{width:46,height:46,borderRadius:23,justifyContent:"center",alignItems:"center"},voiceTitle:{fontFamily:serif,color:palette.text,fontSize:24},voiceSubtitle:{fontSize:12,lineHeight:19,color:palette.muted,minHeight:57},voiceCta:{fontSize:12,fontWeight:"600",flexShrink:1},council:{borderRadius:22,padding:22,borderWidth:1,borderColor:"#4C425C",backgroundColor:"#1B1922",gap:14},councilIcons:{flexDirection:"row",alignItems:"center",gap:10},iconLine:{width:24,height:1,backgroundColor:"#5C5368"},newBadge:{color:palette.violet,fontSize:9,letterSpacing:1.5,flexShrink:1},councilTitle:{fontFamily:serif,color:palette.text,fontSize:27},ritualIcon:{width:40,height:40,borderRadius:20,backgroundColor:"#2B2922",alignItems:"center",justifyContent:"center"},ritualTitle:{fontSize:14,color:palette.text,fontWeight:"500"},premium:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingVertical:8,gap:10},premiumText:{color:palette.gold,fontSize:13,flexShrink:1},disclaimer:{color:"#777A80",fontSize:10,lineHeight:16,textAlign:"center"},pressed:{opacity:0.65}
});
