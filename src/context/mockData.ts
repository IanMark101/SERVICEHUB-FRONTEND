import {
  User,
  ServiceListing,
  JobRequest,
  Bid,
  JobEngagement,
  Transaction,
  Notification,
  Message,
  CategorySuggestion,
  UserReport
} from '../types';

// Mock Users Seeding
export const mockUsers: User[] = [
  {
    id: 'u1',
    firstName: 'Alex',
    lastName: 'Mercer',
    email: 'alexmercer@gmail.com',
    role: 'seeker',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    bio: 'Local homeowner looking for reliable lawn maintenance, plumbing, and general home repairs.',
    phone: '+63 917 123 4567',
    rating: 5,
    reviews: [
      {
        id: 'rev1',
        authorId: 'u3',
        authorName: 'John Francisco',
        rating: 5,
        comment: 'Great client! Clear instructions and fast cash payment.',
        createdAt: '2026-06-10'
      }
    ],
    isVerified: true
  },
  {
    id: 'u2',
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah@gmail.com',
    role: 'seeker',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    bio: 'Property manager in the metro area looking to outsource maintenance tasks quickly.',
    phone: '+63 918 888 7777',
    rating: 4.5,
    reviews: [],
    isVerified: true
  },
  {
    id: 'u5',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria@gmail.com',
    role: 'seeker',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    bio: 'Local resident looking for help with household chore scaling, deep cleaning, and appliance fixes.',
    phone: '+63 919 777 6666',
    rating: 4.8,
    reviews: [],
    isVerified: true
  },
  {
    id: 'u6',
    firstName: 'Delfin',
    lastName: 'Labra',
    email: 'delfin@gmail.com',
    role: 'seeker',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    bio: 'Board member at community center, seeking verified technicians for electrical upkeep and minor works.',
    phone: '+63 920 123 7890',
    rating: 5.0,
    reviews: [],
    isVerified: true
  },
  {
    id: 'u3',
    firstName: 'John',
    lastName: 'Francisco',
    email: 'johnfrans@gmail.com',
    role: 'provider',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Licensed electrician and professional landscaper with over 6 years of experience.',
    phone: '+63 917 555 1234',
    rating: 4.8,
    reviews: [
      {
        id: 'rev2',
        authorId: 'u1',
        authorName: 'Alex Mercer',
        rating: 5,
        comment: 'Excellent lawn care service. John was on time and very thorough.',
        createdAt: '2026-06-12'
      },
      {
        id: 'rev3',
        authorId: 'u2',
        authorName: 'Sarah Connor',
        rating: 4,
        comment: 'Did a great job fixing the outdoor wiring. Slightly delayed but quality work.',
        createdAt: '2026-06-14'
      }
    ],
    isVerified: true,
    proofOfResidencyUrl: 'residency_doc_john.jpg',
    proofOfSkillUrl: 'electrician_license_john.jpg'
  },
  {
    id: 'u4',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'janedoe@gmail.com',
    role: 'provider',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    bio: 'Professional plumber specializing in pipe fixes, drainage clearing, and sink installations.',
    phone: '+63 917 999 8888',
    rating: 4.9,
    reviews: [
      {
        id: 'rev4',
        authorId: 'u1',
        authorName: 'Alex Mercer',
        rating: 5,
        comment: 'Jane fixed our kitchen leak in less than an hour. Highly recommended!',
        createdAt: '2026-06-15'
      }
    ],
    isVerified: true,
    proofOfResidencyUrl: 'residency_doc_jane.jpg',
    proofOfSkillUrl: 'plumbing_certificate_jane.jpg'
  },
  {
    id: 'u7',
    firstName: 'Ramon',
    lastName: 'Magsaysay',
    email: 'ramon@gmail.com',
    role: 'provider',
    avatarUrl: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=200',
    bio: 'Air conditioner specialist and appliance expert. Experienced with window/split types and refrigerators.',
    phone: '+63 918 333 4444',
    rating: 4.7,
    reviews: [],
    isVerified: true,
    proofOfResidencyUrl: 'residency_doc_ramon.jpg',
    proofOfSkillUrl: 'ac_cert_ramon.jpg'
  },
  {
    id: 'u8',
    firstName: 'Elena',
    lastName: 'Del Mar',
    email: 'elena@gmail.com',
    role: 'provider',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    bio: 'Professional house painter and home cleaning expert. Offers deep washing, exterior styling, and declutter services.',
    phone: '+63 915 222 1111',
    rating: 5.0,
    reviews: [],
    isVerified: true,
    proofOfResidencyUrl: 'residency_doc_elena.jpg',
    proofOfSkillUrl: 'painting_cert_elena.jpg'
  }
];

