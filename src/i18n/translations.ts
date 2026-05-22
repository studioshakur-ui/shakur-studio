export type Language = 'fr' | 'it' | 'en';

export type TranslationKey =
  /* navigation + global */
  | 'nav.agents'
  | 'nav.method'
  | 'nav.contact'
  | 'cta.startProject'
  | 'cta.whatsapp'
  | 'cta.email'
  | 'a11y.brand'
  | 'a11y.nav'
  | 'a11y.language'
  /* cinematic hero */
  | 'hero.eyebrow'
  | 'hero.titleA'
  | 'hero.titleB'
  | 'hero.tagline'
  | 'hero.copy'
  | 'hero.testAgent'
  | 'hero.startProject'
  | 'hero.builtBy'
  | 'hero.chain.idea'
  | 'hero.chain.agent'
  | 'hero.chain.system'
  | 'hero.chain.result'
  /* agent console */
  | 'agents.kicker'
  | 'agents.title'
  | 'agents.copy'
  | 'agents.console.tabsLabel'
  | 'agents.console.eyebrow'
  | 'agents.advanced.show'
  | 'agents.advanced.hide'
  | 'agents.tryExample'
  | 'agents.loading'
  | 'agents.result'
  | 'agents.resultDemo'
  | 'agents.reset'
  | 'agents.runAgain'
  | 'agents.turnIntoSystem'
  | 'agents.demoNotice'
  | 'agents.errorRateLimit'
  | 'agents.errorTimeout'
  | 'agents.errorInvalid'
  | 'agents.errorNetwork'
  | 'agents.errorNotConfigured'
  | 'agents.errorGeneric'
  /* offer agent */
  | 'agents.offer.title'
  | 'agents.offer.copy'
  | 'agents.offer.cta'
  | 'agents.offer.primaryLabel'
  | 'agents.offer.primaryPlaceholder'
  | 'agents.offer.primaryExample'
  | 'agents.offer.audienceLabel'
  | 'agents.offer.audiencePlaceholder'
  | 'agents.offer.audienceExample'
  | 'agents.offer.goalLabel'
  | 'agents.offer.goalPlaceholder'
  | 'agents.offer.goalExample'
  | 'agents.offer.toneLabel'
  | 'agents.offer.tone.expert'
  | 'agents.offer.tone.direct'
  | 'agents.offer.tone.premium'
  | 'agents.offer.tone.friendly'
  | 'agents.offer.angleLabel'
  | 'agents.offer.structureLabel'
  | 'agents.offer.ctaLabel'
  /* audit agent */
  | 'agents.audit.title'
  | 'agents.audit.copy'
  | 'agents.audit.cta'
  | 'agents.audit.primaryLabel'
  | 'agents.audit.primaryPlaceholder'
  | 'agents.audit.primaryExample'
  | 'agents.audit.audienceLabel'
  | 'agents.audit.audiencePlaceholder'
  | 'agents.audit.audienceExample'
  | 'agents.audit.objectiveLabel'
  | 'agents.audit.objectivePlaceholder'
  | 'agents.audit.objectiveExample'
  | 'agents.audit.clarityLabel'
  | 'agents.audit.trustLabel'
  | 'agents.audit.riskLabel'
  | 'agents.audit.riskLow'
  | 'agents.audit.riskMedium'
  | 'agents.audit.riskHigh'
  | 'agents.audit.frictionLabel'
  | 'agents.audit.fixesLabel'
  /* automation agent */
  | 'agents.automation.title'
  | 'agents.automation.copy'
  | 'agents.automation.cta'
  | 'agents.auto.primaryLabel'
  | 'agents.auto.primaryPlaceholder'
  | 'agents.auto.primaryExample'
  | 'agents.auto.toolsLabel'
  | 'agents.auto.toolsPlaceholder'
  | 'agents.auto.toolsExample'
  | 'agents.auto.resultLabel'
  | 'agents.auto.resultPlaceholder'
  | 'agents.auto.resultExample'
  | 'agents.auto.inputLabel'
  | 'agents.auto.logicLabel'
  | 'agents.auto.outputLabel'
  | 'agents.auto.stepsLabel'
  | 'agents.auto.integrationsLabel'
  | 'agents.auto.roadmapLabel'
  /* capabilities + final contact */
  | 'caps.eyebrow'
  | 'caps.title'
  | 'caps.web.title'
  | 'caps.web.copy'
  | 'caps.ai.title'
  | 'caps.ai.copy'
  | 'caps.auto.title'
  | 'caps.auto.copy'
  | 'contact.kicker'
  | 'contact.title'
  | 'contact.copy'
  | 'contact.action.whatsapp'
  | 'contact.action.email'
  | 'contact.action.scroll'
  | 'contact.prefill.subjectPrefix'
  | 'contact.prefill.body.offer'
  | 'contact.prefill.body.audit'
  | 'contact.prefill.body.automation'
  | 'contact.prefill.footer'
  /* footer */
  | 'footer.signature'
  | 'footer.tagline';

