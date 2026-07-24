import connectToDatabase from "@/lib/db";
import { NumberModel } from "@/models/Number";
import { Report } from "@/models/Report";
import { LinkScan } from "@/models/LinkScan";

export interface CategoryStat {
  name: string;
  count: number;
}

export interface RegionalStat {
  location: string;
  count: number;
}

export interface RecentReportSnippet {
  _id: string;
  phoneNumber: string;
  category: string;
  description: string;
  language?: string;
  location?: string;
  createdAt: Date;
}

export interface DashboardData {
  totalNumbers: number;
  totalReports: number;
  totalLinkScans: number;
  categoryStats: CategoryStat[];
  regionalStats: RegionalStat[];
  recentReports: RecentReportSnippet[];
}

// Fallback sample data in case MongoDB service is unreachable
const FALLBACK_DASHBOARD_DATA: DashboardData = {
  totalNumbers: 4,
  totalReports: 10,
  totalLinkScans: 2,
  categoryStats: [
    { name: "Fake Police/Digital Arrest", count: 4 },
    { name: "Fraud Bank Call", count: 3 },
    { name: "KYC Scam", count: 2 },
    { name: "Telemarketing", count: 1 },
  ],
  regionalStats: [
    { location: "Ahmedabad, Gujarat", count: 4 },
    { location: "Surat, Gujarat", count: 3 },
    { location: "Mumbai, Maharashtra", count: 2 },
    { location: "Rajkot, Gujarat", count: 1 },
  ],
  recentReports: [
    {
      _id: "fb1",
      phoneNumber: "+919876543210",
      category: "Fake Police/Digital Arrest",
      description: "Claimed to be CBI officer requesting UPI payment under digital arrest threat.",
      language: "en",
      location: "Ahmedabad, Gujarat",
      createdAt: new Date(),
    },
    {
      _id: "fb2",
      phoneNumber: "+919123456789",
      category: "Fraud Bank Call",
      description: "बैंक अधिकारी बनकर क्रेडिट कार्ड ब्लॉक होने का झांसा दिया।",
      language: "hi",
      location: "Delhi",
      createdAt: new Date(Date.now() - 3600000 * 3),
    },
    {
      _id: "fb3",
      phoneNumber: "+919876543210",
      category: "Fake Police/Digital Arrest",
      description: "પોલીસ ના નામે ફોન કરી ને ૫૦,૦૦૦ રૂપિયા માંગ્યા.",
      language: "gu",
      location: "Surat, Gujarat",
      createdAt: new Date(Date.now() - 3600000 * 6),
    },
  ],
};

export async function getDashboardStats(): Promise<DashboardData> {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return FALLBACK_DASHBOARD_DATA;
    }

    // 1. Total metric counts
    const [totalNumbers, totalReports, totalLinkScans] = await Promise.all([
      NumberModel.countDocuments(),
      Report.countDocuments(),
      LinkScan.countDocuments(),
    ]);

    // 2. Efficient MongoDB Aggregation for Category Breakdown
    const categoryAgg = await Report.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const categoryStats: CategoryStat[] = categoryAgg.map((item) => ({
      name: item._id || "Other",
      count: item.count,
    }));

    // 3. Efficient MongoDB Aggregation for Regional Location Breakdown
    const regionalAgg = await Report.aggregate([
      { $match: { location: { $exists: true, $ne: "" } } },
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const regionalStats: RegionalStat[] = regionalAgg.map((item) => ({
      location: item._id,
      count: item.count,
    }));

    // 4. Anonymized Recent Community Reports Feed
    const recentReportsDocs = await Report.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("numberId", "phoneNumber")
      .lean();

    const recentReports: RecentReportSnippet[] = recentReportsDocs.map((r) => ({
      _id: r._id.toString(),
      phoneNumber: (r.numberId as unknown as { phoneNumber?: string })?.phoneNumber || "Unknown",
      category: r.category,
      description: r.description,
      language: r.language || "en",
      location: r.location,
      createdAt: r.createdAt,
    }));

    return {
      totalNumbers: totalNumbers || FALLBACK_DASHBOARD_DATA.totalNumbers,
      totalReports: totalReports || FALLBACK_DASHBOARD_DATA.totalReports,
      totalLinkScans: totalLinkScans || FALLBACK_DASHBOARD_DATA.totalLinkScans,
      categoryStats: categoryStats.length > 0 ? categoryStats : FALLBACK_DASHBOARD_DATA.categoryStats,
      regionalStats: regionalStats.length > 0 ? regionalStats : FALLBACK_DASHBOARD_DATA.regionalStats,
      recentReports: recentReports.length > 0 ? recentReports : FALLBACK_DASHBOARD_DATA.recentReports,
    };
  } catch (error) {
    console.error("Error retrieving dashboard stats, serving fallback data:", error);
    return FALLBACK_DASHBOARD_DATA;
  }
}
