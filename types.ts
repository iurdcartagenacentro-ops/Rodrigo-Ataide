
export enum MaritalStatus {
  SOLTERO = 'SOLTERO(A)',
  CASADO = 'CASADO(A)',
  DIVORCIADO = 'DIVORCIADO(A)',
  VIUDO = 'VIUDO(A)',
  UNION_LIBRE = 'UNIÓN LIBRE'
}

export enum Group {
  EVG = 'EVG',
  FTU = 'FTU',
  FJU = 'FJU',
  EBI = 'EBI',
  CALEB = 'CALEB',
  NINGUNO = 'NINGUNO'
}

export interface MemberFormData {
  id?: number;
  serialNumber: string;
  photo: string | null;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  department: string;
  cellphone: string;
  email: string;
  birthDate: string;
  maritalStatus: MaritalStatus | '';
  baptismDate: string;
  church: string;
  timeInChurch: string;
  group: Group | '';
  signature: string | null;
  updateDate: string;
  createdAt?: number;
}
