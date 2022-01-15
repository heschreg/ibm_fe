export interface SD_Kommunikation {
  id: number;
  bezeichnung: string;
}

export interface Kommunikation {
  id: number;
  Zeitpunkt: string;
  sd_Kommunikation: SD_Kommunikation;
}

export interface Anlagen {
  id: number;
  name?: string;
  type?: string;
  bin_data?: Blob;
}

export interface Bewerber {
  id: number;
  id_stellenangebot: number,
  nachname: string;
  vorname: string;
  anrede: string;
  titel: string;
  plz: number;
  ort: string;
  strasse: string;
  hausnummer: number;
  email: string;
  notizen: string;
  kommunikation: Kommunikation[];
  anlagen: Anlagen[];
}
