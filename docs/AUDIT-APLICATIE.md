# Audit inițial Heaven or Hell — 11 noiembrie 2026

Acest document păstrează analiza inițială. Pentru implementările ulterioare, imaginile noi și rezultatele verificărilor, vezi [notele versiunii 1.1](RELEASE.md).

Analiză a codului local și a celor două capturi furnizate. Nu este o verificare a configurației efective din App Store Connect/RevenueCat și nici un test pe iPhone al noului cod.

## Ce funcționează bine

- Tema Heaven/Hell este memorabilă. Portalul, contrastul auriu/violet și cele două personaje pot deveni identitatea produsului.
- Alegerea dintre două perspective oferă un motiv clar pentru a încerca aplicația.
- Există deja traduceri în patru limbi, restaurarea cumpărăturilor și linkuri juridice.
- Integrarea principală folosește RevenueCat și verifică entitlement-ul, nu doar confirmarea apăsării unui buton.
- Cheia OpenAI este folosită în backend, nu în aplicația mobilă.

## De ce Premium nu pornește

Capturile arată două etape: încărcarea prețului eșuează, apoi aplicația permite totuși pornirea achiziției și afișează un mesaj generic. Nu există suficiente dovezi pentru a atribui totul unei singure cauze din magazin.

Probleme confirmate în codul inițial:

1. `app.json` declară `com.gabriellivadariu.goddevilchat`, dar proiectul Xcode declară `com.gabriellivadariu.goddevil` în Debug și Release. Acest lucru poate lega buildurile de aplicații diferite. Identificatorul corect trebuie comparat cu aplicația existentă din App Store Connect și aplicația iOS din RevenueCat; nu am schimbat identitatea aplicației fără această dovadă.
2. SDK-ul ignora `EXPO_PUBLIC_REVENUECAT_API_KEY` și folosea o cheie scrisă direct în sursă. Nu este demonstrat că acea cheie era greșită, dar configurația din `.env` nu controla integrarea.
3. Se accepta exclusiv produsul `com.gabriellivadariu.goddevilchat.premium.monthly.v2`. Un pachet lunar configurat cu alt produs era respins chiar dacă era disponibil în magazin.
4. O ofertă explicit configurată putea fi ignorată dacă RevenueCat returna și o ofertă curentă.
5. `subscriptionPeriod` era citit ca obiect cu `unit`, deși SDK-ul instalat returnează o durată ISO 8601, de exemplu `P1M`.
6. Butonul de plată rămânea activ fără preț. Erorile utilizatorului erau în engleză, indiferent de limba selectată.
7. Statusul Premium era actualizat în selecția personajului numai când devenea adevărat; o expirare nu îl readucea la fals.

## Remedieri implementate local

- Cheie publică SDK din mediu; cheie separată opțională pentru Android. Inițializarea concurentă folosește o singură promisiune și permite reîncercarea după eșec.
- Se respectă oferta și pachetul configurate. Un ID de produs poate fi fixat explicit prin `EXPO_PUBLIC_REVENUECAT_PRODUCT_ID`; nu se alege arbitrar primul produs.
- Se cumpără exact pachetul al cărui preț a fost afișat. Un reload eșuat invalidează pachetul anterior.
- Prețul localizat și perioada sunt afișate înaintea butonului; achiziția este blocată dacă prețul lipsește. Există reîncercare și mesaje în toate cele patru limbi pentru indisponibilitate, conexiune, plată în așteptare și restaurare.
- Anularea de către utilizator nu afișează eroare. Plata fără entitlement nu activează artificial Premium.
- Statusul Premium se verifică la pornire, la revenirea în aplicație și prin listenerul SDK. O eroare de rețea nu este interpretată ca expirare.
- Ecranul Premium are scroll, safe area, închidere, contrast mai bun, beneficii care se încadrează pe mai multe rânduri și limbi/linkuri care se rearanjează.
- Wrapperul vechi `subscriptionService.ts` nu mai returnează succes fictiv.
- Textul limitei gratuite nu mai promite acces exclusiv la Dumnezeu: codul permite deja personajul Dumnezeu gratuit și restricționează Diavolul.

## Ce trebuie verificat în conturile de magazin

1. Bundle ID-ul aplicației publicate trebuie să coincidă cu proiectul Xcode, configurația Expo și aplicația iOS asociată cheii publice RevenueCat.
2. În RevenueCat, oferta curentă sau oferta explicit configurată trebuie să conțină pachetul `monthly`/`$rc_monthly`. Produsul atașat trebuie să existe în aplicația corectă din App Store Connect.
3. Produsul trebuie asociat entitlement-ului `premium` (sau ID-ului explicit configurat).
4. În App Store Connect trebuie verificate disponibilitatea produsului, teritoriile, metadatele, prețul și acordurile comerciale/bancare/fiscale necesare. Lipsa produselor poate proveni din configurația magazinului, chiar dacă SDK-ul este corect.
5. Cheia publică iOS trebuie disponibilă și în mediul de build EAS/CI; existența ei în `.env` pe acest calculator nu demonstrează că există în buildul distribuit.
6. După aliniere: build nou în TestFlight, încărcare preț, anulare, achiziție sandbox, restaurare, relansare și expirare. Nu testa printr-o plată reală pentru validarea inițială.

