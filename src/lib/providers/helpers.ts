import { Message } from './providerTypes';

// Detect language of the input text (supporting French, English, and major African languages)
export function detectLanguage(text: string): 'fr' | 'en' | 'wolof' | 'swahili' | 'lingala' | 'yoruba' | 'zulu' | 'amharic' | 'bambara' | 'arabic' | 'pulaar' | 'hausa' {
  const lower = text.toLowerCase();
  
  if (lower.includes('na nga def') || lower.includes('nanga def') || lower.includes('jërëjëf') || lower.includes('jerejef')) {
    return 'wolof';
  }
  if (lower.includes('habari') || lower.includes('mambo') || lower.includes('asante') || lower.includes('habari gani')) {
    return 'swahili';
  }
  if (lower.includes('mbote') || lower.includes('sango nini') || lower.includes('botondi') || lower.includes('malamu')) {
    return 'lingala';
  }
  if (lower.includes('bawo ni') || lower.includes('e dupe') || lower.includes('o dabọ') || lower.includes('odabo') || lower.includes('kabo')) {
    return 'yoruba';
  }
  if (lower.includes('sawubona') || lower.includes('ngiyabonga') || lower.includes('unjani')) {
    return 'zulu';
  }
  if (lower.includes('selam') || lower.includes('amesegenalehu') || lower.includes('tenayistilign')) {
    return 'amharic';
  }
  if (lower.includes('i ni ce') || lower.includes('inice') || lower.includes('hèrè') || lower.includes('here')) {
    return 'bambara';
  }
  if (lower.includes('no mbaddi') || lower.includes('mbooto') || lower.includes('jaaraama') || lower.includes('pulaar')) {
    return 'pulaar';
  }
  if (lower.includes('sannu') || lower.includes('ina kwana') || lower.includes('na gode') || lower.includes('hausa')) {
    return 'hausa';
  }
  if (lower.includes('marhaban') || lower.includes('shukran') || lower.includes('salam alaykum') || lower.includes('assalamu')) {
    return 'arabic';
  }
  
  const frWords = ['bonjour', 'salut', 'comment', 'pourquoi', 'aide', 'creer', 'faire', 'projet', 'recherche', 'document'];
  if (frWords.some(w => lower.includes(w)) || /[éèàùçïë]/i.test(text)) {
    return 'fr';
  }
  
  return 'en';
}

