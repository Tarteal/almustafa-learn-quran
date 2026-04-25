export interface BlogPost {
  slug: string;
  cat: string;
  date: string;        // ISO for SEO
  dateLabel: string;   // human readable
  readTime: string;
  title: string;
  excerpt: string;
  author: { name: string; role: string; initial: string };
  gradient: string;
  /** Body as ordered blocks for typed rendering */
  body: Block[];
}

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "list"; items: string[] }
  | { type: "ayah"; arabic: string; translation: string; ref: string };

export const posts: BlogPost[] = [
  {
    slug: "5-common-mistakes-in-madd",
    cat: "Tajweed",
    date: "2026-04-12",
    dateLabel: "Apr 12, 2026",
    readTime: "6 min read",
    title: "5 Common Mistakes in Madd — and How to Fix Them",
    excerpt:
      "Lengthening (Madd) is one of the most beautiful aspects of Tajweed, but it's easy to overlook the subtleties. Here's how to perfect yours.",
    author: { name: "Sheikh Abdullah Al-Misri", role: "Senior Tajweed Instructor", initial: "A" },
    gradient: "from-emerald-deep to-emerald",
    body: [
      { type: "p", text: "Madd — the art of elongating vowels — is what gives the Quran its haunting, melodic beauty. Yet it's also one of the easiest rules to misapply. Over fifteen years of teaching, I've noticed the same five mistakes appearing again and again, even in advanced students." },
      { type: "p", text: "The good news? Each one has a clear, practical fix. Master these and your recitation will instantly sound more measured, more reverent, and closer to the way the Companions ﷺ recited." },
      { type: "h2", text: "1. Inconsistent Madd Tabee'i length" },
      { type: "p", text: "Madd Tabee'i — the natural two-count Madd — should be exactly two harakat (counts). Most students rush it to one and a half on familiar verses, then over-stretch it to three on unfamiliar ones. Use a metronome at 60 BPM and treat each beat as one harakah. You'll feel the difference within a week." },
      { type: "h2", text: "2. Confusing Madd Munfasil with Madd Muttasil" },
      { type: "p", text: "Munfasil (separated) is permissible at 2, 4, or 5 counts depending on your riwayah. Muttasil (connected) requires a minimum of 4. Many students stretch both equally and lose the distinction. Pick one count for each and stay consistent throughout the entire session." },
      { type: "ayah", arabic: "وَلَا الضَّآلِّينَ", translation: "Nor of those who go astray.", ref: "Al-Fatihah 1:7" },
      { type: "h2", text: "3. Over-stretching Madd Lazim" },
      { type: "p", text: "Madd Lazim is six counts — fixed, no exceptions. But six is longer than people instinctively feel, so most under-stretch it to four or five. Tap your hand on the table six times before you reach the next letter. Awkward at first, perfectly Quranic by week two." },
      { type: "h2", text: "4. Forgetting Madd 'Aaridh at stops" },
      { type: "p", text: "When you stop on a verse ending with a Madd letter, you have three valid lengths: 2, 4, or 6. Pick one based on your reading style and stick to it for the whole sitting. Switching mid-Surah breaks the listener's flow and your own concentration." },
      { type: "h2", text: "5. Treating Madd as decoration" },
      { type: "quote", text: "He who does not recite the Quran with Tajweed is sinful, for it was revealed by Allah with Tajweed and reaches us with Tajweed.", cite: "Imam Ibn al-Jazari" },
      { type: "p", text: "Madd is not ornamentation — it's the structure of revelation. Once you internalize that, you'll stop trying to 'make it sound nice' and start letting the rules do the work." },
      { type: "h2", text: "Your next step" },
      { type: "p", text: "Pick one mistake from this list. Just one. Spend a week correcting only that. Record yourself reading Surah Al-Fatihah on day 1 and day 7 — you'll be amazed at the change." },
    ],
  },
  {
    slug: "memorize-quran-while-working-full-time",
    cat: "Hifz",
    date: "2026-04-05",
    dateLabel: "Apr 5, 2026",
    readTime: "8 min read",
    title: "How to Memorize Quran While Working Full-Time",
    excerpt:
      "A practical guide to building a sustainable Hifz routine alongside your career, with sample weekly schedules.",
    author: { name: "Hafiz Yusuf Khan", role: "Hifz Program Director", initial: "Y" },
    gradient: "from-gold-deep to-gold",
    body: [
      { type: "p", text: "I started Hifz at 31, with two kids, a 50-hour-a-week engineering job, and zero free time. Six years later, alhamdulillah, I completed the Quran. If I can do it, you can too — but only with the right system. Motivation is not a system." },
      { type: "h2", text: "The 20-minute foundation" },
      { type: "p", text: "Forget the romantic idea of memorizing for two hours after work. It won't happen. Commit to twenty minutes — that's it. Twenty minutes every day for a year is 122 hours, and that's enough to memorize roughly 5–8 ajzaa with a good teacher." },
      { type: "list", items: [
        "10 minutes new memorization (sabaq) — first thing in the morning, before phone, before email.",
        "5 minutes reviewing yesterday's portion (sabqi).",
        "5 minutes reviewing the past week (manzil).",
      ]},
      { type: "h2", text: "Why mornings beat evenings" },
      { type: "p", text: "Your brain consolidates memory during sleep. Memorize at night and you go to sleep before consolidation happens — by morning, half is gone. Memorize at Fajr and you have the entire day to recall it, plus the verses ride into your sleep already half-stored." },
      { type: "ayah", arabic: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ", translation: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?", ref: "Al-Qamar 54:17" },
      { type: "h2", text: "A sample week (working professional)" },
      { type: "p", text: "Here is the exact schedule three of my recent students used. Adapt it — don't copy it." },
      { type: "list", items: [
        "Mon–Fri 5:30am: 20 min Hifz block (after Fajr).",
        "Lunch break: 5 min review while walking.",
        "Saturday 9:00am: 45 min consolidation with teacher (online).",
        "Sunday: full rest from new memorization, only review.",
      ]},
      { type: "h2", text: "The revision rule that saves everything" },
      { type: "p", text: "New memorization without revision is sand through fingers. Use the 1-7-30 rule: every new portion gets revisited the next day, then 7 days later, then 30 days later. Most students skip the 30-day mark and lose half their hifz by year two." },
      { type: "h2", text: "When you fall off — and you will" },
      { type: "quote", text: "The one who recites the Quran while it is difficult for him will have a double reward.", cite: "Sahih Muslim" },
      { type: "p", text: "I missed entire weeks. I lost months of memorization. I started over more than once. Each restart was easier than the last, because the foundation was still there. Allah ﷻ doesn't ask for perfection — He asks for return. Just come back." },
    ],
  },
  {
    slug: "raising-quran-loving-kids",
    cat: "Parenting",
    date: "2026-03-28",
    dateLabel: "Mar 28, 2026",
    readTime: "7 min read",
    title: "Raising Quran-Loving Kids: A Parent's Roadmap",
    excerpt:
      "From age 4 to 14 — practical milestones, dua suggestions, and gentle techniques that work in modern households.",
    author: { name: "Ustadha Fatima Siddiqui", role: "Children's Quran Educator", initial: "F" },
    gradient: "from-emerald to-gold-deep",
    body: [
      { type: "p", text: "The most common question I hear from parents: 'How do I make my child love the Quran?' My answer is always the same: you don't make them love it — you let them see you loving it." },
      { type: "p", text: "Children mirror what they witness, not what they're told. The roadmap below is built on that single principle, applied at age-appropriate stages." },
      { type: "h2", text: "Ages 4–6: The seed years" },
      { type: "p", text: "Goal at this age is exposure, not mastery. Play Quran softly during breakfast. Recite Surah Al-Fatihah out loud during Salah so they hear the rhythm. Don't quiz them. Don't correct them. Let the sounds settle in their bones." },
      { type: "list", items: [
        "5 minutes of Quran audio at the same time each day.",
        "Teach Bismillah before meals — make it a fun ritual, not a rule.",
        "Read Quran in front of them, not at them.",
      ]},
      { type: "h2", text: "Ages 7–10: The structure years" },
      { type: "p", text: "Now formal learning begins. Start with Noorani Qaida and short Surahs from Juz 'Amma. Twenty minutes of class, four days a week — never more. Reward effort, not output: praise the act of sitting down to learn, not the speed of memorizing." },
      { type: "ayah", arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي", translation: "My Lord, make me an establisher of prayer, and [many] from my descendants.", ref: "Ibrahim 14:40" },
      { type: "h2", text: "Ages 11–14: The ownership years" },
      { type: "p", text: "This is the hardest stage. They will push back. Your job is to shift from instructor to companion. Read together, ask their opinion on what a verse means, let them lead Salah at home. The Quran has to become theirs — not yours that you hand to them." },
      { type: "h2", text: "What never works" },
      { type: "list", items: [
        "Punishing missed memorization. It poisons the association forever.",
        "Comparing them to other kids. The Quran is not a race.",
        "Bribing with money or screens. The reward becomes the goal.",
        "Outsourcing entirely. You must show up, even for 5 minutes a day.",
      ]},
      { type: "h2", text: "A dua to make daily" },
      { type: "quote", text: "O Allah, make the Quran the spring of our hearts, the light of our chests, the remover of our sorrows, and the reliever of our anxieties.", cite: "Prophetic dua" },
      { type: "p", text: "Make this dua over your children every Friday. Watch what Allah does over the years. The seeds you plant today are not for tomorrow's harvest — they're for the next generation." },
    ],
  },
];

export const getPostBySlug = (slug: string) => posts.find((p) => p.slug === slug);
export const getRelatedPosts = (slug: string, count = 2) =>
  posts.filter((p) => p.slug !== slug).slice(0, count);
