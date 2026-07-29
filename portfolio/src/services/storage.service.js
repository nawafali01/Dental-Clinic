const KEYS = {
  USERS: "users",
  CURRENT_USER: "currentUser",
  ORGANIZATIONS: "organizations",
  CLINICS: "clinics",
  SEEDED: "isSeeded",
};

// Seed data
const initialUsers = [
  {
    id: "u1",
    email: "admin@test.com",
    password: "Admin123", // Storing plaintext as requested (No SHA256)
    role: "super_admin",
    status: "active",
    fullName: "Super Admin",
    createdAt: new Date().toISOString(),
  },
];

const initialOrganizations = [
  { id: "org1", name: "Aurea Dental Group" },
];

const initialClinics = [
  { id: "c1", name: "Aurea Main Clinic", orgId: "org1" },
  { id: "c2", name: "Aurea North Branch", orgId: "org1" },
];

export const storageService = {
  get: (key) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  },

  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  },

  seed: () => {
    try {
      const isSeeded = window.localStorage.getItem(KEYS.SEEDED);
      if (!isSeeded) {
        window.localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
        window.localStorage.setItem(KEYS.ORGANIZATIONS, JSON.stringify(initialOrganizations));
        window.localStorage.setItem(KEYS.CLINICS, JSON.stringify(initialClinics));
        window.localStorage.setItem(KEYS.SEEDED, "true");
        console.log("Database seeded successfully.");
      }
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  },
};
