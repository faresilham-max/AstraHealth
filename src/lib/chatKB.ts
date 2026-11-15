// Each entry: keywords (matched without accents or capitals) + answer
type Entry = { keywords: RegExp; answer: string };

// The first entry that matches wins, so the emergency entry comes first.
const KB: Entry[] = [
  {
    keywords: /inconscient|evanoui|evanouissement|evanouie|perd connaissance|perte de connaissance|ne repond plus/,
    answer:
      "Urgence : sécurisez la personne, vérifiez sa respiration, libérez les voies respiratoires, prenez le défibrillateur et le matériel médical, puis alertez le médecin et le contrôle de mission. Commencez la réanimation si nécessaire et suivez le protocole médical d’urgence.",
  },
  {
    keywords: /frequence cardiaque|rythme cardiaque|battements? du coeur|pouls|palpitation/,
    answer:
      "Aucun capteur de fréquence cardiaque n’est actuellement connecté à ce montage. L’écran OLED affiche l’assistant ASTRA et le DHT11 mesure la température et l’humidité ambiantes.",
  },
  {
    keywords: /temperature|fievre|chaud|froid|dht11|humidite|capteur/,
    answer:
      "Le capteur DHT11 mesure la température et l’humidité de l’air ambiant. Il ne mesure pas la température du corps.",
  },
  {
    keywords: /humidite|air sec|air humide/,
    answer:
      "Le capteur DHT11 mesure l’humidité ambiante. Cette mesure décrit l’air de la pièce et ne constitue pas un indicateur médical individuel.",
  },
  {
    keywords: /tension arterielle|pression arterielle/,
    answer:
      "Le tableau de démonstration ne mesure pas la tension artérielle avec les capteurs connectés. Utilisez un tensiomètre adapté et demandez conseil au personnel médical.",
  },
  {
    keywords: /saturation|oxygene|spo2|essouffle|respiration/,
    answer:
      "La saturation en oxygène n’est pas mesurée par les capteurs actuellement connectés. Utilisez un oxymètre adapté et contactez le personnel médical en cas de difficulté à respirer.",
  },
  {
    keywords: /bonjour|salut|bonsoir|coucou/,
    answer: "Bonjour ! Vous pouvez me poser une question sur les mesures, les capteurs ou les gestes d’urgence.",
  },
  {
    keywords: /urgence|aide|secours|danger/,
    answer:
      "En cas d’urgence, appelez les services de secours locaux et suivez les consignes des professionnels. Les mesures de ce tableau ne sont pas un dispositif médical.",
  },
  {
    keywords: /unconscious|faint|pass(es|ed)? out|collaps|unresponsive|black(s|ed)? out|(lose|loses|lost) consciousness/,
    answer:
      "Emergency: secure the person, check breathing and pulse, clear the airway, fetch the defibrillator (AED) and the medical kit, then alert the flight doctor and mission control. Start CPR if there is no pulse. Open the Emergency page for the video.",
  },
  {
    keywords: /co2|carbon dioxide|ventilation|\bair\b|stuffy/,
    answer:
      "Le CO2 n’est pas mesuré par les capteurs actuellement connectés. Seules la température et l’humidité ambiantes du DHT11 sont affichées.",
  },
  {
    keywords: /bpm|heart|pulse|palpitation/,
    answer:
      "Resting heart rate is between 50 and 90 BPM here. A lasting increase, especially with little sleep or stress, should be reported. Take a calm break and measure again.",
  },
  {
    keywords: /blood pressure|\bpressure\b|systolic|diastolic|hypertension/,
    answer:
      "Measure your blood pressure seated and at rest. Above 130/85 mmHg, stay calm for 10 minutes, measure again, and report it if the value stays high.",
  },
  {
    keywords: /spo2|oxygen|saturation|breath/,
    answer:
      "An SpO₂ below 95% calls for a new measurement after rest and a check of the module's air. Below 92%, contact the flight doctor.",
  },
  {
    keywords: /temperature|fever|\bhot\b|\bcold\b|chill/,
    answer:
      "A temperature above 37.5 °C is flagged. Drink water, rest and measure again in 30 minutes.",
  },
  {
    keywords: /glucose|blood sugar|sugar|hungry|hunger|\beat\b|\bmeal\b|food/,
    answer:
      "A blood glucose below 3.9 mmol/L, or more than 5 hours without eating, calls for a snack. If the value stays low after eating, alert the flight doctor.",
  },
  {
    keywords: /drink|water|thirst|dehydrat|hydrat/,
    answer:
      "Drink about 250 ml of water every 3 hours, especially with a fever, a high heart rate or rising CO₂.",
  },
  {
    keywords: /sleep|tired|fatigue|insomnia|exhaust/,
    answer:
      "Aim for 7 to 8 hours of regular sleep. Less than 6 hours, or strong fatigue, triggers a rest recommendation.",
  },
  {
    keywords: /stress|mental|lonely|\balone\b|mood|\bsad\b|anxi|depress|homesick/,
    answer:
      "Fill in the daily questionnaire on your page. Talking to a crewmate or the psychological support team helps a lot with isolation and stress.",
  },
  {
    keywords: /radiation|\bdose\b|radiat/,
    answer:
      "Radiation exposure is tracked when dosimetry data is available. Check the mission context for solar events.",
  },
  {
    keywords: /\bhello\b|\bhi\b|\bhey\b|good morning/,
    answer: "Hello! Ask me a question about your health readings or what to do in a given situation.",
  },
];

export const WELCOME =
  "Bonjour, je suis l’assistant ASTRA. Choisissez une question pour écouter ma réponse.";

export const SUGGESTIONS = [
  "Que faire si une personne s’évanouit ?",
  "Que faire si le CO2 est trop élevé ?",
  "Que mesure le capteur DHT11 ?",
  "Comment demander de l’aide en cas d’urgence ?",
];

const FALLBACK =
  "Je n’ai pas de réponse adaptée à cette question. En cas d’urgence, contactez immédiatement les services de secours.";

// Removes accents and lowercases, to compare more easily
function normalize(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

export function answer(question: string): string {
  const q = normalize(question);
  const hit = KB.find((e) => e.keywords.test(q));
  return hit ? hit.answer : FALLBACK;
}