Surse oficiale: [RevenueCat — Displaying Products](https://www-docs.revenuecat.com/docs/getting-started/displaying-products), [RevenueCat — iOS Product Setup](https://www-docs.revenuecat.com/docs/getting-started/entitlements/ios-products).

## Probleme importante rămase

- **Build local:** lipsesc `assets/god-bg.jpg`, `assets/devil-bg.jpg` și `assets/god-devil-split.jpg`, deși ecranele le importă. Sunt ștergeri deja prezente în workspace; nu le-am înlocuit cu imagini arbitrare. Metro nu poate genera un bundle complet fără rezolvarea lor.
- **Repository:** unele comenzi `git diff` eșuează cu `unable to read` pentru obiecte Git. Nu am resetat sau reparat distructiv repository-ul; modificările preexistente trebuie păstrate.
- **Conversație fără context:** fiecare cerere trimite doar ultimul mesaj; backendul nu transmite istoricul către model. La ieșirea din ecran se pierde și lista locală. Ar trebui istoric pe personaj, ștergere și o fereastră limitată de context în backend.
- **Cost și latență:** backendul face detectare cu modelul, generare și încă o traducere pentru fiecare mesaj, inclusiv când traducerea nu este necesară. Ar trebui măsurate latența/costul și eliminată traducerea redundantă.
- **Protecția backendului:** ruta chat nu verifică identitatea sau abonamentul și nu aplică o limită zilnică pe server. Limita din AsyncStorage poate fi ocolită, iar endpointul poate fi apelat direct. Sunt necesare autentificare, verificare Premium pe server, rate limiting și validarea tipului/lungimii mesajului.
- **Produs:** „Most Popular” apare pentru singurul plan, fără o comparație; „No ads” nu diferențiază Premium dacă nici varianta gratuită nu are reclame. Beneficiile trebuie să reflecte diferențe reale.
- **Notificări:** Premium poate programa până la 20 de notificări pe zi dacă sunt activate ambele personaje. Aș oferi 1–2 implicit, ore alese și interval de liniște. Textele locale programate se repetă; nu sunt conversații noi generate personalizat.
- **UX:** splashul impune cinci secunde, iar personajele sunt zone mari fără etichete/butoane explicite. Aș reduce timpul de pornire și aș adăuga nume, descriere și un început de conversație.
- **Ton și transparență:** simularea AI trebuie explicată și în interfață. Prompturile conțin tratament special pentru un nume propriu; aș elimina aceste reguli din experiența publică.

## Idei „wow” — propuneri, neimplementate

### 1. Consiliul celor două voci

Scrii o dilemă și primești două perspective în carduri alăturate: una calmă și una provocatoare, urmate de întrebarea „Tu ce alegi?”. Un exemplu: „Să îi mai scriu?” → două răspunsuri cu ton distinct și o acțiune practică. Acesta poate deveni motivul central pentru Premium.

### 2. Portal care răspunde la alegere

La atingerea personajului, lumina și particulele se deplasează spre partea aleasă, cu feedback tactil discret. Animație scurtă, posibilitate de reducere a mișcării și fără întârziere repetată înainte de fiecare chat. Fundalul rămâne atmosferă, iar textul stă pe suprafețe lizibile.

### 3. Ritualul de 60 de secunde

Utilizatorul alege „Am nevoie de curaj”, „Vreau claritate” sau „Am o tentație”. Primește o reflecție, perspectiva personajului și un pas mic pentru azi. O invitație utilă la revenire, cu notificări doar dacă le dorește.

### 4. Cartea ta de reflecție

Un răspuns favorit poate fi salvat într-un jurnal privat sau transformat într-un card vizual. Partajarea este explicită, cu previzualizare și alegerea textului, fără expunerea automată a conversației.

### 5. Premium cu valoare vizibilă

Înainte de ofertă: o demonstrație scurtă a celor două voci. În ofertă: beneficiile reale, prețul exact și perioada, un singur CTA și restaurare. Planul anual poate fi introdus numai după configurarea produsului real; economiile se calculează din prețurile magazinului.

Ordine propusă: repararea achizițiilor și a buildului → protecția backendului și memoria conversației → Consiliul celor două voci → animații și ritualuri.

## Validare

`node --test tests/revenuecat.test.cjs` verifică integrarea prin mockuri SDK: inițializare concurentă, preț/perioadă, oferta explicită, refuzul altui produs, invalidarea după reload eșuat, anulare/plată pending, entitlement absent și cheie lipsă. Aceste teste nu validează produsul din App Store sau plata pe dispozitiv.

Rezultat local: 8/8 teste trecute; sintaxa fișierelor TypeScript/TSX modificate și prezența traducerilor pentru erori au fost verificate. Verificarea TypeScript completă a fost oprită după câteva minute fără rezultat, în timpul citirii dependențelor. Nu există un build iOS complet sau o verificare vizuală a noului ecran pe dispozitiv; imaginile lipsă blochează bundlingul.
