"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "gu";

interface Translations {
  navHome: string;
  navReport: string;
  navScan: string;
  navDashboard: string;
  navLogin: string;
  navSignup: string;
  navAccount: string;
  navAdmin: string;
  navLogout: string;

  heroTitle: string;
  heroHighlight: string;
  heroSub: string;
  searchPlaceholder: string;
  searchBtn: string;
  samplePrompt: string;

  featureFraudTitle: string;
  featureFraudDesc: string;
  featureScanTitle: string;
  featureScanDesc: string;
  featureLangTitle: string;
  featureLangDesc: string;

  reportTitle: string;
  reportSub: string;
  reportPhoneLabel: string;
  reportCatLabel: string;
  reportDescLabel: string;
  reportLangLabel: string;
  reportLocLabel: string;
  reportEvidenceLabel: string;
  reportAudioLabel: string;
  reportSubmitBtn: string;

  scanTitle: string;
  scanSub: string;
  scanBtn: string;

  dashTitle: string;
  dashSub: string;
  dashCataloged: string;
  dashReports: string;
  dashScans: string;
  dashCategories: string;
  dashRegional: string;
  dashFeed: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    navHome: "Home",
    navReport: "Report Fraud",
    navScan: "Scan Link",
    navDashboard: "Dashboard",
    navLogin: "Login",
    navSignup: "Sign Up",
    navAccount: "My Account",
    navAdmin: "Admin Panel",
    navLogout: "Log out",

    heroTitle: "Identify Fraud Calls &",
    heroHighlight: "Phishing Links Instantly",
    heroSub: "Check any unknown phone number to see crowdsourced fraud risk scores, report suspicious callers in your language (Gujarati, Hindi, English), and scan dangerous links.",
    searchPlaceholder: "Enter phone number (e.g. +919876543210 or 9876543210)",
    searchBtn: "Check Risk",
    samplePrompt: "Try looking up a sample seeded number:",

    featureFraudTitle: "Crowdsourced Fraud Score",
    featureFraudDesc: "Calculated using weighted community reports, recency decay, and category severity to give you an accurate risk % before calling back.",
    featureScanTitle: "Phishing Link Scanner",
    featureScanDesc: "Paste suspicious links received via SMS or WhatsApp to check reputation against Google Safe Browsing API instantly.",
    featureLangTitle: "Regional Language Support",
    featureLangDesc: "Community reports in Gujarati, Hindi, and English capture local India-specific scam narratives (fake police, digital arrest, bank KYC).",

    reportTitle: "Report a Scam Number",
    reportSub: "Warn the community about suspicious calls, bank impersonators, and phishing attempts",
    reportPhoneLabel: "Scam Phone Number",
    reportCatLabel: "Scam Category",
    reportDescLabel: "Scam Description / Incident Notes",
    reportLangLabel: "Primary Language",
    reportLocLabel: "Reporter Location (Optional)",
    reportEvidenceLabel: "Evidence Screenshot (Optional)",
    reportAudioLabel: "Saved Call Recording Audio (Optional)",
    reportSubmitBtn: "Submit Fraud Report",

    scanTitle: "SMS & WhatsApp Phishing Scanner",
    scanSub: "Check suspicious links received via SMS, WhatsApp, or email before clicking",
    scanBtn: "Scan Link Risk",

