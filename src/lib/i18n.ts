import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "./constants";
import { hasThaiScript, isUsableEnglish } from "./utils.ts";

export type { Lang };

const strings = {
  en: {
    appName: "KrabiMarketplace",
    tagline: "Jobs, services and classifieds in Krabi",
    welcomeHome: "Services, jobs and classifieds — Thai and English.",
    heroHeadline: "Find it locally in Krabi",
    heroSub: "Professionals, jobs and marketplace ads. Auto-translated.",
    coast: "Krabi · Thai & English",
    moduleServices: "Local professionals",
    moduleJobs: "Hire or get hired",
    moduleMarket: "Buy and sell nearby",
    latest: "Latest",
    howTitle: "How KrabiMarketplace works",
    how1: "Search",
    how1b: "Pick services, jobs or ads in your area.",
    how2: "Contact",
    how2b: "Chat in your language. We translate.",
    how3: "Agree",
    how3b: "Meet, hire or buy — directly with locals.",
    emptyFeed: "Listings from Ao Nang and Krabi Town appear here.",
    popular: "Popular in Krabi",
    discover: "Discover",
    search: "Search",
    create: "Post",
    chats: "Messages",
    account: "Profile",
    map: "Map",
    list: "List",
    all: "All",
    items: "Services",
    services: "Services",
    requests: "Wanted",
    help: "Services",
    jobs: "Jobs",
    looking: "Wanted",
    market: "Marketplace",
    free: "Free",
    paid: "Paid",
    filters: "Filters",
    district: "Area",
    category: "Category",
    nearby: "Near you",
    perDay: "per day",
    deposit: "deposit",
    available: "Open",
    lent: "Taken",
    paused: "Paused",
    active: "Open",
    verified: "Verified",
    translatedFromTh: "Automatically translated from Thai",
    translatedFromEn: "Automatically translated from English",
    showOriginal: "Show original",
    showTranslation: "Show translation",
    askToBorrow: "Ask for this",
    requestService: "Request this",
    sendMessage: "Send a message",
    bookDates: "Choose dates",
    confirmBooking: "Confirm request",
    from: "From",
    to: "To",
    messagePlaceholder: "Write a message…",
    emptyChats: "No conversations yet. Open a listing and write.",
    emptyInventory: "Nothing here yet. Post a service, job or marketplace ad.",
    myInventory: "My services",
    myServices: "My services",
    myRequests: "My wanted ads",
    myHelp: "My services",
    myJobs: "My jobs",
    myMarket: "My ads",
    reviews: "Reviews",
    reputation: "Reputation",
    completed: "Completed",
    editProfile: "Edit profile",
    save: "Save",
    cancel: "Cancel",
    name: "Name",
    phone: "Phone",
    language: "Language",
    bio: "About you",
    verify: "Verify profile",
    verifiedHint: "Add your name, area and phone to get a verified badge.",
    signIn: "Sign in",
    signUp: "Create account",
    signInTitle: "Welcome to KrabiMarketplace",
    signInBody: "Sign in to post, message and manage listings.",
    continueGoogle: "Continue with Google",
    continueX: "Continue with X",
    orEmail: "or with email",
    email: "Email",
    password: "Password",
    haveAccount: "Already have an account?",
    needAccount: "New here?",
    shareItem: "Offer a service",
    offerService: "Offer a service",
    postRequest: "Post a wanted ad",
    offerHelp: "I offer this",
    needHelp: "I’m looking for this",
    postJob: "We're hiring",
    lookingWork: "Looking for work",
    sellItem: "For sale",
    wantToBuy: "Wanted",
    title: "Title",
    description: "Description",
    photos: "Photos",
    addPhoto: "Add photo",
    condition: "Condition",
    priceDay: "Price per day (THB)",
    priceRate: "Rate (THB)",
    pricing: "Pay",
    radius: "Travel radius (km)",
    times: "Typical hours",
    type: "Type",
    translating: "Translating into Thai and English…",
    publish: "Publish",
    posting: "Publishing…",
    back: "Back",
    owner: "Listed by",
    chat: "Chat",
    bookingSent: "Request sent",
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    status: "Status",
    toggleAvail: "Open",
    editPrice: "Price",
    delete: "Remove",
    signOut: "Sign in to manage your listings",
    guestBrowse: "Browse as a guest, or sign in to post and chat.",
    searchPlaceholder: "AC repair, waiter, scooter…",
    categories: "What kind of work",
    loadError: "Could not load this just now.",
    send: "Send",
    you: "You",
    bookingConfirm: "Confirm booking",
    bookingDecline: "Decline",
    dates: "Dates",
    noMessages: "Say hello — messages are translated automatically.",
    inventoryHint: "Toggle whether this listing is open for contact.",
    stars: "stars",
    writtenIn: "Written in",
    english: "English",
    thai: "Thai",
    chooseKind: "What would you like to post?",
    kindItemHint: "A professional service you provide in Krabi.",
    kindServiceHint: "Repairs, tours, cleaning, lessons and more.",
    kindRequestHint: "Tell Krabi what you need.",
    kindHelpHint: "A professional service you provide in Krabi.",
    kindJobHint: "Hiring or looking for work — hospitality, trades, office.",
    kindMarketHint: "Buy and sell vehicles, property, boats and goods.",
    pickArea: "Choose your area",
    allAreas: "All of Krabi",
    gift: "Give away",
    sell: "For sale",
    lend: "Lend",
    hourly: "THB/hr",
    daily: "THB/day",
    monthly: "THB/mo",
    flat: "flat",
    swap: "swap",
    newListing: "New listing",
    profile: "Profile",
    bookings: "Requests",
    incoming: "Incoming",
    outgoing: "Outgoing",
    noneYet: "None yet",
    useStock: "Use a category photo",
    takePhoto: "Upload photo",
    done: "Done",
    close: "Close",
    kmAway: "km",
    viewListing: "View listing",
    openChat: "Open chat",
    required: "Required",
    minChars: "Please add a short description.",
    published: "Published — it’s live on KrabiMarketplace.",
    accountIntro: "Your services, jobs, ads and reviews.",
    memberSince: "Member since",
    contact: "Contact",
    about: "About",
    noReviews: "No reviews yet. Complete a booking to earn your first stars.",
    loginDisabled: "Sign-in is disabled.",
    passwordHint: "At least 8 characters",
    nameHint: "How others will see you",
    continue: "Continue",
    skip: "Skip",
    original: "Original",
    today: "Today",
    yesterday: "Yesterday",
    startDate: "Start",
    endDate: "End",
    total: "Total",
    requestTo: "Request to",
    reply: "Reply",
    lastSeen: "Active in Krabi",
    filterFree: "No price set",
    clearFilters: "Clear",
    results: "results",
    browseMap: "Explore the map",
    browseList: "Latest listings",
    applyNow: "Apply",
    iCanHelp: "I can help",
    iCanDoThis: "I can do this",
    askHelp: "Ask for this help",
    hiring: "Hiring",
    seeking: "Looking",
    listings: "Listings",
    tasks: "What exactly",
    tasksHint: "Tick what you offer — or what you are looking for.",
    taskGroupLabor: "Day labour & odd jobs",
    taskGroupErrands: "Errands",
    taskGroupJobs: "Hospitality & home",
    taskGroupSkills: "Trades & skills",
    offerOrWant: "Are you offering, or looking?",
    offering: "I offer this",
    lookingFor: "I'm looking for this",
    pickTasks: "Tick the boxes that apply",
    showMap: "Map",
    showList: "List",
    autoTranslated: "Auto-translated",
    admin: "Admin",
    adminIntro: "Manage listings, members and reviews.",
    adminOnly: "This area is only for KrabiMarketplace admins.",
    users: "People",
    makeAdmin: "Make admin",
    removeAdmin: "Remove admin",
    beFirst: "Post the first listing",
    portalSearch: "Search services, jobs, ads…",
    contactSeller: "Contact seller",
    facebook: "Facebook profile",
    facebookHint: "Paste a Facebook profile or Marketplace seller link. Visitors can contact them there — useful if they have no KrabiMarketplace account.",
    openFacebook: "Contact on Facebook",
    facebookConnected: "Facebook profile linked via Graph API",
    facebookLoading: "Looking up Facebook profile…",
    agents: "Grok agents",
    agentIntro: "Create a key so a Grok agent can copy Facebook Marketplace ads into KrabiMarketplace.",
    agentRotate: "Create new key",
    agentCopy: "Copy key",
    agentCopied: "Copied",
    agentActive: "Key is active",
    agentNone: "No key yet — create one, then paste it into your Grok agent.",
    agentBrief: "Copy agent brief",
    agentWarn: "Shown once. Store it in the Grok agent. Rotating replaces the old key.",
    agentGuideTitle: "How Grok bots import ads",
    agentStep1: "1. Create a key here.",
    agentStep2: "2. Copy the agent brief into a Grok agent / bot.",
    agentStep3: "3. The bot reads Facebook Marketplace and posts each ad to KrabiMarketplace.",
    agentRule1: "Use the seller’s Facebook profile link, not only the Marketplace item.",
    agentRule2: "Include the Marketplace item URL as sourceUrl so the same ad is not imported twice.",
    agentRule3: "Leave text as-is — KrabiMarketplace translates Thai and English.",
    agentFields: "Required: title. Recommended: price, photos, area, Facebook profile.",
    adminEmail: "Admin email",
  },
  th: {
    appName: "KrabiMarketplace",
    tagline: "ตลาดสองภาษาของกระบี่",
    welcomeHome: "บริการ งาน และประกาศซื้อขาย — ไทยและอังกฤษ",
    heroHeadline: "หาได้ในกระบี่",
    heroSub: "ผู้เชี่ยวชาญ งาน และประกาศซื้อขาย แปลอัตโนมัติ",
    coast: "กระบี่ · ไทยและอังกฤษ",
    moduleServices: "ผู้เชี่ยวชาญในพื้นที่",
    moduleJobs: "รับสมัครหรือหางาน",
    moduleMarket: "ซื้อขายในกระบี่",
    latest: "ล่าสุด",
    howTitle: "KrabiMarketplace ใช้ยังไง",
    how1: "ค้นหา",
    how1b: "เลือกบริการ งาน หรือประกาศในพื้นที่",
    how2: "ติดต่อ",
    how2b: "แชทภาษาของคุณ เราแปลให้",
    how3: "ตกลง",
    how3b: "นัด จ้าง หรือซื้อ กับคนในพื้นที่",
    emptyFeed: "ประกาศจากอ่าวนางและตัวเมืองกระบี่จะแสดงที่นี่",
    popular: "ยอดนิยมในกระบี่",
    discover: "ค้นพบ",
    search: "ค้นหา",
    create: "ลงประกาศ",
    chats: "ข้อความ",
    account: "โปรไฟล์",
    map: "แผนที่",
    list: "รายการ",
    all: "ทั้งหมด",
    items: "บริการ",
    services: "บริการ",
    requests: "ตามหา",
    help: "บริการ",
    jobs: "งาน",
    looking: "ตามหา",
    market: "ตลาด",
    free: "ฟรี",
    paid: "มีค่าใช้จ่าย",
    filters: "ตัวกรอง",
    district: "พื้นที่",
    category: "หมวดหมู่",
    nearby: "ใกล้คุณ",
    perDay: "ต่อวัน",
    deposit: "มัดจำ",
    available: "เปิดรับ",
    lent: "ไม่ว่าง",
    paused: "หยุดชั่วคราว",
    active: "เปิดรับงาน",
    verified: "ยืนยันแล้ว",
    translatedFromTh: "แปลอัตโนมัติจากภาษาไทย",
    translatedFromEn: "แปลอัตโนมัติจากภาษาอังกฤษ",
    showOriginal: "ดูต้นฉบับ",
    showTranslation: "ดูคำแปล",
    askToBorrow: "ส่งคำขอ",
    requestService: "ขอใช้บริการ",
    sendMessage: "ส่งข้อความ",
    bookDates: "เลือกวันที่",
    confirmBooking: "ยืนยันคำขอ",
    from: "จาก",
    to: "ถึง",
    messagePlaceholder: "พิมพ์ข้อความ…",
    emptyChats: "ยังไม่มีแชท เปิดประกาศแล้วทักได้เลย",
    emptyInventory: "ยังไม่มีรายการ ลงบริการ งาน หรือประกาศขายได้เลย",
    myInventory: "บริการของฉัน",
    myServices: "บริการของฉัน",
    myRequests: "ประกาศตามหา",
    myHelp: "บริการของฉัน",
    myJobs: "งานที่ฉันลง",
    myMarket: "ประกาศขายของฉัน",
    reviews: "รีวิว",
    reputation: "ชื่อเสียง",
    completed: "เสร็จแล้ว",
    editProfile: "แก้ไขโปรไฟล์",
    save: "บันทึก",
    cancel: "ยกเลิก",
    name: "ชื่อ",
    phone: "โทรศัพท์",
    language: "ภาษา",
    bio: "เกี่ยวกับคุณ",
    verify: "ยืนยันโปรไฟล์",
    verifiedHint: "ใส่ชื่อ พื้นที่ และเบอร์โทร เพื่อรับป้ายยืนยัน",
    signIn: "เข้าสู่ระบบ",
    signUp: "สร้างบัญชี",
    signInTitle: "ยินดีต้อนรับสู่ KrabiMarketplace",
    signInBody: "พอร์ทัลสองภาษาของกระบี่ สำหรับบริการ งาน และประกาศซื้อขาย",
    continueGoogle: "ดำเนินการต่อด้วย Google",
    continueX: "ดำเนินการต่อด้วย X",
    orEmail: "หรือใช้อีเมล",
    email: "อีเมล",
    password: "รหัสผ่าน",
    haveAccount: "มีบัญชีอยู่แล้ว?",
    needAccount: "เพิ่งเคยใช้?",
    shareItem: "เสนอบริการ",
    offerService: "เสนอบริการ",
    postRequest: "ลงประกาศตามหา",
    offerHelp: "ฉันเสนอสิ่งนี้",
    needHelp: "ฉันตามหาสิ่งนี้",
    postJob: "รับสมัคร",
    lookingWork: "หางาน",
    sellItem: "ขาย",
    wantToBuy: "รับซื้อ",
    title: "หัวข้อ",
    description: "รายละเอียด",
    photos: "รูปภาพ",
    addPhoto: "เพิ่มรูป",
    condition: "สภาพ",
    priceDay: "ราคาต่อวัน (บาท)",
    priceRate: "อัตรา (บาท)",
    pricing: "ค่าตอบแทน",
    radius: "รัศมีเดินทาง (กม.)",
    times: "ช่วงเวลาที่สะดวก",
    type: "ประเภท",
    translating: "กำลังแปลเป็นไทยและอังกฤษ…",
    publish: "เผยแพร่",
    posting: "กำลังเผยแพร่…",
    back: "ย้อนกลับ",
    owner: "ประกาศโดย",
    chat: "แชท",
    bookingSent: "ส่งคำขอแล้ว",
    pending: "รอยืนยัน",
    confirmed: "ยืนยันแล้ว",
    cancelled: "ยกเลิก",
    status: "สถานะ",
    toggleAvail: "เปิดรับ",
    editPrice: "ราคา",
    delete: "ลบ",
    signOut: "เข้าสู่ระบบเพื่อจัดการประกาศ",
    guestBrowse: "ดูประกาศได้เลย หรือเข้าสู่ระบบเพื่อลงประกาศและแชท",
    searchPlaceholder: "พนักงานเสิร์ฟ งานสวน เอกสาร แอร์…",
    categories: "งานแบบไหน",
    loadError: "โหลดไม่สำเร็จในขณะนี้",
    send: "ส่ง",
    you: "คุณ",
    bookingConfirm: "ยืนยันการจอง",
    bookingDecline: "ปฏิเสธ",
    dates: "วันที่",
    noMessages: "ทักทายได้เลย ข้อความจะถูกแปลให้อัตโนมัติ",
    inventoryHint: "เปิด-ปิดว่าประกาศนี้รับงานอยู่หรือไม่",
    stars: "ดาว",
    writtenIn: "เขียนเป็น",
    english: "อังกฤษ",
    thai: "ไทย",
    chooseKind: "ต้องการลงประกาศแบบใด?",
    kindItemHint: "บริการที่คุณทำในกระบี่",
    kindServiceHint: "ซ่อม ทัวร์ ทำความสะอาด สอน และอื่นๆ",
    kindRequestHint: "บอกกระบี่ว่าคุณต้องการอะไร",
    kindHelpHint: "บริการที่คุณทำในกระบี่",
    kindJobHint: "รับสมัครหรือหางาน — ร้านอาหาร ช่าง ออฟฟิศ",
    kindMarketHint: "ซื้อขายรถ ที่ดิน เรือ และสินค้า",
    pickArea: "เลือกพื้นที่ของคุณ",
    allAreas: "กระบี่ทั้งหมด",
    gift: "ให้ฟรี",
    sell: "ขาย",
    lend: "ให้ยืม",
    hourly: "บาท/ชม.",
    daily: "บาท/วัน",
    monthly: "บาท/เดือน",
    flat: "เหมา",
    swap: "แลก",
    newListing: "ประกาศใหม่",
    profile: "โปรไฟล์",
    bookings: "คำขอ",
    incoming: "คำขอเข้า",
    outgoing: "คำขอออก",
    noneYet: "ยังไม่มี",
    useStock: "ใช้รูปหมวดหมู่",
    takePhoto: "อัปโหลดรูป",
    done: "เสร็จ",
    close: "ปิด",
    kmAway: "กม.",
    viewListing: "ดูประกาศ",
    openChat: "เปิดแชท",
    required: "จำเป็น",
    minChars: "กรุณาใส่รายละเอียดสั้น ๆ",
    published: "เผยแพร่แล้ว แสดงบน KrabiMarketplace",
    accountIntro: "บริการ งาน ประกาศขาย และรีวิวของคุณ",
    memberSince: "สมาชิกตั้งแต่",
    contact: "ติดต่อ",
    about: "เกี่ยวกับ",
    noReviews: "ยังไม่มีรีวิว เมื่อช่วยงานเสร็จจะได้ดาวแรก",
    loginDisabled: "ระบบเข้าสู่ระบบปิดอยู่",
    passwordHint: "อย่างน้อย 8 ตัวอักษร",
    nameHint: "ชื่อที่ผู้อื่นจะเห็น",
    continue: "ต่อไป",
    skip: "ข้าม",
    original: "ต้นฉบับ",
    today: "วันนี้",
    yesterday: "เมื่อวาน",
    startDate: "เริ่ม",
    endDate: "สิ้นสุด",
    total: "รวม",
    requestTo: "ส่งคำขอถึง",
    reply: "ตอบกลับ",
    lastSeen: "ใช้งานในกระบี่",
    filterFree: "ฟรี / ช่วยกัน",
    clearFilters: "ล้าง",
    results: "รายการ",
    browseMap: "สำรวจแผนที่",
    browseList: "ประกาศล่าสุด",
    applyNow: "สมัคร",
    iCanHelp: "ช่วยได้",
    iCanDoThis: "รับงานนี้ได้",
    askHelp: "ขอความช่วยเหลือนี้",
    hiring: "รับสมัคร",
    seeking: "ตามหา",
    listings: "ประกาศ",
    tasks: "งานที่ชัดเจน",
    tasksHint: "ติ๊กสิ่งที่เสนอ — หรือสิ่งที่ตามหา",
    taskGroupLabor: "แรงงานรายวันและงานจิปาถะ",
    taskGroupErrands: "งานฝากซื้อ-ฝากทำ",
    taskGroupJobs: "ร้านอาหารและงานบ้าน",
    taskGroupSkills: "ช่างและทักษะ",
    offerOrWant: "เสนอ หรือ ตามหา?",
    offering: "ฉันเสนอสิ่งนี้",
    lookingFor: "ฉันตามหาสิ่งนี้",
    pickTasks: "ติ๊กช่องที่ตรงกับคุณ",
    showMap: "แผนที่",
    showList: "รายการ",
    autoTranslated: "แปลอัตโนมัติ",
    admin: "ผู้ดูแล",
    adminIntro: "จัดการประกาศ สมาชิก และรีวิว",
    adminOnly: "ส่วนนี้สำหรับผู้ดูแล KrabiMarketplace เท่านั้น",
    users: "สมาชิก",
    makeAdmin: "ตั้งเป็นผู้ดูแล",
    removeAdmin: "ถอดผู้ดูแล",
    beFirst: "ลงประกาศแรก",
    portalSearch: "ค้นหาบริการ งาน ประกาศ…",
    contactSeller: "ติดต่อผู้ขาย",
    facebook: "โปรไฟล์ Facebook",
    facebookHint: "วางลิงก์โปรไฟล์ Facebook หรือผู้ขาย Marketplace ผู้เยี่ยมชมติดต่อได้ที่นั่น — เหมาะถ้ายังไม่มีบัญชี KrabiMarketplace",
    openFacebook: "ติดต่อทาง Facebook",
    facebookConnected: "เชื่อมโปรไฟล์ Facebook แล้ว",
    facebookLoading: "กำลังดึงโปรไฟล์ Facebook…",
    agents: "เอเจนต์ Grok",
    agentIntro: "สร้างคีย์ให้เอเจนต์ Grok คัดลอกประกาศ Facebook Marketplace เข้า KrabiMarketplace",
    agentRotate: "สร้างคีย์ใหม่",
    agentCopy: "คัดลอกคีย์",
    agentCopied: "คัดลอกแล้ว",
    agentActive: "คีย์พร้อมใช้",
    agentNone: "ยังไม่มีคีย์ — สร้างแล้ววางในเอเจนต์ Grok",
    agentBrief: "คัดลอกคำสั่งเอเจนต์",
    agentWarn: "แสดงครั้งเดียว เก็บในเอเจนต์ Grok การสร้างใหม่จะแทนที่คีย์เก่า",
    agentGuideTitle: "วิธีให้บอท Grok นำเข้าประกาศ",
    agentStep1: "1. สร้างคีย์ที่นี่",
    agentStep2: "2. คัดลอกคำสั่งเอเจนต์ไปใส่บอท Grok",
    agentStep3: "3. บอทอ่าน Facebook Marketplace แล้วส่งเข้า KrabiMarketplace",
    agentRule1: "ใช้ลิงก์โปรไฟล์ผู้ขาย ไม่ใช่แค่โพสต์ Marketplace",
    agentRule2: "ใส่ลิงก์ประกาศ Marketplace เป็น sourceUrl เพื่อไม่ให้ซ้ำ",
    agentRule3: "ไม่ต้องแปล ข้อความ — KrabiMarketplace แปลไทย/อังกฤษเอง",
    agentFields: "จำเป็น: ชื่อเรื่อง แนะนำ: ราคา รูป พื้นที่ โปรไฟล์ Facebook",
    adminEmail: "อีเมลแอดมิน",
  },
} as const;

