import fs from "fs";
import path from "path";

export interface TechnicianRecord {
  id: string;
  name: string;
  phone: string;
  district: string;
  specialty: string;
  active: boolean;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const TECH_FILE = path.join(DATA_DIR, "technicians.json");

function readTechnicians(): TechnicianRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(TECH_FILE)) {
      fs.writeFileSync(TECH_FILE, JSON.stringify([], null, 2), "utf8");
      return [];
    }
    const data = fs.readFileSync(TECH_FILE, "utf8");
    if (!data.trim()) return [];
    return JSON.parse(data) as TechnicianRecord[];
  } catch (error) {
    console.error("Error reading technicians file:", error);
    return [];
  }
}

function writeTechnicians(techs: TechnicianRecord[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TECH_FILE, JSON.stringify(techs, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving technicians file:", error);
    return false;
  }
}

export async function getAllTechniciansAsync(): Promise<TechnicianRecord[]> {
  return readTechnicians();
}

export async function addTechnicianAsync(tech: Omit<TechnicianRecord, "id" | "createdAt" | "active">): Promise<TechnicianRecord> {
  const all = readTechnicians();
  const id = `TECH-${Math.floor(1000 + Math.random() * 9000)}`;
  const newTech: TechnicianRecord = {
    id,
    name: tech.name.trim(),
    phone: tech.phone.trim(),
    district: tech.district.trim(),
    specialty: tech.specialty.trim(),
    active: true,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newTech);
  writeTechnicians(all);
  return newTech;
}

export async function updateTechnicianAsync(id: string, updates: Partial<TechnicianRecord>): Promise<TechnicianRecord | null> {
  const all = readTechnicians();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updates };
  writeTechnicians(all);
  return all[idx];
}

export async function deleteTechnicianAsync(id: string): Promise<boolean> {
  const all = readTechnicians();
  const filtered = all.filter((t) => t.id !== id);
  if (filtered.length === all.length) return false;
  writeTechnicians(filtered);
  return true;
}
