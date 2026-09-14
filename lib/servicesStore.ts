import fs from "fs";
import path from "path";
import { ServiceCategory, ServiceItem, serviceData as defaultServiceData } from "@/data/services";

const DATA_DIR = path.join(process.cwd(), "data");
const SERVICES_FILE = path.join(DATA_DIR, "services_catalog.json");

/**
 * Initialize services catalog on disk if not present
 */
function getStoredServices(): ServiceCategory[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(SERVICES_FILE)) {
      fs.writeFileSync(SERVICES_FILE, JSON.stringify(defaultServiceData, null, 2), "utf8");
      return defaultServiceData;
    }

    const raw = fs.readFileSync(SERVICES_FILE, "utf8");
    if (!raw.trim()) return defaultServiceData;
    return JSON.parse(raw) as ServiceCategory[];
  } catch (err) {
    console.error("Error reading services catalog:", err);
    return defaultServiceData;
  }
}

/**
 * Save updated services catalog
 */
function saveServices(categories: ServiceCategory[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(categories, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error saving services catalog:", err);
    return false;
  }
}

export async function getAllServiceCategoriesAsync(): Promise<ServiceCategory[]> {
  return getStoredServices();
}

export async function addServiceItemAsync(
  categoryId: string,
  serviceInput: {
    name: string;
    shortDesc: string;
    group?: "cooling" | "appliances" | "electrical" | "plumbing" | "furniture" | "turnkey" | "custom";
    features?: string[];
    popular?: boolean;
    pricingModel?: "fixed" | "starting_from" | "custom";
    basePrice?: number | null;
    pricingLabel?: string;
  }
): Promise<{ success: boolean; service?: ServiceItem; error?: string }> {
  const categories = getStoredServices();
  const targetCategory = categories.find((c) => c.id === categoryId);

  if (!targetCategory) {
    return { success: false, error: "Target category not found" };
  }

  const newId = `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newService: ServiceItem = {
    id: newId,
    name: serviceInput.name.trim(),
    shortDesc: serviceInput.shortDesc.trim(),
    group: serviceInput.group || "appliances",
    features:
      serviceInput.features && serviceInput.features.length > 0
        ? serviceInput.features
        : ["Standard inspection & repair warranty"],
    popular: !!serviceInput.popular,
  };

  targetCategory.services.unshift(newService);
  saveServices(categories);

  return { success: true, service: newService };
}

export async function updateServiceItemAsync(
  serviceId: string,
  updates: Partial<ServiceItem>
): Promise<{ success: boolean; service?: ServiceItem; error?: string }> {
  const categories = getStoredServices();

  for (const cat of categories) {
    const idx = cat.services.findIndex((s) => s.id === serviceId);
    if (idx !== -1) {
      cat.services[idx] = {
        ...cat.services[idx],
        ...updates,
      };

      saveServices(categories);
      return { success: true, service: cat.services[idx] };
    }
  }

  return { success: false, error: "Service item not found" };
}

export async function deleteServiceItemAsync(
  serviceId: string
): Promise<{ success: boolean; error?: string }> {
  const categories = getStoredServices();

  for (const cat of categories) {
    const originalLen = cat.services.length;
    cat.services = cat.services.filter((s) => s.id !== serviceId);
    if (cat.services.length !== originalLen) {
      saveServices(categories);
      return { success: true };
    }
  }

  return { success: false, error: "Service item not found" };
}
