type Lang = "en" | "ro" | "de" | "no";

const godMessages: Record<Lang, string[]> = {
  en: [
    "Do not fear, I am with you.",
    "Your heart knows the way—follow the light.",
    "Grace is near; breathe and rise.",
    "Strength comes quietly; listen.",
    "Love never fails; keep walking.",
    "Hope is stronger than the storm.",
    "Peace be with you; stay steadfast.",
    "I guide your steps; stay humble.",
    "Mercy meets you where you are.",
    "Rest; the battle is Mine, not yours.",
    "You are seen, heard, and loved.",
    "Keep planting good seeds; harvest will come.",
    "Choose kindness today; it echoes.",
    "Patience opens doors that force cannot.",
    "Let go of worry; I hold tomorrow.",
    "Light shines brightest after the dark.",
    "Truth sets you free; stay close to it.",
    "Quiet your mind; I speak in whispers.",
    "Mountains move when faith steps forward.",
    "I calm storms; trust and watch.",
    "I opened seas before—what you face is small.",
    "Angels guard your path today.",
    "Your prayers are heard; answers are on the way."
  ],
  ro: [
    "Nu te teme, Eu sunt cu tine.",
    "Inima ta cunoaște drumul — urmează lumina.",
    "Harul e aproape; inspiră și ridică-te.",
    "Puterea vine în tăcere; ascultă.",
    "Iubirea nu cade; mergi mai departe.",
    "Speranța e mai tare decât furtuna.",
    "Pacea să fie cu tine; rămâi statornic.",
    "Îți ghidez pașii; rămâi smerit.",
    "Îndurarea te întâmpină acolo unde ești.",
    "Odihnește-te; lupta este a Mea, nu a ta.",
    "Ești văzut, auzit și iubit.",
    "Continuă să semeni binele; seceri la vreme.",
    "Alege bunătatea azi; are ecou lung.",
    "Răbdarea deschide uși pe care forța nu le poate mișca.",
    "Lasă grijile; viitorul e în mâinile Mele.",
    "Lumina strălucește mai tare după întuneric.",
    "Adevărul te face liber; stai aproape de el.",
    "Liniștește-ți mintea; Eu vorbesc în șoapte.",
    "Munții se mișcă atunci când credința pășește înainte.",
    "Potolesc furtuni; ai încredere și privește.",
    "Am deschis mările cândva — ce întâmpini acum e mic.",
    "Îngerii îți păzesc drumul astăzi.",
    "Rugăciunile tale sunt auzite; răspunsurile vin."
  ],
  de: [
    "Fürchte dich nicht, ich bin bei dir.",
    "Dein Herz kennt den Weg — folge dem Licht.",
    "Gnade ist nah; atme und steh auf.",
    "Kraft kommt leise; höre hin.",
    "Liebe fällt nie; geh weiter.",
    "Hoffnung ist stärker als der Sturm.",
    "Friede sei mit dir; bleib standhaft.",
    "Ich führe deine Schritte; bleib demütig.",
    "Barmherzigkeit begegnet dir, wo du bist.",
    "Ruh dich aus; der Kampf ist mein, nicht deiner.",
    "Du wirst gesehen, gehört und geliebt.",
    "Säe weiter Gutes; die Ernte wird kommen.",
    "Wähle heute Güte; sie hallt nach.",
    "Geduld öffnet Türen, die Kraft nicht bewegen kann.",
    "Lass die Sorge los; ich halte das Morgen.",
    "Licht scheint am hellsten nach der Dunkelheit.",
    "Die Wahrheit macht dich frei; bleib nahe bei ihr.",
    "Beruhige deinen Geist; ich spreche im Flüstern.",
    "Berge weichen, wenn der Glaube vorangeht.",
    "Ich stille Stürme; vertraue und sieh zu.",
    "Ich habe einst Meere geteilt — was du jetzt siehst, ist klein.",
    "Engel bewachen heute deinen Weg.",
    "Deine Gebete sind gehört; Antworten sind unterwegs."
  ],
  no: [
    "Frykt ikke, jeg er med deg.",
    "Hjertet ditt kjenner veien — følg lyset.",
    "Nåde er nær; pust og reis deg.",
    "Styrke kommer stille; lytt.",
    "Kjærligheten faller ikke; fortsett.",
    "Håpet er sterkere enn stormen.",
    "Fred være med deg; hold stand.",
    "Jeg leder dine steg; vær ydmyk.",
    "Barmhjertighet møter deg der du er.",
    "Hvil; kampen er min, ikke din.",
    "Du er sett, hørt og elsket.",
    "Fortsett å så godt; høsten kommer.",
    "Velg godhet i dag; den klinger lenge.",
    "Tålmodighet åpner dører kraft ikke rører.",
    "La bekymringene gå; jeg holder morgendagen.",
    "Lyset skinner sterkest etter mørket.",
    "Sannheten gjør deg fri; hold deg nær den.",
    "Still sinnet ditt; jeg taler i hvisk.",
    "Fjell flytter seg når troen går først.",
    "Jeg stilner stormer; stol på meg og se.",
    "Jeg åpnet hav en gang — det du møter nå er lite.",
    "Engler vokter stien din i dag.",
    "Bønnene dine er hørt; svarene er på vei."
  ]
};

