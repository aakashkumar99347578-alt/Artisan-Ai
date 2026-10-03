import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'hi' | 'gu' | 'bn' | 'ta' | 'mr';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Nav & Brand
    'nav.brand_tag': 'Direct Artisan Marketplace',
    'nav.explore': 'Explore Marketplace',
    'nav.clusters': 'Craft Clusters & States',
    'nav.ai_studio': 'AI Artisan Studio',
    'nav.b2b': 'B2B Wholesale Quotes',
    'nav.track_orders': 'Order Tracking',
    'nav.dashboard': 'My Dashboard',
    'nav.cart': 'Cart',
    'nav.wishlist': 'Wishlist',
    'nav.sign_in': 'Sign In / Register',
    'nav.sign_out': 'Sign Out',
    'nav.role': 'Current Role',
    'nav.switch_role': 'Switch Account Role',

    // Hero
    'hero.badge': '100% Authentic Handcrafted Heritage',
    'hero.title': 'From Master Artisan Kilns & Looms Direct to Your Home',
    'hero.subtitle': 'Bridge India’s ancient craft heritage with conscious buyers. Fair-trade verified terracotta, handloom silks, blue pottery, and tribal metalcraft.',
    'hero.voice_cta': 'Voice AI Product Listing',
    'hero.explore_cta': 'Explore Craft Catalog',
    'hero.stat_artisans': 'Verified Master Artisans',
    'hero.stat_clusters': 'Regional Craft Clusters',
    'hero.stat_gi': 'GI Authenticity Certified',

    // Catalog & Filters
    'catalog.title': 'Authentic Handcrafted Treasures',
    'catalog.search_placeholder': 'Search crafts by name, material, state (e.g. Terracotta, Banarasi, Jaipur)...',
    'catalog.filter_all': 'All Crafts',
    'catalog.filter_pottery': 'Pottery & Ceramics',
    'catalog.filter_textiles': 'Handloom & Textiles',
    'catalog.filter_metal': 'Metalcraft & Dhokra',
    'catalog.filter_wood': 'Woodcraft & Carving',
    'catalog.filter_paintings': 'Traditional Paintings',
    'catalog.filter_leather': 'Leather & Stone',
    'catalog.sort': 'Sort by',
    'catalog.sort_featured': 'Featured Masterpieces',
    'catalog.sort_price_low': 'Price: Low to High',
    'catalog.sort_price_high': 'Price: High to Low',
    'catalog.sort_popular': 'Highest Rated',
    'catalog.add_cart': 'Add to Cart',
    'catalog.buy_now': 'Buy Now',
    'catalog.b2b_quote': 'Wholesale B2B Quote',
    'catalog.gi_certified': 'GI Certified',
    'catalog.by_artisan': 'By Master Artisan',

    // Order Tracking & Kiln/Loom
    'tracker.title': 'Real-Time Artisan Craft Tracker',
    'tracker.subtitle': 'Watch your unique handmade treasure journey from the artisan’s kiln/loom to your doorstep',
    'tracker.stage_kiln': 'At Kiln / Handloom',
    'tracker.stage_kiln_desc': 'Artisan handcrafting, wheel turning, or wood kiln baking in progress',
    'tracker.stage_gi': 'GI Tagging & Quality',
    'tracker.stage_gi_desc': 'Master inspection, GI seal affixation, and protective eco-packaging',
    'tracker.stage_transit': 'Dispatched in Transit',
    'tracker.stage_transit_desc': 'Dispatched from artisan cluster with live courier logistics tracking',
    'tracker.stage_delivered': 'Delivered to Doorstep',
    'tracker.stage_delivered_desc': 'Received with signed Certificate of Authenticity',
    'tracker.artisan_workshop': 'Workshop Location',
    'tracker.live_status': 'Live Workshop Status',
    'tracker.temp_metric': 'Craft Process Metric',
    'tracker.courier_partner': 'Courier Partner',
    'tracker.tracking_code': 'Tracking ID',
    'tracker.est_delivery': 'Estimated Delivery',
    'tracker.certificate_btn': 'View Certificate of Authenticity',
    'tracker.simulate_advance': 'Simulate Next Production Milestone',
    'tracker.all_stages': 'All 4 Production Milestones',

    // Customer Dashboard
    'dash.welcome': 'Namaste',
    'dash.orders': 'My Orders & Tracking',
    'dash.inquiries': 'B2B Inquiries & Quotes',
    'dash.wishlist': 'Saved Wishlist',
    'dash.profile': 'Buyer Account Profile',
    'dash.no_orders': 'No orders placed yet',
    'dash.no_orders_sub': 'Explore our marketplace to order directly from master artisans.',
    'dash.track_live': 'Live Artisan Tracking',

    // Auth Screen
    'auth.title_signin': 'Sign In to KalaSetu',
    'auth.title_signup': 'Create KalaSetu Account',
    'auth.subtitle': 'Access direct master artisan crafts, B2B wholesale quotes, and real-time order tracking.',
    'auth.tab_signin': 'Sign In',
    'auth.tab_signup': 'Register New User',
    'auth.email_phone': 'Email Address or Mobile Number',
    'auth.full_name': 'Full Legal Name',
    'auth.password': 'Password (min. 6 characters)',
    'auth.role_select': 'Select Account Type',
    'auth.role_customer': 'Retail Customer / Craft Lover',
    'auth.role_artisan': 'Master Artisan / Craft Producer',
    'auth.role_b2b': 'B2B Retail Partner / Boutique',
    'auth.role_admin': 'Platform Administrator',
    'auth.business_name': 'Business / Store Name (Optional)',
    'auth.state_select': 'State / Indian Region',
    'auth.btn_signin': 'Sign In & Enter Marketplace',
    'auth.btn_signup': 'Register Account & Save to Database',
    'auth.db_status': 'Database Storage Engine',
    'auth.db_saved': 'Saved permanently to Database',
    'auth.users_count': 'Total Registered Users in Database',
  },
  hi: {
    // Nav & Brand
    'nav.brand_tag': 'प्रत्यक्ष हस्तशिल्प बाज़ार',
    'nav.explore': 'बाज़ार अन्वेषण करें',
    'nav.clusters': 'शिल्प समूह एवं राज्य',
    'nav.ai_studio': 'एआई कारीगर स्टूडियो',
    'nav.b2b': 'थोक B2B कोटेशन',
    'nav.track_orders': 'ऑर्डर ट्रैकिंग',
    'nav.dashboard': 'मेरा डैशबोर्ड',
    'nav.cart': 'झोली (कार्ट)',
    'nav.wishlist': 'पसंदीदा सूची',
    'nav.sign_in': 'लॉग इन / पंजीकरण',
    'nav.sign_out': 'लॉग आउट',
    'nav.role': 'वर्तमान भूमिका',
    'nav.switch_role': 'खाता भूमिका बदलें',

    // Hero
    'hero.badge': '100% प्रामाणिक भारतीय हस्तकला विरासत',
    'hero.title': 'शिल्पकार की भट्टी और करघे से सीधे आपके द्वार',
    'hero.subtitle': 'भारत की प्राचीन शिल्पकला को जागरूक ग्राहकों से जोड़ें। जीआई टैग प्रमाणित टेराकोटा, हथकरघा बनारसी रेशम, जयपुर ब्लू पॉटरी एवं जनजातीय ढोकरा शिल्प।',
    'hero.voice_cta': 'आवाज़ से उत्पाद सूची बनाएं',
    'hero.explore_cta': 'शिल्प सूची देखें',
    'hero.stat_artisans': 'सत्यापित उस्ताद कारीगर',
    'hero.stat_clusters': 'पारंपरिक शिल्प समूह',
    'hero.stat_gi': 'जीआई प्रामाणिकता प्रमाणित',

    // Catalog & Filters
    'catalog.title': 'प्रामाणिक हस्तनिर्मित कृतियाँ',
    'catalog.search_placeholder': 'शिल्प नाम, सामग्री, राज्य से खोजें (जैसे टेराकोटा, बनारसी, जयपुर)...',
    'catalog.filter_all': 'सभी शिल्पकलाएँ',
    'catalog.filter_pottery': 'मिट्टी के बर्तन व सेरामिक',
    'catalog.filter_textiles': 'हथकरघा व वस्त्र',
    'catalog.filter_metal': 'धातुशिल्प व ढोकरा',
    'catalog.filter_wood': 'काष्ठशिल्प व नक्काशी',
    'catalog.filter_paintings': 'पारंपरिक चित्रकला',
    'catalog.filter_leather': 'चर्मशिल्प व प्रस्तर',
    'catalog.sort': 'क्रमबद्ध करें',
    'catalog.sort_featured': 'विशेष उत्कृष्ट कृतियाँ',
    'catalog.sort_price_low': 'मूल्य: कम से अधिक',
    'catalog.sort_price_high': 'मूल्य: अधिक से कम',
    'catalog.sort_popular': 'सर्वोच्च रेटेड',
    'catalog.add_cart': 'झोली में जोड़ें',
    'catalog.buy_now': 'अभी खरीदें',
    'catalog.b2b_quote': 'थोक B2B भाव मांगें',
    'catalog.gi_certified': 'जीआई प्रमाणित',
    'catalog.by_artisan': 'शिल्पकार द्वारा निर्मित',

    // Order Tracking & Kiln/Loom
    'tracker.title': 'लाइव कारीगर ऑर्डर ट्रैकर',
    'tracker.subtitle': 'शिल्पकार की भट्टी/करघे से लेकर आपके घर तक की प्रामाणिक यात्रा लाइव देखें',
    'tracker.stage_kiln': 'भट्टी / करघे पर निर्माण',
    'tracker.stage_kiln_desc': 'शिल्पकार द्वारा चाक पर ढलाई, हथकरघा बुनाई या पारंपरिक मिट्टी भट्टी में पकाई जारी',
    'tracker.stage_gi': 'जीआई टैगिंग एवं गुणवत्ता परीक्षण',
    'tracker.stage_gi_desc': 'उस्ताद शिल्पी द्वारा गुणवत्ता जांच, जीआई होलोग्राम सील और सुरक्षित पैकेजिंग',
    'tracker.stage_transit': 'कूरियर द्वारा परिवहन में',
    'tracker.stage_transit_desc': 'कारीगर गांव/क्लस्टर से रवाना, लाइव कूरियर ट्रैकिंग कोड सक्रिय',
    'tracker.stage_delivered': 'द्वार तक सफलतापूर्वक प्राप्त',
    'tracker.stage_delivered_desc': 'हस्ताक्षरित प्रामाणिकता प्रमाणपत्र (Certificate of Authenticity) सहित प्राप्त',
    'tracker.artisan_workshop': 'शिल्पकार कार्यशाला',
    'tracker.live_status': 'कार्यशाला से लाइव स्थिति',
    'tracker.temp_metric': 'प्रक्रिया मापदंड (Metric)',
    'tracker.courier_partner': 'कूरियर सहयोगी',
    'tracker.tracking_code': 'ट्रैकिंग आईडी',
    'tracker.est_delivery': 'अनुमानित डिलीवरी',
    'tracker.certificate_btn': 'प्रामाणिकता प्रमाणपत्र देखें',
    'tracker.simulate_advance': 'अगला निर्माण चरण सिम्युलेट करें',
    'tracker.all_stages': 'सभी 4 निर्माण चरण',

    // Customer Dashboard
    'dash.welcome': 'नमस्ते',
    'dash.orders': 'मेरे ऑर्डर एवं लाइव ट्रैकिंग',
    'dash.inquiries': 'थोक पूछताछ एवं कोटेशन',
    'dash.wishlist': 'सहेजी गई पसंदीदा सूची',
    'dash.profile': 'क्रेता प्रोफ़ाइल विवरण',
    'dash.no_orders': 'अभी तक कोई ऑर्डर नहीं दिया गया',
    'dash.no_orders_sub': 'कारीगरों से सीधे हस्तनिर्मित उत्पाद ऑर्डर करने के लिए बाज़ार देखें।',
    'dash.track_live': 'लाइव शिल्पकला ट्रैकिंग',

    // Auth Screen
    'auth.title_signin': 'कलासेतु में लॉग इन करें',
    'auth.title_signup': 'कलासेतु पर नया खाता बनाएं',
    'auth.subtitle': 'सत्यापित कारीगरों से सीधे जुड़ें, थोक कोटेशन प्राप्त करें और ऑर्डर ट्रैक करें।',
    'auth.tab_signin': 'लॉग इन करें',
    'auth.tab_signup': 'नया खाता पंजीकृत करें',
    'auth.email_phone': 'ईमेल पता या मोबाइल नंबर',
    'auth.full_name': 'पूरा कानूनी नाम',
    'auth.password': 'पासवर्ड (न्यूनतम 6 अक्षर)',
    'auth.role_select': 'खाता प्रकार चुनें',
    'auth.role_customer': 'खुदरा ग्राहक / कला प्रेमी',
    'auth.role_artisan': 'उस्ताद कारीगर / उत्पादक',
    'auth.role_b2b': 'थोक व्यापारी / बुटीक पार्टनर',
    'auth.role_admin': 'सिस्टम प्रशासक',
    'auth.business_name': 'फर्म / व्यवसाय का नाम (वैकल्पिक)',
    'auth.state_select': 'राज्य / क्षेत्र चुनें',
    'auth.btn_signin': 'लॉग इन करें और बाज़ार में प्रवेश करें',
    'auth.btn_signup': 'खाता बनाएं और डेटाबेस में सुरक्षित करें',
    'auth.db_status': 'डेटाबेस स्टोरेज इंजन',
    'auth.db_saved': 'डेटाबेस में स्थायी रूप से सुरक्षित',
    'auth.users_count': 'डेटाबेस में कुल पंजीकृत खाते',
  },
  gu: {
    'nav.brand_tag': 'સીધા કારીગરનું બજાર',
    'nav.explore': 'બજારનું અન્વેષણ કરો',
    'nav.clusters': 'હસ્તકલા ક્લસ્ટર્સ',
    'nav.ai_studio': 'એઆઈ કારીગર સ્ટુડિયો',
    'nav.b2b': 'જથ્થાબંધ B2B ભાવપત્રક',
    'nav.track_orders': 'ઓર્ડર ટ્રેકિંગ',
    'nav.dashboard': 'મારું ડેશબોર્ડ',
    'nav.cart': 'ટોપલી (કાર્ટ)',
    'nav.wishlist': 'પસંદગી યાદી',
    'nav.sign_in': 'સાઇન ઇન / રજીસ્ટર',
    'nav.sign_out': 'સાઇન આઉટ',
    'hero.badge': '100% અધિકૃત ભારતીય હસ્તકલા',
    'hero.title': 'કારીગરની ભઠ્ઠી અને સાળ પરથી સીધું તમારા દ્વારે',
    'hero.subtitle': 'ગુજરાત અને ભારતના સમૃદ્ધ વારસાને સીધા કારીગરો પાસેથી ખરીદો. પટોળા, ટેરાકોટા અને કચ્છ ભરતકામ.',
    'hero.explore_cta': 'હસ્તકલા સંગ્રહ જુઓ',
    'catalog.title': 'અધિકૃત હાથબનાવટ વસ્તુઓ',
    'tracker.title': 'લાઈવ કારીગર ઓર્ડર ટ્રેકિંગ',
    'tracker.stage_kiln': 'ભઠ્ઠી / સાળ પર નિર્માણ',
    'tracker.stage_gi': 'જીઆઈ પ્રમાણપત્ર અને ગુણવત્તા',
    'tracker.stage_transit': 'કુરિયર મારફતે પરિવહનમાં',
    'tracker.stage_delivered': 'સફળતાપૂર્વક પહોંચાડેલ',
    'dash.orders': 'મારા ઓર્ડર અને ટ્રેકિંગ',
    'dash.welcome': 'નમસ્તે',
    'auth.tab_signin': 'સાઇન ઇન',
    'auth.tab_signup': 'નવો વપરાશકર્તા રજીસ્ટર કરો',
    'auth.btn_signup': 'ખાતું બનાવી ડેટાબેઝમાં સાચવો',
  },
  bn: {
    'nav.brand_tag': 'সরাসরি কারিগর বাজার',
    'nav.explore': 'মার্কেটপ্লেস দেখুন',
    'nav.clusters': 'ঐতিহ্যবাহী কারুশিল্প ক্লাস্টার',
    'nav.ai_studio': 'এআই কারিগর স্টুডিও',
    'nav.b2b': 'পাইকারি B2B কোটেশন',
    'nav.track_orders': 'অর্ডার ট্র্যাকিং',
    'nav.dashboard': 'আমার ড্যাশবোর্ড',
    'nav.cart': 'ঝুলি (কার্ট)',
    'nav.wishlist': 'পছন্দের তালিকা',
    'nav.sign_in': 'সাইন ইন / নিবন্ধন',
    'nav.sign_out': 'সাইন আউট',
    'hero.badge': '১০০% খাঁটি ঐতিহ্যবাহী হস্তশিল্প',
    'hero.title': 'কারিগরদের ভাঁটি ও তাঁত থেকে সরাসরি আপনার দরজায়',
    'hero.subtitle': 'বিষ্ণুপুরের টেরাকোটা ঘোড়া থেকে শান্তিপুরী তাঁতের শাড়ি—সরাসরি মাস্টার কারিগরদের থেকে সংগ্রহ করুন।',
    'hero.explore_cta': 'শিল্পকর্ম দেখুন',
    'catalog.title': 'খাঁটি হস্তশিল্প নিদর্শন',
    'tracker.title': 'লাইভ কারিগর অর্ডার ট্র্যাকার',
    'tracker.stage_kiln': 'ভাঁটি / তাঁতে নির্মাণাধীন',
    'tracker.stage_gi': 'জিআই ট্যাগ ও মান যাচাই',
    'tracker.stage_transit': 'কুরিয়ার মারফত পাঠানো হচ্ছে',
    'tracker.stage_delivered': 'সফলভাবে পৌঁছেছে',
    'dash.orders': 'আমার অর্ডার ও ট্র্যাকিং',
    'dash.welcome': 'নমস্কার',
    'auth.tab_signin': 'লগ ইন করুন',
    'auth.tab_signup': 'নতুন অ্যাকাউন্ট নিবন্ধন করুন',
    'auth.btn_signup': 'অ্যাকাউন্ট তৈরি করে ডেটাবেজে সংরক্ষণ করুন',
  },
  ta: {
    'nav.brand_tag': 'நேரடி கைவினைஞர் சந்தை',
    'nav.explore': 'சந்தையை காண்க',
    'nav.clusters': 'கைவினைக் குழுமங்கள்',
    'nav.ai_studio': 'ஏஐ கைவினைஞர் ஸ்டுடியோ',
    'nav.b2b': 'மொத்த விற்பனை B2B மேற்கோள்',
    'nav.track_orders': 'ஆர்டர் கண்காணிப்பு',
    'nav.dashboard': 'என் கட்டுப்பாட்டகம்',
    'nav.cart': 'கூடை (கார்ட்)',
    'nav.wishlist': 'விருப்பப்பட்டியல்',
    'nav.sign_in': 'உள்நுழைக / பதிவு செய்க',
    'nav.sign_out': 'வெளியேறுக',
    'hero.badge': '100% உண்மையான பாரம்பரிய கைவினைப்பொருட்கள்',
    'hero.title': 'கைவினைஞரின் சூளை மற்றும் தறியிலிருந்து உங்கள் இல்லத்திற்கு',
    'hero.subtitle': 'தஞ்சாவூர் தட்டுகள், காஞ்சிபுரம் பட்டு, சுவாமிமலை வெண்கலச் சிலைகளை நேரடியாகப் பெறுங்கள்.',
    'hero.explore_cta': 'பொருட்களை காண்க',
    'catalog.title': 'பாரம்பரிய கைவினைப் படைப்புகள்',
    'tracker.title': 'நேரடி கைவினைஞர் ஆர்டர் கண்காணிப்பு',
    'tracker.stage_kiln': 'சூளை / தறியில் உருவாக்கம்',
    'tracker.stage_gi': 'ஜிஐ குறிச்சொல் மற்றும் தரம்',
    'tracker.stage_transit': 'போக்குவரத்தில் உள்ளது',
    'tracker.stage_delivered': 'வெற்றிகரமாக வழங்கப்பட்டது',
    'dash.orders': 'எனது ஆர்டர்கள் மற்றும் கண்காணிப்பு',
    'dash.welcome': 'வணக்கம்',
    'auth.tab_signin': 'உள்நுழைக',
    'auth.tab_signup': 'புதிய கணக்கை பதிவு செய்க',
    'auth.btn_signup': 'கணக்கை உருவாக்கி தரவுத்தளத்தில் சேமிக்கவும்',
  },
  mr: {
    'nav.brand_tag': 'थेट कारागीर बाजारपेठ',
    'nav.explore': 'बाजारपेठ पहा',
    'nav.clusters': 'शिल्पकला केंद्रे',
    'nav.ai_studio': 'एआय कारागीर स्टुडिओ',
    'nav.b2b': 'घाऊक B2B कोटेशन',
    'nav.track_orders': 'ऑर्डर ट्रॅकिंग',
    'nav.dashboard': 'माझे डॅशबोर्ड',
    'nav.cart': 'खरेदी झोळी (कार्ट)',
    'nav.wishlist': 'आवडती यादी',
    'nav.sign_in': 'साइन इन / नोंदणी',
    'nav.sign_out': 'साइन आउट',
    'hero.badge': '१००% अस्सल हस्तकला वारसा',
    'hero.title': 'कारागिरांच्या भट्टी आणि मागावरून थेट तुमच्या घरापर्यंत',
    'hero.subtitle': 'पैठणी साड्या, कोल्हापुरी चप्पल आणि वारली चित्रे थेट पारंपरिक कारागिरांकडून खरेदी करा.',
    'hero.explore_cta': 'हस्तकला संग्रह पहा',
    'catalog.title': 'अस्सल हस्तनिर्मित कलाकृती',
    'tracker.title': 'थेट कारागीर ऑर्डर ट्रॅकर',
    'tracker.stage_kiln': 'भट्टी / मागावर निर्मिती',
    'tracker.stage_gi': 'जीआय मानांकन व तपासणी',
    'tracker.stage_transit': 'कुरिअरने वाहतुकीत',
    'tracker.stage_delivered': 'सुरक्षितपणे पोहोचले',
    'dash.orders': 'माझ्या ऑर्डर्स आणि ट्रॅकिंग',
    'dash.welcome': 'नमस्कार',
    'auth.tab_signin': 'साइन इन करा',
    'auth.tab_signup': 'नवीन खाते नोंदणी करा',
    'auth.btn_signup': 'खाते तयार करून डेटाबेसमध्ये जतन करा',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  isHindiOrRegional: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  isHindiOrRegional: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('kalasetu_app_language') as LanguageCode;
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
    } catch (e) {}
    return 'en';
  });

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    try {
      localStorage.setItem('kalasetu_app_language', code);
    } catch (e) {}
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    if (TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  const isHindiOrRegional = language !== 'en';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isHindiOrRegional }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