    dashTitle: "Community Fraud Dashboard",
    dashSub: "Live crowdsourced fraud trends, top reported scam categories, and regional insights across India",
    dashCataloged: "Numbers Cataloged",
    dashReports: "Reports Submitted",
    dashScans: "Phishing Links Scanned",
    dashCategories: "Top Scam Categories Distribution",
    dashRegional: "Regional Breakdown",
    dashFeed: "Recent Anonymized Community Activity Feed",
  },
  hi: {
    navHome: "होम",
    navReport: "स्कैम रिपोर्ट करें",
    navScan: "लिंक स्कैन करें",
    navDashboard: "डैशबोर्ड",
    navLogin: "लॉगिन",
    navSignup: "साइन अप",
    navAccount: "मेरा खाता",
    navAdmin: "एडमिन पैनल",
    navLogout: "लॉग आउट",

    heroTitle: "फ्रॉड कॉल्स और",
    heroHighlight: "फ़िशिंग लिंक्स तुरंत पहचानें",
    heroSub: "किसी भी अनजान नंबर का फ्रॉड रिस्क स्कोर जांचें, संदिग्ध कॉलर की रिपोर्ट हिंदी, गुजराती या अंग्रेजी में दर्ज करें, और खतरनाक लिंक्स स्कैन करें।",
    searchPlaceholder: "फ़ोन नंबर दर्ज करें (जैसे +919876543210)",
    searchBtn: "रिस्क जांचें",
    samplePrompt: "नमूना नंबर जांचें:",

    featureFraudTitle: "क्राउडसोर्स्ड फ्रॉड स्कोर",
    featureFraudDesc: "सामुदायिक रिपोर्ट, हालिया समय और श्रेणी की गंभीरता के आधार पर सटीक जोखिम % निर्धारित करता है।",
    featureScanTitle: "फ़िशिंग लिंक स्कैनर",
    featureScanDesc: "SMS या WhatsApp पर प्राप्त संदिग्ध लिंक को तुरंत Google Safe Browsing से जांचें।",
    featureLangTitle: "क्षेत्रीय भाषा सहायता",
    featureLangDesc: "गुजराती, हिंदी और अंग्रेजी में सामुदायिक रिपोर्ट स्थानीय घोटालों (डिजिटल अरेस्ट, फर्जी पुलिस, बैंक केवाईसी) को कवर करती हैं।",

    reportTitle: "स्कैम नंबर की रिपोर्ट करें",
    reportSub: "संदिग्ध कॉल, बैंक धोखाधड़ी और डिजिटल अरेस्ट के बारे में समुदाय को चेतावनी दें",
    reportPhoneLabel: "स्कैम फ़ोन नंबर",
    reportCatLabel: "स्कैम की श्रेणी",
    reportDescLabel: "घटना का विवरण / नोट",
    reportLangLabel: "मुख्य भाषा",
    reportLocLabel: "रिपोर्टर स्थान (वैकल्पिक)",
    reportEvidenceLabel: "स्क्रीनशॉट साक्ष्य (वैकल्पिक)",
    reportAudioLabel: "सेव किया गया कॉल ऑडियो (वैकल्पिक)",
    reportSubmitBtn: "रिपोर्ट सबमिट करें",

    scanTitle: "SMS और WhatsApp फ़िशिंग स्कैनर",
    scanSub: "क्लिक करने से पहले SMS या WhatsApp पर प्राप्त संदिग्ध लिंक्स की सुरक्षा जांचें",
    scanBtn: "लिंक रिस्क स्कैन करें",

    dashTitle: "सामुदायिक फ्रॉड डैशबोर्ड",
    dashSub: "भारत भर के लाइव फ्रॉड ट्रेंड्स, मुख्य स्कैम श्रेणियां और क्षेत्रीय आंकड़े",
    dashCataloged: "दर्ज किए गए नंबर",
    dashReports: "कुल सबमिट रिपोर्ट",
    dashScans: "स्कैन किए गए लिंक्स",
    dashCategories: "मुख्य स्कैम श्रेणियों का वितरण",
    dashRegional: "क्षेत्रीय राज्य/शहर विश्लेषण",
    dashFeed: "हालिया गुमनाम रिपोर्ट फ़ीड",
  },
  gu: {
    navHome: "હોમ",
    navReport: "સ્કેમ રિપોર્ટ કરો",
    navScan: "લિંક સ્કેન કરો",
    navDashboard: "ડેશબોર્ડ",
    navLogin: "લોગિન",
    navSignup: "સાઇન અપ",
    navAccount: "મારું એકાઉન્ટ",
    navAdmin: "એડમિન પેનલ",
    navLogout: "લોગ આઉટ",

    heroTitle: "ફ્રોડ કૉલ્સ અને",
    heroHighlight: "ફિશિંગ લિંક્સ તુરંત ઓળખો",
    heroSub: "કોઈપણ અજાણ્યા નંબરનો ફ્રોડ જોખમ સ્કોર તપાસો, શંકાસ્પદ કૉલરની રિપોર્ટ ગુજરાતી, હિન્દી કે અંગ્રેજીમાં નોંધાવો, અને ખતરનાક લિંક્સ સ્કેન કરો.",
    searchPlaceholder: "ફોન નંબર દાખલ કરો (દા.ત. +919876543210)",
    searchBtn: "જોખમ તપાસો",
    samplePrompt: "નમૂના નંબર તપાસો:",

    featureFraudTitle: "ક્રાઉડસોર્સ્ડ ફ્રોડ સ્કોર",
    featureFraudDesc: "સમુદાયના અહેવાલો અને તાજેતરના સમય આધારે સચોટ ફ્રોડ જોખમ ટકાવારી ગણે છે.",
    featureScanTitle: "ફિશિંગ લિંક સ્કેનર",
    featureScanDesc: "SMS અથવા WhatsApp પર આવેલી શંકાસ્પદ લિંક્સ ગુગલ સેફ બ્રાઉઝિંગ દ્વારા ચકાસો.",
    featureLangTitle: "પ્રાદેશિક ભાષા સપોર્ટ",
    featureLangDesc: "ગુજરાતી, હિન્દી અને અંગ્રેજીમાં સમુદાય અહેવાલો સ્થાનિક સ્કેમ્સ (ડિજિટલ એરેસ્ટ, નકલી પોલીસ, બેંક KYC) ને આવરી લે છે.",

    reportTitle: "સ્કેમ નંબરની રિપોર્ટ કરો",
    reportSub: "શંકાસ્પદ કોલ્સ અને બેંક ફ્રોડ વિશે સમુદાયને ચેતવણી આપો",
    reportPhoneLabel: "સ્કેમ ફોન નંબર",
    reportCatLabel: "સ્કેમ કેટેગરી",
    reportDescLabel: "ઘટનાની વિગત / વિગતવાર નોંધ",
    reportLangLabel: "મુખ્ય ભાષા",
    reportLocLabel: "રિપોર્ટર સ્થળ (મરજિયાત)",
    reportEvidenceLabel: "પુરાવા સ્ક્રીનશોટ (મરજિયાત)",
    reportAudioLabel: "સેવ કરેલ કોલ ઓડિયો (મરજિયાત)",
    reportSubmitBtn: "રિપોર્ટ સબમિટ કરો",

    scanTitle: "SMS અને WhatsApp ફિશિંગ સ્કેનર",
    scanSub: "ક્લિક કરતાં પહેલાં શંકાસ્પદ લિંક્સની સુરક્ષા ચકાસો",
    scanBtn: "લિંક સ્કેન કરો",

    dashTitle: "સમુદાય ફ્રોડ ડેશબોર્ડ",
    dashSub: "લાઈવ ફ્રોડ ટ્રેન્ડ્સ, ટોચની સ્કેમ કેટેગરીઝ અને પ્રાદેશિક માહિતી",
    dashCataloged: "નોંધાયેલા નંબરો",
    dashReports: "સબમિટ થયેલ રિપોર્ટ્સ",
    dashScans: "સ્કેન થયેલ લિંક્સ",
    dashCategories: "ટોચની સ્કેમ કેટેગરીઝનું વિતરણ",
    dashRegional: "પ્રાદેશિક સ્થળ પૃથક્કરણ",
    dashFeed: "તાજેતરના અનામી રિપોર્ટ્સ",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("callshield_lang") as Language;
    if (saved && (saved === "en" || saved === "hi" || saved === "gu")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("callshield_lang", lang);
  };

  const value = {
    language,
    setLanguage,
    t: TRANSLATIONS[language] || TRANSLATIONS.en,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
