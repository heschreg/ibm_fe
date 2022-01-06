export interface Kanal {
  id: number;
  bezeichnung: string;
}

export interface Status {
  id: number;
  bezeichnung: string;
}

export interface Kanaele {
  id: number;
  bezeichnung: string;
}

export interface Stellenangebot {
  id: number;
  bezeichnung: string;
  beginn: Date;
  ende: Date;
  notizen: string;
  sd_status: Status;
  sd_kanal: Kanal;
  kanaele: Kanal[];
}



export interface Stellenangebote {
  id: number;
  firstName: string;
  lastName: string;
  emailId: string;
}