type Dictionary = Record<TranslationKey, string>;

export const translations: Record<Language, Dictionary> = {
  fr: {
    'nav.agents': 'Agents',
    'nav.method': 'Méthode',
    'nav.contact': 'Contact',
    'cta.startProject': 'Démarrer un projet',
    'cta.whatsapp': 'WhatsApp',
    'cta.email': 'Email',
    'a11y.brand': 'SHAKUR Studio — accueil',
    'a11y.nav': 'Navigation principale',
    'a11y.language': 'Sélecteur de langue',

    'hero.eyebrow': 'AI · Web · Automation',
    'hero.titleA': 'Systèmes digitaux intelligents.',
    'hero.titleB': 'Construits avec précision.',
    'hero.tagline': 'Simple en façade. Puissant en profondeur.',
    'hero.copy': 'Sites premium, agents IA et workflows d’automatisation pour les entreprises qui veulent clarté, conversion et exécution.',
    'hero.testAgent': 'Tester un agent',
    'hero.startProject': 'Démarrer un projet',
    'hero.builtBy': 'Construit par SHAKUR',
    'hero.chain.idea': 'Idée',
    'hero.chain.agent': 'Agent',
    'hero.chain.system': 'Système',
    'hero.chain.result': 'Résultat',

    'agents.kicker': 'Console',
    'agents.title': 'Trois agents. Une console.',
    'agents.copy': 'Décris en une phrase. L’agent te renvoie un plan structuré, prêt à exécuter.',
    'agents.console.tabsLabel': 'Choisir l’agent',
    'agents.console.eyebrow': 'Agent Console',
    'agents.advanced.show': 'Champs avancés',
    'agents.advanced.hide': 'Masquer les champs avancés',
    'agents.tryExample': 'Exemple',
    'agents.loading': 'L’agent réfléchit…',
    'agents.result': 'Résultat',
    'agents.resultDemo': 'Résultat (démo)',
    'agents.reset': 'Réinitialiser',
    'agents.runAgain': 'Relancer',
    'agents.turnIntoSystem': 'En faire un système SHAKUR',
    'agents.demoNotice': 'Mode démo — la sortie est prédéfinie, pas générée.',
    'agents.errorRateLimit': 'Trop de requêtes. Réessaie dans un instant.',
    'agents.errorTimeout': 'L’agent a mis trop de temps à répondre.',
    'agents.errorInvalid': 'Entrée invalide. Vérifie les champs.',
    'agents.errorNetwork': 'Impossible de joindre l’API. Vérifie ta connexion.',
    'agents.errorNotConfigured': 'API non configurée. Renseigne VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.',
    'agents.errorGeneric': 'L’agent a rencontré une erreur. Réessaie.',

    'agents.offer.title': 'Offer Agent',
    'agents.offer.copy': 'Transforme une activité en offre lisible, ciblée et vendable.',
    'agents.offer.cta': 'Générer l’offre',
    'agents.offer.primaryLabel': 'Décris ton activité, ton service ou ton idée',
    'agents.offer.primaryPlaceholder': 'Une phrase suffit. Ex : studio de design pour fintechs B2B.',
    'agents.offer.primaryExample': 'Studio de design qui aide les fintechs B2B à lancer leur premier produit SaaS.',
    'agents.offer.audienceLabel': 'Client cible',
    'agents.offer.audiencePlaceholder': 'Ex : CTO de startup pré-seed',
    'agents.offer.audienceExample': 'CTO de fintechs Series A en Europe',
    'agents.offer.goalLabel': 'Objectif',
    'agents.offer.goalPlaceholder': 'Ex : 3 RDV qualifiés / semaine',
    'agents.offer.goalExample': 'Obtenir 3 RDV qualifiés par semaine',
    'agents.offer.toneLabel': 'Ton',
    'agents.offer.tone.expert': 'Expert',
    'agents.offer.tone.direct': 'Direct',
    'agents.offer.tone.premium': 'Premium',
    'agents.offer.tone.friendly': 'Amical',
    'agents.offer.angleLabel': 'Angle',
    'agents.offer.structureLabel': 'Structure landing',
    'agents.offer.ctaLabel': 'Call to action',

    'agents.audit.title': 'Audit Agent',
    'agents.audit.copy': 'Audit clarté · confiance · conversion d’une présence digitale.',
    'agents.audit.cta': 'Auditer la présence',
    'agents.audit.primaryLabel': 'Colle une URL ou décris ta présence digitale',
    'agents.audit.primaryPlaceholder': 'Une URL ou une phrase. Ex : agence vendant des data warehouses.',
    'agents.audit.primaryExample': 'https://exemple.com — landing d’une agence vendant des data warehouses',
    'agents.audit.audienceLabel': 'Client cible',
    'agents.audit.audiencePlaceholder': 'Ex : PME 10-50 personnes',
    'agents.audit.audienceExample': 'PME industrielles 10-50 personnes',
    'agents.audit.objectiveLabel': 'Objectif principal',
    'agents.audit.objectivePlaceholder': 'Ex : générer des leads B2B qualifiés',
    'agents.audit.objectiveExample': 'Générer des leads B2B qualifiés',
    'agents.audit.clarityLabel': 'Clarté',
    'agents.audit.trustLabel': 'Confiance',
    'agents.audit.riskLabel': 'Risque conversion',
    'agents.audit.riskLow': 'faible',
    'agents.audit.riskMedium': 'moyen',
    'agents.audit.riskHigh': 'élevé',
    'agents.audit.frictionLabel': 'Frictions',
    'agents.audit.fixesLabel': 'Corrections prioritaires',

    'agents.automation.title': 'Automation Agent',
    'agents.automation.copy': 'Cartographie d’un workflow manuel vers une chaîne automatisée.',
    'agents.automation.cta': 'Cartographier le workflow',
    'agents.auto.primaryLabel': 'Décris un workflow manuel que tu veux automatiser',
    'agents.auto.primaryPlaceholder': 'Une phrase suffit. Ex : je relance chaque semaine à la main.',
    'agents.auto.primaryExample': 'Je reçois des demandes par email, je réponds avec un devis manuel, je relance chaque semaine à la main.',
    'agents.auto.toolsLabel': 'Outils utilisés',
    'agents.auto.toolsPlaceholder': 'Ex : Gmail, Notion, WhatsApp',
    'agents.auto.toolsExample': 'Gmail, Notion, WhatsApp Business',
    'agents.auto.resultLabel': 'Résultat souhaité',
    'agents.auto.resultPlaceholder': 'Ex : qualifier et relancer automatiquement',
    'agents.auto.resultExample': 'Qualifier et relancer automatiquement les leads chauds',
    'agents.auto.inputLabel': 'Entrée',
    'agents.auto.logicLabel': 'Logique',
    'agents.auto.outputLabel': 'Sortie',
    'agents.auto.stepsLabel': 'Étapes d’automatisation',
    'agents.auto.integrationsLabel': 'Outils & intégrations',
    'agents.auto.roadmapLabel': 'Roadmap d’implémentation',

    'caps.eyebrow': 'Ce que SHAKUR construit',
    'caps.title': 'Trois capacités. Un seul système.',
    'caps.web.title': 'Web Systems',
    'caps.web.copy': 'Sites et interfaces qui transforment des visiteurs en demandes qualifiées.',
    'caps.ai.title': 'AI Interfaces',
    'caps.ai.copy': 'Interfaces IA qui guident, structurent les décisions et réduisent le travail manuel.',
    'caps.auto.title': 'Automation',
    'caps.auto.copy': 'Workflows automatisés qui suppriment les relances manuelles et la friction opérationnelle.',

    'contact.kicker': 'Construisons ton système',
    'contact.title': 'Tu n’as pas besoin d’un site. Tu as besoin d’un système.',
    'contact.copy': 'Décris ton contexte. SHAKUR Studio revient sous 24 h avec un plan ciblé, pas un devis générique.',
    'contact.action.whatsapp': 'Continuer sur WhatsApp',
    'contact.action.email': 'Envoyer par email',
    'contact.action.scroll': 'Voir le formulaire de contact',
    'contact.prefill.subjectPrefix': 'SHAKUR STUDIO',
    'contact.prefill.body.offer': 'Bonjour, je viens d’utiliser l’Offer Agent sur shakurstudio.com. J’aimerais transformer cette offre en système exécutable.',
    'contact.prefill.body.audit': 'Bonjour, je viens d’utiliser l’Audit Agent sur shakurstudio.com. J’aimerais discuter des corrections prioritaires et de leur mise en œuvre.',
    'contact.prefill.body.automation': 'Bonjour, je viens d’utiliser l’Automation Agent sur shakurstudio.com. J’aimerais cadrer la mise en place du workflow proposé.',
    'contact.prefill.footer': 'Envoyé depuis shakurstudio.com',

    'footer.signature': 'Construit par SHAKUR.',
    'footer.tagline': 'Pour les entreprises qui ont besoin de systèmes, pas de décoration.'
  },

  it: {
    'nav.agents': 'Agenti',
    'nav.method': 'Metodo',
    'nav.contact': 'Contatto',
    'cta.startProject': 'Avvia un progetto',
    'cta.whatsapp': 'WhatsApp',
    'cta.email': 'Email',
    'a11y.brand': 'SHAKUR Studio — home',
    'a11y.nav': 'Navigazione principale',
    'a11y.language': 'Selettore lingua',

    'hero.eyebrow': 'AI · Web · Automation',
    'hero.titleA': 'Sistemi digitali intelligenti.',
    'hero.titleB': 'Costruiti con precisione.',
    'hero.tagline': 'Semplice in superficie. Potente in profondità.',
    'hero.copy': 'Siti premium, agenti IA e workflow di automazione per aziende che vogliono chiarezza, conversione ed esecuzione.',
    'hero.testAgent': 'Provare un agente',
    'hero.startProject': 'Avvia un progetto',
    'hero.builtBy': 'Costruito da SHAKUR',
    'hero.chain.idea': 'Idea',
    'hero.chain.agent': 'Agente',
    'hero.chain.system': 'Sistema',
    'hero.chain.result': 'Risultato',

    'agents.kicker': 'Console',
    'agents.title': 'Tre agenti. Una console.',
    'agents.copy': 'Descrivi in una frase. L’agente restituisce un piano strutturato, pronto da eseguire.',
    'agents.console.tabsLabel': 'Scegli l’agente',
    'agents.console.eyebrow': 'Agent Console',
    'agents.advanced.show': 'Campi avanzati',
    'agents.advanced.hide': 'Nascondi i campi avanzati',
    'agents.tryExample': 'Esempio',
    'agents.loading': 'L’agente sta pensando…',
    'agents.result': 'Risultato',
    'agents.resultDemo': 'Risultato (demo)',
    'agents.reset': 'Reset',
    'agents.runAgain': 'Riprova',
    'agents.turnIntoSystem': 'Trasformare in sistema SHAKUR',
    'agents.demoNotice': 'Modalità demo — output predefinito, non generato.',
    'agents.errorRateLimit': 'Troppe richieste. Riprova tra un istante.',
    'agents.errorTimeout': 'L’agente ha impiegato troppo tempo a rispondere.',
    'agents.errorInvalid': 'Input non valido. Controlla i campi.',
    'agents.errorNetwork': 'Impossibile raggiungere l’API. Verifica la connessione.',
    'agents.errorNotConfigured': 'API non configurata. Imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
    'agents.errorGeneric': 'L’agente ha incontrato un errore. Riprova.',

    'agents.offer.title': 'Offer Agent',
    'agents.offer.copy': 'Trasforma un’attività in un’offerta leggibile, mirata e vendibile.',
    'agents.offer.cta': 'Generare l’offerta',
    'agents.offer.primaryLabel': 'Descrivi la tua attività, il tuo servizio o la tua idea',
    'agents.offer.primaryPlaceholder': 'Una frase basta. Es: studio di design per fintech B2B.',
    'agents.offer.primaryExample': 'Studio di design che aiuta le fintech B2B a lanciare il primo prodotto SaaS.',
    'agents.offer.audienceLabel': 'Cliente target',
    'agents.offer.audiencePlaceholder': 'Es: CTO di startup pre-seed',
    'agents.offer.audienceExample': 'CTO di fintech Series A in Europa',
    'agents.offer.goalLabel': 'Obiettivo',
    'agents.offer.goalPlaceholder': 'Es: 3 call qualificate / settimana',
    'agents.offer.goalExample': 'Ottenere 3 call qualificate a settimana',
    'agents.offer.toneLabel': 'Tono',
    'agents.offer.tone.expert': 'Esperto',
    'agents.offer.tone.direct': 'Diretto',
    'agents.offer.tone.premium': 'Premium',
    'agents.offer.tone.friendly': 'Amichevole',
    'agents.offer.angleLabel': 'Angolo',
    'agents.offer.structureLabel': 'Struttura landing',
    'agents.offer.ctaLabel': 'Call to action',

    'agents.audit.title': 'Audit Agent',
    'agents.audit.copy': 'Audit chiarezza · fiducia · conversione di una presenza digitale.',
    'agents.audit.cta': 'Auditare la presenza',
    'agents.audit.primaryLabel': 'Inserisci un URL o descrivi la tua presenza digitale',
    'agents.audit.primaryPlaceholder': 'Un URL o una frase. Es: agenzia che vende data warehouse.',
    'agents.audit.primaryExample': 'https://esempio.com — landing di un’agenzia che vende data warehouse',
    'agents.audit.audienceLabel': 'Cliente target',
    'agents.audit.audiencePlaceholder': 'Es: PMI 10-50 persone',
    'agents.audit.audienceExample': 'PMI industriali 10-50 persone',
    'agents.audit.objectiveLabel': 'Obiettivo principale',
    'agents.audit.objectivePlaceholder': 'Es: generare lead B2B qualificati',
    'agents.audit.objectiveExample': 'Generare lead B2B qualificati',
    'agents.audit.clarityLabel': 'Chiarezza',
    'agents.audit.trustLabel': 'Fiducia',
    'agents.audit.riskLabel': 'Rischio conversione',
    'agents.audit.riskLow': 'basso',
    'agents.audit.riskMedium': 'medio',
    'agents.audit.riskHigh': 'alto',
    'agents.audit.frictionLabel': 'Frizioni',
    'agents.audit.fixesLabel': 'Correzioni prioritarie',

    'agents.automation.title': 'Automation Agent',
    'agents.automation.copy': 'Mappatura di un workflow manuale in una catena automatizzata.',
    'agents.automation.cta': 'Mappare il workflow',
    'agents.auto.primaryLabel': 'Descrivi un workflow manuale che vuoi automatizzare',
    'agents.auto.primaryPlaceholder': 'Una frase basta. Es: faccio follow-up a mano ogni settimana.',
    'agents.auto.primaryExample': 'Ricevo richieste via email, rispondo con un preventivo manuale, faccio follow-up ogni settimana a mano.',
    'agents.auto.toolsLabel': 'Strumenti utilizzati',
    'agents.auto.toolsPlaceholder': 'Es: Gmail, Notion, WhatsApp',
    'agents.auto.toolsExample': 'Gmail, Notion, WhatsApp Business',
    'agents.auto.resultLabel': 'Risultato desiderato',
    'agents.auto.resultPlaceholder': 'Es: qualificare e seguire automaticamente',
    'agents.auto.resultExample': 'Qualificare e seguire automaticamente i lead caldi',
    'agents.auto.inputLabel': 'Input',
    'agents.auto.logicLabel': 'Logica',
    'agents.auto.outputLabel': 'Output',
    'agents.auto.stepsLabel': 'Passaggi di automazione',
    'agents.auto.integrationsLabel': 'Strumenti & integrazioni',
    'agents.auto.roadmapLabel': 'Roadmap di implementazione',

    'caps.eyebrow': 'Cosa costruisce SHAKUR',
    'caps.title': 'Tre capacità. Un solo sistema.',
    'caps.web.title': 'Web Systems',
    'caps.web.copy': 'Siti e interfacce che trasformano i visitatori in richieste qualificate.',
    'caps.ai.title': 'AI Interfaces',
    'caps.ai.copy': 'Interfacce IA che guidano, strutturano le decisioni e riducono il lavoro manuale.',
    'caps.auto.title': 'Automation',
    'caps.auto.copy': 'Workflow automatizzati che eliminano follow-up manuali e attriti operativi.',

    'contact.kicker': 'Costruiamo il tuo sistema',
    'contact.title': 'Non ti serve un sito. Ti serve un sistema.',
    'contact.copy': 'Descrivi il contesto. SHAKUR Studio torna entro 24 h con un piano mirato, non un preventivo generico.',
    'contact.action.whatsapp': 'Continua su WhatsApp',
    'contact.action.email': 'Invia via email',
    'contact.action.scroll': 'Vai al modulo di contatto',
    'contact.prefill.subjectPrefix': 'SHAKUR STUDIO',
    'contact.prefill.body.offer': 'Ciao, ho appena usato l’Offer Agent su shakurstudio.com. Vorrei trasformare questa offerta in un sistema operativo.',
    'contact.prefill.body.audit': 'Ciao, ho appena usato l’Audit Agent su shakurstudio.com. Vorrei discutere le correzioni prioritarie e la loro implementazione.',
    'contact.prefill.body.automation': 'Ciao, ho appena usato l’Automation Agent su shakurstudio.com. Vorrei inquadrare l’implementazione del workflow proposto.',
    'contact.prefill.footer': 'Inviato da shakurstudio.com',

    'footer.signature': 'Costruito da SHAKUR.',
    'footer.tagline': 'Per aziende che hanno bisogno di sistemi, non di decorazione.'
  },

  en: {
    'nav.agents': 'Agents',
    'nav.method': 'Method',
    'nav.contact': 'Contact',
    'cta.startProject': 'Start a project',
    'cta.whatsapp': 'WhatsApp',
    'cta.email': 'Email',
    'a11y.brand': 'SHAKUR Studio — home',
    'a11y.nav': 'Primary navigation',
    'a11y.language': 'Language selector',

    'hero.eyebrow': 'AI · Web · Automation',
    'hero.titleA': 'Intelligent digital systems.',
    'hero.titleB': 'Built with precision.',
    'hero.tagline': 'Simple on the surface. Powerful underneath.',
    'hero.copy': 'Premium websites, AI agents and automation workflows for businesses that need clarity, conversion and execution.',
    'hero.testAgent': 'Test an agent',
    'hero.startProject': 'Start a project',
    'hero.builtBy': 'Built by SHAKUR',
    'hero.chain.idea': 'Idea',
    'hero.chain.agent': 'Agent',
    'hero.chain.system': 'System',
    'hero.chain.result': 'Result',

    'agents.kicker': 'Console',
    'agents.title': 'Three agents. One console.',
    'agents.copy': 'Describe it in one sentence. The agent returns a structured plan, ready to execute.',
    'agents.console.tabsLabel': 'Choose the agent',
    'agents.console.eyebrow': 'Agent Console',
    'agents.advanced.show': 'Advanced fields',
    'agents.advanced.hide': 'Hide advanced fields',
    'agents.tryExample': 'Example',
    'agents.loading': 'Agent is thinking…',
    'agents.result': 'Result',
    'agents.resultDemo': 'Result (demo)',
    'agents.reset': 'Reset',
    'agents.runAgain': 'Run again',
    'agents.turnIntoSystem': 'Turn this into a SHAKUR system',
    'agents.demoNotice': 'Demo mode — output is preset, not generated.',
    'agents.errorRateLimit': 'Too many requests. Try again in a moment.',
    'agents.errorTimeout': 'The agent took too long to respond.',
    'agents.errorInvalid': 'Invalid input. Check the fields.',
    'agents.errorNetwork': 'Unable to reach the API. Check your connection.',
    'agents.errorNotConfigured': 'API not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    'agents.errorGeneric': 'The agent ran into an error. Please retry.',

    'agents.offer.title': 'Offer Agent',
    'agents.offer.copy': 'Turns an activity into a readable, targeted, sellable offer.',
    'agents.offer.cta': 'Generate offer',
    'agents.offer.primaryLabel': 'Describe your business, service or idea',
    'agents.offer.primaryPlaceholder': 'One sentence is enough. E.g. design studio for B2B fintechs.',
    'agents.offer.primaryExample': 'Design studio helping B2B fintechs launch their first SaaS product.',
    'agents.offer.audienceLabel': 'Target customer',
    'agents.offer.audiencePlaceholder': 'E.g. CTO of a pre-seed startup',
    'agents.offer.audienceExample': 'CTOs of Series A fintechs in Europe',
    'agents.offer.goalLabel': 'Goal',
    'agents.offer.goalPlaceholder': 'E.g. 3 qualified calls / week',
    'agents.offer.goalExample': 'Book 3 qualified calls per week',
    'agents.offer.toneLabel': 'Tone',
    'agents.offer.tone.expert': 'Expert',
    'agents.offer.tone.direct': 'Direct',
    'agents.offer.tone.premium': 'Premium',
    'agents.offer.tone.friendly': 'Friendly',
    'agents.offer.angleLabel': 'Angle',
    'agents.offer.structureLabel': 'Landing structure',
    'agents.offer.ctaLabel': 'Call to action',

    'agents.audit.title': 'Audit Agent',
    'agents.audit.copy': 'Clarity · trust · conversion audit of a digital presence.',
    'agents.audit.cta': 'Audit presence',
    'agents.audit.primaryLabel': 'Paste a website or describe your digital presence',
    'agents.audit.primaryPlaceholder': 'A URL or a sentence. E.g. agency selling data warehouses.',
    'agents.audit.primaryExample': 'https://example.com — agency landing selling data warehouses',
    'agents.audit.audienceLabel': 'Target customer',
    'agents.audit.audiencePlaceholder': 'E.g. SMBs 10-50 people',
    'agents.audit.audienceExample': 'Industrial SMBs with 10-50 people',
    'agents.audit.objectiveLabel': 'Main objective',
    'agents.audit.objectivePlaceholder': 'E.g. generate qualified B2B leads',
    'agents.audit.objectiveExample': 'Generate qualified B2B leads',
    'agents.audit.clarityLabel': 'Clarity',
    'agents.audit.trustLabel': 'Trust',
    'agents.audit.riskLabel': 'Conversion risk',
    'agents.audit.riskLow': 'low',
    'agents.audit.riskMedium': 'medium',
    'agents.audit.riskHigh': 'high',
    'agents.audit.frictionLabel': 'Friction',
    'agents.audit.fixesLabel': 'Priority fixes',

    'agents.automation.title': 'Automation Agent',
    'agents.automation.copy': 'Maps a manual workflow into an automated chain.',
    'agents.automation.cta': 'Map workflow',
    'agents.auto.primaryLabel': 'Describe one manual workflow you want to automate',
    'agents.auto.primaryPlaceholder': 'One sentence is enough. E.g. I follow up by hand every week.',
    'agents.auto.primaryExample': 'I get inbound requests by email, reply manually with quotes, then follow up by hand each week.',
    'agents.auto.toolsLabel': 'Tools currently used',
    'agents.auto.toolsPlaceholder': 'E.g. Gmail, Notion, WhatsApp',
    'agents.auto.toolsExample': 'Gmail, Notion, WhatsApp Business',
    'agents.auto.resultLabel': 'Desired result',
    'agents.auto.resultPlaceholder': 'E.g. automatically qualify and follow up',
    'agents.auto.resultExample': 'Automatically qualify and follow up hot leads',
    'agents.auto.inputLabel': 'Input',
    'agents.auto.logicLabel': 'Logic',
    'agents.auto.outputLabel': 'Output',
    'agents.auto.stepsLabel': 'Automation steps',
    'agents.auto.integrationsLabel': 'Tools & integrations',
    'agents.auto.roadmapLabel': 'Implementation roadmap',

    'caps.eyebrow': 'What SHAKUR builds',
    'caps.title': 'Three capabilities. One system.',
    'caps.web.title': 'Web Systems',
    'caps.web.copy': 'Websites and interfaces that turn visitors into qualified requests.',
    'caps.ai.title': 'AI Interfaces',
    'caps.ai.copy': 'AI interfaces that guide users, structure decisions and reduce manual work.',
    'caps.auto.title': 'Automation',
    'caps.auto.copy': 'Automated workflows that remove manual follow-ups and operational friction.',

    'contact.kicker': 'Let’s build your system',
    'contact.title': 'You don’t need a website. You need a system.',
    'contact.copy': 'Describe your context. SHAKUR Studio comes back within 24 h with a targeted plan, not a generic quote.',
    'contact.action.whatsapp': 'Continue on WhatsApp',
    'contact.action.email': 'Send by email',
    'contact.action.scroll': 'See the contact form',
    'contact.prefill.subjectPrefix': 'SHAKUR STUDIO',
    'contact.prefill.body.offer': 'Hi — I just used the Offer Agent on shakurstudio.com. I’d like to turn this offer into an operational system.',
    'contact.prefill.body.audit': 'Hi — I just used the Audit Agent on shakurstudio.com. I’d like to discuss the priority fixes and how to ship them.',
    'contact.prefill.body.automation': 'Hi — I just used the Automation Agent on shakurstudio.com. I’d like to scope the implementation of the proposed workflow.',
    'contact.prefill.footer': 'Sent from shakurstudio.com',

    'footer.signature': 'Built by SHAKUR.',
    'footer.tagline': 'For businesses that need systems, not decoration.'
  }
};
