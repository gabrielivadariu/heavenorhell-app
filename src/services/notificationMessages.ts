type Lang = "en" | "ro";

const godMessages: Record<Lang, string[]> = {
  en: [
    "Do not fear, I am with you.",
    "Your heart knows the way—follow the light.",
    "Grace is near; breathe and rise.",
    "Strength comes quietly; listen.",
    "Love never fails; keep walking.",
    "Hope is stronger than the storm.",
    "Peace be with you; stay steadfast.",
    "I guide your steps; stay humble."
  ],
  ro: [
    "Nu te teme, Eu sunt cu tine.",
    "Inima ta cunoaște drumul — urmează lumina.",
    "Harul e aproape; inspiră și ridică-te.",
    "Puterea vine în tăcere; ascultă.",
    "Iubirea nu cade; mergi mai departe.",
    "Speranța e mai tare decât furtuna.",
    "Pacea să fie cu tine; rămâi statornic.",
    "Îți ghidez pașii; rămâi smerit."
  ]
};

const devilMessages: Record<Lang, string[]> = {
  en: [
    "Skip the halo today, you’ve earned some chaos.",
    "Your comfort zone is boring. Do something risky (but legal).",
    "Rules are suggestions—bend one.",
    "Procrastinate later; stir trouble now (harmless kind).",
    "Feed your ego a bit; then laugh at it.",
    "Chaos with charm beats dull perfection."
  ],
  ro: [
    "Lasă aureola azi, ai câștigat puțin haos.",
    "Zona ta de confort e plictisitoare. Fă ceva riscant (dar legal).",
    "Regulile sunt sugestii — îndoaie una.",
    "Amână amânarea; agită spiritele (fără să rănești).",
    "Hrănește-ți ego-ul puțin; apoi fă mișto de el.",
    "Haos cu șarm bate perfecțiunea plictisitoare."
  ]
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomGodMessage(language: Lang): { title: string; body: string } {
  const lang: Lang = language === "ro" ? "ro" : "en";
  return {
    title: lang === "ro" ? "Mesaj de la Dumnezeu" : "Message from God",
    body: pickRandom(godMessages[lang])
  };
}

export function getRandomDevilMessage(language: Lang): { title: string; body: string } {
  const lang: Lang = language === "ro" ? "ro" : "en";
  return {
    title: lang === "ro" ? "Mesaj de la Diavol" : "Message from Devil",
    body: pickRandom(devilMessages[lang])
  };
}
