export type Protocol = {
  id: string;
  name: string;
  category: "meta" | "protocolo";
  description: string;
  sessions: string[]; // datas das sessões em que aparece
};

export const PROTOCOLS: Protocol[] = [
  {
    id: "meta-01-identificacao",
    name: "Meta 01: Identificação",
    category: "meta",
    description: "Identificação correta do paciente usando no mínimo dois identificadores.",
    sessions: ["16/06", "25/06", "07/07"],
  },
  {
    id: "meta-02-comunicacao",
    name: "Meta 02: Comunicação",
    category: "meta",
    description: "Comunicação efetiva entre profissionais de saúde (SBAR, passagem de plantão).",
    sessions: ["16/06", "25/06", "07/07"],
  },
  {
    id: "meta-03-medicamentos",
    name: "Meta 03: Medicamentos",
    category: "meta",
    description: "Segurança na prescrição, dispensação e administração de medicamentos de alta vigilância.",
    sessions: ["18/06", "30/06", "09/07"],
  },
  {
    id: "meta-04-cirurgia-segura",
    name: "Meta 04: Cirurgia Segura",
    category: "meta",
    description: "Cirurgia segura: checklist e Time-out antes do procedimento cirúrgico.",
    sessions: ["18/06", "30/06", "09/07"],
  },
  {
    id: "meta-05-higiene-maos",
    name: "Meta 05: Higiene de Mãos",
    category: "meta",
    description: "Higiene de mãos: os 5 momentos e técnica correta.",
    sessions: ["23/06", "02/07", "14/07"],
  },
  {
    id: "meta-06-quedas",
    name: "Meta 06: Quedas",
    category: "meta",
    description: "Prevenção de quedas: Escala de Morse e barreiras de proteção.",
    sessions: ["23/06", "02/07", "14/07"],
  },
  {
    id: "meta-06-lesao-pressao",
    name: "Meta 06: Lesão por Pressão",
    category: "meta",
    description: "Prevenção de lesão por pressão: Escala de Braden e mudança de decúbito.",
    sessions: ["18/06", "30/06", "09/07"],
  },
  {
    id: "prot-dor-toracica",
    name: "Prot. Dor Torácica",
    category: "protocolo",
    description: "Protocolo de atendimento à dor torácica aguda.",
    sessions: ["16/06", "25/06", "07/07"],
  },
  {
    id: "prot-avc",
    name: "Prot. AVC",
    category: "protocolo",
    description: "Protocolo de atendimento ao AVC: Escala de Cincinnati e linha do tempo.",
    sessions: ["16/06", "25/06", "07/07"],
  },
  {
    id: "prot-dor",
    name: "Prot. Dor",
    category: "protocolo",
    description: "Protocolo de avaliação e manejo da dor: escalas e intervenções.",
    sessions: ["18/06", "30/06", "09/07"],
  },
  {
    id: "prot-sepse",
    name: "Prot. Sepse",
    category: "protocolo",
    description: "Protocolo de Sepse: identificação precoce e bundle de tratamento.",
    sessions: ["23/06", "02/07", "14/07"],
  },
  {
    id: "prot-deterioracao",
    name: "Prot. Deterioração",
    category: "protocolo",
    description: "Protocolo de Deterioração Clínica: MEWS e acionamento precoce.",
    sessions: ["23/06", "02/07", "14/07"],
  },
];