export type I18nKey = keyof typeof strings.en;

/** Toggle source of truth: label TH always selects locale `th`, EN always `en`. */
export const LOCALES = [
  { locale: "th" as const, label: "TH", name: "ไทย" },
  { locale: "en" as const, label: "EN", name: "English" },
] as const;

export const LOCALE_STORAGE_KEY = "krabimarketplace-lang";
export const LOCALE_COOKIE = "krabimarketplace-lang";

/** Default locale: browser/OS language starting with `th` → Thai, else English. */
export function localeFromLanguageTags(tags: readonly string[]): Lang {
  const primary = tags.find((tag) => tag.trim().length > 0);
  if (!primary) return "en";
  return primary.trim().toLowerCase().replace(/_/g, "-").startsWith("th") ? "th" : "en";
}

function detectDeviceLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  return localeFromLanguageTags([navigator.language, ...(navigator.languages ?? [])].filter(Boolean));
}

function readLocaleCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )krabimarketplace-lang=(th|en)(?:;|$)/);
  return match ? (match[1] as Lang) : null;
}

export function writeLocaleCookie(lang: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function applyDocumentLang(lang: Lang) {
  if (typeof document !== "undefined") document.documentElement.lang = lang;
}

type LangState = {
  lang: Lang;
  locked: boolean;
  setLang: (lang: Lang) => void;
  setLocale: (lang: Lang) => void;
};

function commitLang(lang: Lang): Pick<LangState, "lang" | "locked"> {
  applyDocumentLang(lang);
  writeLocaleCookie(lang);
  return { lang, locked: true };
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => {
      const setLang = (lang: Lang) => set(commitLang(lang));
      return {
        lang: "en",
        locked: false,
        setLang,
        setLocale: setLang,
      };
    },
    {
      name: LOCALE_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        const current = useLangStore.getState();
        if (current.locked || state?.locked) {
          applyDocumentLang(current.lang);
          writeLocaleCookie(current.lang);
          return;
        }
        const next = readLocaleCookie() ?? detectDeviceLang();
        const locked = Boolean(readLocaleCookie());
        useLangStore.setState({ lang: next, locked });
        applyDocumentLang(next);
        if (locked) writeLocaleCookie(next);
      },
    },
  ),
);

