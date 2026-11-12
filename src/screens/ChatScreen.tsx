import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Alert, Share, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetInfo } from "@react-native-community/netinfo";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTranslation } from "../context/LanguageContext";
import { usePremium } from "../context/PremiumContext";
import { Icon, IconButton, Button, ui } from "../components/Primitives";
import { palette, personaColors, portalArt, serif } from "../theme/tokens";
import { loadHistory, saveHistory, clearHistory, saveReflection, getConversationRevision, Message } from "../services/conversations";
import { sendChat, ChatApiError } from "../services/chatApi";

type Props=NativeStackScreenProps<RootStackParamList,"Chat">;
export default function ChatScreen({route,navigation}:Props) {
  const {role,initialPrompt}=route.params;
  const {t,language}=useTranslation();
  const {isPremium}=usePremium();
  const insets=useSafeAreaInsets();
  const net=useNetInfo();
  const [messages,setMessages]=useState<Message[]>([]);
  const [input,setInput]=useState(initialPrompt||"");
  const [sending,setSending]=useState(false);
  const [hydrated,setHydrated]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [remaining,setRemaining]=useState<number|null>(null);
  const [saved,setSaved]=useState<string[]>([]);
  const list=useRef<FlatList<Message>>(null);
  const lock=useRef(false);
  const accent=personaColors[role];
  const title=role==="council"?t("experience.council"):t(`common.${role}`);
  const icon=role==="god"?"sunny-outline":role==="devil"?"flame-outline":"git-compare-outline";
  useEffect(()=>{
    let active=true;
    setHydrated(false); setMessages([]); setRemaining(null);
    loadHistory(role).then(data=>{if(active)setMessages(data);}).catch(()=>{if(active)setError("storage");}).finally(()=>{if(active)setHydrated(true);});
    return ()=>{active=false;};
  },[role]);
  const persist=(next:Message[])=>saveHistory(role,next).catch(()=>setError("storage"));
  const onSend=async()=>{
    const text=input.trim();
    if(!text||lock.current||!hydrated)return;
    if(net.isConnected===false){setError("offline");return;}
    lock.current=true;setSending(true);setError(null);setInput("");
    const before=messages;
    const revision=getConversationRevision();
    const question:Message={id:`u-${Date.now()}`,from:"user",text};
    setMessages([...before,question]);
    try {
      const result=await sendChat({role,message:text,language,history:before});
      if (getConversationRevision() !== revision) return;
      const council=result.council;
      const reply:Message={id:`a-${Date.now()}`,from:"ai",text:result.reply||(council?`${t("common.god")}: ${council.god}\n\n${t("common.devil")}: ${council.devil}\n\n${council.reflection}`:""),council};
      const next=[...before,question,reply].slice(-60);
      setMessages(next);setRemaining(result.remaining);await persist(next);
    } catch(e) {
      setMessages(before);setInput(text);
      setError(e instanceof ChatApiError?e.code:"service_unavailable");
    } finally {setSending(false);lock.current=false;}
  };
  const onClear=()=>Alert.alert(t("experience.newConversation"),t("experience.clearConfirm"),[
    {text:t("experience.cancel"),style:"cancel"},
    {text:t("experience.clear"),style:"destructive",onPress:()=>{
      clearHistory(role).then(()=>{setMessages([]);setError(null);}).catch(()=>setError("storage"));
    }}
  ]);
  const bookmark=async(item:Message)=>{
    try {await saveReflection({id:item.id,role,text:item.text,createdAt:Date.now()});setSaved(previous=>[...previous,item.id]);}
    catch{setError("storage");}
  };
  const share=async(text:string)=>{try{await Share.share({message:`${text}\n\nHeaven & Hell · ${t("experience.aiLabel")}`});}catch{setError("share");}};
  const prompts=t(`experience.starters.${role}`) as string[];
  const errorKey=error&&["daily_limit","capacity","rate_limit","busy","session_expired","service_unavailable","invalid_request","storage","offline","share"].includes(error)?error:"service_unavailable";
  const renderMessage=({item}:{item:Message})=>item.from==="user"?
    <View style={styles.userBubble}><Text selectable style={styles.userText}>{item.text}</Text></View>:
    <View style={styles.answer}>
      <View style={ui.row}><View style={[styles.tinySymbol,{borderColor:accent}]}><Icon name={icon} color={accent} size={14}/></View><Text style={[styles.answerLabel,{color:accent}]}>{title}</Text></View>
      {item.council?<View style={{gap:12}}>
        <View style={[styles.perspective,{borderLeftColor:palette.gold}]}><Text style={[styles.perspectiveLabel,{color:palette.gold}]}>{t("common.god")}</Text><Text selectable style={styles.answerText}>{item.council.god}</Text></View>
        <View style={[styles.perspective,{borderLeftColor:palette.ember}]}><Text style={[styles.perspectiveLabel,{color:palette.ember}]}>{t("common.devil")}</Text><Text selectable style={styles.answerText}>{item.council.devil}</Text></View>
        <Text selectable style={[styles.answerText,{fontFamily:serif,color:palette.ivory}]}>{item.council.reflection}</Text>
      </View>:<Text selectable style={styles.answerText}>{item.text}</Text>}
      <View style={styles.answerActions}>
        <Pressable accessibilityRole="button" onPress={()=>bookmark(item)} style={styles.action}><Icon name={saved.includes(item.id)?"bookmark":"bookmark-outline"} color={saved.includes(item.id)?palette.gold:palette.muted} size={17}/><Text style={styles.actionText}>{t(saved.includes(item.id)?"experience.saved":"experience.save")}</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={()=>share(item.text)} style={styles.action}><Icon name="share-outline" color={palette.muted} size={17}/><Text style={styles.actionText}>{t("experience.share")}</Text></Pressable>
      </View>
    </View>;
  return <View style={ui.screen}>
    <ImageBackground source={portalArt} resizeMode="cover" imageStyle={{width:"100%",height:"100%"}} style={styles.backdrop}><LinearGradient colors={["rgba(11,14,18,0.35)",palette.background]} style={{flex:1}}/></ImageBackground>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":undefined} keyboardVerticalOffset={0}>
      <View style={[styles.header,{paddingTop:insets.top+8}]}>
        <IconButton name="chevron-back" label={t("common.back")} onPress={()=>navigation.goBack()}/>
        <View style={styles.headerTitle}><Text style={[styles.personaName,{color:accent}]}>{title}</Text><Text style={styles.status}>{t("experience.aiLabel")}</Text></View>
        <IconButton name="add-outline" label={t("experience.newConversation")} disabled={sending} onPress={onClear}/>
      </View>
      {!hydrated?<ActivityIndicator style={{flex:1}} color={accent}/>:<FlatList
        ref={list} data={messages} renderItem={renderMessage} keyExtractor={item=>item.id}
        contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled"
        onContentSizeChange={()=>list.current?.scrollToEnd({animated:true})}
        ListEmptyComponent={<View style={styles.welcome}>
          <View style={[styles.welcomeIcon,{borderColor:accent}]}><Icon name={icon} color={accent} size={34}/></View>
          <Text style={styles.welcomeEyebrow}>{t("experience.privateSpace")}</Text>
          <Text style={styles.welcomeTitle}>{t(`experience.welcome.${role}`)}</Text>
          <Text style={styles.welcomeBody}>{t(`experience.welcomeBody.${role}`)}</Text>
          <View style={styles.prompts}>{prompts.map((prompt,index)=><Pressable key={index} accessibilityRole="button" onPress={()=>setInput(prompt)} style={styles.prompt}><Text style={styles.promptText}>{prompt}</Text><Icon name="arrow-up-outline" size={15} color={accent}/></Pressable>)}</View>
        </View>}
        ListFooterComponent={sending?<View accessibilityLiveRegion="polite" style={styles.thinking}><ActivityIndicator color={accent} size="small"/><Text style={ui.body}>{t(role==="council"?"experience.thinkingBoth":"experience.thinking")}</Text></View>:null}
      />}
      {error&&<View accessibilityLiveRegion="polite" style={styles.error}><Text style={styles.errorText}>{t(`experience.errors.${errorKey}`)}</Text>{error==="daily_limit"&&!isPremium&&<Button secondary label={t("common.goPremium")} onPress={()=>navigation.navigate("Paywall")}/>}</View>}
      <View style={[styles.composerArea,{paddingBottom:Math.max(insets.bottom,12)}]}>
        {remaining!==null&&<Text style={styles.remaining}>{t("experience.remaining",{count:remaining})}</Text>}
        <View style={styles.composer}><TextInput value={input} onChangeText={setInput} placeholder={t("experience.inputPlaceholder")} placeholderTextColor="#858486" multiline maxLength={2000} editable={hydrated&&!sending} style={styles.input} accessibilityLabel={t("experience.inputPlaceholder")}/><Pressable accessibilityRole="button" accessibilityLabel={t("chat.send")} onPress={onSend} disabled={!input.trim()||sending||!hydrated} style={[styles.send,{backgroundColor:accent},(!input.trim()||sending||!hydrated)&&{opacity:0.35}]}><Icon name="arrow-up" color={palette.background} size={23}/></Pressable></View>
        <Text style={styles.footer}>{t("experience.chatPrivacy")}</Text>
      </View>
    </KeyboardAvoidingView>
  </View>;
}
const styles=StyleSheet.create({
  backdrop:{width:"100%",position:"absolute",top:0,left:0,right:0,height:330,opacity:0.33},header:{flexDirection:"row",alignItems:"center",gap:12,paddingHorizontal:18,paddingBottom:16,borderBottomWidth:1,borderBottomColor:"rgba(255,255,255,0.06)"},headerTitle:{flex:1,alignItems:"center",gap:5},personaName:{fontFamily:serif,fontSize:24},status:{color:palette.muted,fontSize:10,letterSpacing:1},list:{padding:24,gap:24,flexGrow:1},welcome:{paddingTop:24,paddingBottom:16,alignItems:"center",gap:18},welcomeIcon:{height:78,width:78,borderRadius:39,borderWidth:1,alignItems:"center",justifyContent:"center",backgroundColor:"rgba(233,198,139,0.04)"},welcomeEyebrow:{color:palette.muted,fontSize:9,letterSpacing:2.5,textAlign:"center"},welcomeTitle:{fontFamily:serif,fontSize:32,lineHeight:40,color:palette.text,textAlign:"center",maxWidth:340},welcomeBody:{fontSize:14,lineHeight:23,textAlign:"center",color:palette.muted,maxWidth:330},prompts:{gap:9,width:"100%",marginTop:8,maxWidth:500},prompt:{padding:15,borderRadius:14,borderWidth:1,borderColor:palette.border,backgroundColor:"rgba(21,25,31,0.8)",flexDirection:"row",gap:12,alignItems:"center",justifyContent:"space-between"},promptText:{fontSize:12,color:"#DDD6C9",flex:1,lineHeight:19},userBubble:{alignSelf:"flex-end",maxWidth:"87%",padding:16,borderRadius:19,borderBottomRightRadius:5,backgroundColor:"#292A2A",borderWidth:1,borderColor:"#3B3A37"},userText:{color:palette.text,fontSize:15,lineHeight:23},answer:{gap:16,paddingVertical:4},tinySymbol:{width:27,height:27,borderRadius:14,borderWidth:1,alignItems:"center",justifyContent:"center"},answerLabel:{fontSize:11,letterSpacing:1},answerText:{fontSize:16,lineHeight:27,color:"#E4DED3"},answerActions:{flexDirection:"row",gap:24},action:{flexDirection:"row",gap:7,alignItems:"center",minHeight:44},actionText:{color:palette.muted,fontSize:11},perspective:{borderLeftWidth:2,paddingLeft:16,paddingVertical:10,gap:8},perspectiveLabel:{fontSize:11,letterSpacing:1.5},thinking:{flexDirection:"row",alignItems:"center",gap:12,paddingVertical:16},error:{marginHorizontal:20,gap:12,padding:14,borderRadius:14,backgroundColor:"#32251F"},errorText:{fontSize:13,lineHeight:20,color:"#EFC5AD"},composerArea:{paddingHorizontal:18,paddingTop:10,gap:10,backgroundColor:palette.background},composer:{flexDirection:"row",alignItems:"flex-end",borderWidth:1,borderColor:"#45413A",borderRadius:25,padding:7,backgroundColor:"#191D21",gap:8},input:{flex:1,minHeight:40,maxHeight:130,color:palette.text,paddingHorizontal:12,paddingTop:10,paddingBottom:10,fontSize:14,lineHeight:21},send:{height:40,width:40,borderRadius:20,alignItems:"center",justifyContent:"center"},footer:{textAlign:"center",color:"#7F8185",fontSize:9,lineHeight:14},remaining:{textAlign:"center",color:palette.muted,fontSize:10}
});