// Generate premium simulated responses reflecting model personalities and African linguistic context
export function getSimulatedResponse(
  provider: string,
  modelId: string,
  messages: Message[],
  webSearchEnabled: boolean
): string {
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const lang = detectLanguage(lastUserMessage);
  
  const searchPrefix = webSearchEnabled 
    ? (lang === 'fr' 
        ? `*Sources consultées : Données régionales et actualités francophones.*\n\n`
        : `*Consulted sources: Regional databases and local news.*\n\n`)
    : '';

  // Wolof
  if (lang === 'wolof') {
    return `${searchPrefix}Salam. Nanga def? PETAW AI la, di liggey ak model bu mag bi.

Mënn naa la jafal ci sa liggey walla sa prosee. Wax ma lan nga bëgg ci wolof walla ci français, ma jox la tontu bu leer.

Jërëjëf.`;
  }

  // Swahili
  if (lang === 'swahili') {
    return `${searchPrefix}Jambo. Habari yako? Mimi ni PETAW AI.

Ninaweza kukusaidia kuandika misimbo, kupanga miradi, au kujibu maswali yako kwa Kiswahili au Kifaransa. 

Je, unataka tufanye nini leo? Karibu sana.`;
  }

  // Lingala
  if (lang === 'lingala') {
    return `${searchPrefix}Mbote. Sango nini? Ngai naza PETAW AI.

Nazali awa pona kosunga yo na kokoma mikanda, kosala coding, to kopesa biyano na Lingala to Kifaransa.

Olingi tosala nini lelo? Botondi.`;
  }

  // Yoruba
  if (lang === 'yoruba') {
    return `${searchPrefix}Báwo ni. Ẹ lẹ kabọ. Emi ni PETAW AI.

Mo le ran ọ lọwọ pẹlu sisọ ede, ṣiṣe eto, tabi didahun awọn ibeere rẹ ni ede Yoruba tabi Faransé.

Kini o fẹ ki a ṣe loni? Ẹ dupe.`;
  }

  // Zulu
  if (lang === 'zulu') {
    return `${searchPrefix}Sawubona. Unjani? Ngingu-PETAW AI.

Ngingakusiza ukubhala ikhodi, ukuhlela amaphrojekthi, noma ukuphendula imibuzo yakho ngesiZulu noma ngesiFulentshi.

Ngiyabonga.`;
  }

  // Amharic
  if (lang === 'amharic') {
    return `${searchPrefix}ሰላም. እንደምን ነህ/ነሽ? እኔ PETAW AI ነኝ።

በአማርኛ ወይም በፈረንሳይኛ ኮድ ለመጻፍ፣ ፕሮጀክቶችን ለማቀድ ወይም ጥяቄዎችን ለመመለስ እረዳሃለሁ/እረዳሻለሁ።

አመሰግናለሁ.`;
  }

  // Bambara
  if (lang === 'bambara') {
    return `${searchPrefix}I ni ce. Hèrè bɛ? Ne ye PETAW AI ye.

N bɛ se k'i dɛmɛ ka sɛbɛnni kɛ, ka projɛw labɛn, walla ka nyinikaliw jaabi ni Bamanankan walla ni Tubabukan ye.

I ni ce.`;
  }

  // Pulaar
  if (lang === 'pulaar') {
    return `${searchPrefix}Mbooto. No mbaddi? Ko miin woni PETAW AI.

Mido waawi wallude ma e binndol, kodal, walla jaabaade lande maa e Pulaar walla Farayse.

Jaaraama.`;
  }

  // Hausa
  if (lang === 'hausa') {
    return `${searchPrefix}Sannu. Barka da rana. Ni ce PETAW AI.

Zan iya taimaka maka da rubutu, tsara ayyuka, ko amsa tambayoyinka cikin Hausa ko Faransanci.

Na gode.`;
  }

  // Arabic
  if (lang === 'arabic') {
    return `${searchPrefix}مرحباً بك. أنا PETAW AI.

يمكنني مساعدتك في كتابة الأكواد، تخطيط المشاريع، أو الإجابة على استفساراتك باللغة العربية أو الفرنسية.

شكراً لك.`;
  }

  // French
  if (lang === 'fr') {
    if (lastUserMessage.toLowerCase().includes('projet') || lastUserMessage.toLowerCase().includes('créer')) {
      return `${searchPrefix}Nous pouvons structurer votre projet ensemble.

Voici les étapes clés adaptées à une exécution simple et optimisée :
1. **Cadrage** : Identifier l'intention première et la cible locale.
2. **Architecture** : Concevoir une structure légère (Vite/TypeScript) adaptée aux débits mobiles.
3. **Mise en œuvre** : Planifier un déploiement progressif.

Par quoi souhaitez-vous commencer ?`;
    }

    if (lastUserMessage.toLowerCase().includes('document') || lastUserMessage.toLowerCase().includes('analys')) {
      return `${searchPrefix}Le document peut être analysé pour en extraire l'essence.

Veuillez le déposer dans l'onglet **Documents** à gauche. J'étudierai sa structure afin d'y apporter des réponses ciblées.`;
    }

    if (webSearchEnabled) {
      return `${searchPrefix}Les informations récentes concernant votre demande ont été synthétisées.

Je me tiens à votre disposition pour détailler un point particulier ou adapter cette synthèse à votre projet.`;
    }

    return `${searchPrefix}Je suis PETAW, votre assistant personnel.

Je comprends le français, l'anglais, ainsi que plusieurs langues africaines (dont le Wolof, le Pulaar, le Swahili, le Lingala, le Bambara, le Yoruba, le Hausa, l'Amharique et l'Arabe).

Que voulez-vous faire aujourd'hui ?`;
  }

  // English
  if (lastUserMessage.toLowerCase().includes('project') || lastUserMessage.toLowerCase().includes('create')) {
    return `${searchPrefix}We can design your project together.

Here is a focused outline for efficient building:
1. **Scope**: Define the core value and primary local target.
2. **Stack**: Keep it lightweight (React/TypeScript) for low bandwidth.
3. **Execution**: Implement step-by-step milestones.

What is the first file or specification we should write?`;
  }

  if (webSearchEnabled) {
    return `${searchPrefix}I have retrieved recent data to address your query.

Let me know if you would like me to expand on these points or apply them to your local project.`;
  }

  return `${searchPrefix}I am PETAW, your personal assistant.

I understand English, French, and several African languages (such as Wolof, Pulaar, Swahili, Lingala, Bambara, Yoruba, Hausa, Amharic, and Arabic).

How can I help you today?`;
}

// Simulate streaming response
export function simulateStream(
  text: string,
  onProgress: (chunk: string) => void
): Promise<string> {
  return new Promise((resolve) => {
    let currentText = '';
    const words = text.split(' ');
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < words.length) {
        currentText += (index === 0 ? '' : ' ') + words[index];
        onProgress(currentText);
        index++;
      } else {
        clearInterval(interval);
        resolve(text);
      }
    }, 40);
  });
}
