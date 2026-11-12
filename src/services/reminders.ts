import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import type { Language } from "../context/LanguageContext";
import { getMessageBatch } from "./notificationMessages";
export type ReminderPreferences={morning:boolean;evening:boolean};
const KEY="hh_reminders_v2";
let queue:Promise<unknown>=Promise.resolve();
export async function loadReminders():Promise<ReminderPreferences> {
  const raw=await AsyncStorage.getItem(KEY);
  if(raw){try{const v=JSON.parse(raw);return{morning:v.morning===true,evening:v.evening===true};}catch{}}
  // Preserve opt-in from the old screen while reducing the frequency.
  const legacy=await AsyncStorage.getItem("notification_settings");
  if(legacy){try{const v=JSON.parse(legacy);return{morning:v.godEnabled===true,evening:v.devilEnabled===true};}catch{}}
  return{morning:false,evening:false};
}
export function reconcileReminders(preferences:ReminderPreferences,language:Language,premium:boolean) {
  const pending=queue.catch(()=>{}).then(async()=>{
    await Notifications.cancelAllScheduledNotificationsAsync();
    const permission=await Notifications.getPermissionsAsync();
    if(permission.status==="granted"){
      const options=[{enabled:preferences.morning,role:"god" as const,hour:9,minute:0},{enabled:preferences.evening&&premium,role:"devil" as const,hour:19,minute:30}];
      const ids:string[]=[];
      try{
        for(const option of options)if(option.enabled){
          const message=getMessageBatch(option.role,language,1)[0];
          if(message)ids.push(await Notifications.scheduleNotificationAsync({content:{title:message.title,body:message.body},trigger:{type:Notifications.SchedulableTriggerInputTypes.DAILY,hour:option.hour,minute:option.minute}}));
        }
      }catch(error){await Promise.all(ids.map(id=>Notifications.cancelScheduledNotificationAsync(id)));throw error;}
    }
    await AsyncStorage.setItem(KEY,JSON.stringify(preferences));
    await AsyncStorage.removeItem("notification_settings");
  });
  queue=pending;return pending;
}
