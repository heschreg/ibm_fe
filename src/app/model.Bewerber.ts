export interface SD_Kommunikation {
  id: number;
  bezeichnung: string;
}

/*
long id = kommunikationen.get(0).getId();
String anmerkungen                = kommunikationen.get(0).getAnmerkungen(); // Achtung: ist immer nur eine Anmerkung
Date zeitpunkt                    = kommunikationen.get(0).getZeitpunkt();
Bewerber bewerber                 = kommunikationen.get(0).getBewerber();
SD_Kommunikation sd_Kommunikation = kommunikationen.get(0).getSd_kommunikation();
*/
export interface Kommunikation {
  id: number;
  zeitpunkt: string;
  anmerkungen: string;
  sd_kommunikation: SD_Kommunikation;
  bewerber?: Bewerber;
}

export interface Anlagen {
  id: number;
  name: string;
  type: string;
  bin_data?: Blob;
}

export interface Bewerber {
  id: number;
  idstellenangebot: number,
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
  kommunikationen: Kommunikation[];
  anlagen: Anlagen[];
  skills: string;
}
export interface Pdf_Attached {
  id: number;
  name?: string;
  type?: string;
  bin_data?: Blob;
}
