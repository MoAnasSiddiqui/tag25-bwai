/**
 * Represents a news article with its title and content.
 */
export interface NewsArticle {
  /**
   * The title of the news article.
   */
  title: string;
  /**
   * The content of the news article.
   */
  content: string;
  /**
   * The source URL of the news article.
   */
  url: string;
}

/**
 * Asynchronously scrapes a news website and retrieves the latest news articles.
 *
 * @param websiteUrl The URL of the news website to scrape.
 * @returns A promise that resolves to an array of NewsArticle objects.
 */
export async function scrapeNews(websiteUrl: string): Promise<NewsArticle[]> {
  // TODO: Implement this by calling an API.

  const dummyArticles: NewsArticle[] = [
    {
      title:
        "Local Man Discovers Secret Portal in Refrigerator, Accidentally Attends 1987 Office Meeting",
      content:
        "In what experts are calling “a highly unusual time-space kitchen anomaly,” a man from Des Moines claims he stumbled upon a glowing vortex behind a jar of pickles in his refrigerator. John Mallory, 42, was reportedly reaching for mayonnaise when he “tripped into the shimmering void” and landed in a corporate meeting from 1987. Witnesses from that timeline said he arrived holding a Bluetooth speaker and muttering about AI regulation. Time scientists have neither confirmed nor denied the possibility of such fridge-based wormholes but suggest checking expiration dates more carefully in the future. Mallory brought back a paperclip and a note that reads “Invest in Netflix.” He has since boarded up his fridge and switched to takeout.",
      url: "https://example.com/news1",
    },
    {
      title:
        "World Leaders Meet for Emergency Summit on Rising Penguin Uprisings in the Southern Hemisphere",
      content:
        "In an unprecedented turn of events, world leaders have convened in Geneva to address a surge in coordinated penguin activity near research outposts across Antarctica and southern Chile. Intelligence agencies report that thousands of emperor and Adélie penguins have begun marching in militarized formations, surrounding scientific facilities and stealing lab equipment. “At first we thought it was cute,” said Dr. Elena Park, a climatologist stationed at McMurdo Base. “Then they took our satellite dish and started transmitting what sounded like Morse code.” Experts believe the penguins are protesting global warming, overfishing, and being consistently typecast as slapstick sidekicks in children’s films. Negotiators have dispatched a delegation of marine biologists and a Netflix executive to broker peace.",
      url: "https://example.com/news2",
    },
    {
      title:
        "Startup Launches Subscription Service for Renting Emotions—Beta Testers Confused and Crying",
      content:
        "Silicon Valley startup *FeelShare* has launched an experimental platform allowing users to “stream” emotions on demand via neural-linked headbands. The $29.99/month subscription includes packages like “Monday Motivation,” “Sunday Scaries,” and “First Love Flashback.” Beta testers report mixed results. One user, Greg Thomas, said he tried the “Creative Frenzy” package but ended up drawing cats for 12 hours straight and crying uncontrollably when his Sharpie ran dry. Critics call the technology “Black Mirror with worse UX,” but investors are pouring millions into FeelShare’s upcoming “Shared Breakup” bundle, which lets two strangers feel the same heartbreak simultaneously. Meanwhile, therapists are seeing a spike in patients who “don’t know which feelings are theirs anymore.”",
      url: "https://example.com/news3",
    },
    {
      title:
        "Aliens Land in Kansas, Ask for WiFi Password, Leave After Realizing We Still Use 5G",
      content:
        "A brief extraterrestrial encounter rocked a small Kansas town yesterday when a saucer-shaped craft landed outside a gas station and three humanoid figures exited, politely requesting Earth’s “universal access code.” The beings, described as “glowing, polite, and deeply judgmental,” quickly grew unimpressed when shown the station’s spotty 5G signal and a YouTube ad for a financial guru. “They took one look at our bandwidth and just shook their heads,” said employee Carla Jenkins. Witnesses say the aliens muttered something that translated roughly to “primitive planet, still buffering,” before departing at light speed. NASA has declined comment, but leaked footage shows one alien leaving behind a note that reads: “We’ll check back in 3025. Maybe.”",
      url: "https://example.com/news4",
    },
    {
      title:
        "Underground Society of Cats Apparently Running Shadow Government, Whistleblower Claims",
      content:
        "In a leak that’s shocking yet strangely validating to cat owners, a whistleblower from within the Department of Homeland Security claims a covert feline network has been operating beneath major cities for decades. Codenamed “Operation Litterbox,” the organization allegedly involves cats influencing high-level decisions by controlling dreams, manipulating AI algorithms, and occasionally tripping humans on stairs. The whistleblower, identified only as “Garfield,” released documents detailing how cats communicate through subtle paw gestures and shadow meetings held at 3 a.m. Experts point to recent strange political decisions and sudden bursts of productivity in “cat-heavy households” as possible signs. The White House press secretary denied all claims, though one reporter noted an orange tabby was spotted sleeping in the Situation Room.",
      url: "https://example.com/news5",
    },
  ];

  return dummyArticles;
}
