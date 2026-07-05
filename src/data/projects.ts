export type ProjectVisualPattern =
  | 'editorial-arc'
  | 'route-grid'
  | 'operations-stack'
  | 'dossier-beam'
  | 'tender-signal'
  | 'agent-orbit';

export interface ProjectDefinition {
  id: string;
  nameKey:
    | 'projects.kora.name'
    | 'projects.percorso.name'
    | 'projects.core.name'
    | 'projects.radarpulse.name'
    | 'projects.btp.name'
    | 'projects.shakuros.name';
  labelKey:
    | 'projects.kora.label'
    | 'projects.percorso.label'
    | 'projects.core.label'
    | 'projects.radarpulse.label'
    | 'projects.btp.label'
    | 'projects.shakuros.label';
  typeKey:
    | 'projects.kora.type'
    | 'projects.percorso.type'
    | 'projects.core.type'
    | 'projects.radarpulse.type'
    | 'projects.btp.type'
    | 'projects.shakuros.type';
  shortDescriptionKey:
    | 'projects.kora.description'
    | 'projects.percorso.description'
    | 'projects.core.description'
    | 'projects.radarpulse.description'
    | 'projects.btp.description'
    | 'projects.shakuros.description';
  tagKeys: Array<
    | 'projects.tags.ai'
    | 'projects.tags.editorial'
    | 'projects.tags.sources'
    | 'projects.tags.mapping'
    | 'projects.tags.validation'
    | 'projects.tags.operations'
    | 'projects.tags.reporting'
    | 'projects.tags.traceability'
    | 'projects.tags.opportunities'
    | 'projects.tags.decision'
    | 'projects.tags.tenders'
    | 'projects.tags.publicworks'
    | 'projects.tags.agents'
    | 'projects.tags.automation'
    | 'projects.tags.workflows'
  >;
  statusKey:
    | 'projects.status.system'
    | 'projects.status.platform'
    | 'projects.status.viewer'
    | 'projects.status.os';
  visualPattern: ProjectVisualPattern;
  imageSrc?: string;
  imageMode?: 'cover' | 'contain';
  imagePosition?: string;
}

export const projects: ProjectDefinition[] = [
  {
    id: 'kora',
    nameKey: 'projects.kora.name',
    labelKey: 'projects.kora.label',
    typeKey: 'projects.kora.type',
    shortDescriptionKey: 'projects.kora.description',
    tagKeys: ['projects.tags.ai', 'projects.tags.editorial', 'projects.tags.sources'],
    statusKey: 'projects.status.system',
    visualPattern: 'editorial-arc'
  },
  {
    id: 'percorso',
    nameKey: 'projects.percorso.name',
    labelKey: 'projects.percorso.label',
    typeKey: 'projects.percorso.type',
    shortDescriptionKey: 'projects.percorso.description',
    tagKeys: ['projects.tags.mapping', 'projects.tags.validation', 'projects.tags.ai'],
    statusKey: 'projects.status.viewer',
    visualPattern: 'route-grid',
    imageSrc: '/projects/percorso-hero.png',
    imageMode: 'cover',
    imagePosition: 'center top'
  },
  {
    id: 'core-rapportino',
    nameKey: 'projects.core.name',
    labelKey: 'projects.core.label',
    typeKey: 'projects.core.type',
    shortDescriptionKey: 'projects.core.description',
    tagKeys: ['projects.tags.operations', 'projects.tags.reporting', 'projects.tags.traceability'],
    statusKey: 'projects.status.platform',
    visualPattern: 'operations-stack',
    imageSrc: '/projects/core-hero.png',
    imageMode: 'cover',
    imagePosition: 'center top'
  },
  {
    id: 'radarpulse',
    nameKey: 'projects.radarpulse.name',
    labelKey: 'projects.radarpulse.label',
    typeKey: 'projects.radarpulse.type',
    shortDescriptionKey: 'projects.radarpulse.description',
    tagKeys: ['projects.tags.opportunities', 'projects.tags.decision', 'projects.tags.ai'],
    statusKey: 'projects.status.platform',
    visualPattern: 'dossier-beam',
    imageSrc: '/projects/radarpulse-hero.png',
    imageMode: 'cover',
    imagePosition: 'center top'
  },
  {
    id: 'btp-intelligence',
    nameKey: 'projects.btp.name',
    labelKey: 'projects.btp.label',
    typeKey: 'projects.btp.type',
    shortDescriptionKey: 'projects.btp.description',
    tagKeys: ['projects.tags.tenders', 'projects.tags.publicworks', 'projects.tags.opportunities'],
    statusKey: 'projects.status.system',
    visualPattern: 'tender-signal'
  },
  {
    id: 'shakuros',
    nameKey: 'projects.shakuros.name',
    labelKey: 'projects.shakuros.label',
    typeKey: 'projects.shakuros.type',
    shortDescriptionKey: 'projects.shakuros.description',
    tagKeys: ['projects.tags.agents', 'projects.tags.automation', 'projects.tags.workflows'],
    statusKey: 'projects.status.os',
    visualPattern: 'agent-orbit'
  }
];
