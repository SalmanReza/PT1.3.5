/* Practical Hanafi-oriented prayer guidance and Hijri-day notes.
   Counts are presented with school/variant caveats where practice differs. */
export const PRAYER_GUIDANCE = {
  fajr: { rakahs: '2 Sunnah mu’akkadah + 2 Fard', bn: '২ রাকাত সুন্নাতে মুয়াক্কাদা + ২ রাকাত ফরজ', guide: 'Pray the two Sunnah rak‘ahs before the two obligatory rak‘ahs. The Fard prayer is two rak‘ahs.', guideBn: 'দুই রাকাত সুন্নাত আগে, এরপর দুই রাকাত ফরজ আদায় করুন।', history: 'The dawn prayer is one of the five prayers prescribed in the Night Journey and Ascension tradition.', historyBn: 'ফজর পাঁচ ওয়াক্ত ফরজ সালাতের একটি; ইসরা ও মিরাজের বর্ণনায় পাঁচ ওয়াক্ত সালাত ফরজ হওয়ার কথা এসেছে.' , source: 'Qur’an 17:1; Sahih al-Bukhari and Sahih Muslim, reports of al-Isra wa’l-Mi‘raj.', sourceBn: 'কুরআন ১৭:১; সহিহ বুখারি ও সহিহ মুসলিমে ইসরা-মিরাজের বর্ণনা।' },
  dhuhr: { rakahs: '4 Sunnah mu’akkadah + 4 Fard + 2 Sunnah mu’akkadah', bn: '৪ রাকাত সুন্নাতে মুয়াক্কাদা + ৪ রাকাত ফরজ + ২ রাকাত সুন্নাতে মুয়াক্কাদা', guide: 'In the common Hanafi arrangement, pray four Sunnah before the four Fard, then two Sunnah after.', guideBn: 'প্রচলিত হানাফি নিয়মে চার রাকাত সুন্নাত, চার রাকাত ফরজ, এরপর দুই রাকাত সুন্নাত পড়ুন।', history: 'Dhuhr is the midday prayer, performed after the sun passes its zenith.', historyBn: 'সূর্য মধ্যাকাশ অতিক্রম করার পর যোহরের সময় শুরু হয়।' , source: 'Sahih Muslim 612; prayer-time descriptions.', sourceBn: 'সহিহ মুসলিম ৬১২; সালাতের ওয়াক্তসংক্রান্ত বর্ণনা।' },
  jumuah: { rakahs: '4 Sunnah before + 2 Fard with the imam + 4 Sunnah after + 2 Sunnah after; optional 2 Nafl', bn: '৪ রাকাত সুন্নাত আগে + ইমামের সঙ্গে ২ রাকাত ফরজ + ৪ রাকাত সুন্নাত + ২ রাকাত সুন্নাত; অতিরিক্ত ২ রাকাত নফল ঐচ্ছিক', guide: 'On Friday, the congregational Jumu‘ah prayer replaces Dhuhr for those for whom it is obligatory. This is a common Hanafi arrangement; khutbah and local congregation time are set by the mosque.', guideBn: 'শুক্রবার যাদের ওপর জুমুআ ফরজ, তাদের জন্য জামাতের জুমুআ যোহরের পরিবর্তে আদায় হয়। এটি প্রচলিত হানাফি বিন্যাস; খুতবা ও জামাতের সময় মসজিদ নির্ধারণ করে।', history: 'The Qur’an commands believers to hasten to the remembrance of Allah when the Friday call is made (62:9).', historyBn: 'জুমুআর আহ্বান হলে আল্লাহর স্মরণের দিকে অগ্রসর হতে কুরআনে নির্দেশ দেওয়া হয়েছে (৬২:৯)।' , source: 'Qur’an 62:9; Sahih al-Bukhari 881; Sahih Muslim 850.', sourceBn: 'কুরআন ৬২:৯; সহিহ বুখারি ৮৮১; সহিহ মুসলিম ৮৫০।' },
  asr: { rakahs: '4 Sunnah ghayr mu’akkadah + 4 Fard', bn: '৪ রাকাত সুন্নাতে গায়রে মুয়াক্কাদা + ৪ রাকাত ফরজ', guide: 'The four Sunnah before Asr are recommended but not emphasised like the regular Sunnah mu’akkadah. The four Fard are obligatory.', guideBn: 'আসরের আগে চার রাকাত সুন্নাত গায়রে মুয়াক্কাদা; এরপর চার রাকাত ফরজ।', history: 'The Qur’an gives special emphasis to guarding the middle prayer (al-salat al-wusta); its identification is discussed in tafsir and hadith.', historyBn: 'কুরআনে মধ্যবর্তী সালাতের বিশেষ সংরক্ষণের নির্দেশ এসেছে; তাফসির ও হাদিসে এর ব্যাখ্যা আলোচিত।' , source: 'Qur’an 2:238; Sahih al-Bukhari and Sahih Muslim on al-salat al-wusta.', sourceBn: 'কুরআন ২:২৩৮; মধ্যবর্তী সালাত বিষয়ে সহিহ বুখারি ও মুসলিম।' },
  maghrib: { rakahs: '3 Fard + 2 Sunnah mu’akkadah', bn: '৩ রাকাত ফরজ + ২ রাকাত সুন্নাতে মুয়াক্কাদা', guide: 'Pray three obligatory rak‘ahs after sunset, followed by two regular Sunnah rak‘ahs.', guideBn: 'সূর্যাস্তের পর তিন রাকাত ফরজ, এরপর দুই রাকাত সুন্নাতে মুয়াক্কাদা আদায় করুন।', history: 'Maghrib marks the transition from daylight to night; the Islamic date begins at sunset.', historyBn: 'মাগরিবের মাধ্যমে দিনের আলো থেকে রাতের সূচনা হয়; হিজরি তারিখ সূর্যাস্তে শুরু হয়।' , source: 'Sahih al-Bukhari and Sahih Muslim, prayer-time reports.', sourceBn: 'সহিহ বুখারি ও সহিহ মুসলিমের সালাতের ওয়াক্তসংক্রান্ত হাদিস।' },
  isha: { rakahs: '4 Sunnah ghayr mu’akkadah + 4 Fard + 2 Sunnah mu’akkadah + 3 Witr wajib', bn: '৪ রাকাত সুন্নাতে গায়রে মুয়াক্কাদা + ৪ রাকাত ফরজ + ২ রাকাত সুন্নাতে মুয়াক্কাদা + ৩ রাকাত ওয়াজিব বিতর', guide: 'In Hanafi practice, pray four Fard, two regular Sunnah, then three Witr (wajib). The earlier four Sunnah are ghayr mu’akkadah.', guideBn: 'হানাফি মতে চার রাকাত ফরজ, দুই রাকাত সুন্নাত এবং তিন রাকাত ওয়াজিব বিতর আদায় করুন।', history: 'Isha is the night prayer. Its time continues until true dawn, though delaying it too late is discouraged when it risks hardship.', historyBn: 'ইশার সময় সুবহে সাদিক পর্যন্ত থাকে; তবে কষ্টের আশঙ্কা থাকলে অযথা বিলম্ব করা উচিত নয়।' , source: 'Sahih Muslim 612.', sourceBn: 'সহিহ মুসলিম ৬১২।' },
  duha: { rakahs: '2–12 rak‘ahs; commonly 2 or 4, in sets of 2', bn: '২–১২ রাকাত; সাধারণত ২ বা ৪, প্রতি ২ রাকাত করে', guide: 'Pray after the sun has risen clearly (roughly 15–20 minutes after sunrise) and before the Zawal exclusion. Ishraq is often used for its early part; Duha for the broader morning prayer.', guideBn: 'সূর্য ভালোভাবে ওঠার প্রায় ১৫–২০ মিনিট পর থেকে জাওয়ালের আগ পর্যন্ত দুই রাকাত করে পড়ুন।', history: 'The Prophet ﷺ encouraged the Duha prayer in authentic reports; its minimum is commonly taught as two rak‘ahs.', historyBn: 'সহিহ বর্ণনায় নবী ﷺ দুহার সালাতে উৎসাহ দিয়েছেন; সাধারণভাবে এর সর্বনিম্ন দুই রাকাত বলা হয়।' , source: 'Sahih Muslim 720–721 (Duha prayer reports).', sourceBn: 'সহিহ মুসলিম ৭২০–৭২১ (দুহার সালাতসংক্রান্ত বর্ণনা)।' },
  awwabin: { rakahs: '2–6 or more; pray in sets of 2 (Hanafi practice commonly 6)', bn: '২–৬ বা বেশি; প্রতি ২ রাকাত করে (হানাফি আমলে প্রচলিত ৬)', guide: 'A voluntary prayer after Maghrib. The label Awwabin and its specific virtue have differing scholarly assessments; do not treat a particular count as universally obligatory.', guideBn: 'মাগরিবের পর নফল সালাত। আওয়াবিন নাম ও নির্দিষ্ট ফজিলতের বর্ণনা নিয়ে আলেমদের মধ্যে মতভেদ আছে।', history: 'The term Awwabin is associated in reports with prayer between Maghrib and Isha; scholars differ on how those reports are applied.', historyBn: 'মাগরিব ও ইশার মধ্যবর্তী সালাতের সঙ্গে আওয়াবিন শব্দটি কিছু বর্ণনায় এসেছে; প্রয়োগ নিয়ে মতভেদ রয়েছে।' , source: 'Reports on prayer between Maghrib and Isha vary in strength; see the scholarly disagreement noted above.', sourceBn: 'মাগরিব-ইশার মধ্যবর্তী সালাতের বর্ণনার মান নিয়ে মতভেদ রয়েছে; উপরের সতর্কতা দেখুন।' },
  qiyam: { rakahs: '2 or more; in sets of 2, followed by Witr', bn: '২ বা বেশি; প্রতি ২ রাকাত করে, শেষে বিতর', guide: 'Voluntary night prayer after Isha and before Fajr. There is no single fixed total for all Muslims; pray in pairs and finish with Witr if not already prayed.', guideBn: 'ইশার পর থেকে ফজরের আগে পর্যন্ত দুই রাকাত করে পড়ুন; বিতর আগে না পড়ে থাকলে শেষে আদায় করুন।', history: 'The Qur’an praises night standing, and authentic hadith describe the Prophet’s ﷺ night prayer as being performed in pairs.', historyBn: 'কুরআনে রাতের ইবাদতের প্রশংসা করা হয়েছে; সহিহ হাদিসে জোড়া জোড়া রাকাতে রাতের সালাতের বর্ণনা রয়েছে।' , source: 'Sahih al-Bukhari 990; Sahih Muslim 749.', sourceBn: 'সহিহ বুখারি ৯৯০; সহিহ মুসলিম ৭৪৯।' },
  tahajjud: { rakahs: '2 or more; in sets of 2', bn: '২ বা বেশি; প্রতি ২ রাকাত করে', guide: 'Tahajjud is night prayer after sleeping and waking. The final third of the night is especially virtuous; calculate this from Maghrib to Fajr.', guideBn: 'ঘুমিয়ে উঠে রাতের সালাত আদায় করাকে তাহাজ্জুদ বলা হয়। মাগরিব থেকে ফজর পর্যন্ত সময়ের শেষ এক-তৃতীয়াংশ বিশেষ মর্যাদাপূর্ণ।', history: 'The Prophet ﷺ regularly stood in prayer at night; the final third is highlighted in authentic hadith.', historyBn: 'নবী ﷺ নিয়মিত রাতে সালাত আদায় করতেন; সহিহ হাদিসে রাতের শেষ তৃতীয়াংশের বিশেষ ফজিলত এসেছে।' , source: 'Sahih al-Bukhari 1145; Sahih Muslim 758 (last-third reports).', sourceBn: 'সহিহ বুখারি ১১৪৫; সহিহ মুসলিম ৭৫৮ (রাতের শেষ তৃতীয়াংশের বর্ণনা)।' },
  tarawih: { rakahs: '20 rak‘ahs in common Hanafi congregational practice; 8 is also practised by some communities', bn: 'প্রচলিত হানাফি জামাতে ২০ রাকাত; কিছু সম্প্রদায়ে ৮ রাকাতও প্রচলিত', guide: 'Prayed after Isha on Ramadan nights. It is performed in sets of 2. The app displays the local practice count as guidance, not as a condition of validity.', guideBn: 'রমজানের রাতে ইশার পর দুই রাকাত করে আদায় করা হয়। এখানে প্রচলিত আমলের সংখ্যা দেখানো হয়; এটি নামাজের শুদ্ধতার শর্ত নয়।', history: 'The Prophet ﷺ led night prayer in congregation on some Ramadan nights, then refrained from making it obligatory for the community; this is reported in Sahih al-Bukhari and Sahih Muslim.', historyBn: 'নবী ﷺ রমজানের কিছু রাতে জামাতে রাতের সালাত আদায় করিয়েছেন; উম্মতের ওপর ফরজ হয়ে যাওয়ার আশঙ্কায় নিয়মিত বের হননি—বুখারি ও মুসলিমে বর্ণিত।' , source: 'Sahih al-Bukhari 2012; Sahih Muslim 761.', sourceBn: 'সহিহ বুখারি ২০১২; সহিহ মুসলিম ৭৬১।' },
  eid_prayer: { rakahs: '2 rak‘ahs with additional takbirs; Hanafi: 6 extra takbirs', bn: 'অতিরিক্ত তাকবিরসহ ২ রাকাত; হানাফি মতে ৬টি অতিরিক্ত তাকবির', guide: 'Prayed in congregation after sunrise once the sun has risen sufficiently and before Zawal. The extra-takbir placement differs by madhhab; follow the local imam.', guideBn: 'সূর্য ওঠার পর থেকে জাওয়ালের আগে জামাতে আদায় করুন। অতিরিক্ত তাকবিরের পদ্ধতি মাজহাবভেদে ভিন্ন; স্থানীয় ইমামের অনুসরণ করুন।', history: 'The Prophet ﷺ established the two Eid prayers as public congregational observances.', historyBn: 'নবী ﷺ ঈদের দুই সালাতকে প্রকাশ্য জামাতের ইবাদত হিসেবে প্রতিষ্ঠা করেছেন।' , source: 'Sahih al-Bukhari 956; Sahih Muslim 889.', sourceBn: 'সহিহ বুখারি ৯৫৬; সহিহ মুসলিম ৮৮৯।' },
  witr: { rakahs: '3 rak‘ahs (Hanafi: wajib)', bn: '৩ রাকাত (হানাফি মতে ওয়াজিব)', guide: 'In Hanafi practice, pray three rak‘ahs together with the additional takbir and Qunut in the third rak‘ah. Other schools have different forms.', guideBn: 'হানাফি মতে তিন রাকাত একসঙ্গে; তৃতীয় রাকাতে অতিরিক্ত তাকবির ও দোয়া কুনুত। অন্য মাজহাবে পদ্ধতি ভিন্ন।', history: 'The Prophet ﷺ instructed that the night prayer be concluded with Witr; its legal classification differs among schools.', historyBn: 'নবী ﷺ রাতের সালাত বিতর দিয়ে শেষ করার নির্দেশ দিয়েছেন; এর বিধান মাজহাবভেদে ভিন্ন।' , source: 'Sahih al-Bukhari 998; Sahih Muslim 751.', sourceBn: 'সহিহ বুখারি ৯৯৮; সহিহ মুসলিম ৭৫১।' },
  tahiyyatul_masjid: { rakahs: '2 rak‘ahs', bn: '২ রাকাত', guide: 'Pray two rak‘ahs before sitting when entering a mosque, unless a restricted time or another specific ruling applies.', guideBn: 'মসজিদে প্রবেশ করে বসার আগে দুই রাকাত পড়ুন; তবে নিষিদ্ধ সময় বা বিশেষ বিধান থাকলে তা মানুন।', history: 'The instruction to pray two rak‘ahs before sitting is reported in Sahih al-Bukhari 444 and Sahih Muslim 714.', historyBn: 'বসার আগে দুই রাকাত পড়ার নির্দেশ সহিহ বুখারি ৪৪৪ ও সহিহ মুসলিম ৭১৪-এ এসেছে।', source: 'Sahih al-Bukhari 444; Sahih Muslim 714.', sourceBn: 'সহিহ বুখারি ৪৪৪; সহিহ মুসলিম ৭১৪।' },
  istikhara: { rakahs: '2 rak‘ahs', bn: '২ রাকাত', guide: 'Pray two voluntary rak‘ahs, then recite the established Istikhara supplication when deciding about a permissible matter.', guideBn: 'বৈধ কোনো বিষয়ে সিদ্ধান্তের জন্য দুই রাকাত নফল পড়ে ইস্তিখারার মাসনুন দোয়া পড়ুন।', history: 'The Prophet ﷺ taught the Companions the Istikhara supplication for decisions (Sahih al-Bukhari 1166).', historyBn: 'নবী ﷺ সাহাবিদের সিদ্ধান্তের ক্ষেত্রে ইস্তিখারার দোয়া শিক্ষা দিতেন (সহিহ বুখারি ১১৬৬)।', source: 'Sahih al-Bukhari 1166.', sourceBn: 'সহিহ বুখারি ১১৬৬।' },
  tawbah: { rakahs: '2 rak‘ahs', bn: '২ রাকাত', guide: 'After a sin, make sincere repentance and pray two voluntary rak‘ahs; the prayer does not replace the conditions of repentance.', guideBn: 'গুনাহের পর আন্তরিক তওবা করুন এবং দুই রাকাত নফল পড়ুন; সালাত তওবার শর্তগুলোর বিকল্প নয়।', history: 'The report of Abu Bakr describes a person who sins, purifies, prays two rak‘ahs and seeks forgiveness (Sunan Abi Dawud 1521; Jami‘ al-Tirmidhi 406).', historyBn: 'আবু বকর (রা.)-এর বর্ণনায় গুনাহের পর পবিত্রতা অর্জন, দুই রাকাত সালাত ও ক্ষমা প্রার্থনার কথা এসেছে (আবু দাউদ ১৫২১; তিরমিজি ৪০৬)।', source: 'Sunan Abi Dawud 1521; Jami‘ al-Tirmidhi 406.', sourceBn: 'সুনান আবু দাউদ ১৫২১; জামে তিরমিজি ৪০৬।' },
  rawatib: { rakahs: '12 regular Sunnah rak‘ahs: 2 before Fajr, 4 before Dhuhr, 2 after Dhuhr, 2 after Maghrib, 2 after Isha', bn: '১২ রাকাত সুন্নাতে মুয়াক্কাদা: ফজরের আগে ২, যোহরের আগে ৪ ও পরে ২, মাগরিবের পরে ২, ইশার পরে ২', guide: 'These are the regular Sunnah prayers associated with the five daily prayers in a well-known hadith report. The four before Dhuhr may be prayed as two plus two.', guideBn: 'হাদিসে বর্ণিত পাঁচ ওয়াক্তের নিয়মিত সুন্নাতগুলো হলো এই ১২ রাকাত। যোহরের আগের চার রাকাত দুই+দুই করেও পড়া যায়।', history: 'Umm Habibah reported the promise of a house in Paradise for one who maintains twelve voluntary rak‘ahs in a day and night (Sahih Muslim).', historyBn: 'উম্মে হাবিবা (রা.) থেকে বর্ণিত, দিনে-রাতে বারো রাকাত নফল নিয়মিত আদায়কারীর জন্য জান্নাতে ঘরের সুসংবাদ এসেছে (সহিহ মুসলিম)।', source: 'Sahih Muslim 728 (twelve regular voluntary rak‘ahs).', sourceBn: 'সহিহ মুসলিম ৭২৮ (বারো রাকাত নিয়মিত সুন্নাত)।' },
};