// Mock Service Listings
export const mockServices: ServiceListing[] = [
  {
    id: 's1',
    providerId: 'u3',
    providerName: 'John Francisco',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    title: 'Expert Backyard Landscaping & Gardening',
    category: 'Lawn Care',
    description: 'Complete lawn care, weeding, and landscape design to keep your outdoor spaces beautiful.',
    price: 800,
    queueSize: 0, // 0 = Available Now
    isPaused: false,
    proofOfSkillUrl: 'landscaping_cert.jpg',
    rating: 4.8
  },
  {
    id: 's2',
    providerId: 'u3',
    providerName: 'John Francisco',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    title: 'Emergency Electrical Repair & Wiring',
    category: 'Electrical Repair',
    description: 'Diagnosing power trip issues, fixing short circuits, outlet replacement, and general electrical maintenance for houses.',
    price: 1200,
    queueSize: 0,
    isPaused: false,
    proofOfSkillUrl: 'electrician_license.jpg',
    rating: 4.5
  },
  {
    id: 's3',
    providerId: 'u4',
    providerName: 'Jane Doe',
    providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    title: 'Emergency Plumbing & Pipe Leak Fixes',
    category: 'Plumbing',
    description: 'Master plumber with 10 years experience. Immediate response for leaks.',
    price: 1500,
    queueSize: 2, // 2 = Busy (Queue: 2)
    isPaused: false,
    proofOfSkillUrl: 'plumbing_cert.jpg',
    rating: 4.9
  },
  {
    id: 's4',
    providerId: 'u8',
    providerName: 'Elena Del Mar',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    title: 'Professional House Painting & Trim Styling',
    category: 'House Cleaning',
    description: 'Provide uniform wall painting, stain removal, baseboard coatings, and wall repair.',
    price: 2500,
    queueSize: 0,
    isPaused: false,
    proofOfSkillUrl: 'painting_license.jpg',
    rating: 5.0
  },
  {
    id: 's5',
    providerId: 'u7',
    providerName: 'Ramon Magsaysay',
    providerAvatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=200',
    title: 'Air Conditioner Deep Cleaning & Freon Refill',
    category: 'Electrical Repair',
    description: 'Full split-type or window-type AC cleaning, coil disinfection, pressure wash, and leak testing.',
    price: 1000,
    queueSize: 1,
    isPaused: false,
    proofOfSkillUrl: 'ac_cert.jpg',
    rating: 4.7
  }
];

// Mock Job Requests (Seekers seeking bids)
export const mockJobRequests: JobRequest[] = [
  {
    id: 'jr1',
    seekerId: 'u1',
    seekerName: 'Alex Mercer',
    seekerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    title: 'Garden Hedge Trimming and Cleanup',
    category: 'Lawn Care',
    urgency: 'medium',
    budget: 900,
    description: 'Need a professional to trim tall hedges in the front yard and clean up all cuttings. Hedges are about 7 feet high.',
    status: 'open',
    createdAt: '2026-06-14'
  },
  {
    id: 'jr2',
    seekerId: 'u2',
    seekerName: 'Sarah Connor',
    seekerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    title: 'Leaking Pipe Under Bathroom Sink',
    category: 'Plumbing',
    urgency: 'high',
    budget: 1500,
    description: 'Bathroom sink pipe has a steady drip leak. Need a plumber to replace the joint and seal it properly as soon as possible.',
    status: 'open',
    createdAt: '2026-06-15'
  },
  {
    id: 'jr3',
    seekerId: 'u5',
    seekerName: 'Maria Santos',
    seekerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    title: 'Washing Machine Drainage Repair',
    category: 'Plumbing',
    urgency: 'medium',
    budget: 850,
    description: 'Washing machine drainage hose is clogged or broken. Water leaks all over the floor whenever it spins. Need replacement.',
    status: 'open',
    createdAt: '2026-06-18'
  },
  {
    id: 'jr4',
    seekerId: 'u6',
    seekerName: 'Delfin Labra',
    seekerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    title: 'Fix Tripping Circuit Breaker',
    category: 'Electrical Repair',
    urgency: 'high',
    budget: 1200,
    description: 'Our main breaker trips every time we turn on the living room air conditioning unit. Need someone to diagnose overload or short circuits.',
    status: 'open',
    createdAt: '2026-06-19'
  }
];

