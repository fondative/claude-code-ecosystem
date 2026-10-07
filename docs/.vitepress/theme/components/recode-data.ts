export type Skill = { id: string; input: string; output: string; points: string[] }
export type Lane = {
  key: 'dev' | 'mig' | 'real' | 'doc'
  name: string
  tagline: string
  page: string
  before?: string
  after: string
  skills: Skill[]
}

export const lanes: Lane[] = [
  {
    key: 'dev', name: 'Développement', tagline: 'Un besoin neuf sur la stack courante', page: '/recode/developpement',
    after: 'Réalisation',
    skills: [
      { id: 'explore-need', input: 'Brouillon libre', output: 'Besoin structuré', points: [
        'Point d\'entrée du workflow Développement',
        'Clarifie par un dialogue guidé et compare plusieurs approches avant de choisir',
        'Découpe le besoin en features, validées section par section',
      ] },
      { id: 'write-spec', input: 'Besoin structuré', output: 'Spécification fonctionnelle, feature par feature', points: [
        'Décrit comportement nominal, erreurs et cas limites',
        'Reste à haut niveau technique : les détails se résolvent plus tard contre le code réel',
      ] },
    ],
  },
  {
    key: 'mig', name: 'Migration', tagline: 'Un code existant réécrit vers une autre stack', page: '/recode/migration',
    after: 'Réalisation',
    skills: [
      { id: 'analyze-app', input: 'Code source existant', output: 'Cartographie globale', points: [
        'Point d\'entrée du workflow Migration',
        'Dresse le contexte, la stack, les intégrations externes et les modules triés par dépendance',
        'Fixe un découpage stable et l\'ordre de traitement de la migration',
      ] },
      { id: 'analyze-module', input: 'Cartographie + code d\'un module', output: 'Analyse approfondie', points: [
        'Alimente aussi le workflow Documentation',
        'Couvre features, flux, logique métier, interfaces et effets de bord, chaque affirmation ancrée dans le code',
        'Plusieurs modules peuvent être traités en parallèle',
      ] },
      { id: 'write-migration', input: 'Analyse d\'un module', output: 'Décisions de transformation vers la stack cible', points: [
        'Décide, feature par feature, ce qui est porté, recréé, changé ou supprimé',
        'Réécriture big-bang : on reconstruit, on ne traduit pas ligne à ligne',
      ] },
    ],
  },
  {
    key: 'real', name: 'Réalisation', tagline: 'Découpage en tâches testables, puis code en TDD', page: '/recode/realisation',
    before: 'Développement ou Migration',
    after: 'Code livré',
    skills: [
      { id: 'plan-tasks', input: 'Spécification ou décisions de migration', output: 'Tâches testables', points: [
        'Développement : part de la spécification',
        'Migration : part des décisions de migration',
        'Dans les deux cas, produit des tâches au même format, chacune livrant un comportement testable',
      ] },
      { id: 'implement-tasks', input: 'Tâches testables', output: 'Code testé, un commit par tâche', points: [
        'Même cycle quel que soit l\'amont : TDD, review avant chaque commit, reprise possible',
        'Développement : construit la nouvelle feature sur la stack courante',
        'Migration : réécrit le module sur la stack cible, l\'ancien code est remplacé sans cohabitation',
      ] },
    ],
  },
  {
    key: 'doc', name: 'Documentation', tagline: 'Wiki généré à partir des analyses', page: '/recode/documentation',
    before: 'analyze-module',
    after: 'Wiki',
    skills: [
      { id: 'build-graphs-data', input: 'Analyses', output: 'Arbre des features et graphe de dépendances', points: [
        'Se branche sur les analyses de la Migration',
        'Sépare les données de leur affichage',
        'Donne une vue du couplage pour décider de l\'ordre de migration',
      ] },
      { id: 'generate-docs', input: 'Données structurées + analyses', output: 'Wiki consultable', points: [
        'Cartographie interactive, une page par module, tableau de bord de progression',
        'Rend l\'analyse accessible aux non-développeurs',
      ] },
    ],
  },
]

export const findSkill = (id: string) => {
  const lane = lanes.find((l) => l.skills.some((s) => s.id === id))!
  return { lane, skill: lane.skills.find((s) => s.id === id)! }
}