export const HIJRI_DAY_NOTES = {
  '1-1': { title: 'Beginning of Muharram', bn: 'মুহাররম মাসের সূচনা', detail: 'The first day of the Hijri year. No special prayer is established specifically for this date; begin the year with ordinary worship and reflection.', detailBn: 'হিজরি বছরের প্রথম দিন। এ দিনের জন্য নির্দিষ্ট কোনো বিশেষ সালাত প্রমাণিত নয়; সাধারণ ইবাদত ও আত্মসমালোচনায় বছর শুরু করুন।' },
  '1-9': { title: 'Tasu’a', bn: 'তাসুআ', detail: 'The 9th of Muharram. Fasting on this day with the 10th is recommended in the hadith tradition; no special salah is prescribed.', detailBn: 'মুহাররমের ৯ তারিখ। ১০ তারিখের সঙ্গে এ দিন রোজা রাখার ইচ্ছা নবী ﷺ প্রকাশ করেছিলেন; নির্দিষ্ট বিশেষ সালাত নেই।' },
  '1-10': { title: 'Day of Ashura', bn: 'আশুরার দিন', detail: 'Allah saved Musa and his people on this day, as reported in Sahih al-Bukhari and Muslim. Fasting is strongly recommended; many also fast the 9th or 11th.', detailBn: 'সহিহ বুখারি ও মুসলিমে বর্ণিত, এ দিনে আল্লাহ মূসা (আ.) ও তাঁর সম্প্রদায়কে মুক্তি দেন। রোজা সুন্নত; ৯ বা ১১ তারিখও সঙ্গে রাখা যায়।', source: 'Sahih al-Bukhari 2004; Sahih Muslim 1134.' },
  '3-12': { title: '12 Rabi al-Awwal', bn: '১২ রবিউল আউয়াল', detail: 'Commonly observed by some communities as Mawlid. The exact birth date is historically disputed, and observance is not universal; no special prayer is prescribed by consensus.', detailBn: 'কিছু সম্প্রদায় এ দিনকে মিলাদুন্নবী হিসেবে পালন করে। জন্মতারিখ ঐতিহাসিকভাবে মতভেদপূর্ণ; সর্বসম্মতভাবে নির্দিষ্ট কোনো বিশেষ সালাত নেই।' },
  '7-27': { title: 'Isra and Mi’raj (commonly observed date)', bn: 'ইসরা ও মিরাজ (প্রচলিত তারিখ)', detail: 'The Night Journey and Ascension are affirmed in the Qur’an and Sunnah, but assigning the event to 27 Rajab is not established with certainty. The five daily prayers were prescribed in this account.', detailBn: 'ইসরা ও মিরাজ কুরআন-সুন্নাহ দ্বারা প্রমাণিত; তবে ২৭ রজব তারিখটি নিশ্চিতভাবে সাব্যস্ত নয়। এ ঘটনার বর্ণনায় পাঁচ ওয়াক্ত সালাত ফরজ হওয়ার কথা এসেছে।' },
  '8-15': { title: 'Mid-Sha’ban', bn: 'শবে বরাত / মধ্য শাবান', detail: 'Reports about the virtue of this night are assessed differently by scholars. There is no universally agreed special prayer format or fixed rak‘ah count.', detailBn: 'এ রাতের ফজিলতসংক্রান্ত বর্ণনার গ্রহণযোগ্যতা নিয়ে আলেমদের মতভেদ রয়েছে। নির্দিষ্ট বিশেষ নামাজের পদ্ধতি বা রাকাতসংখ্যা সর্বসম্মত নয়।' },
  '9-1': { title: 'Ramadan begins', bn: 'রমজান শুরু', detail: 'Fasting becomes obligatory when Ramadan is confirmed by the accepted moon-sighting method. Taraweeh is offered after Isha during Ramadan nights.', detailBn: 'স্বীকৃত চাঁদ দেখার পদ্ধতিতে রমজান সাব্যস্ত হলে রোজা ফরজ হয়। রমজানের রাতে ইশার পর তারাবিহ পড়া হয়।' },
  '9-20': { title: 'Conquest of Makkah', bn: 'মক্কা বিজয়', detail: 'The conquest of Makkah is commonly dated to 20 Ramadan, 8 AH in historical accounts. The Prophet ﷺ entered the city with a general amnesty; exact chronology is discussed in the sira sources.', detailBn: 'সিরাতের প্রসিদ্ধ বিবরণে ৮ হিজরির ২০ রমজান মক্কা বিজয়ের তারিখ হিসেবে উল্লেখিত। নবী ﷺ সাধারণ ক্ষমার ঘোষণা দিয়ে নগরীতে প্রবেশ করেন।', source: 'Ibn Hisham, al-Sirah al-Nabawiyyah, Conquest of Makkah; al-Tabari, events of 8 AH.' },
  '9-17': { title: 'Battle of Badr', bn: 'বদরের যুদ্ধ', detail: 'The Battle of Badr took place on 17 Ramadan, 2 AH according to the well-known historical chronology. It is remembered as a decisive early event in the Muslim community.', detailBn: 'প্রসিদ্ধ ঐতিহাসিক বিবরণ অনুযায়ী ২ হিজরির ১৭ রমজান বদরের যুদ্ধ সংঘটিত হয়। মুসলিম সমাজের প্রাথমিক ইতিহাসে এটি একটি গুরুত্বপূর্ণ ঘটনা।', source: 'Qur’an 8:41; Ibn Hisham, al-Sirah al-Nabawiyyah, account of Badr.' },
  '9-27': { title: '27th Ramadan (commonly observed Laylat al-Qadr)', bn: '২৭ রমজান (প্রচলিত লাইলাতুল কদর)', detail: 'Laylat al-Qadr is in the last ten nights, especially the odd nights; the exact night is not fixed by definitive evidence. The Prophet ﷺ encouraged seeking it in all ten.', detailBn: 'লাইলাতুল কদর রমজানের শেষ দশকে, বিশেষত বিজোড় রাতে অনুসন্ধান করতে বলা হয়েছে; নির্দিষ্ট রাত নিশ্চিত নয়।' },
  '10-1': { title: 'Eid al-Fitr', bn: 'ঈদুল ফিতর', detail: 'The festival marking the end of Ramadan. Eid prayer is a two-rak‘ah congregational prayer with additional takbirs; it appears only in its morning window.', detailBn: 'রমজান শেষে ঈদুল ফিতর। অতিরিক্ত তাকবিরসহ দুই রাকাত জামাতের সালাত; অ্যাপে শুধু ঈদের সকালের সময়ে দেখাবে।' },
  '12-8': { title: 'Day of Tarwiyah', bn: 'ইয়াওমুত তারবিয়াহ', detail: 'The 8th of Dhul Hijjah marks the beginning of the main Hajj rites for many pilgrims. No separate special prayer is prescribed for everyone.', detailBn: '৮ জিলহজ বহু হাজির মূল হজের কার্যক্রমের সূচনা। সবার জন্য আলাদা কোনো বিশেষ সালাত নির্ধারিত নয়।' },
  '12-9': { title: 'Day of Arafah', bn: 'আরাফার দিন', detail: 'The central day of Hajj. Fasting is highly recommended for those not performing Hajj; pilgrims at Arafah combine Dhuhr and Asr under Hajj rulings.', detailBn: 'হজের প্রধান দিন। হাজি নন এমন ব্যক্তির জন্য রোজা অত্যন্ত ফজিলতপূর্ণ; আরাফায় অবস্থানরত হাজিরা হজের বিধান অনুযায়ী যোহর-আসর একত্রে আদায় করেন।' },
  '12-10': { title: 'Eid al-Adha', bn: 'ঈদুল আজহা', detail: 'The festival of sacrifice. Eid prayer is displayed only during its morning time window. The days of sacrifice continue through the 13th of Dhul Hijjah.', detailBn: 'কুরবানির ঈদ। ঈদের সালাত শুধু সকালের নির্ধারিত সময়ে দেখাবে; কুরবানির দিন ১৩ জিলহজ পর্যন্ত।' },
  '12-11': { title: 'Ayyam al-Tashriq', bn: 'আইয়ামে তাশরিক', detail: 'The 11th–13th of Dhul Hijjah are days of eating, drinking and remembering Allah. Fasting is prohibited on these days except for specific Hajj cases described in fiqh.', detailBn: '১১–১৩ জিলহজ খাওয়া, পান করা ও আল্লাহর জিকিরের দিন। ফিকহে বর্ণিত বিশেষ হজের ব্যতিক্রম ছাড়া এ দিনগুলোতে রোজা রাখা নিষিদ্ধ।' },
  '12-12': { title: 'Ayyam al-Tashriq', bn: 'আইয়ামে তাশরিক', detail: 'The 11th–13th of Dhul Hijjah are days of eating, drinking and remembering Allah. Fasting is prohibited on these days except for specific Hajj cases described in fiqh.', detailBn: '১১–১৩ জিলহজ খাওয়া, পান করা ও আল্লাহর জিকিরের দিন। ফিকহে বর্ণিত বিশেষ হজের ব্যতিক্রম ছাড়া এ দিনগুলোতে রোজা রাখা নিষিদ্ধ।' },
  '12-13': { title: 'Ayyam al-Tashriq', bn: 'আইয়ামে তাশরিক', detail: 'The 11th–13th of Dhul Hijjah are days of eating, drinking and remembering Allah. Fasting is prohibited on these days except for specific Hajj cases described in fiqh.', detailBn: '১১–১৩ জিলহজ খাওয়া, পান করা ও আল্লাহর জিকিরের দিন। ফিকহে বর্ণিত বিশেষ হজের ব্যতিক্রম ছাড়া এ দিনগুলোতে রোজা রাখা নিষিদ্ধ।' }
};


