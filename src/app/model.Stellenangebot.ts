export interface Stellenangebot {
  id: number;
  bezeichnung: string;
  beginn: string;
  ende: string;
  notizen: string;
  sd_status: Status;
  sd_kanal: Kanal;
  kanaele: Kanal[];
  pdf_stellenangebot: Pdf_Attached;
}

export interface Status {
  id: number;
  bezeichnung: string;
  checked?: boolean;
}

export interface Kanal {
  id: number;
  bezeichnung: string;
  selected?: boolean;
}
export interface Pdf_Attached {
  id: number;
  name?: string;
  type?: string;
  bin_data?: Blob;
}

/*
export interface Kanal_Success {
  id: number;
  bezeichnung: string;
  selected?: boolean;
}

export interface Stellenangebote {
  id: number;
  firstName: string;
  lastName: string;
  emailId: string;
}
*/
