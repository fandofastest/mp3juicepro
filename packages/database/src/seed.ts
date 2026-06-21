import { connectToDatabase, disconnectFromDatabase, User, SystemSettings, Category, Banner, HomeSection } from "./index";
import { hashPassword } from "@headless/auth";
import { Logger } from "@headless/utils";

export async function seedDatabase(mongoUri?: string) {
  Logger.info("Starting database seeding...");
  const uri = mongoUri || process.env.MONGODB_URI || "mongodb://localhost:27017/mp3juice";
  await connectToDatabase(uri);

  // 1. Seed Super Admin
  const superAdminEmail = "superadmin@mp3juice.pro";
  const existingSuper = await User.findOne({ email: superAdminEmail });
  if (!existingSuper) {
    const pwHash = await hashPassword("admin12345");
    await User.create({
      username: "superadmin",
      displayName: "Super Admin",
      email: superAdminEmail,
      passwordHash: pwHash,
      role: "Super Admin",
      status: "active",
      verified: true,
      premium: true,
    });
    Logger.info("Super Admin user created (superadmin@mp3juice.pro / admin12345).");
  } else {
    Logger.info("Super Admin already exists.");
  }

  // 2. Seed Settings
  const settingsCount = await SystemSettings.countDocuments();
  if (settingsCount === 0) {
    await SystemSettings.create({
      appName: "MP3Juice Pro CMS",
      primaryColor: "#1DB954",
      secondaryColor: "#191414",
      theme: "dark",
      language: "en",
      country: "US",
      searchLimit: 20,
      cacheTtl: 3600,
      maintenanceMode: false,
      minimumAppVersion: "1.0.0",
      apiKeys: {},
    });
    Logger.info("Default system settings seeded.");
  }

  // 3. Seed Categories
  const categoryCount = await Category.countDocuments();
  if (categoryCount === 0) {
    const categoriesList = [
      { title: "Top Hits", slug: "top-hits", color: "#1DB954", sortOrder: 1, enabled: true },
      { title: "Focus & Chill", slug: "focus-chill", color: "#8E44AD", sortOrder: 2, enabled: true },
      { title: "Workout Energy", slug: "workout-energy", color: "#E67E22", sortOrder: 3, enabled: true },
      { title: "Party Anthems", slug: "party-anthems", color: "#E74C3C", sortOrder: 4, enabled: true },
    ];
    await Category.insertMany(categoriesList);
    Logger.info("Default categories seeded.");
  }

  // 4. Seed Banners
  const bannerCount = await Banner.countDocuments();
  if (bannerCount === 0) {
    await Banner.create({
      title: "Premium Sound Experience",
      subtitle: "Get ad-free high fidelity streams today",
      image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=60",
      buttonText: "Upgrade Now",
      buttonColor: "#1DB954",
      targetType: "url",
      targetId: "https://mp3juice.pro/premium",
      enabled: true,
      sortOrder: 1,
    });
    Logger.info("Default banner seeded.");
  }

  // 5. Seed Home Builder Sections
  const sectionCount = await HomeSection.countDocuments();
  if (sectionCount === 0) {
    const sections = [
      {
        title: "Main Spotlight Banner",
        layout: "banner",
        type: "banner",
        limit: 1,
        sortOrder: 1,
        enabled: true,
        provider: "local",
      },
      {
        title: "Featured Tracks",
        subtitle: "Handpicked tracks trending worldwide",
        layout: "carousel",
        type: "featured",
        limit: 8,
        sortOrder: 2,
        enabled: true,
        provider: "mock",
      },
      {
        title: "Explore Categories",
        subtitle: "Find your favorite genres",
        layout: "grid",
        type: "category",
        limit: 4,
        sortOrder: 3,
        enabled: true,
        provider: "local",
      },
      {
        title: "Recently Played",
        subtitle: "Jump back in where you left off",
        layout: "list",
        type: "history",
        limit: 5,
        sortOrder: 4,
        enabled: true,
        provider: "local",
      },
    ];
    await HomeSection.insertMany(sections);
    Logger.info("Default Home Sections seeded.");
  }

  Logger.info("Database seeding complete.");
}

// Keep executable support for CLI runner (npm run seed)
if (process.argv[1] && process.argv[1].includes("seed")) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    Logger.error("Failed to seed database:", err);
    process.exit(1);
  });
}