/* Historical revelation anchors. Al-‘Alaq 96:1–5 is widely identified as the
   first revelation. Ramadan is one reported chronology, while sources differ
   about both month and day. This record is therefore month-precision only and
   must never be presented as an exact-date match. The UI displays one verse. */
export const QURAN_REVELATION_RECORDS = [
  {
    id: 'first-revelation-al-alaq', month: 9, week: null, day: null,
    title: 'The beginning of Qur’anic revelation',
    titleBn: 'কুরআনের প্রথম ওহি',
    context: 'The opening of Surah al-‘Alaq is widely identified as the first Qur’anic revelation, received in the Cave of Hira. One historical chronology places it in Ramadan, but reports differ about both the month and the exact day. This is therefore a qualified month-level match, not a claim that it happened on this date.',
    contextBn: 'সূরা আল-আলাকের প্রথম আয়াতগুলোকে ব্যাপকভাবে প্রথম কুরআনিক ওহি হিসেবে চিহ্নিত করা হয়। একটি ঐতিহাসিক কালপঞ্জিতে এটি রমজানে নাজিল হওয়ার কথা বলা হয়েছে, তবে মাস ও নির্দিষ্ট দিন—দুটিই নিয়ে বর্ণনায় মতভেদ রয়েছে। তাই এটি সতর্কতাসহ মাসভিত্তিক মিল, আজকের তারিখে নাজিল হওয়ার দাবি নয়।',
    verse: {
      arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      translation: 'Recite in the name of your Lord who created.',
      translationBn: 'পড়ুন আপনার রবের নামে, যিনি সৃষ্টি করেছেন।',
      reference: 'Surah al-‘Alaq 96:1'
    },
    suggestion: 'Continue with Surah al-‘Alaq 96:2–5.',
    suggestionBn: 'এরপর সূরা আল-আলাক ৯৬:২–৫ পড়তে পারেন।',
    source: 'Sahih al-Bukhari 3; Sahih Muslim 160; al-Raheeq al-Makhtum, pp. 66–67. Historical reports differ on the month and day; Ramadan is one reported chronology.'
  },
  {
    id: 'ramadan-month-of-revelation', month: 9, week: null, day: null,
    title: 'Ramadan, the month of the Qur’an',
    titleBn: 'রমজান: কুরআন নাজিলের মাস',
    context: 'The Qur’an itself states that it was sent down in the month of Ramadan. This is a month-level association taught by the verse, not a claim about which verse was revealed on today’s date.',
    contextBn: 'কুরআন নিজেই জানায়, রমজান মাসে কুরআন নাজিল হয়েছে। এটি আয়াতে বর্ণিত মাসভিত্তিক সম্পর্ক; আজকের তারিখে কোন আয়াত নাজিল হয়েছিল, সে দাবি নয়।',
    verse: {
      arabic: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ',
      translation: 'The month of Ramadan in which the Qur’an was sent down as guidance for people, with clear proofs of guidance and the criterion.',
      translationBn: 'রমজান মাস, যাতে কুরআন নাজিল করা হয়েছে মানুষের জন্য হিদায়াত, হিদায়াতের সুস্পষ্ট নিদর্শন ও সত্য-মিথ্যার পার্থক্যকারী হিসেবে।',
      reference: 'Surah al-Baqarah 2:185 (opening)'
    },
    suggestion: 'Continue with the rest of Surah al-Baqarah 2:185.',
    suggestionBn: 'এরপর সূরা আল-বাকারা ২:১৮৫-এর বাকি অংশ পড়তে পারেন।',
    source: 'Qur’an 2:185.'
  },
  {
    id: 'laylat-al-qadr-revelation', month: 9, week: null, day: null,
    title: 'Sent down on the Night of Decree',
    titleBn: 'কদরের রাতে নাজিল',
    context: 'Surah al-Qadr states that the Qur’an was sent down on Laylat al-Qadr. The Prophet ﷺ told believers to seek that night in the last ten nights of Ramadan; its exact date is not fixed, so this is a month-level match.',
    contextBn: 'সূরা আল-কদরে বলা হয়েছে, কুরআন লাইলাতুল কদরে নাজিল হয়েছে। নবী ﷺ রমজানের শেষ দশ রাতে এ রাত অনুসন্ধান করতে বলেছেন; নির্দিষ্ট তারিখ স্থির নয়, তাই এটি মাসভিত্তিক মিল।',
    verse: {
      arabic: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ',
      translation: 'Indeed, We sent it down on the Night of Decree.',
      translationBn: 'নিশ্চয়ই আমি একে কদরের রাতে নাজিল করেছি।',
      reference: 'Surah al-Qadr 97:1'
    },
    suggestion: 'Continue with Surah al-Qadr 97:2–5.',
    suggestionBn: 'এরপর সূরা আল-কদর ৯৭:২–৫ পড়তে পারেন।',
    source: 'Qur’an 97:1; Sahih al-Bukhari 2017 (seek it in the odd nights of the last ten).'
  },
  {
    id: 'perfection-of-religion-arafah', month: 12, week: null, day: 9,
    title: 'Revealed on the Day of Arafah',
    titleBn: 'আরাফার দিনে নাজিল',
    context: '‘Umar ibn al-Khattab reported that this passage was revealed while the Prophet ﷺ was standing at Arafah on a Friday during the Farewell Hajj (9 Dhul Hijjah 10 AH). This is one of the few revelations with a documented day.',
    contextBn: 'উমর ইবনুল খাত্তাব (রা.) বর্ণনা করেন, বিদায় হজে (১০ হিজরির ৯ জিলহজ) শুক্রবার নবী ﷺ আরাফায় অবস্থানকালে এ অংশটি নাজিল হয়। এটি নির্দিষ্ট দিনসহ নথিভুক্ত অল্প কয়েকটি অবতরণের একটি।',
    verse: {
      arabic: 'الْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِي وَرَضِيتُ لَكُمُ الْإِسْلَامَ دِينًا',
      translation: 'This day I have perfected your religion for you, completed My favour upon you, and approved Islam as your religion.',
      translationBn: 'আজ আমি তোমাদের জন্য তোমাদের দ্বীনকে পূর্ণাঙ্গ করলাম, তোমাদের ওপর আমার নিয়ামত সম্পূর্ণ করলাম এবং ইসলামকে তোমাদের দ্বীন হিসেবে মনোনীত করলাম।',
      reference: 'Surah al-Ma’idah 5:3 (excerpt)'
    },
    suggestion: 'Read the whole of Surah al-Ma’idah 5:3 in context.',
    suggestionBn: 'প্রেক্ষাপটসহ সূরা আল-মায়িদা ৫:৩ সম্পূর্ণ পড়ুন।',
    source: 'Sahih al-Bukhari 45; Sahih Muslim 3017.'
  },
  {
    id: 'surah-al-fath-hudaybiyyah', month: 11, week: null, day: null,
    title: 'Surah al-Fath after al-Hudaybiyyah',
    titleBn: 'হুদায়বিয়ার পর সূরা আল-ফাতহ',
    context: 'Surah al-Fath was revealed as the Prophet ﷺ returned from al-Hudaybiyyah, and he said a surah had been revealed to him that was dearer to him than everything the sun rises upon. The treaty is dated to Dhul Qa‘dah 6 AH; the exact day of revelation is not documented, so this is a month-level match.',
    contextBn: 'হুদায়বিয়া থেকে ফেরার পথে সূরা আল-ফাতহ নাজিল হয়; নবী ﷺ বলেন, তাঁর ওপর এমন একটি সূরা নাজিল হয়েছে, যা সূর্যের আলোয় থাকা সবকিছুর চেয়ে তাঁর কাছে প্রিয়। সন্ধিটি ৬ হিজরির জিলকদ মাসে; অবতরণের নির্দিষ্ট দিন নথিভুক্ত নয়, তাই এটি মাসভিত্তিক মিল।',
    verse: {
      arabic: 'إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا',
      translation: 'Indeed, We have granted you a clear victory.',
      translationBn: 'নিশ্চয়ই আমি আপনাকে সুস্পষ্ট বিজয় দান করেছি।',
      reference: 'Surah al-Fath 48:1'
    },
    suggestion: 'Continue with Surah al-Fath 48:2–4.',
    suggestionBn: 'এরপর সূরা আল-ফাতহ ৪৮:২–৪ পড়তে পারেন।',
    source: 'Sahih al-Bukhari 4177; Ibn Hisham, al-Sirah al-Nabawiyyah, al-Hudaybiyyah (Dhul Qa‘dah 6 AH).'
  },
  {
    id: 'change-of-qibla', month: 7, months: [7, 8], week: null, day: null,
    title: 'The change of the Qiblah',
    titleBn: 'কিবলা পরিবর্তন',
    context: 'The instruction to face al-Masjid al-Haram in prayer came about sixteen or seventeen months after the Hijrah. Historians date it to Rajab or Sha‘ban 2 AH and reports differ, so this is shown as a qualified match for both months.',
    contextBn: 'হিজরতের প্রায় ষোলো বা সতেরো মাস পর সালাতে মসজিদুল হারামের দিকে মুখ ফেরানোর নির্দেশ আসে। ঐতিহাসিকরা একে ২ হিজরির রজব বা শাবান মাসে উল্লেখ করেন এবং বর্ণনায় মতভেদ রয়েছে; তাই দুই মাসের জন্যই সতর্কতাসহ মিল হিসেবে দেখানো হয়।',
    verse: {
      arabic: 'فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ',
      translation: 'So turn your face toward al-Masjid al-Haram.',
      translationBn: 'সুতরাং আপনি মসজিদুল হারামের দিকে মুখ ফেরান।',
      reference: 'Surah al-Baqarah 2:144 (excerpt)'
    },
    suggestion: 'Read Surah al-Baqarah 2:142–150 for the full passage on the Qiblah.',
    suggestionBn: 'কিবলা-সংক্রান্ত পূর্ণ অংশের জন্য সূরা আল-বাকারা ২:১৪২–১৫০ পড়ুন।',
    source: 'Sahih al-Bukhari 40 and 4486; Sahih Muslim 525. The month (Rajab or Sha‘ban 2 AH) is disputed.'
  },
  {
    id: 'badr-help-answered', month: 9, week: null, day: 17,
    title: 'Badr: the prayer for help is answered',
    titleBn: 'বদর: সাহায্যের দোয়া কবুল',
    context: '‘Umar ibn al-Khattab reported that on the day of Badr the Prophet ﷺ faced the Qiblah and supplicated at length, and Allah revealed this verse. Badr is traditionally dated 17 Ramadan 2 AH.',
    contextBn: 'উমর ইবনুল খাত্তাব (রা.) বর্ণনা করেন, বদরের দিন নবী ﷺ কিবলামুখী হয়ে দীর্ঘ দোয়া করেন, তখন আল্লাহ এই আয়াত নাজিল করেন। প্রচলিত তারিখ অনুযায়ী বদর ২ হিজরির ১৭ রমজান।',
    verse: {
      arabic: 'إِذْ تَسْتَغِيثُونَ رَبَّكُمْ فَاسْتَجَابَ لَكُمْ',
      translation: 'When you were calling upon your Lord for help, and He answered you.',
      translationBn: 'স্মরণ করো, যখন তোমরা তোমাদের রবের কাছে সাহায্য প্রার্থনা করছিলে, আর তিনি তোমাদের ডাকে সাড়া দিলেন।',
      reference: 'Surah al-Anfal 8:9 (opening)'
    },
    suggestion: 'Continue with Surah al-Anfal 8:9–12.',
    suggestionBn: 'এরপর সূরা আল-আনফাল ৮:৯–১২ পড়তে পারেন।',
    source: 'Sahih Muslim 1763. Date: Ibn Hisham, al-Sirah al-Nabawiyyah (17 Ramadan 2 AH, the widely transmitted chronology).'
  },
  {
    id: 'uhud-two-parties', month: 10, week: null, day: null,
    title: 'Uhud: the two groups who nearly faltered',
    titleBn: 'উহুদ: যে দুটি দল সাহস হারাতে বসেছিল',
    context: 'Jabir ibn ‘Abdullah said this verse was revealed about his people, Banu Salimah and Banu Harithah, at Uhud in Shawwal 3 AH. The surrounding passage of Al ‘Imran reflects on the battle.',
    contextBn: 'জাবির ইবনে আবদুল্লাহ (রা.) বলেন, ৩ হিজরির শাওয়ালে উহুদে তাঁর গোত্র বনু সালিমা ও বনু হারিসা সম্পর্কে এই আয়াত নাজিল হয়। সূরা আলে ইমরানের আশপাশের আয়াতগুলোতে যুদ্ধের শিক্ষা আলোচিত।',
    verse: {
      arabic: 'إِذْ هَمَّت طَّائِفَتَانِ مِنكُمْ أَن تَفْشَلَا وَاللَّهُ وَلِيُّهُمَا',
      translation: 'When two groups among you were about to lose courage, but Allah was their protector.',
      translationBn: 'যখন তোমাদের মধ্যকার দুটি দল সাহস হারানোর উপক্রম করেছিল, অথচ আল্লাহ ছিলেন তাদের অভিভাবক।',
      reference: 'Surah Al ‘Imran 3:122 (excerpt)'
    },
    suggestion: 'Read Surah Al ‘Imran 3:121–129 for the opening of the Uhud passage.',
    suggestionBn: 'উহুদ-সংক্রান্ত অংশের শুরু জানতে সূরা আলে ইমরান ৩:১২১–১২৯ পড়ুন।',
    source: 'Sahih al-Bukhari 4051 and 4558; Sahih Muslim 2505. Uhud: Shawwal 3 AH.'
  },
  {
    id: 'khandaq-from-above-and-below', month: 10, week: null, day: null,
    title: 'The Trench: armies from above and below',
    titleBn: 'খন্দক: ওপর ও নিচ থেকে আগত বাহিনী',
    context: '‘A’ishah explained that this verse describes the Day of the Trench (al-Ahzab). Ibn Ishaq dates the siege to Shawwal 5 AH; some reports place it in Dhul Qa‘dah, so this is a qualified month-level match.',
    contextBn: 'আয়েশা (রা.) ব্যাখ্যা করেন, এই আয়াত খন্দকের (আহযাব) দিনের বর্ণনা। ইবনে ইসহাক অবরোধকে ৫ হিজরির শাওয়ালে উল্লেখ করেছেন; কোনো বর্ণনায় জিলকদ, তাই এটি শর্তসাপেক্ষ মাসভিত্তিক মিল।',
    verse: {
      arabic: 'إِذْ جَاءُوكُم مِّن فَوْقِكُمْ وَمِنْ أَسْفَلَ مِنكُمْ',
      translation: 'When they came at you from above you and from below you.',
      translationBn: 'যখন তারা তোমাদের ওপর দিক ও নিচের দিক থেকে তোমাদের ওপর এসে পড়েছিল।',
      reference: 'Surah al-Ahzab 33:10 (opening)'
    },
    suggestion: 'Read Surah al-Ahzab 33:9–27 for the account of the confederates.',
    suggestionBn: 'আহযাবের পূর্ণ বিবরণের জন্য সূরা আল-আহযাব ৩৩:৯–২৭ পড়ুন।',
    source: 'Sahih al-Bukhari 4103; Ibn Hisham, al-Sirah al-Nabawiyyah (Shawwal 5 AH; month disputed).'
  },
  {
    id: 'hunayn-named-in-quran', month: 10, week: null, day: null,
    title: 'The day of Hunayn',
    titleBn: 'হুনাইনের দিন',
    context: 'The Qur’an names the Battle of Hunayn, fought in Shawwal 8 AH shortly after the conquest of Makkah, and reminds the believers that their large numbers did not avail them.',
    contextBn: 'কুরআনে হুনাইনের যুদ্ধের নাম উল্লেখ আছে, যা মক্কা বিজয়ের অল্প পরে ৮ হিজরির শাওয়ালে সংঘটিত হয়; এতে মুমিনদের স্মরণ করানো হয়েছে যে সংখ্যার আধিক্য তাদের কোনো কাজে আসেনি।',
    verse: {
      arabic: 'لَقَدْ نَصَرَكُمُ اللَّهُ فِي مَوَاطِنَ كَثِيرَةٍ ۙ وَيَوْمَ حُنَيْنٍ',
      translation: 'Allah has already given you victory in many places, and on the day of Hunayn.',
      translationBn: 'আল্লাহ তোমাদের বহু ক্ষেত্রে সাহায্য করেছেন, এবং হুনাইনের দিনেও।',
      reference: 'Surah al-Tawbah 9:25 (opening)'
    },
    suggestion: 'Continue with Surah al-Tawbah 9:25–27.',
    suggestionBn: 'এরপর সূরা আত-তাওবা ৯:২৫–২৭ পড়তে পারেন।',
    source: 'Qur’an 9:25 (names Hunayn); Sahih al-Bukhari 4315 and 4317; Ibn Hisham (Shawwal 8 AH).'
  },
  {
    id: 'hijrah-the-cave', month: 3, months: [2, 3], week: null, day: null,
    title: 'The Hijrah: two in the cave',
    titleBn: 'হিজরত: গুহায় দুজন',
    context: 'During the Hijrah the Prophet ﷺ and Abu Bakr hid in the cave of Thawr. The journey began in late Safar by some reports and reached Quba in Rabi‘ al-Awwal 1 AH, so this is shown for both months.',
    contextBn: 'হিজরতের সময় নবী ﷺ ও আবু বকর (রা.) সাওর গুহায় আত্মগোপন করেন। কোনো বর্ণনায় যাত্রা সফরের শেষে শুরু হয় এবং রবিউল আউয়ালে কুবায় পৌঁছায়, তাই দুই মাসেই দেখানো হয়।',
    verse: {
      arabic: 'ثَانِيَ اثْنَيْنِ إِذْ هُمَا فِي الْغَارِ إِذْ يَقُولُ لِصَاحِبِهِ لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
      translation: 'The second of two, when they were in the cave, when he said to his companion, “Do not grieve; indeed Allah is with us.”',
      translationBn: 'তিনি ছিলেন দুজনের দ্বিতীয়জন, যখন তাঁরা গুহায় ছিলেন; যখন তিনি তাঁর সঙ্গীকে বলেছিলেন, “চিন্তা কোরো না, নিশ্চয়ই আল্লাহ আমাদের সঙ্গে আছেন।”',
      reference: 'Surah al-Tawbah 9:40 (excerpt)'
    },
    suggestion: 'Read the whole of Surah al-Tawbah 9:40.',
    suggestionBn: 'সূরা আত-তাওবা ৯:৪০ সম্পূর্ণ পড়ুন।',
    source: 'Sahih al-Bukhari 3653 and 4663; Sahih Muslim 2381. Dates: Ibn Hisham, al-Sirah al-Nabawiyyah.'
  },
  {
    id: 'al-ifk-vindication', month: 8, week: null, day: null,
    title: 'The slander (al-Ifk) and ‘A’ishah’s vindication',
    titleBn: 'অপবাদ (ইফক) ও আয়েশা (রা.)-এর নির্দোষিতা',
    context: 'The slander arose on the return from the expedition of Banu al-Mustaliq in Sha‘ban (5 or 6 AH); ‘A’ishah reports that the verses declaring her innocence came about a month later. This match follows the month of the expedition, not the day of revelation.',
    contextBn: 'শাবান মাসে (৫ বা ৬ হিজরি) বনু মুস্তালিক অভিযান থেকে ফেরার পথে অপবাদ রটে; আয়েশা (রা.) জানান, তাঁর নির্দোষিতার আয়াত প্রায় এক মাস পর নাজিল হয়। এই মিলটি অভিযানের মাস অনুযায়ী, ওহি নাজিলের দিন অনুযায়ী নয়।',
    verse: {
      arabic: 'إِنَّ الَّذِينَ جَاءُوا بِالْإِفْكِ عُصْبَةٌ مِّنكُمْ',
      translation: 'Indeed, those who came with the slander are a group among you.',
      translationBn: 'নিশ্চয়ই যারা এই অপবাদ রটিয়েছে, তারা তোমাদেরই একটি দল।',
      reference: 'Surah al-Nur 24:11 (opening)'
    },
    suggestion: 'Read Surah al-Nur 24:11–20 for the full passage.',
    suggestionBn: 'পূর্ণ অংশের জন্য সূরা আন-নূর ২৪:১১–২০ পড়ুন।',
    source: 'Sahih al-Bukhari 4141 and 4750; Sahih Muslim 2770. The year of the expedition (5 or 6 AH) is disputed.'
  },
  {
    id: 'umrat-al-qada-vision-fulfilled', month: 11, week: null, day: null,
    title: 'The vision fulfilled: entering al-Masjid al-Haram',
    titleBn: 'স্বপ্ন সত্য হলো: মসজিদুল হারামে প্রবেশ',
    context: 'Revealed after al-Hudaybiyyah, this verse promised that the believers would enter al-Masjid al-Haram in safety. It was fulfilled in the ‘Umrah of Dhul Qa‘dah 7 AH (‘Umrat al-Qada’).',
    contextBn: 'হুদায়বিয়ার পর নাজিল হওয়া এই আয়াতে প্রতিশ্রুতি দেওয়া হয় যে মুমিনরা নিরাপদে মসজিদুল হারামে প্রবেশ করবে। ৭ হিজরির জিলকদে উমরাতুল কাযায় তা পূর্ণ হয়।',
    verse: {
      arabic: 'لَقَدْ صَدَقَ اللَّهُ رَسُولَهُ الرُّؤْيَا بِالْحَقِّ ۖ لَتَدْخُلُنَّ الْمَسْجِدَ الْحَرَامَ إِن شَاءَ اللَّهُ آمِنِينَ',
      translation: 'Allah has certainly fulfilled His Messenger’s vision in truth: you will surely enter al-Masjid al-Haram, if Allah wills, in safety.',
      translationBn: 'আল্লাহ তাঁর রাসূলের স্বপ্ন সত্যে পরিণত করেছেন: আল্লাহ চাইলে তোমরা অবশ্যই নিরাপদে মসজিদুল হারামে প্রবেশ করবে।',
      reference: 'Surah al-Fath 48:27 (opening)'
    },
    suggestion: 'Read the whole of Surah al-Fath 48:27–29.',
    suggestionBn: 'সূরা আল-ফাতহ ৪৮:২৭–২৯ সম্পূর্ণ পড়ুন।',
    source: 'Sahih al-Bukhari 4252 and 2731–2732; Ibn Kathir, Tafsir, on 48:27.'
  }
];