const devilMessages: Record<Lang, string[]> = {
  en: [
    "Skip the halo today, you’ve earned some chaos.",
    "Your comfort zone is boring. Do something risky (but legal).",
    "Rules are suggestions—bend one.",
    "Procrastinate later; stir trouble now (harmless kind).",
    "Feed your ego a bit; then laugh at it.",
    "Chaos with charm beats dull perfection.",
    "Take the shortcut and brag about it (no victims).",
    "Leave one task unfinished—keep them guessing.",
    "Turn a whisper into a headline, just for fun.",
    "No need to be nice all day; pick one moment to be spicy.",
    "Swap your routine with a plot twist.",
    "Charm can open doors; sarcasm kicks them.",
    "Give in to dessert. Twice.",
    "Play the villain in a tiny story today.",
    "Rules? More like polite requests.",
    "Start a harmless rumor about how amazing you are."
  ],
  ro: [
    "Lasă aureola azi, ai câștigat puțin haos.",
    "Zona ta de confort e plictisitoare. Fă ceva riscant (dar legal).",
    "Regulile sunt sugestii — îndoaie una.",
    "Amână amânarea; agită spiritele (fără să rănești).",
    "Hrănește-ți ego-ul puțin; apoi fă mișto de el.",
    "Haos cu șarm bate perfecțiunea plictisitoare.",
    "Ia scurtătura și laudă-te (fără victime).",
    "Lasă o treabă neterminată — să îi ții în suspans.",
    "Transformă un șoaptă într-un titlu, doar de distracție.",
    "Nu trebuie să fii drăguț toată ziua; alege un moment să fii picant.",
    "Înlocuiește rutina cu un plot twist.",
    "Farmecul deschide uși; sarcasmul le dă un șut.",
    "Cedează desertului. De două ori.",
    "Joacă rolul de villain într-o poveste minusculă azi.",
    "Reguli? Mai mult niște rugăminți politicoase.",
    "Pornește un zvon nevinovat despre cât ești de grozav."
  ],
  de: [
    "Lass heute den Heiligenschein, du hast dir Chaos verdient.",
    "Deine Komfortzone ist langweilig. Tu etwas Riskantes (aber Legales).",
    "Regeln sind Vorschläge — beuge eine.",
    "Verschiebe das Aufschieben; wirble jetzt harmlosen Ärger auf.",
    "Füttere dein Ego ein wenig; dann mach dich darüber lustig.",
    "Chaos mit Charme schlägt fade Perfektion.",
    "Nimm die Abkürzung und prahle damit (keine Opfer).",
    "Lass eine Aufgabe offen — halt sie gespannt.",
    "Mach aus einem Flüstern eine Schlagzeile, nur zum Spaß.",
    "Du musst nicht den ganzen Tag nett sein; wähle einen würzigen Moment.",
    "Tausche deine Routine gegen einen Plot Twist.",
    "Charme öffnet Türen; Sarkasmus kickt sie.",
    "Gib dem Dessert nach. Zweimal.",
    "Spiel heute den Schurken in einer Mini-Geschichte.",
    "Regeln? Eher höfliche Bitten.",
    "Starte ein harmloses Gerücht darüber, wie großartig du bist."
  ],
  no: [
    "Dropp glorien i dag, du har fortjent litt kaos.",
    "Komfortsonen din er kjedelig. Gjør noe risikabelt (men lovlig).",
    "Regler er forslag — bøy en.",
    "Utsett utsettelsen; rør litt uskyldig uro nå.",
    "Gi egoet ditt litt mat; og gjør narr av det etterpå.",
    "Kaos med sjarm slår kjedelig perfeksjon.",
    "Ta snarveien og skryt av det (uten ofre).",
    "La en oppgave stå igjen — hold dem i spenning.",
    "Gjør en hvisking til en overskrift, bare for moro.",
    "Du trenger ikke være snill hele dagen; velg et krydret øyeblikk.",
    "Bytt rutinen med en plott-twist.",
    "Sjarme åpner dører; sarkasme sparker dem inn.",
    "Gi etter for dessert. To ganger.",
    "Spill skurken i en bitteliten historie i dag.",
    "Regler? Mer som høflige forespørsler.",
    "Start et uskyldig rykte om hvor fantastisk du er."
  ]
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffledUnique(arr: string[], count: number): string[] {
  const pool = [...arr];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  if (count <= pool.length) {
    return pool.slice(0, count);
  }
  const needed = count - pool.length;
  const extras: string[] = [];
  while (extras.length < needed) {
    const candidate = pickRandom(arr);
    if (!extras.includes(candidate)) {
      extras.push(candidate);
    }
  }
  return [...pool, ...extras];
}

export function getMessageBatch(
  category: "god" | "devil",
  language: Lang,
  count: number
): { title: string; body: string }[] {
  const lang = godMessages[language] ? language : "en";
  const pool = category === "god" ? godMessages[lang] : devilMessages[lang];
  const titleMap: Record<Lang, { god: string; devil: string }> = {
    en: { god: "Message from God", devil: "Message from Devil" },
    ro: { god: "Mesaj de la Dumnezeu", devil: "Mesaj de la Diavol" },
    de: { god: "Nachricht von Gott", devil: "Nachricht vom Teufel" },
    no: { god: "Melding fra Gud", devil: "Melding fra Djevelen" }
  };
  const title = titleMap[lang][category];
  return shuffledUnique(pool, count).map((body) => ({ title, body }));
}