// Mock Bids/Offers
export const mockBids: Bid[] = [
  {
    id: 'b1',
    requestId: 'jr1',
    providerId: 'u3',
    providerName: 'John Francisco',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    providerRating: 4.8,
    price: 850,
    message: 'Hello Alex, I can bring my tall ladders and trimmers tomorrow morning. Will clean and take away all cuttings.',
    status: 'pending',
    createdAt: '2026-06-15'
  },
  {
    id: 'b2',
    requestId: 'jr2',
    providerId: 'u4',
    providerName: 'Jane Doe',
    providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    providerRating: 4.9,
    price: 1400,
    message: 'I have standard replacement joints in my kit. I can pass by at 10 AM to resolve this for you.',
    status: 'pending',
    createdAt: '2026-06-16'
  },
  {
    id: 'b3',
    requestId: 'jr3',
    providerId: 'u4',
    providerName: 'Jane Doe',
    providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    providerRating: 4.9,
    price: 800,
    message: 'Hi Maria, I can replace the hose and clean the internal lint filters to ensure a perfect flow.',
    status: 'pending',
    createdAt: '2026-06-18'
  },
  {
    id: 'b4',
    requestId: 'jr3',
    providerId: 'u8',
    providerName: 'Elena Del Mar',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    providerRating: 5.0,
    price: 850,
    message: 'I specialize in cleaning and draining repairs. Can drop by today if needed.',
    status: 'pending',
    createdAt: '2026-06-18'
  },
  {
    id: 'b5',
    requestId: 'jr4',
    providerId: 'u3',
    providerName: 'John Francisco',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    providerRating: 4.8,
    price: 1100,
    message: 'Hi Delfin, it sounds like an overload or faulty fuse switch. I have full testing meters to diagnose this.',
    status: 'pending',
    createdAt: '2026-06-19'
  }
];

// Mock Active Job Engagements
export const mockJobEngagements: JobEngagement[] = [
  {
    id: 'je1',
    title: 'Kitchen Sink Declogging',
    seekerId: 'u1',
    seekerName: 'Alex Mercer',
    providerId: 'u4',
    providerName: 'Jane Doe',
    providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    serviceId: 's3',
    price: 1000,
    status: 'in_progress',
    paymentMethod: 'GCash',
    createdAt: '2026-06-16'
  },
  {
    id: 'je2',
    title: 'Backyard Power Wash',
    seekerId: 'u2',
    seekerName: 'Sarah Connor',
    providerId: 'u3',
    providerName: 'John Francisco',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    serviceId: 's1',
    price: 800,
    status: 'awaiting_seeker_approval', // Provider has completed it, Seeker needs to approve
    paymentMethod: 'On-site Cash',
    createdAt: '2026-06-15'
  },
  {
    id: 'je3',
    title: 'AC Airflow Diagnostics',
    seekerId: 'u6',
    seekerName: 'Delfin Labra',
    providerId: 'u7',
    providerName: 'Ramon Magsaysay',
    providerAvatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=200',
    serviceId: 's5',
    price: 1000,
    status: 'queued',
    paymentMethod: 'GCash',
    createdAt: '2026-06-18'
  },
  {
    id: 'je4',
    title: 'Window Cleaning Work',
    seekerId: 'u5',
    seekerName: 'Maria Santos',
    providerId: 'u8',
    providerName: 'Elena Del Mar',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    serviceId: 's4',
    price: 2500,
    status: 'pending_provider',
    paymentMethod: 'GCash',
    createdAt: '2026-06-19'
  },
  {
    id: 'je5',
    title: 'Gate Painting Dispute',
    seekerId: 'u2',
    seekerName: 'Sarah Connor',
    providerId: 'u8',
    providerName: 'Elena Del Mar',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    serviceId: 's4',
    price: 2500,
    status: 'disputed',
    paymentMethod: 'GCash',
    createdAt: '2026-06-12',
    disputeReason: 'Paint coat is uneven and contractor used a different color than agreed.'
  }
];