/* Dated milestones used when no exact Hijri-day history entry exists. The UI
   labels a nearest match honestly instead of pretending it happened today. */
export const ISLAMIC_HISTORY_EVENTS = [
  {
    month: 1, day: 10, noteKey: '1-10', title: 'The day of Ashura', bn: 'আশুরার দিন',
    detail: 'The Prophet ﷺ told the Companions that Allah had saved Musa and his people on this day. Fasting on Ashura is established in authentic hadith; many scholars recommend adding the 9th or 11th.',
    detailBn: 'নবী ﷺ সাহাবিদের জানান, এ দিনে আল্লাহ মূসা (আ.) ও তাঁর সম্প্রদায়কে রক্ষা করেছিলেন। সহিহ হাদিসে আশুরার রোজা প্রমাণিত; অনেক আলেম ৯ বা ১১ তারিখও সঙ্গে রাখার পরামর্শ দেন।',
    dateLabel: '10 Muharram · annual observance', dateLabelBn: '১০ মুহাররম · বার্ষিক স্মরণীয় দিন',
    source: 'Sahih al-Bukhari 2004; Sahih Muslim 1134.'
  },
  {
    month: 9, day: 17, noteKey: '9-17', title: 'The Battle of Badr', bn: 'বদরের যুদ্ধ',
    detail: 'The Battle of Badr took place on 17 Ramadan, 2 AH in the widely transmitted Muslim historical chronology. The Qur’an refers to the event as the Day of Criterion (Yawm al-Furqan).',
    detailBn: 'প্রচলিত মুসলিম ঐতিহাসিক কালপঞ্জি অনুযায়ী ২ হিজরির ১৭ রমজান বদরের যুদ্ধ সংঘটিত হয়। কুরআনে এ ঘটনাকে ইয়াওমুল ফুরকান—সত্য-মিথ্যার পার্থক্যের দিন—বলা হয়েছে।',
    dateLabel: '17 Ramadan 2 AH · 624 CE', dateLabelBn: '১৭ রমজান ২ হিজরি · ৬২৪ খ্রিষ্টাব্দ',
    source: 'Qur’an 8:41; Ibn Hisham, al-Sirah al-Nabawiyyah, account of Badr; Sahih al-Bukhari, reports on the people of Badr.'
  },
  {
    month: 9, day: 20, noteKey: '9-20', title: 'The Conquest of Makkah', bn: 'মক্কা বিজয়',
    detail: 'The conquest of Makkah is commonly placed on 20 Ramadan, 8 AH. The Prophet ﷺ entered Makkah and announced a broad amnesty; historical sources differ on some details of the chronology.',
    detailBn: 'প্রসিদ্ধ ঐতিহাসিক বর্ণনায় ৮ হিজরির ২০ রমজান মক্কা বিজয়ের তারিখ হিসেবে উল্লেখিত। নবী ﷺ মক্কায় প্রবেশ করে সাধারণ ক্ষমা ঘোষণা করেন; কালপঞ্জির কিছু বিবরণে মতভেদ রয়েছে।',
    dateLabel: '20 Ramadan 8 AH · 630 CE', dateLabelBn: '২০ রমজান ৮ হিজরি · ৬৩০ খ্রিষ্টাব্দ',
    source: 'Ibn Hisham, al-Sirah al-Nabawiyyah, Conquest of Makkah; al-Tabari, events of 8 AH.'
  },
  {
    month: 10, day: 7, title: 'The Battle of Uhud', bn: 'উহুদের যুদ্ধ',
    detail: 'The Battle of Uhud is commonly dated to 7 Shawwal, 3 AH. The Qur’an discusses lessons from Uhud in Surah Al ‘Imran, particularly verses 121 onward.',
    detailBn: 'প্রচলিত ঐতিহাসিক তারিখ অনুযায়ী ৩ হিজরির ৭ শাওয়াল উহুদের যুদ্ধ সংঘটিত হয়। সূরা আলে ইমরানের ১২১ নম্বর আয়াত থেকে এ যুদ্ধের শিক্ষা আলোচিত হয়েছে।',
    dateLabel: '7 Shawwal 3 AH · 625 CE', dateLabelBn: '৭ শাওয়াল ৩ হিজরি · ৬২৫ খ্রিষ্টাব্দ',
    source: 'Qur’an 3:121–180; Ibn Hisham, al-Sirah al-Nabawiyyah, account of Uhud.'
  },
  {
    month: 4, day: 25, title: 'The Battle of Hattin', bn: 'হিত্তিনের যুদ্ধ',
    detail: 'On 25 Rabi‘ al-Thani 583 AH (4 July 1187 CE), Salah al-Din’s forces defeated the Crusader army near Hattin. The victory opened the way for the recovery of Jerusalem later that year.',
    detailBn: '৫৮৩ হিজরির ২৫ রবিউস সানি (৪ জুলাই ১১৮৭ খ্রিষ্টাব্দ) সালাহউদ্দিনের বাহিনী হিত্তিনের কাছে ক্রুসেডার বাহিনীকে পরাজিত করে। এই বিজয় ওই বছর জেরুজালেম পুনরুদ্ধারের পথ খুলে দেয়।',
    dateLabel: '25 Rabi‘ al-Thani 583 AH · 4 July 1187 CE', dateLabelBn: '২৫ রবিউস সানি ৫৮৩ হিজরি · ৪ জুলাই ১১৮৭ খ্রিষ্টাব্দ',
    source: 'Islam Museum, “Battle of Hattin” historical entry; dated 4 July 1187 CE / 25 Rabi‘ II 583 AH.'
  },
  {
    month: 1, day: null, precision: 'month', title: 'The Fall of Baghdad', bn: 'বাগদাদের পতন',
    detail: 'The Mongol sack of Baghdad in Muharram 656 AH (January–February 1258 CE) devastated the Abbasid capital and marked the end of the Abbasid caliphate in Baghdad. Historical accounts differ on the exact day, so this is a month-level match.',
    detailBn: '৬৫৬ হিজরির মুহাররমে (জানুয়ারি–ফেব্রুয়ারি ১২৫৮ খ্রিষ্টাব্দ) মঙ্গোলদের আক্রমণে আব্বাসীয় রাজধানী বাগদাদ বিপর্যস্ত হয় এবং বাগদাদের আব্বাসীয় খেলাফতের অবসান ঘটে। সুনির্দিষ্ট দিন নিয়ে ঐতিহাসিক বর্ণনায় মতভেদ আছে; তাই এটি মাসভিত্তিক মিল।',
    dateLabel: 'Muharram 656 AH · January–February 1258 CE (exact day disputed)', dateLabelBn: 'মুহাররম ৬৫৬ হিজরি · জানুয়ারি–ফেব্রুয়ারি ১২৫৮ (সুনির্দিষ্ট দিন নিয়ে মতভেদ)',
    source: 'Joseph de Somogyi, “A Qaṣīda on the Destruction of Baghdād by the Mongols”, Bulletin of the School of Oriental and African Studies (2009); Islam Museum, “The Tatar sack of Baghdad and the killing of al-Musta‘sim”.'
  },
  {
    month: 12, day: 9, title: 'The Farewell Sermon at Arafah', bn: 'আরাফায় বিদায় হজের ভাষণ',
    detail: 'During the Farewell Hajj, the Prophet ﷺ addressed the pilgrims at Arafah on 9 Dhul Hijjah 10 AH, declaring the sanctity of life, property and honour and urging people to hold fast to the Book of Allah.',
    detailBn: 'বিদায় হজে ১০ হিজরির ৯ জিলহজ নবী ﷺ আরাফায় হাজিদের উদ্দেশে ভাষণ দেন; তিনি জীবন, সম্পদ ও সম্মানের পবিত্রতা ঘোষণা করেন এবং আল্লাহর কিতাব আঁকড়ে ধরার আহ্বান জানান।',
    dateLabel: '9 Dhul Hijjah 10 AH · 632 CE', dateLabelBn: '৯ জিলহজ ১০ হিজরি · ৬৩২ খ্রিষ্টাব্দ',
    source: 'Sahih Muslim 1218 (Jabir’s account of the Farewell Hajj).'
  },
  {
    month: 7, day: 27, title: 'Salah al-Din recovers Jerusalem', bn: 'সালাহউদ্দিনের জেরুজালেম পুনরুদ্ধার',
    detail: 'Three months after Hattin, Jerusalem surrendered to Salah al-Din on 27 Rajab 583 AH (2 October 1187 CE). The terms allowed the inhabitants to leave on payment of a ransom, and many were released without one.',
    detailBn: 'হিত্তিনের তিন মাস পর ৫৮৩ হিজরির ২৭ রজব (২ অক্টোবর ১১৮৭ খ্রিষ্টাব্দ) জেরুজালেম সালাহউদ্দিনের কাছে আত্মসমর্পণ করে। শর্ত অনুযায়ী বাসিন্দারা মুক্তিপণ দিয়ে চলে যেতে পারত; অনেককে মুক্তিপণ ছাড়াই মুক্তি দেওয়া হয়।',
    dateLabel: '27 Rajab 583 AH · 2 October 1187 CE', dateLabelBn: '২৭ রজব ৫৮৩ হিজরি · ২ অক্টোবর ১১৮৭ খ্রিষ্টাব্দ',
    source: 'Baha’ al-Din Ibn Shaddad, al-Nawadir al-Sultaniyya; Ibn al-Athir, al-Kamil fi al-Tarikh, events of 583 AH.'
  },
  {
    month: 9, day: 25, title: 'The Battle of ‘Ayn Jalut', bn: 'আইন জালুতের যুদ্ধ',
    detail: 'On 25 Ramadan 658 AH (3 September 1260 CE), the Mamluk army under Sultan Qutuz, with Baybars among its commanders, defeated the Mongols at ‘Ayn Jalut in Palestine, halting their advance into Egypt.',
    detailBn: '৬৫৮ হিজরির ২৫ রমজান (৩ সেপ্টেম্বর ১২৬০ খ্রিষ্টাব্দ) সুলতান কুতুজের নেতৃত্বে মামলুক বাহিনী—যার সেনাপতিদের মধ্যে বাইবার্সও ছিলেন—ফিলিস্তিনের আইন জালুতে মঙ্গোলদের পরাজিত করে মিসরের দিকে তাদের অগ্রযাত্রা থামিয়ে দেয়।',
    dateLabel: '25 Ramadan 658 AH · 3 September 1260 CE', dateLabelBn: '২৫ রমজান ৬৫৮ হিজরি · ৩ সেপ্টেম্বর ১২৬০ খ্রিষ্টাব্দ',
    source: 'al-Maqrizi, al-Suluk li-Ma‘rifat Duwal al-Muluk, events of 658 AH; Reuven Amitai-Preiss, Mongols and Mamluks (1995).'
  },
  {
    month: 5, day: 20, title: 'The Conquest of Constantinople', bn: 'কনস্টান্টিনোপল বিজয়',
    detail: 'Ottoman forces under Sultan Mehmed II entered Constantinople on 20 Jumada al-Ula 857 AH (29 May 1453 CE) after a siege of about seven weeks, ending the Byzantine Empire. The city became the Ottoman capital.',
    detailBn: 'প্রায় সাত সপ্তাহের অবরোধের পর ৮৫৭ হিজরির ২০ জমাদিউল আউয়াল (২৯ মে ১৪৫৩ খ্রিষ্টাব্দ) সুলতান দ্বিতীয় মেহমেদের নেতৃত্বে উসমানীয় বাহিনী কনস্টান্টিনোপলে প্রবেশ করে; বাইজান্টাইন সাম্রাজ্যের অবসান ঘটে এবং নগরীটি উসমানীয় রাজধানী হয়।',
    dateLabel: '20 Jumada al-Ula 857 AH · 29 May 1453 CE', dateLabelBn: '২০ জমাদিউল আউয়াল ৮৫৭ হিজরি · ২৯ মে ১৪৫৩ খ্রিষ্টাব্দ',
    source: 'Halil İnalcık, The Ottoman Empire: The Classical Age 1300–1600; Steven Runciman, The Fall of Constantinople 1453 (1965).'
  },
  {
    month: 1, day: 10, title: 'Al-Husayn at Karbala', bn: 'কারবালায় হুসাইন (রা.)',
    detail: 'Al-Husayn ibn ‘Ali, grandson of the Prophet ﷺ, was killed with members of his family and companions at Karbala in Iraq on 10 Muharram 61 AH (680 CE).',
    detailBn: 'নবী ﷺ-এর দৌহিত্র হুসাইন ইবন আলী (রা.) ৬১ হিজরির ১০ মুহাররম (৬৮০ খ্রিষ্টাব্দ) ইরাকের কারবালায় পরিবারের সদস্য ও সঙ্গীদের সঙ্গে শহীদ হন।',
    dateLabel: '10 Muharram 61 AH · 680 CE', dateLabelBn: '১০ মুহাররম ৬১ হিজরি · ৬৮০ খ্রিষ্টাব্দ',
    source: 'al-Tabari, Tarikh al-Rusul wa’l-Muluk, events of 61 AH.'
  },
  {
    month: 9, day: 21, title: 'The death of ‘Ali ibn Abi Talib', bn: 'আলী ইবন আবি তালিব (রা.)-এর ইন্তেকাল',
    detail: 'The fourth caliph, ‘Ali ibn Abi Talib, was struck in the mosque of Kufa on 19 Ramadan 40 AH and died on 21 Ramadan (661 CE), according to the commonly cited chronology.',
    detailBn: 'প্রচলিত কালপঞ্জি অনুযায়ী চতুর্থ খলিফা আলী ইবন আবি তালিব (রা.) ৪০ হিজরির ১৯ রমজান কুফার মসজিদে আঘাতপ্রাপ্ত হন এবং ২১ রমজান (৬৬১ খ্রিষ্টাব্দ) ইন্তেকাল করেন।',
    dateLabel: '21 Ramadan 40 AH · 661 CE (commonly cited)', dateLabelBn: '২১ রমজান ৪০ হিজরি · ৬৬১ খ্রিষ্টাব্দ (প্রচলিত তারিখ)',
    source: 'al-Tabari, Tarikh al-Rusul wa’l-Muluk, events of 40 AH.'
  },
  {
    month: 12, day: 18, title: 'The martyrdom of ‘Uthman ibn ‘Affan', bn: 'উসমান ইবন আফফান (রা.)-এর শাহাদাত',
    detail: 'The third caliph, ‘Uthman ibn ‘Affan, was killed in his house in Madinah by rebels on 18 Dhul Hijjah 35 AH (656 CE), according to the commonly cited date.',
    detailBn: 'প্রচলিত তারিখ অনুযায়ী তৃতীয় খলিফা উসমান ইবন আফফান (রা.) ৩৫ হিজরির ১৮ জিলহজ (৬৫৬ খ্রিষ্টাব্দ) মদিনায় নিজ ঘরে বিদ্রোহীদের হাতে শহীদ হন।',
    dateLabel: '18 Dhul Hijjah 35 AH · 656 CE (commonly cited)', dateLabelBn: '১৮ জিলহজ ৩৫ হিজরি · ৬৫৬ খ্রিষ্টাব্দ (প্রচলিত তারিখ)',
    source: 'al-Tabari, Tarikh al-Rusul wa’l-Muluk, events of 35 AH.'
  },
  {
    month: 6, day: 22, title: 'The death of Abu Bakr al-Siddiq', bn: 'আবু বকর সিদ্দিক (রা.)-এর ইন্তেকাল',
    detail: 'The first caliph, Abu Bakr al-Siddiq, died in Madinah on 22 Jumada al-Akhirah 13 AH (634 CE), according to the commonly cited date, and was buried beside the Prophet ﷺ.',
    detailBn: 'প্রচলিত তারিখ অনুযায়ী প্রথম খলিফা আবু বকর সিদ্দিক (রা.) ১৩ হিজরির ২২ জমাদিউস সানি (৬৩৪ খ্রিষ্টাব্দ) মদিনায় ইন্তেকাল করেন এবং নবী ﷺ-এর পাশে সমাহিত হন।',
    dateLabel: '22 Jumada al-Akhirah 13 AH · 634 CE (commonly cited)', dateLabelBn: '২২ জমাদিউস সানি ১৩ হিজরি · ৬৩৪ খ্রিষ্টাব্দ (প্রচলিত তারিখ)',
    source: 'al-Tabari, Tarikh al-Rusul wa’l-Muluk, events of 13 AH; Ibn Sa‘d, al-Tabaqat al-Kubra.'
  },
  {
    month: 3, day: 2, title: 'The surrender of Granada', bn: 'গ্রানাডার আত্মসমর্পণ',
    detail: 'The Nasrid ruler Muhammad XII (Boabdil) surrendered Granada, the last Muslim kingdom in al-Andalus, to Castile and Aragon on 2 January 1492 CE. The Hijri day is approximate (about 2 Rabi‘ al-Awwal 897 AH).',
    detailBn: 'আন্দালুসের শেষ মুসলিম রাজ্য গ্রানাডা ২ জানুয়ারি ১৪৯২ খ্রিষ্টাব্দে নাসরি শাসক দ্বাদশ মুহাম্মদ (বোয়াবদিল) কাস্তিল ও আরাগনের কাছে সমর্পণ করেন। হিজরি দিনটি আনুমানিক (প্রায় ২ রবিউল আউয়াল ৮৯৭ হিজরি)।',
    dateLabel: 'About 2 Rabi‘ al-Awwal 897 AH · 2 January 1492 CE (Hijri day approximate)', dateLabelBn: 'প্রায় ২ রবিউল আউয়াল ৮৯৭ হিজরি · ২ জানুয়ারি ১৪৯২ খ্রিষ্টাব্দ (হিজরি দিন আনুমানিক)',
    source: 'L. P. Harvey, Islamic Spain 1250 to 1500 (1990).'
  },
  {
    month: 3, day: null, precision: 'month', title: 'The Hijrah: arrival in Madinah', bn: 'হিজরত: মদিনায় আগমন',
    detail: 'The Prophet ﷺ reached Quba and then Madinah in Rabi‘ al-Awwal of the year of the Hijrah (622 CE). Reports differ on the exact day (the 8th and 12th are both cited), so this is a month-level match.',
    detailBn: 'হিজরতের বছর (৬২২ খ্রিষ্টাব্দ) রবিউল আউয়াল মাসে নবী ﷺ কুবায় এবং পরে মদিনায় পৌঁছান। নির্দিষ্ট দিন নিয়ে বর্ণনায় মতভেদ আছে (৮ ও ১২ তারিখ দুটিই উল্লেখিত); তাই এটি মাসভিত্তিক মিল।',
    dateLabel: 'Rabi‘ al-Awwal 1 AH · 622 CE (exact day disputed)', dateLabelBn: 'রবিউল আউয়াল ১ হিজরি · ৬২২ খ্রিষ্টাব্দ (সুনির্দিষ্ট দিন নিয়ে মতভেদ)',
    source: 'Sahih al-Bukhari 3906 (account of the Hijrah); Ibn Hisham, al-Sirah al-Nabawiyyah.'
  },
  {
    month: 3, day: null, precision: 'month', title: 'The passing of the Prophet ﷺ', bn: 'নবী ﷺ-এর ইন্তেকাল',
    detail: 'The Prophet ﷺ passed away in Madinah on a Monday in Rabi‘ al-Awwal 11 AH (632 CE). The 12th is the most commonly cited day, but reports differ, so this is a month-level match.',
    detailBn: 'নবী ﷺ ১১ হিজরির রবিউল আউয়াল মাসে (৬৩২ খ্রিষ্টাব্দ) এক সোমবার মদিনায় ইন্তেকাল করেন। ১২ তারিখ সর্বাধিক প্রচলিত, তবে বর্ণনায় মতভেদ আছে; তাই এটি মাসভিত্তিক মিল।',
    dateLabel: 'Rabi‘ al-Awwal 11 AH · 632 CE (exact day disputed)', dateLabelBn: 'রবিউল আউয়াল ১১ হিজরি · ৬৩২ খ্রিষ্টাব্দ (সুনির্দিষ্ট দিন নিয়ে মতভেদ)',
    source: 'Sahih al-Bukhari 1387 (he died on a Monday); Ibn Hisham, al-Sirah al-Nabawiyyah.'
  },
  {
    month: 1, day: null, precision: 'month', title: 'The expedition to Khaybar', bn: 'খায়বার অভিযান',
    detail: 'The Muslims marched to Khaybar, north of Madinah, in Muharram 7 AH (628 CE) and took its fortresses. Some historians place it in Safar, so this is a month-level match.',
    detailBn: '৭ হিজরির মুহাররমে (৬২৮ খ্রিষ্টাব্দ) মুসলমানরা মদিনার উত্তরে খায়বারে অভিযান চালান এবং এর দুর্গগুলো জয় করেন। কিছু ঐতিহাসিক একে সফর মাসে উল্লেখ করেন; তাই এটি মাসভিত্তিক মিল।',
    dateLabel: 'Muharram 7 AH · 628 CE (some sources: Safar)', dateLabelBn: 'মুহাররম ৭ হিজরি · ৬২৮ খ্রিষ্টাব্দ (কিছু সূত্রে সফর)',
    source: 'Sahih al-Bukhari, Book of Military Expeditions, chapter on Khaybar; Ibn Hisham, al-Sirah al-Nabawiyyah.'
  },
  {
    month: 5, day: null, precision: 'month', title: 'The Battle of Mu’tah', bn: 'মুতার যুদ্ধ',
    detail: 'In Jumada al-Ula 8 AH (629 CE), a Muslim force met Byzantine-allied armies at Mu’tah in present-day Jordan. Its commanders Zayd ibn Harithah, Ja‘far ibn Abi Talib and ‘Abdullah ibn Rawahah were killed, and Khalid ibn al-Walid led the army back.',
    detailBn: '৮ হিজরির জমাদিউল আউয়ালে (৬২৯ খ্রিষ্টাব্দ) বর্তমান জর্ডানের মুতায় মুসলিম বাহিনী বাইজান্টাইন-মিত্র বাহিনীর মুখোমুখি হয়। সেনাপতি যায়দ ইবন হারিসা, জাফর ইবন আবি তালিব ও আবদুল্লাহ ইবন রাওয়াহা (রা.) শহীদ হন; খালিদ ইবনুল ওয়ালিদ (রা.) বাহিনীকে ফিরিয়ে আনেন।',
    dateLabel: 'Jumada al-Ula 8 AH · 629 CE (month-level)', dateLabelBn: 'জমাদিউল আউয়াল ৮ হিজরি · ৬২৯ খ্রিষ্টাব্দ (মাসভিত্তিক)',
    source: 'Sahih al-Bukhari 4261–4262; Ibn Hisham, al-Sirah al-Nabawiyyah, account of Mu’tah.'
  },
  {
    month: 7, day: null, precision: 'month', title: 'The expedition of Tabuk', bn: 'তাবুক অভিযান',
    detail: 'In Rajab 9 AH (630 CE), the Prophet ﷺ led a large army north to Tabuk in a time of heat and hardship. No battle took place. Surah al-Tawbah discusses the expedition, and Ka‘b ibn Malik’s account describes those who stayed behind.',
    detailBn: '৯ হিজরির রজবে (৬৩০ খ্রিষ্টাব্দ) প্রচণ্ড গরম ও কষ্টের সময় নবী ﷺ বিশাল বাহিনী নিয়ে উত্তরে তাবুকে যান; কোনো যুদ্ধ হয়নি। সূরা আত-তাওবায় এ অভিযানের আলোচনা আছে এবং কাব ইবন মালিক (রা.)-এর বর্ণনায় পেছনে থেকে যাওয়াদের কথা এসেছে।',
    dateLabel: 'Rajab 9 AH · 630 CE (month-level)', dateLabelBn: 'রজব ৯ হিজরি · ৬৩০ খ্রিষ্টাব্দ (মাসভিত্তিক)',
    source: 'Qur’an 9:38–122; Sahih al-Bukhari 4418 (Ka‘b ibn Malik).'
  },
  {
    month: 10, day: null, precision: 'month', title: 'The Battle of the Trench (al-Ahzab)', bn: 'খন্দকের যুদ্ধ (আহযাব)',
    detail: 'A confederate army besieged Madinah, which the Muslims defended with a trench. Ibn Ishaq dates it to Shawwal 5 AH (627 CE); other reports differ, so this is a month-level match. Surah al-Ahzab describes the siege.',
    detailBn: 'সম্মিলিত বাহিনী মদিনা অবরোধ করলে মুসলমানরা পরিখা খনন করে নগরী রক্ষা করেন। ইবন ইসহাক একে ৫ হিজরির শাওয়ালে (৬২৭ খ্রিষ্টাব্দ) উল্লেখ করেন; অন্য বর্ণনায় ভিন্নতা আছে, তাই এটি মাসভিত্তিক মিল। সূরা আল-আহযাবে এ অবরোধের বর্ণনা রয়েছে।',
    dateLabel: 'Shawwal 5 AH · 627 CE (date discussed in the sources)', dateLabelBn: 'শাওয়াল ৫ হিজরি · ৬২৭ খ্রিষ্টাব্দ (তারিখ নিয়ে সূত্রে আলোচনা আছে)',
    source: 'Qur’an 33:9–27; Ibn Hisham, al-Sirah al-Nabawiyyah, account of al-Khandaq.'
  },
  {
    month: 10, day: null, precision: 'month', title: 'The Battle of Hunayn', bn: 'হুনাইনের যুদ্ধ',
    detail: 'Shortly after the conquest of Makkah, in Shawwal 8 AH (630 CE), the Muslim army was ambushed in the valley of Hunayn, regrouped and prevailed. The Qur’an recalls how numbers alone did not help that day.',
    detailBn: 'মক্কা বিজয়ের অল্প পরেই ৮ হিজরির শাওয়ালে (৬৩০ খ্রিষ্টাব্দ) হুনাইন উপত্যকায় মুসলিম বাহিনী অতর্কিত আক্রমণের শিকার হয়, পরে পুনর্গঠিত হয়ে বিজয় লাভ করে। কুরআন স্মরণ করিয়ে দেয়, সেদিন শুধু সংখ্যাধিক্য কাজে আসেনি।',
    dateLabel: 'Shawwal 8 AH · 630 CE (month-level)', dateLabelBn: 'শাওয়াল ৮ হিজরি · ৬৩০ খ্রিষ্টাব্দ (মাসভিত্তিক)',
    source: 'Qur’an 9:25–26; Ibn Hisham, al-Sirah al-Nabawiyyah, account of Hunayn.'
  },
  {
    month: 11, day: null, precision: 'month', title: 'The Treaty of al-Hudaybiyyah', bn: 'হুদায়বিয়ার সন্ধি',
    detail: 'In Dhul Qa‘dah 6 AH (628 CE), the Prophet ﷺ set out for ‘Umrah and concluded a truce with Quraysh at al-Hudaybiyyah, outside Makkah. The Pledge of Ridwan took place there, and Surah al-Fath was revealed on the return journey.',
    detailBn: '৬ হিজরির জিলকদ মাসে (৬২৮ খ্রিষ্টাব্দ) নবী ﷺ উমরার উদ্দেশে রওনা হয়ে মক্কার বাইরে হুদায়বিয়ায় কুরাইশের সঙ্গে সন্ধি করেন। সেখানে বাইআতে রিদওয়ান হয় এবং ফেরার পথে সূরা আল-ফাতহ নাজিল হয়।',
    dateLabel: 'Dhul Qa‘dah 6 AH · 628 CE (month-level)', dateLabelBn: 'জিলকদ ৬ হিজরি · ৬২৮ খ্রিষ্টাব্দ (মাসভিত্তিক)',
    source: 'Qur’an 48:1–29; Sahih al-Bukhari 2731–2732.'
  },
  {
    month: 5, day: null, precision: 'month', title: 'The Battle of Ajnadayn', bn: 'আজনাদাইনের যুদ্ধ',
    detail: 'An early battle in Palestine between the Muslim army under Khalid ibn al-Walid and the Byzantines, in Jumada al-Ula 13 AH (July 634 CE), during the caliphate of Abu Bakr. Al-Tabari gives the end of the month; other reports differ by a few days.',
    detailBn: 'আবু বকর (রা.)-এর খিলাফতকালে ১৩ হিজরির জুমাদাল উলায় (জুলাই ৬৩৪ খ্রিষ্টাব্দ) ফিলিস্তিনে খালিদ ইবনুল ওয়ালিদের নেতৃত্বে মুসলিম বাহিনী ও বাইজান্টাইনদের মধ্যে সংঘটিত প্রাথমিক যুদ্ধ। আত-তাবারি মাসের শেষ দিক উল্লেখ করেছেন; অন্য বর্ণনায় কয়েক দিনের পার্থক্য আছে।',
    dateLabel: 'Jumada al-Ula 13 AH · July 634 CE (exact day disputed)', dateLabelBn: 'জুমাদাল উলা ১৩ হিজরি · জুলাই ৬৩৪ (সুনির্দিষ্ট দিন নিয়ে মতভেদ)',
    source: 'al-Tabari, Tarikh al-Rusul wa al-Muluk, events of 13 AH; al-Baladhuri, Futuh al-Buldan.'
  },
  {
    month: 6, day: null, precision: 'month', title: 'The Battle of the Camel', bn: 'জামালের যুদ্ধ',
    detail: 'Fought near Basra in Jumada al-Akhirah 36 AH (December 656 CE) during the caliphate of ‘Ali ibn Abi Talib; a painful episode of the first civil strife (fitnah). Al-Tabari dates it to 10 Jumada al-Akhirah; other reports differ.',
    detailBn: '৩৬ হিজরির জুমাদাল আখিরায় (ডিসেম্বর ৬৫৬ খ্রিষ্টাব্দ) আলী ইবনে আবি তালিব (রা.)-এর খিলাফতকালে বসরার কাছে সংঘটিত; প্রথম ফিতনার একটি বেদনাদায়ক অধ্যায়। আত-তাবারি ১০ জুমাদাল আখিরা উল্লেখ করেছেন; অন্য বর্ণনায় ভিন্নতা আছে।',
    dateLabel: 'Jumada al-Akhirah 36 AH · December 656 CE (exact day disputed)', dateLabelBn: 'জুমাদাল আখিরা ৩৬ হিজরি · ডিসেম্বর ৬৫৬ (সুনির্দিষ্ট দিন নিয়ে মতভেদ)',
    source: 'al-Tabari, Tarikh al-Rusul wa al-Muluk, events of 36 AH; Ibn Kathir, al-Bidayah wa al-Nihayah.'
  },
  {
    month: 6, day: 14, title: 'The death of Imam al-Ghazali', bn: 'ইমাম গাজালির ইন্তেকাল',
    detail: 'Abu Hamid al-Ghazali, the jurist and theologian, author of Ihya’ ‘Ulum al-Din, died in Tus on Monday 14 Jumada al-Akhirah 505 AH (December 1111 CE).',
    detailBn: 'ফকিহ ও ধর্মতাত্ত্বিক, ‘ইহইয়াউ উলুমিদ্দিন’-এর লেখক আবু হামিদ আল-গাজালি ৫০৫ হিজরির ১৪ জুমাদাল আখিরা সোমবার (ডিসেম্বর ১১১১ খ্রিষ্টাব্দ) তুস নগরীতে ইন্তেকাল করেন।',
    dateLabel: '14 Jumada al-Akhirah 505 AH · December 1111 CE', dateLabelBn: '১৪ জুমাদাল আখিরা ৫০৫ হিজরি · ডিসেম্বর ১১১১',
    source: 'Ibn al-Jawzi, al-Muntazam, events of 505 AH; Ibn Khallikan, Wafayat al-A‘yan; al-Subki, Tabaqat al-Shafi‘iyyah al-Kubra.'
  },
  {
    month: 2, day: null, precision: 'month', title: 'The tragedy of Bi’r Ma‘unah', bn: 'বি’রে মাউনার মর্মান্তিক ঘটনা',
    detail: 'About seventy Companions known for reciting the Qur’an were sent to teach and were killed at the well of Ma‘unah. The Prophet ﷺ supplicated against the killers in the dawn prayer for a month. Ibn Ishaq places it in Safar 4 AH.',
    detailBn: 'কুরআন শিক্ষা দেওয়ার জন্য পাঠানো প্রায় সত্তরজন কারি সাহাবিকে মাউনা কূপের কাছে হত্যা করা হয়। নবী ﷺ এক মাস ফজরের সালাতে হত্যাকারীদের বিরুদ্ধে দোয়া (কুনুত) করেন। ইবনে ইসহাক একে ৪ হিজরির সফর মাসে উল্লেখ করেছেন।',
    dateLabel: 'Safar 4 AH · 625 CE (month-level)', dateLabelBn: 'সফর ৪ হিজরি · ৬২৫ খ্রিষ্টাব্দ (মাসভিত্তিক)',
    source: 'Sahih al-Bukhari 4088–4096; Sahih Muslim 677; Ibn Hisham, al-Sirah al-Nabawiyyah (date).'
  },
  {
    month: 2, day: 27, title: 'The death of Salah al-Din', bn: 'সালাহউদ্দিনের ইন্তেকাল',
    detail: 'Salah al-Din Yusuf ibn Ayyub, who recovered Jerusalem in 583 AH, died in Damascus on Wednesday 27 Safar 589 AH (March 1193 CE), as recorded by his companion and biographer Baha’ al-Din Ibn Shaddad.',
    detailBn: '৫৮৩ হিজরিতে জেরুজালেম পুনরুদ্ধারকারী সালাহউদ্দিন ইউসুফ ইবনে আইয়ুব ৫৮৯ হিজরির ২৭ সফর বুধবার (মার্চ ১১৯৩ খ্রিষ্টাব্দ) দামেস্কে ইন্তেকাল করেন—তাঁর সঙ্গী ও জীবনীকার বাহাউদ্দিন ইবনে শাদ্দাদের বর্ণনা অনুযায়ী।',
    dateLabel: '27 Safar 589 AH · March 1193 CE', dateLabelBn: '২৭ সফর ৫৮৯ হিজরি · মার্চ ১১৯৩',
    source: 'Baha’ al-Din Ibn Shaddad, al-Nawadir al-Sultaniyyah; Ibn Khallikan, Wafayat al-A‘yan.'
  },
  {
    month: 2, day: null, precision: 'month', title: 'The Battle of Siffin', bn: 'সিফফিনের যুদ্ধ',
    detail: 'Fought on the Euphrates in Safar 37 AH (July 657 CE) between the forces of ‘Ali ibn Abi Talib and Mu‘awiyah, ending in arbitration. Days of fighting extended over several weeks, so this is a month-level match.',
    detailBn: '৩৭ হিজরির সফরে (জুলাই ৬৫৭ খ্রিষ্টাব্দ) ফোরাত নদীর তীরে আলী ইবনে আবি তালিব (রা.) ও মুআবিয়া (রা.)-এর বাহিনীর মধ্যে সংঘটিত; সালিশের মাধ্যমে শেষ হয়। লড়াই কয়েক সপ্তাহ ধরে চলায় এটি মাসভিত্তিক মিল।',
    dateLabel: 'Safar 37 AH · July 657 CE (month-level)', dateLabelBn: 'সফর ৩৭ হিজরি · জুলাই ৬৫৭ (মাসভিত্তিক)',
    source: 'al-Tabari, Tarikh al-Rusul wa al-Muluk, events of 37 AH; Nasr ibn Muzahim, Waq‘at Siffin.'
  },
  {
    month: 3, day: 12, title: 'The death of Imam Ahmad ibn Hanbal', bn: 'ইমাম আহমদ ইবনে হাম্বলের ইন্তেকাল',
    detail: 'Imam Ahmad ibn Hanbal, compiler of the Musnad and founder of the Hanbali school, died in Baghdad on Friday 12 Rabi‘ al-Awwal 241 AH (855 CE); some reports give the 13th.',
    detailBn: 'মুসনাদের সংকলক ও হাম্বলি মাযহাবের প্রতিষ্ঠাতা ইমাম আহমদ ইবনে হাম্বল ২৪১ হিজরির ১২ রবিউল আউয়াল শুক্রবার (৮৫৫ খ্রিষ্টাব্দ) বাগদাদে ইন্তেকাল করেন; কোনো বর্ণনায় ১৩ তারিখ বলা হয়েছে।',
    dateLabel: '12 Rabi‘ al-Awwal 241 AH · 855 CE (some say the 13th)', dateLabelBn: '১২ রবিউল আউয়াল ২৪১ হিজরি · ৮৫৫ (কারও মতে ১৩ তারিখ)',
    source: 'al-Dhahabi, Siyar A‘lam al-Nubala’; Ibn Kathir, al-Bidayah wa al-Nihayah, events of 241 AH.'
  },
  {
    month: 7, day: null, precision: 'month', title: 'The first emigration to Abyssinia', bn: 'হাবশায় প্রথম হিজরত',
    detail: 'A small group of Muslims, including ‘Uthman ibn ‘Affan and Ruqayyah, emigrated to the Negus in Abyssinia to escape persecution in Makkah. Ibn Sa‘d places it in Rajab of the fifth year of prophethood.',
    detailBn: 'মক্কায় নির্যাতন থেকে বাঁচতে উসমান ইবনে আফফান (রা.) ও রুকাইয়া (রা.)-সহ মুসলমানদের একটি ছোট দল হাবশার বাদশাহ নাজাশির কাছে হিজরত করেন। ইবনে সাদ একে নবুয়তের পঞ্চম বছরের রজব মাসে উল্লেখ করেছেন।',
    dateLabel: 'Rajab, 5th year of prophethood · c. 615 CE (month-level)', dateLabelBn: 'রজব, নবুয়তের পঞ্চম বছর · আনুমানিক ৬১৫ (মাসভিত্তিক)',
    source: 'Ibn Sa‘d, al-Tabaqat al-Kubra; Ibn Hisham, al-Sirah al-Nabawiyyah; Sahih al-Bukhari 3872 (the emigration).'
  },
  {
    month: 7, day: null, precision: 'month', title: 'The Battle of Yarmuk', bn: 'ইয়ারমুকের যুদ্ধ',
    detail: 'A decisive battle against the Byzantine army near the Yarmuk river. Al-Tabari reports Rajab 15 AH (August 636 CE) among other dates; historians differ, so this is a qualified month-level match.',
    detailBn: 'ইয়ারমুক নদীর কাছে বাইজান্টাইন বাহিনীর বিরুদ্ধে একটি নির্ণায়ক যুদ্ধ। আত-তাবারি অন্যান্য মতের সঙ্গে ১৫ হিজরির রজব (আগস্ট ৬৩৬ খ্রিষ্টাব্দ) উল্লেখ করেছেন; ঐতিহাসিকদের মতভেদ থাকায় এটি শর্তসাপেক্ষ মাসভিত্তিক মিল।',
    dateLabel: 'Rajab 15 AH · August 636 CE (date disputed)', dateLabelBn: 'রজব ১৫ হিজরি · আগস্ট ৬৩৬ (তারিখ নিয়ে মতভেদ)',
    source: 'al-Tabari, Tarikh al-Rusul wa al-Muluk, events of 15 AH; al-Baladhuri, Futuh al-Buldan.'
  },
  {
    month: 7, day: null, precision: 'month', title: 'The death of Imam al-Shafi‘i', bn: 'ইমাম শাফেয়ির ইন্তেকাল',
    detail: 'Imam Muhammad ibn Idris al-Shafi‘i, founder of the Shafi‘i school, died in Egypt on the last night of Rajab 204 AH (January 820 CE), as reported by his student al-Rabi‘ ibn Sulayman.',
    detailBn: 'শাফেয়ি মাযহাবের প্রতিষ্ঠাতা ইমাম মুহাম্মদ ইবনে ইদরিস আশ-শাফেয়ি ২০৪ হিজরির রজব মাসের শেষ রাতে (জানুয়ারি ৮২০ খ্রিষ্টাব্দ) মিসরে ইন্তেকাল করেন—তাঁর ছাত্র রবি ইবনে সুলাইমানের বর্ণনা অনুযায়ী।',
    dateLabel: 'End of Rajab 204 AH · January 820 CE', dateLabelBn: 'রজবের শেষ রাত ২০৪ হিজরি · জানুয়ারি ৮২০',
    source: 'Ibn Khallikan, Wafayat al-A‘yan; al-Dhahabi, Siyar A‘lam al-Nubala’.'
  },
  {
    month: 7, day: 24, title: 'The death of Imam al-Nawawi', bn: 'ইমাম নববির ইন্তেকাল',
    detail: 'Yahya ibn Sharaf al-Nawawi, author of Riyad al-Salihin, al-Arba‘in and the commentary on Sahih Muslim, died in Nawa on 24 Rajab 676 AH (December 1277 CE).',
    detailBn: '‘রিয়াদুস সালিহিন’, ‘আল-আরবাঈন’ ও সহিহ মুসলিমের ব্যাখ্যাগ্রন্থের লেখক ইয়াহইয়া ইবনে শারাফ আন-নববি ৬৭৬ হিজরির ২৪ রজব (ডিসেম্বর ১২৭৭ খ্রিষ্টাব্দ) নাওয়া গ্রামে ইন্তেকাল করেন।',
    dateLabel: '24 Rajab 676 AH · December 1277 CE', dateLabelBn: '২৪ রজব ৬৭৬ হিজরি · ডিসেম্বর ১২৭৭',
    source: 'Ibn al-‘Attar, Tuhfat al-Talibin fi Tarjamat al-Imam Muhyi al-Din; al-Dhahabi, Tarikh al-Islam.'
  },
  {
    month: 8, day: null, precision: 'month', title: 'Fasting in Ramadan is made obligatory', bn: 'রমজানের রোজা ফরজ হয়',
    detail: 'The fast of Ramadan was prescribed (Qur’an 2:183–185) in Sha‘ban of 2 AH, so the first obligatory Ramadan fast was in 2 AH, the year of Badr.',
    detailBn: 'রমজানের রোজা (কুরআন ২:১৮৩–১৮৫) ২ হিজরির শাবান মাসে ফরজ করা হয়; তাই প্রথম ফরজ রমজানের রোজা ছিল বদরের বছর ২ হিজরিতে।',
    dateLabel: 'Sha‘ban 2 AH · 624 CE (month-level)', dateLabelBn: 'শাবান ২ হিজরি · ৬২৪ (মাসভিত্তিক)',
    source: 'Qur’an 2:183–185; al-Tabari, Tarikh, events of 2 AH; Ibn Sa‘d, al-Tabaqat al-Kubra.'
  },
  {
    month: 8, day: null, precision: 'month', title: 'The expedition of Banu al-Mustaliq (al-Muraysi‘)', bn: 'বনু মুস্তালিক (মুরাইসি) অভিযান',
    detail: 'The expedition to Banu al-Mustaliq took place in Sha‘ban; Ibn Ishaq says 6 AH and Musa ibn ‘Uqbah 5 AH. The slander against ‘A’ishah (al-Ifk) arose on the return journey.',
    detailBn: 'বনু মুস্তালিক অভিযান শাবান মাসে হয়; ইবনে ইসহাক ৬ হিজরি এবং মূসা ইবনে উকবা ৫ হিজরি বলেছেন। ফেরার পথে আয়েশা (রা.)-এর বিরুদ্ধে অপবাদের (ইফক) ঘটনা ঘটে।',
    dateLabel: 'Sha‘ban 5 or 6 AH · 626–627 CE (year disputed)', dateLabelBn: 'শাবান ৫ বা ৬ হিজরি · ৬২৬–৬২৭ (বছর নিয়ে মতভেদ)',
    source: 'Sahih al-Bukhari, Kitab al-Maghazi, chapter on Banu al-Mustaliq (before 4138) and 4141; Ibn Hisham, al-Sirah al-Nabawiyyah.'
  },
  {
    month: 9, day: null, precision: 'month', title: 'The death of Khadijah', bn: 'খাদিজা (রা.)-এর ইন্তেকাল',
    detail: 'Khadijah bint Khuwaylid, the Prophet’s first wife and the first to believe in him, died in Makkah in the tenth year of prophethood. Ibn Sa‘d places it in Ramadan; the year is remembered as the Year of Sorrow.',
    detailBn: 'নবী ﷺ-এর প্রথম স্ত্রী এবং সর্বপ্রথম ঈমান আনয়নকারী খাদিজা বিনতে খুয়াইলিদ (রা.) নবুয়তের দশম বছরে মক্কায় ইন্তেকাল করেন। ইবনে সাদ একে রমজান মাসে উল্লেখ করেছেন; বছরটি ‘দুঃখের বছর’ নামে স্মরণীয়।',
    dateLabel: 'Ramadan, 10th year of prophethood · c. 619 CE (month reported by Ibn Sa‘d)', dateLabelBn: 'রমজান, নবুয়তের দশম বছর · আনুমানিক ৬১৯ (ইবনে সাদের বর্ণনা)',
    source: 'Ibn Sa‘d, al-Tabaqat al-Kubra; Sahih al-Bukhari 3896.'
  },
  {
    month: 9, day: null, precision: 'month', title: 'The landing in al-Andalus and Guadalete', bn: 'আন্দালুসে অবতরণ ও গুয়াদালেতের যুদ্ধ',
    detail: 'The army of Tariq ibn Ziyad defeated the Visigothic king Roderic at the Guadalete in Ramadan 92 AH (July 711 CE), opening al-Andalus. Sources differ on the exact days.',
    detailBn: 'তারিক ইবনে যিয়াদের বাহিনী ৯২ হিজরির রমজানে (জুলাই ৭১১ খ্রিষ্টাব্দ) গুয়াদালেতে ভিসিগথ রাজা রডারিককে পরাজিত করে, যা আন্দালুসের দ্বার খুলে দেয়। নির্দিষ্ট দিন নিয়ে সূত্রে মতভেদ আছে।',
    dateLabel: 'Ramadan 92 AH · July 711 CE (exact days disputed)', dateLabelBn: 'রমজান ৯২ হিজরি · জুলাই ৭১১ (সুনির্দিষ্ট দিন নিয়ে মতভেদ)',
    source: 'Ibn ‘Idhari, al-Bayan al-Mughrib; al-Maqqari, Nafh al-Tib.'
  },
  {
    month: 10, day: 1, title: 'The death of Imam al-Bukhari', bn: 'ইমাম বুখারির ইন্তেকাল',
    detail: 'Muhammad ibn Isma‘il al-Bukhari, compiler of al-Jami‘ al-Sahih, died in Khartank near Samarkand on the night of Eid al-Fitr, 1 Shawwal 256 AH (870 CE).',
    detailBn: '‘আল-জামি আস-সহিহ’-এর সংকলক মুহাম্মদ ইবনে ইসমাঈল আল-বুখারি ২৫৬ হিজরির ঈদুল ফিতরের রাতে, ১ শাওয়াল (৮৭০ খ্রিষ্টাব্দ) সমরকন্দের কাছে খারতাংয়ে ইন্তেকাল করেন।',
    dateLabel: '1 Shawwal 256 AH · 870 CE', dateLabelBn: '১ শাওয়াল ২৫৬ হিজরি · ৮৭০',
    source: 'al-Khatib al-Baghdadi, Tarikh Baghdad; Ibn Hajar, Hady al-Sari (introduction to Fath al-Bari).'
  },
  {
    month: 10, day: null, precision: 'month', title: 'The marriage of the Prophet ﷺ and ‘A’ishah', bn: 'নবী ﷺ ও আয়েশা (রা.)-এর বিবাহ',
    detail: '‘A’ishah reported that the Prophet ﷺ married her in Shawwal and that her marriage was consummated in Shawwal, answering a pre-Islamic superstition against marrying in that month.',
    detailBn: 'আয়েশা (রা.) বর্ণনা করেন, নবী ﷺ তাঁকে শাওয়াল মাসে বিবাহ করেন এবং শাওয়ালেই দাম্পত্য জীবন শুরু হয়—যা ওই মাসে বিয়ে নিয়ে জাহিলি কুসংস্কারের জবাব ছিল।',
    dateLabel: 'Shawwal (month stated in the hadith)', dateLabelBn: 'শাওয়াল (হাদিসে মাস উল্লেখিত)',
    source: 'Sahih Muslim 1423.'
  },
  {
    month: 11, day: null, precision: 'month', title: '‘Umrat al-Qada’', bn: 'উমরাতুল কাযা',
    detail: 'A year after al-Hudaybiyyah, the Prophet ﷺ and the Companions performed the make-up ‘Umrah in Dhul Qa‘dah 7 AH, as agreed in the treaty. Anas reported that all his ‘Umrahs except the one with his Hajj were in Dhul Qa‘dah.',
    detailBn: 'হুদায়বিয়ার এক বছর পর চুক্তি অনুযায়ী ৭ হিজরির জিলকদ মাসে নবী ﷺ ও সাহাবিরা কাযা উমরাহ আদায় করেন। আনাস (রা.) বর্ণনা করেন, হজের সঙ্গে আদায়কৃত উমরাহ ছাড়া তাঁর সব উমরাহ জিলকদ মাসে ছিল।',
    dateLabel: 'Dhul Qa‘dah 7 AH · 629 CE (month-level)', dateLabelBn: 'জিলকদ ৭ হিজরি · ৬২৯ (মাসভিত্তিক)',
    source: 'Sahih al-Bukhari 1778 and 4252; Sahih Muslim 1253.'
  },
  {
    month: 11, day: null, precision: 'month', title: 'The Battle of Manzikert (Malazgirt)', bn: 'মালাজগির্দের যুদ্ধ',
    detail: 'The Seljuk sultan Alp Arslan defeated the Byzantine emperor Romanos IV near Manzikert in Dhul Qa‘dah 463 AH (August 1071 CE), opening Anatolia to Muslim settlement.',
    detailBn: 'সেলজুক সুলতান আলপ আরসলান ৪৬৩ হিজরির জিলকদ মাসে (আগস্ট ১০৭১ খ্রিষ্টাব্দ) মালাজগির্দের কাছে বাইজান্টাইন সম্রাট চতুর্থ রোমানোসকে পরাজিত করেন, যা আনাতোলিয়ায় মুসলিম বসতির পথ খুলে দেয়।',
    dateLabel: 'Dhul Qa‘dah 463 AH · August 1071 CE (month-level)', dateLabelBn: 'জিলকদ ৪৬৩ হিজরি · আগস্ট ১০৭১ (মাসভিত্তিক)',
    source: 'Ibn al-Athir, al-Kamil fi al-Tarikh, events of 463 AH.'
  },
  {
    month: 11, day: 20, title: 'The death of Ibn Taymiyyah', bn: 'ইবনে তাইমিয়ার ইন্তেকাল',
    detail: 'Taqi al-Din Ibn Taymiyyah, the Hanbali scholar, died while imprisoned in the citadel of Damascus on 20 Dhul Qa‘dah 728 AH (September 1328 CE); a very large crowd attended his funeral.',
    detailBn: 'হাম্বলি আলেম তাকিউদ্দিন ইবনে তাইমিয়া ৭২৮ হিজরির ২০ জিলকদ (সেপ্টেম্বর ১৩২৮ খ্রিষ্টাব্দ) দামেস্কের দুর্গে বন্দি অবস্থায় ইন্তেকাল করেন; তাঁর জানাজায় বিপুল মানুষ অংশ নেয়।',
    dateLabel: '20 Dhul Qa‘dah 728 AH · September 1328 CE', dateLabelBn: '২০ জিলকদ ৭২৮ হিজরি · সেপ্টেম্বর ১৩২৮',
    source: 'Ibn Kathir, al-Bidayah wa al-Nihayah, events of 728 AH; Ibn ‘Abd al-Hadi, al-‘Uqud al-Durriyyah.'
  },
  {
    month: 12, day: 26, title: '‘Umar ibn al-Khattab is stabbed', bn: 'উমর ইবনুল খাত্তাব (রা.) আহত হন',
    detail: 'The second caliph ‘Umar was stabbed while leading the Fajr prayer in late Dhul Hijjah 23 AH (November 644 CE) and died days later. Al-Tabari reports 26 Dhul Hijjah for the attack; some reports give the 27th.',
    detailBn: 'দ্বিতীয় খলিফা উমর (রা.) ২৩ হিজরির জিলহজের শেষ দিকে (নভেম্বর ৬৪৪ খ্রিষ্টাব্দ) ফজরের সালাতে ইমামতির সময় ছুরিকাহত হন এবং কয়েক দিন পর শাহাদাত বরণ করেন। আত-তাবারি আক্রমণের তারিখ ২৬ জিলহজ বলেছেন; কোনো বর্ণনায় ২৭ তারিখ।',
    dateLabel: '26 Dhul Hijjah 23 AH · November 644 CE (some say the 27th)', dateLabelBn: '২৬ জিলহজ ২৩ হিজরি · নভেম্বর ৬৪৪ (কারও মতে ২৭ তারিখ)',
    source: 'Sahih al-Bukhari 3700; al-Tabari, Tarikh al-Rusul wa al-Muluk, events of 23 AH.'
  }
];
