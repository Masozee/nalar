// Expert Data Model
export interface Expert {
  id: number;
  slug: string;
  name: string;
  position: string;
  department: string;
  image: string;
  bio: string;
  expertise: string[];
  education: string[];
  email?: string;
  twitter?: string;
  linkedin?: string;
  publications?: {
    title: string;
    url: string;
    year: number;
    type: 'Book' | 'Journal Article' | 'Working Paper' | 'Policy Brief' | 'Commentary';
  }[];
  speaking_engagements?: {
    title: string;
    event: string;
    date: string;
    location: string;
  }[];
  featured: boolean;
}

// Mock data based on actual CSIS Indonesia scholars
export const EXPERTS: Expert[] = [
  {
    id: 1,
    slug: "philips-vermonte",
    name: "Dr. Philips J. Vermonte",
    position: "Executive Director",
    department: "Board of Directors",
    image: "/bg/boston-public-library-4yPHCb1SPR4-unsplash.jpg",
    bio: `Dr. Philips J. Vermonte is the Executive Director of the Centre for Strategic and International Studies (CSIS), Jakarta. Prior to his appointment, from 2014-2018, he was the Head of Department of Politics and International Relations. He joined CSIS in 2001 as a researcher in the Department of Politics and International Relations. His research interests include comparative politics, electoral politics, electoral behavior, voting pattern, and foreign policy.

    Dr. Vermonte earned his Master's Degree in international studies (with distinction) from the Department of Politics, the University of Adelaide, Australia, in 2003. He obtained his Ph.D. in Political Science from Northern Illinois University, Dekalb, USA, in 2012 through a Fulbright Presidential Scholarship between 2007 and 2012. In 2008, Dr. Vermonte was awarded The Best Teaching Assistant at the Department of Political Science, Northern Illinois University.

    He has taught at several universities in Jakarta, namely Universitas Katolik Atma Jaya, Universitas Pembangunan Nasional "Veteran" Jakarta, and Universitas Indonesia. In his capacity at CSIS, Dr. Vermonte has been involved in various research projects on elections, democratization, conflict resolution, political parties, terrorism, leadership, and decentralization, both in Indonesia and in other countries.`,
    expertise: ["Indonesian Politics", "Democratization", "Foreign Policy", "Electoral Politics"],
    education: [
      "Ph.D. in Political Science, Northern Illinois University, USA",
      "Master's Degree in International Studies, University of Adelaide, Australia",
      "Bachelor's Degree in Political Science, Universitas Indonesia"
    ],
    email: "philips.vermonte@csis.or.id",
    twitter: "pvermonte",
    linkedin: "philips-vermonte",
    publications: [
      {
        title: "Democratization and Foreign Policy in Indonesia: A Case Study of the 2019 General Election",
        url: "#",
        year: 2020,
        type: "Journal Article"
      },
      {
        title: "Political Parties and Democratic Consolidation in Indonesia",
        url: "#",
        year: 2019,
        type: "Book"
      },
      {
        title: "Indonesia's Foreign Policy Under President Joko Widodo",
        url: "#",
        year: 2018,
        type: "Policy Brief"
      }
    ],
    speaking_engagements: [
      {
        title: "Indonesia's Democracy: Progress and Challenges",
        event: "Annual Conference on Southeast Asian Studies",
        date: "May 2023",
        location: "Singapore"
      },
      {
        title: "Foreign Policy Directions in Indonesia",
        event: "ASEAN Forum",
        date: "November 2022",
        location: "Jakarta, Indonesia"
      }
    ],
    featured: true
  },
  {
    id: 2,
    slug: "shafiah-muhibat",
    name: "Dr. Shafiah F. Muhibat",
    position: "Head of Department of International Relations",
    department: "Department of International Relations",
    image: "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png",
    bio: `Dr. Shafiah F. Muhibat is Head of the Department of International Relations at CSIS in Jakarta, Indonesia. She specializes in issues of regional security including maritime security, regional cooperation in the Indo-Pacific, and Indonesia's foreign policy. 

    Dr. Muhibat earned her Master's degree in International Relations from the University of Birmingham, and her Ph.D. in Political Science from the University of Hamburg, Germany. She is also a faculty member at the Indonesian Defense University (Unhan).
    
    She has been involved in various research projects on regional security issues, maritime affairs, and counter-terrorism. Her research interests include Indonesia's foreign policy, ASEAN security, Indo-Pacific strategy, and maritime security governance.`,
    expertise: ["Maritime Security", "Regional Cooperation", "Indonesia's Foreign Policy", "ASEAN"],
    education: [
      "Ph.D. in Political Science, University of Hamburg, Germany",
      "Master's Degree in International Relations, University of Birmingham, UK",
      "Bachelor's Degree, Universitas Indonesia"
    ],
    email: "shafiah.muhibat@csis.or.id",
    linkedin: "shafiah-muhibat",
    publications: [
      {
        title: "Maritime Security Challenges in Southeast Asia: Analysis of International Cooperation",
        url: "#",
        year: 2021,
        type: "Journal Article"
      },
      {
        title: "The Future of the Indo-Pacific: Emerging Challenges",
        url: "#",
        year: 2020,
        type: "Working Paper"
      }
    ],
    speaking_engagements: [
      {
        title: "Maritime Security in the Indo-Pacific",
        event: "Indo-Pacific Security Dialogue",
        date: "October 2023",
        location: "Jakarta, Indonesia"
      }
    ],
    featured: true
  },
  {
    id: 3,
    slug: "yose-rizal-damuri",
    name: "Dr. Yose Rizal Damuri",
    position: "Head of Department of Economics",
    department: "Department of Economics",
    image: "/bg/wildan-kurniawan-m0JLVP04Heo-unsplash.png",
    bio: `Dr. Yose Rizal Damuri is the Head of the Department of Economics at the Centre for Strategic and International Studies (CSIS) in Jakarta. He has been with CSIS since 2001, with primary research interests in international trade, regional integration, and the digital economy.

    Dr. Damuri earned his doctoral degree in Economics from the University of Adelaide, Australia. He has extensive experience as a consultant for various international organizations, including the World Bank, Asian Development Bank, and World Trade Organization (WTO). He has been involved in numerous research projects related to economic policy issues in Indonesia and East Asia.
    
    His areas of expertise include international trade policy, regional economic integration, and more recently, the digital economy and innovation. He has published numerous articles in peer-reviewed journals and has authored several books on these topics.`,
    expertise: ["International Trade", "Regional Economic Integration", "Digital Economy", "Economic Policy"],
    education: [
      "Ph.D. in Economics, University of Adelaide, Australia",
      "Master's Degree in Economics, University of Adelaide, Australia",
      "Bachelor's Degree in Engineering, Institut Teknologi Bandung"
    ],
    email: "yose.damuri@csis.or.id",
    twitter: "yosedamuri",
    linkedin: "yose-rizal-damuri",
    publications: [
      {
        title: "The State of Digital Economy in Indonesia",
        url: "#",
        year: 2022,
        type: "Book"
      },
      {
        title: "Indonesia and Regional Comprehensive Economic Partnership",
        url: "#",
        year: 2021,
        type: "Policy Brief"
      },
      {
        title: "Post-Pandemic Economic Recovery: Opportunities and Challenges for Indonesia",
        url: "#",
        year: 2020,
        type: "Working Paper"
      }
    ],
    speaking_engagements: [
      {
        title: "Digital Economy in Southeast Asia",
        event: "ASEAN Economic Forum",
        date: "January 2023",
        location: "Bangkok, Thailand"
      },
      {
        title: "Indonesia's Economic Outlook",
        event: "Indonesia Economic Dialogue",
        date: "March 2023",
        location: "Jakarta, Indonesia"
      }
    ],
    featured: true
  },
  {
    id: 4,
    slug: "noory-okthariza",
    name: "Noory Okthariza",
    position: "Head of Department of Politics and Social Change",
    department: "Department of Politics and Social Change",
    image: "/bg/planet-volumes-iPxknAs9h3Y-unsplash.jpg",
    bio: `Noory Okthariza is Head of the Department of Politics and Social Change at CSIS Indonesia. His research focuses on Indonesian politics, political parties, electoral politics, democratization, and public opinion. 

    He has been involved in various research projects on elections, democratization, and political behavior in Indonesia. He has published articles in various journals and media outlets on these topics.
    
    Before joining CSIS, he was a researcher at several institutions in Indonesia. He holds a Master's degree in Political Science and is currently pursuing his doctoral studies.`,
    expertise: ["Indonesian Politics", "Electoral Politics", "Democratization", "Political Parties"],
    education: [
      "Master's Degree in Political Science",
      "Bachelor's Degree, Universitas Indonesia"
    ],
    email: "noory.okthariza@csis.or.id",
    twitter: "nookthariza",
    publications: [
      {
        title: "The Dynamics of Indonesian Political Parties",
        url: "#",
        year: 2021,
        type: "Journal Article"
      },
      {
        title: "Public Opinion and Electoral Politics in Indonesia",
        url: "#",
        year: 2020,
        type: "Working Paper"
      }
    ],
    featured: false
  },
  {
    id: 5,
    slug: "lina-alexandra",
    name: "Dr. Lina Alexandra",
    position: "Head of Conflict and Security Studies",
    department: "Department of International Relations",
    image: "/bg/getty-images-AoJ2_pyNoYc-unsplash.jpg",
    bio: `Dr. Lina Alexandra is Head of Conflict and Security Studies at CSIS Indonesia. Her research interests include conflict studies, peacebuilding, human security, ASEAN, and the United Nations.

    Dr. Alexandra earned her Ph.D. from the University of Groningen, Netherlands. She has been involved in various research projects on conflict resolution, peacekeeping, and human security, with a particular focus on ASEAN countries.
    
    She has published extensively on these topics and has presented her work at various international conferences. She has also been involved in Track II diplomacy initiatives in Southeast Asia.`,
    expertise: ["Conflict Resolution", "Peacebuilding", "Human Security", "ASEAN"],
    education: [
      "Ph.D., University of Groningen, Netherlands",
      "Master's Degree in International Relations",
      "Bachelor's Degree, Universitas Indonesia"
    ],
    email: "lina.alexandra@csis.or.id",
    linkedin: "lina-alexandra",
    publications: [
      {
        title: "Conflict Resolution and Peacebuilding in ASEAN",
        url: "#",
        year: 2021,
        type: "Book"
      },
      {
        title: "Human Security Challenges in Southeast Asia",
        url: "#",
        year: 2020,
        type: "Journal Article"
      }
    ],
    speaking_engagements: [
      {
        title: "The Future of Peace in Southeast Asia",
        event: "ASEAN Peace Forum",
        date: "September 2022",
        location: "Manila, Philippines"
      }
    ],
    featured: false
  },
  {
    id: 6,
    slug: "evan-laksmana",
    name: "Dr. Evan A. Laksmana",
    position: "Senior Research Fellow",
    department: "Department of International Relations",
    image: "/bg/shubham-dhage-mjl0yIdSi18-unsplash.jpg",
    bio: `Dr. Evan A. Laksmana is a Senior Research Fellow at CSIS Indonesia. His research focuses on defense policy, civil-military relations, and regional security issues in the Indo-Pacific with a particular focus on Southeast Asia.

    Dr. Laksmana earned his Ph.D. in Political Science from Syracuse University's Maxwell School of Citizenship and Public Affairs. He has been a visiting fellow at various institutions including the National Bureau of Asian Research in Seattle and the Lowy Institute for International Policy in Sydney.
    
    He has published extensively on defense and security issues in Southeast Asia and has received numerous academic awards and fellowships for his work.`,
    expertise: ["Defense Policy", "Military Change", "Regional Security", "Indo-Pacific"],
    education: [
      "Ph.D. in Political Science, Syracuse University, USA",
      "Master's Degree in Strategic Studies, S. Rajaratnam School of International Studies, Singapore",
      "Bachelor's Degree, Parahyangan Catholic University"
    ],
    email: "evan.laksmana@csis.or.id",
    twitter: "evanlaksmana",
    linkedin: "evan-laksmana",
    publications: [
      {
        title: "Military Modernization in Southeast Asia",
        url: "#",
        year: 2022,
        type: "Book"
      },
      {
        title: "Defense Transformation Challenges in Indonesia",
        url: "#",
        year: 2021,
        type: "Journal Article"
      },
      {
        title: "Regional Security Architecture in the Indo-Pacific",
        url: "#",
        year: 2020,
        type: "Policy Brief"
      }
    ],
    speaking_engagements: [
      {
        title: "Military Modernization in Southeast Asia",
        event: "Asia Security Forum",
        date: "November 2022",
        location: "Tokyo, Japan"
      }
    ],
    featured: true
  },
  {
    id: 7,
    slug: "ardhitya-wien-saputra",
    name: "Ardhitya Wien Saputra",
    position: "Senior Researcher",
    department: "Department of Politics and Social Change",
    image: "/bg/heather-green-bQTzJzwQfJE-unsplash.png",
    bio: `Ardhitya Wien Saputra is a Senior Researcher in the Department of Politics and Social Change at CSIS Indonesia. His research focuses on electoral politics, political parties, and democratic institutions in Indonesia.

    He has been involved in various research projects on elections, political behavior, and democratization in Indonesia. He has published articles in various journals and media outlets on these topics.
    
    He holds a Master's degree in Political Science and has extensive experience in survey research and political analysis.`,
    expertise: ["Electoral Politics", "Political Parties", "Democratization", "Survey Research"],
    education: [
      "Master's Degree in Political Science",
      "Bachelor's Degree, Universitas Indonesia"
    ],
    email: "ardhitya.saputra@csis.or.id",
    publications: [
      {
        title: "Electoral Politics and Voting Behavior in Indonesia",
        url: "#",
        year: 2021,
        type: "Journal Article"
      },
      {
        title: "Political Party Dynamics in Post-Reform Indonesia",
        url: "#",
        year: 2020,
        type: "Working Paper"
      }
    ],
    featured: false
  },
  {
    id: 8,
    slug: "galuh-purborini",
    name: "Galuh Purborini",
    position: "Researcher",
    department: "Department of Economics",
    image: "/bg/shubham-dhage-PACWvLRNzj8-unsplash.jpg",
    bio: `Galuh Purborini is a Researcher in the Department of Economics at CSIS Indonesia. Her research focuses on international trade, economic integration, and digital economy.

    She has been involved in various research projects on trade policy, regional economic integration, and digital transformation. She has published articles in various journals and media outlets on these topics.
    
    She holds a Master's degree in Economics and has experience in economic policy analysis.`,
    expertise: ["International Trade", "Economic Integration", "Digital Economy", "Economic Policy"],
    education: [
      "Master's Degree in Economics",
      "Bachelor's Degree in Economics"
    ],
    email: "galuh.purborini@csis.or.id",
    publications: [
      {
        title: "Digital Economy Development in Indonesia",
        url: "#",
        year: 2022,
        type: "Working Paper"
      },
      {
        title: "Regional Trade Integration in ASEAN",
        url: "#",
        year: 2021,
        type: "Policy Brief"
      }
    ],
    featured: false
  },
  {
    id: 9,
    slug: "rizki-satria",
    name: "Rizki Satria",
    position: "Researcher",
    department: "Department of International Relations",
    image: "/bg/getty-images-C3gjLSgTKNw-unsplash.jpg",
    bio: `Rizki Satria is a Researcher in the Department of International Relations at CSIS Indonesia. His research focuses on foreign policy analysis, ASEAN politics, and Indonesia's role in regional affairs.

    He has been involved in various research projects on foreign policy, regional cooperation, and international relations in Southeast Asia. He has published articles in various journals and media outlets on these topics.
    
    He holds a Master's degree in International Relations and has experience in diplomatic analysis.`,
    expertise: ["Foreign Policy Analysis", "ASEAN Politics", "Regional Cooperation", "Diplomatic Relations"],
    education: [
      "Master's Degree in International Relations",
      "Bachelor's Degree in International Relations"
    ],
    email: "rizki.satria@csis.or.id",
    publications: [
      {
        title: "Indonesia's Foreign Policy in the Changing Regional Order",
        url: "#",
        year: 2021,
        type: "Journal Article"
      },
      {
        title: "ASEAN Centrality in Indo-Pacific Regional Architecture",
        url: "#",
        year: 2020,
        type: "Policy Brief"
      }
    ],
    featured: false
  },
  {
    id: 10,
    slug: "beltsazar-krisetya",
    name: "Beltsazar Krisetya",
    position: "Researcher",
    department: "Department of Politics and Social Change",
    image: "/bg/muska-create-5MvNlQENWDM-unsplash.png",
    bio: `Beltsazar Krisetya is a Researcher in the Department of Politics and Social Change at CSIS Indonesia. His research focuses on local politics, decentralization, and regional autonomy in Indonesia.

    He has been involved in various research projects on local governance, political decentralization, and regional development in Indonesia. He has published articles in various journals and media outlets on these topics.
    
    He holds a Master's degree in Political Science and has experience in local government analysis.`,
    expertise: ["Local Politics", "Decentralization", "Regional Autonomy", "Local Governance"],
    education: [
      "Master's Degree in Political Science",
      "Bachelor's Degree in Political Science"
    ],
    email: "beltsazar.krisetya@csis.or.id",
    publications: [
      {
        title: "Decentralization and Local Governance in Indonesia",
        url: "#",
        year: 2021,
        type: "Working Paper"
      },
      {
        title: "Regional Autonomy and Development in Indonesia",
        url: "#",
        year: 2020,
        type: "Journal Article"
      }
    ],
    featured: false
  }
]; 