// Mock Financial Ledger Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    jobId: 'past_job_1',
    seekerId: 'u1',
    providerId: 'u3',
    amount: 1500,
    paymentMethod: 'GCash',
    serviceTitle: 'Main Breaker Fix & Fuse Replace',
    createdAt: '2026-06-10'
  },
  {
    id: 'tx2',
    jobId: 'past_job_2',
    seekerId: 'u2',
    providerId: 'u4',
    amount: 950,
    paymentMethod: 'On-site Cash',
    serviceTitle: 'Shower Hose Installation',
    createdAt: '2026-06-12'
  },
  {
    id: 'tx3',
    jobId: 'past_job_3',
    seekerId: 'u1',
    providerId: 'u3',
    amount: 800,
    paymentMethod: 'GCash',
    serviceTitle: 'Lawn Grass Mowing (June Session)',
    createdAt: '2026-06-14'
  },
  {
    id: 'tx4',
    jobId: 'past_job_4',
    seekerId: 'u5',
    providerId: 'u8',
    amount: 2500,
    paymentMethod: 'GCash',
    serviceTitle: 'House Painting Complete',
    createdAt: '2026-06-18'
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Offer Accepted',
    desc: 'John Francisco accepted your lawn care request.',
    time: '5 mins ago',
    read: false
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'New Bid Received',
    desc: 'Jane Doe submitted a bid of ₱1,400 on your bathroom plumbing request.',
    time: '30 mins ago',
    read: false
  },
  {
    id: 'n3',
    userId: 'u4',
    title: 'New Booking',
    desc: 'Sarah Connor booked you directly for kitchen plumbing.',
    time: '2 hours ago',
    read: false
  },
  {
    id: 'n4',
    userId: 'u5',
    title: 'Pending Proposal Bid',
    desc: 'Elena Del Mar submitted a bid of ₱850 on your washing machine repair.',
    time: '4 hours ago',
    read: false
  }
];

// Mock Direct Messages
export const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: 'u1',
    receiverId: 'u4',
    text: 'Hi Jane, just wanted to check if you are available today to look at my kitchen sink?',
    createdAt: '2026-06-16T10:00:00Z'
  },
  {
    id: 'm2',
    senderId: 'u4',
    receiverId: 'u1',
    text: 'Hello Alex! Yes, I am free this afternoon. I can head over by 2 PM if that works for you?',
    createdAt: '2026-06-16T10:05:00Z'
  },
  {
    id: 'm3',
    senderId: 'u1',
    receiverId: 'u4',
    text: '2 PM is perfect. The sink is completely clogged and backing up.',
    createdAt: '2026-06-16T10:10:00Z'
  },
  {
    id: 'm4',
    senderId: 'u4',
    receiverId: 'u1',
    text: 'Got it. I will bring my heavy declogger and be there on time.',
    createdAt: '2026-06-16T10:12:00Z'
  },
  {
    id: 'm5',
    senderId: 'u5',
    receiverId: 'u8',
    text: 'Hi Elena, I saw you bid on my Window Cleaning work. Can you do this Friday?',
    createdAt: '2026-06-19T14:00:00Z'
  },
  {
    id: 'm6',
    senderId: 'u8',
    receiverId: 'u5',
    text: 'Hello Maria! Friday works great. I can carry my scaffolding and glass cleaners.',
    createdAt: '2026-06-19T14:05:00Z'
  }
];

// Mock Category Suggestions
export const mockCategorySuggestions: CategorySuggestion[] = [
  {
    id: 'cs1',
    name: 'Air Conditioner Cleaning',
    description: 'Regular maintenance, filter cleaning, and system checks for split and window type AC units.',
    suggestedBy: 'Alex Mercer',
    status: 'pending'
  },
  {
    id: 'cs2',
    name: 'Appliance Repair',
    description: 'Fixing home appliances such as refrigerators, washing machines, and microwaves.',
    suggestedBy: 'Sarah Connor',
    status: 'pending'
  },
  {
    id: 'cs3',
    name: 'Carpentry & Cabinetry',
    description: 'Custom table making, door alignments, shelves fixing, and wood restoration works.',
    suggestedBy: 'Maria Santos',
    status: 'pending'
  },
  {
    id: 'cs4',
    name: 'Pet Grooming & Sitting',
    description: 'Professional bathing, hair trimming, walking, and temporary home sitting for local dogs and cats.',
    suggestedBy: 'Delfin Labra',
    status: 'pending'
  }
];

// Mock User Reports/Disputes
export const mockUserReports: UserReport[] = [
  {
    id: 'ur1',
    reportedUserId: 'u3',
    reportedUserName: 'John Francisco',
    reporterUserId: 'u2',
    reporterUserName: 'Sarah Connor',
    reason: 'Incorrect pricing quote',
    details: 'Provider charged ₱500 extra beyond the agreed transaction price for outdoor cabling.',
    status: 'pending',
    createdAt: '2026-06-15'
  },
  {
    id: 'ur2',
    reportedUserId: 'u8',
    reportedUserName: 'Elena Del Mar',
    reporterUserId: 'u2',
    reporterUserName: 'Sarah Connor',
    reason: 'Unacceptable paint color',
    details: 'Provider used a grey tone instead of the selected cream shade on the main entrance gate.',
    status: 'pending',
    createdAt: '2026-06-16'
  }
];
