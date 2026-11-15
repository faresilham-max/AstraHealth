// Gestes à effectuer en cas de perte de conscience (procédure de démonstration)
export const STEPS = [
  "Keep the astronaut fixed and secured (straps)",
  "Check breathing and pulse (carotid)",
  "Clear the airway and check the module’s oxygen",
  "Fetch the defibrillator (AED) and the medical kit; start CPR if there is no pulse",
  "Alert the flight doctor and mission control",
];

// BASE_URL permet au chemin de rester correct même si le site est servi dans un sous-dossier
export const VIDEO_SRC = `${import.meta.env.BASE_URL}videos/premiers-secours.mp4`;