export function t(lang: Lang, key: I18nKey): string {
  const dict = lang === "th" ? strings.th : strings.en;
  return dict[key] ?? strings.en[key];
}

export function useT() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  return {
    lang,
    locale: lang,
    t: (key: I18nKey) => t(lang, key),
    setLang,
    setLocale: setLang,
  };
}

function nonemptyText(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export { isUsableEnglish };

/**
 * Column unswap helper for server restore only. Display uses `loc()` which reads
 * title_th / title_en as stored.
 */
export function bilingualPair(th: string, en: string): { th: string; en: string } {
  const thIsThai = hasThaiScript(th);
  const enIsThai = hasThaiScript(en);
  const thai = thIsThai ? th : enIsThai ? en : th;
  const english = enIsThai ? (thIsThai ? "" : th) : en;
  return { th: thai, en: english };
}

/** Fill `*_en` only when the English field is missing, blank, or a copy of Thai. */
export function needsEnglishOverlay(th: string, en: string): boolean {
  const thai = nonemptyText(th);
  const english = nonemptyText(en);
  if (!thai || !hasThaiScript(thai)) return false;
  if (!english) return true;
  if (english === thai) return true;
  return false;
}

/**
 * locale=th → Thai original. locale=en → English overlay when present and
 * non-empty (Thai place names allowed), else Thai fallback.
 */
export function loc(lang: Lang, th: string, en: string): string {
  const thai = nonemptyText(th);
  const english = nonemptyText(en);
  if (lang === "th") return thai || english;
  return english || thai;
}

export function initDeviceLanguage() {
  if (typeof window === "undefined") return;
  const state = useLangStore.getState();
  if (state.locked) return;
  const fromCookie = readLocaleCookie();
  if (fromCookie) {
    useLangStore.setState(commitLang(fromCookie));
    return;
  }
  const next = detectDeviceLang();
  if (state.lang !== next) useLangStore.setState({ lang: next, locked: false });
  applyDocumentLang(next);
}
