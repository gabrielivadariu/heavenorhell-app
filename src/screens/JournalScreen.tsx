import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Share, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTranslation } from "../context/LanguageContext";
import { loadJournal, removeReflection, SavedReflection } from "../services/conversations";
import { Icon, IconButton, ui } from "../components/Primitives";
import { palette, personaColors, serif } from "../theme/tokens";
type Props=NativeStackScreenProps<RootStackParamList,"Journal">;
export default function JournalScreen({navigation}:Props) {
  const {t,language}=useTranslation();const insets=useSafeAreaInsets();const [entries,setEntries]=useState<SavedReflection[]>([]);
  useFocusEffect(useCallback(()=>{let active=true;loadJournal().then(data=>{if(active)setEntries(data);}).catch(()=>Alert.alert(t("experience.errors.storage")));return()=>{active=false;};},[t]));
  const remove=(id:string)=>Alert.alert(t("experience.deleteReflection"),t("experience.deleteConfirm"),[{text:t("experience.cancel"),style:"cancel"},{text:t("experience.clear"),style:"destructive",onPress:()=>removeReflection(id).then(()=>setEntries(current=>current.filter(v=>v.id!==id))).catch(()=>Alert.alert(t("experience.errors.storage")))}]);
  return <View style={ui.screen}>
    <View style={[styles.header,{paddingTop:insets.top+12}]}><IconButton name="chevron-back" label={t("common.back")} onPress={()=>navigation.goBack()}/><Text style={ui.eyebrow}>{t("experience.journal")}</Text><View style={{width:44}}/></View>
    <FlatList data={entries} keyExtractor={item=>item.id} contentContainerStyle={[ui.content,{paddingBottom:insets.bottom+24}]} ListHeaderComponent={<View style={{gap:12,paddingTop:20,paddingBottom:12}}><Text style={ui.title}>{t("experience.journalTitle")}</Text><Text style={ui.body}>{t("experience.journalBody")}</Text></View>} ListEmptyComponent={<View style={styles.empty}><Icon name="bookmark-outline" color={palette.gold} size={38}/><Text style={styles.emptyTitle}>{t("experience.journalEmpty")}</Text><Text style={[ui.body,{textAlign:"center"}]}>{t("experience.journalHint")}</Text></View>} renderItem={({item})=><View style={[ui.card,{borderTopColor:personaColors[item.role]}]}>
      <View style={ui.between}><Text style={[ui.eyebrow,{color:personaColors[item.role],letterSpacing:1}]}>{t(item.role==="council"?"experience.council":`common.${item.role}`)}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString(language)}</Text></View>
      <Text selectable style={styles.reflection}>{item.text}</Text>
      <View style={{flexDirection:"row",justifyContent:"flex-end",gap:10}}><IconButton name="share-outline" label={t("experience.share")} onPress={()=>{Share.share({message:`${item.text}\n\nHeaven & Hell · ${t("experience.aiLabel")}`}).catch(()=>Alert.alert(t("experience.errors.share")));}}/><IconButton name="trash-outline" label={t("experience.deleteReflection")} onPress={()=>remove(item.id)}/></View>
    </View>}/>
  </View>;
}
const styles=StyleSheet.create({header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:24,paddingBottom:12},empty:{alignItems:"center",paddingTop:60,gap:18},emptyTitle:{fontFamily:serif,fontSize:26,color:palette.text,textAlign:"center"},date:{color:palette.muted,fontSize:10},reflection:{fontFamily:serif,fontSize:17,lineHeight:28,color:palette.text}});
