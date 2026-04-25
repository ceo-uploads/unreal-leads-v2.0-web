import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "product_name": "Unreal Leads v2.0",
      "tagline": "Premium American Leads",
      "nav": {
        "market": "Market",
        "dashboard": "Dashboard",
        "profile": "Profile",
        "admin": "Admin"
      },
      "auth": {
        "login": "Login",
        "signup": "Sign Up",
        "forgot_password": "Forgot Password?",
        "logout": "Logout"
      },
      "payment": {
        "title": "Secure Checkout",
        "methods": {
          "bkash": "bKash",
          "nagad": "Nagad",
          "nsave": "Nsave",
          "gpay": "Google Pay",
          "binance": "Binance (USDT)"
        },
        "instructions1": "Please select 'Send Money' for bKash/Nagad payments. And give correct Trsnsection ID",
        "instructions2": "Enter Your WhatsApp Number For Delivery, and check your email after payment completion",
        "whatsapp_label": "WhatsApp Number",
        "email_label": "Email Address",
        "proceed": "Proceed to Payment",
        "waiting": "Waiting for confirmation..."
      },
      "subscription": {
        "title": "Choose your plan",
        "week_1": "1 Week",
        "week_2": "2 Weeks",
        "month_1": "1 Month",
        "month_2": "2 Months",
        "month_6": "6 Months",
        "year_1": "1 Year",
        "lifetime": "Lifetime"
      },
      "dashboard": {
        "welcome": "Hello",
        "balance": "Balance",
        "deposit": "Deposit",
        "status_active": "Package Status: Active",
        "status_inactive": "Status: Inactive",
        "term_ends": "Term Ends",
        "invoices": "Invoices",
        "market_access": "Market Access",
        "security_events": "Security Events",
        "purchased_total": "Purchased Total",
        "active_leads": "Active Leads",
        "notifications": "Notifications",
        "membership_required": "Membership Required",
        "membership_desc": "Active license required to synchronize with the lead processing infrastructure.",
        "purchase_package": "Purchase Package",
        "extraction_logs": "Lead Extraction Logs",
        "full_export": "Full Export",
        "no_activity": "No activity signature detected",
        "no_activity_desc": "Records will populate upon successful authentication and query execution in the market View."
      },
      "market": {
        "hero_badge": "Premium Access",
        "hero_title": "UNREAL LEADS v2.0",
        "hero_desc": "Exploit the power of 4 Million verified American leads. Detailed information across every state and industry. Scale your business with high-conversion data.",
        "stats_users": "Platform Users",
        "stats_leads": "Available Leads",
        "stats_success": "Success Rate",
        "stats_verified": "Live Data Verified",
        "plans_title": "Subscription Packages",
        "plans_subtitle": "Unlock 4M+ American Records",
        "plan_popular": "Most Popular",
        "purchase_now": "PURCHASE NOW",
        "lifetime_title": "Lifetime",
        "lifetime_badge": "Enterprise Access",
        "lifetime_desc": "Dedicated support, custom filters, and full bulk export capability.",
        "contact_team": "CONTACT TEAM",
        "explorer_title": "Leads Explorer",
        "locked_title": "Full Discovery Locked",
        "locked_desc": "You must have an active subscription to access the Unreal Leads v2.0 database and search filters.",
        "go_to_plans": "Go to Plans"
      }
    }
  },
  bn: {
    translation: {
      "product_name": "আনরিয়েল লিডস v2.0",
      "tagline": "প্রিমিয়াম আমেরিকান লিডস",
      "nav": {
        "market": "মার্কেট",
        "dashboard": "ড্যাশবোর্ড",
        "profile": "প্রোফাইল",
        "admin": "এডমিন"
      },
      "auth": {
        "login": "লগইন",
        "signup": "সাইন আপ",
        "forgot_password": "পাসওয়ার্ড ভুলে গেছেন?",
        "logout": "লগ আউট"
      },
      "payment": {
        "title": "নিরাপদ চেকআউট",
        "methods": {
          "bkash": "বিকাশ",
          "nagad": "নগদ",
          "nsave": "এনসেভ",
          "gpay": "গুগল পে",
          "binance": "বাইনেন্স (USDT)"
        },
        "instructions": "বিকাশ/নগদ পেমেন্টের জন্য দয়া করে 'Send Money' নির্বাচন করুন।",
        "whatsapp_label": "হোয়াটসঅ্যাপ নম্বর",
        "email_label": "ইমেইল অ্যাড্রেস",
        "proceed": "পেমেন্ট সম্পন্ন করুন",
        "waiting": "নিশ্চিতকরণের জন্য অপেক্ষা করা হচ্ছে...",
        "success": "অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। এডমিন আপনার পেমেন্ট যাচাই করবেন।"
      },
      "subscription": {
        "title": "আপনার প্ল্যান নির্বাচন করুন",
        "week_1": "১ সপ্তাহ",
        "week_2": "২ সপ্তাহ",
        "month_1": "১ মাস",
        "month_2": "২ মাস",
        "month_6": "৬ মাস",
        "year_1": "১ বছর",
        "lifetime": "আজীবন"
      },
      "dashboard": {
        "welcome": "হ্যালো",
        "balance": "ব্যালেন্স",
        "deposit": "ডিপোজিট",
        "status_active": "প্যাকেজ স্ট্যাটাস: সক্রিয়",
        "status_inactive": "স্ট্যাটাস: নিষ্ক্রিয়",
        "term_ends": "মেয়াদ শেষ",
        "invoices": "ইনভয়েস",
        "market_access": "মার্কেট অ্যাক্সেস",
        "security_events": "নিরাপত্তা ইভেন্ট",
        "purchased_total": "মোট ক্রয়",
        "active_leads": "সক্রিয় লিডস",
        "notifications": "নোটিফিকেশন",
        "membership_required": "মেম্বারশিপ প্রয়োজন",
        "membership_desc": "লিড প্রসেসিং ইনফ্রাস্ট্রাকচারের সাথে সিন্ক্রোনাইজ করতে সক্রিয় লাইসেন্স প্রয়োজন।",
        "purchase_package": "প্যাকেজ কিনুন",
        "extraction_logs": "লিড এক্সট্রাকশন লগ",
        "full_export": "ফুল এক্সপোর্ট",
        "no_activity": "কোন অ্যাক্টিভিটি খুঁজে পাওয়া যায়নি",
        "no_activity_desc": "সফল অথেন্টিকেশন এবং মার্কেট ভিউতে কোয়েরি এক্সিকিউশন করার পর রেকর্ডগুলো এখানে দেখা যাবে।"
      },
      "market": {
        "hero_badge": "প্রিমিয়াম অ্যাক্সেস",
        "hero_title": "আনরিয়েল লিডস v২.০",
        "hero_desc": "৪০ লক্ষ যাচাইকৃত আমেরিকান লিডসের শক্তি ব্যবহার করুন। প্রতিটি স্টেট এবং ইন্ডাস্ট্রির বিস্তারিত তথ্য। উচ্চ-রূপান্তর ডেটা দিয়ে আপনার ব্যবসা বৃদ্ধি করুন।",
        "stats_users": "প্ল্যাটফর্ম ইউজার",
        "stats_leads": "উপলব্ধ লিডস",
        "stats_success": "সাফল্যের হার",
        "stats_verified": "লাইভ ডেটা ভেরিফাইড",
        "plans_title": "সাবস্ক্রিপশন প্যাকেজ",
        "plans_subtitle": "৪০ লক্ষ+ আমেরিকান রেকর্ড আনলক করুন",
        "plan_popular": "সবচেয়ে জনপ্রিয়",
        "purchase_now": "এখনই কিনুন",
        "lifetime_title": "আজীবন",
        "lifetime_badge": "এন্টারপ্রাইজ অ্যাক্সেস",
        "lifetime_desc": "ডেডিকেটেড সাপোর্ট, কাস্টম ফিল্টার এবং ফুল বাল্ক এক্সপোর্ট সুবিধা।",
        "contact_team": "টিমের সাথে যোগাযোগ করুন",
        "explorer_title": "লিডস এক্সপ্লোরার",
        "locked_title": "সম্পূর্ণ অ্যাক্সেস লক করা আছে",
        "locked_desc": "আনরিয়েল লিডস v২.০ ডাটাবেস এবং সার্চ ফিল্টার অ্যাক্সেস করতে আপনার একটি সক্রিয় সাবস্ক্রিপশন থাকতে হবে।",
        "go_to_plans": "প্ল্যান দেখুন"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
