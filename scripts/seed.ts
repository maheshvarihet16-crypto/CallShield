import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/User";
import { NumberModel } from "../src/models/Number";
import { Report } from "../src/models/Report";
import { LinkScan } from "../src/models/LinkScan";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/callshild";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "callshild";

async function seed() {
  console.log("🌱 Connecting to MongoDB for seeding...");
  console.log(`URI: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
    console.log("✅ Connected to MongoDB.");

    // Clean existing data
    await User.deleteMany({});
    await NumberModel.deleteMany({});
    await Report.deleteMany({});
    await LinkScan.deleteMany({});
    console.log("🧹 Cleaned existing database collections.");

    // 1. Create Sample Users
    const sampleUser = await User.create({
      name: "Rahul Sharma",
      email: "rahul@example.com",
      role: "user",
    });

    const adminUser = await User.create({
      name: "Admin Moderator",
      email: "admin@callshield.org",
      role: "admin",
    });

    console.log("👤 Created sample users.");

    // 2. Create Sample Numbers & Reports
    const sampleNumbersData = [
      {
        phoneNumber: "+919876543210",
        fraudScore: 92,
        totalReports: 5,
        topCategory: "Fake Police/Digital Arrest",
        isSpoofedFlag: true,
        lastReportedAt: new Date(),
        reports: [
          {
            reportedBy: sampleUser._id,
            category: "Fake Police/Digital Arrest" as const,
            description: "Claimed to be from CBI officer informing about illegal package. Demanded money via UPI under threat of digital arrest.",
            language: "en",
            location: "Ahmedabad, Gujarat",
          },
          {
            reportedBy: adminUser._id,
            category: "Fake Police/Digital Arrest" as const,
            description: "પોલીસ ના નામે ફોન કરી ને ૫૦,૦૦૦ રૂપિયા માંગ્યા. ડિજિટલ એરેસ્ટ ની ધમકી આપી.",
            language: "gu",
            location: "Surat, Gujarat",
          },
        ],
      },
      {
        phoneNumber: "+919123456789",
        fraudScore: 85,
        totalReports: 3,
        topCategory: "Fraud Bank Call",
        isSpoofedFlag: false,
        lastReportedAt: new Date(Date.now() - 3600000 * 5),
        reports: [
          {
            reportedBy: sampleUser._id,
            category: "Fraud Bank Call" as const,
            description: "Posing as HDFC bank manager asking for debit card CVV and OTP for credit limit upgrade.",
            language: "en",
            location: "Mumbai, Maharashtra",
          },
          {
            reportedBy: sampleUser._id,
            category: "Fraud Bank Call" as const,
            description: "बैंक अधिकारी बनकर क्रेडिट कार्ड ब्लॉक होने का झांसा दिया और ओटीपी माँगा।",
            language: "hi",
            location: "Delhi",
          },
        ],
      },
      {
        phoneNumber: "+919988776655",
        fraudScore: 78,
        totalReports: 2,
        topCategory: "KYC Scam",
        isSpoofedFlag: false,
        lastReportedAt: new Date(Date.now() - 3600000 * 24),
        reports: [
          {
            reportedBy: sampleUser._id,
            category: "KYC Scam" as const,
            description: "Sent SMS stating SIM card KYC update expired, asking to download AnyDesk remote access app.",
            language: "en",
            location: "Rajkot, Gujarat",
          },
        ],
      },
      {
        phoneNumber: "+919000000000",
        fraudScore: 15,
        totalReports: 1,
        topCategory: "Telemarketing",
        isSpoofedFlag: false,
        lastReportedAt: new Date(Date.now() - 3600000 * 48),
        reports: [
          {
            reportedBy: sampleUser._id,
            category: "Telemarketing" as const,
            description: "Promotional personal loan caller asking for income details.",
            language: "en",
            location: "Bengaluru, Karnataka",
          },
        ],
      },
    ];

    for (const data of sampleNumbersData) {
      const { reports, ...numFields } = data;
      const numDoc = await NumberModel.create(numFields);

      for (const rep of reports) {
        await Report.create({
          ...rep,
          numberId: numDoc._id,
        });
      }
    }

    console.log("📞 Inserted sample numbers and associated reports.");

    // 3. Create Sample Link Scans
    await LinkScan.create([
      {
        url: "http://fake-sbi-kyc-verify.com/login",
        scannedBy: sampleUser._id,
        result: "malicious",
        rawApiResponse: { matches: [{ threatType: "MALWARE" }] },
      },
      {
        url: "https://onlinesbi.sbi",
        scannedBy: sampleUser._id,
        result: "safe",
        rawApiResponse: { matches: [] },
      },
    ]);

    console.log("🔗 Inserted sample link scans.");
    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

seed();
