const bcrypt = require('bcryptjs');

// Preloaded realistic catalog for instant out-of-the-box operation
const defaultProducts = [
  {
    _id: '65e01a1b2c3d4e5f6a7b8c01',
    name: 'Apple iPhone 15 (128 GB) - Black',
    slug: 'apple-iphone-15-128gb-black',
    brand: 'Apple',
    category: 'Mobiles',
    description: 'Dynamic Island bubbles up alerts and Live Activities. 48MP Main camera with 2x Telephoto. All-day battery life with up to 20 hours of video playback. Super Retina XDR display with A16 Bionic chip.',
    thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Display': '6.1-inch Super Retina XDR OLED',
      'Processor': 'A16 Bionic Chip',
      'Camera': '48MP Main + 12MP Ultra-Wide',
      'Battery': '3349 mAh (Up to 20h video)',
      'Storage': '128 GB'
    },
    sources: [
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4',
        currentPrice: 65999,
        mrp: 79900,
        discountPct: 17,
        rating: 4.6,
        inStock: true,
        seller: 'SuperComNet (Flipkart Assured)',
        deliveryText: 'Free delivery by Tomorrow',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B0CHX1W1XY',
        currentPrice: 68900,
        mrp: 79900,
        discountPct: 14,
        rating: 4.5,
        inStock: true,
        seller: 'Appario Retail Private Ltd',
        deliveryText: 'Prime Free One-Day Delivery',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'flipkart', price: 65999, savingsVsMrp: 13901 },
    allTimeLow: { price: 62999, retailer: 'flipkart', date: new Date('2024-05-04') },
    allTimeHigh: { price: 79900, retailer: 'amazon', date: new Date('2023-10-01') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c02',
    name: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
    slug: 'sony-wh-1000xm5-headphones',
    brand: 'Sony',
    category: 'Audio',
    description: 'Two processors and 8 microphones for unprecedented noise cancellation. Up to 30-hour battery life with quick charging. Ultra-comfortable, lightweight design in soft fit leather.',
    thumbnail: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Driver Unit': '30mm Carbon Fiber Composite',
      'Battery Life': '30 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.2, LDAC, Multipoint',
      'Weight': '250g'
    },
    sources: [
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B09XS7JWHH',
        currentPrice: 26990,
        mrp: 34990,
        discountPct: 23,
        rating: 4.6,
        inStock: true,
        seller: 'Amazon Retail',
        deliveryText: 'Get it by Wednesday',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/sony-wh-1000xm5-bluetooth-headset/p/itmd5b9f7a77e1ab',
        currentPrice: 29990,
        mrp: 34990,
        discountPct: 14,
        rating: 4.4,
        inStock: true,
        seller: 'RetailNet',
        deliveryText: 'Standard Delivery in 2 days',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'amazon', price: 26990, savingsVsMrp: 8000 },
    allTimeLow: { price: 24999, retailer: 'amazon', date: new Date('2024-03-20') },
    allTimeHigh: { price: 34990, retailer: 'flipkart', date: new Date('2023-11-15') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c03',
    name: 'Apple 2022 MacBook Air Laptop with M2 chip (13.6-inch, 8GB RAM, 256GB SSD)',
    slug: 'apple-macbook-air-m2-midnight',
    brand: 'Apple',
    category: 'Laptops',
    description: 'Strikingly thin design with all-day battery life up to 18 hours. Big, beautiful Liquid Retina display with 500 nits of brightness. 1080p FaceTime HD camera.',
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Chip': 'Apple M2 (8-core CPU, 8-core GPU)',
      'Memory': '8GB Unified RAM',
      'Storage': '256GB SSD',
      'Display': '13.6-inch Liquid Retina Display'
    },
    sources: [
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/apple-macbook-air-m2-8-gb-256-gb-ssd-mac-os-monterey-mly33hn-a/p/itmd51de41efb7ef',
        currentPrice: 84990,
        mrp: 99900,
        discountPct: 15,
        rating: 4.7,
        inStock: true,
        seller: 'SuperComNet (Flipkart Assured)',
        deliveryText: 'Free 1-day delivery',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B0B3CD3X89',
        currentPrice: 87990,
        mrp: 99900,
        discountPct: 12,
        rating: 4.7,
        inStock: true,
        seller: 'Appario Retail',
        deliveryText: 'Free Prime delivery',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'flipkart', price: 84990, savingsVsMrp: 14910 },
    allTimeLow: { price: 79990, retailer: 'flipkart', date: new Date('2024-01-26') },
    allTimeHigh: { price: 114900, retailer: 'amazon', date: new Date('2023-08-10') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c04',
    name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 256GB Storage)',
    slug: 'samsung-galaxy-s24-ultra-5g',
    brand: 'Samsung',
    category: 'Mobiles',
    description: 'Galaxy AI is here. Circle to Search, Live Translate, and Note Assist. 200MP camera with titanium armor frame and Snapdragon 8 Gen 3.',
    thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
      'RAM / ROM': '12GB / 256GB',
      'Camera': '200MP + 50MP + 12MP + 10MP',
      'Display': '6.8" Dynamic AMOLED 2X 120Hz'
    },
    sources: [
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B0CS5X8X8Z',
        currentPrice: 119999,
        mrp: 134999,
        discountPct: 11,
        rating: 4.5,
        inStock: true,
        seller: 'STPL Exclusive',
        deliveryText: 'Free Delivery by Friday',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/samsung-galaxy-s24-ultra-5g/p/itma0a68d7e98a3b',
        currentPrice: 121999,
        mrp: 134999,
        discountPct: 10,
        rating: 4.6,
        inStock: true,
        seller: 'Samsung Authorized Official',
        deliveryText: 'Free Delivery in 2 days',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'amazon', price: 119999, savingsVsMrp: 15000 },
    allTimeLow: { price: 115999, retailer: 'amazon', date: new Date('2024-04-12') },
    allTimeHigh: { price: 134999, retailer: 'flipkart', date: new Date('2024-01-18') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c05',
    name: 'OnePlus 12 (Silky Black, 12GB RAM, 256GB Storage)',
    slug: 'oneplus-12-silky-black-256gb',
    brand: 'OnePlus',
    category: 'Mobiles',
    description: 'Snapdragon 8 Gen 3 with 5400 mAh battery and 100W SUPERVOOC charging. 4th Gen Hasselblad Camera System with 64MP 3X Periscope Telephoto.',
    thumbnail: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Processor': 'Snapdragon 8 Gen 3',
      'Display': '6.82" 2K 120 Hz ProXDR',
      'Battery': '5400 mAh + 100W Wired',
      'Camera': '50MP Sony LYT-808 + 64MP Periscope'
    },
    sources: [
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B0CQPNX81J',
        currentPrice: 59999,
        mrp: 64999,
        discountPct: 8,
        rating: 4.4,
        inStock: true,
        seller: 'DAWNTECH ELECTRONICS',
        deliveryText: 'Prime Free Delivery',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/oneplus-12-silky-black-256-gb/p/itmd556e40d0cb4f',
        currentPrice: 61499,
        mrp: 64999,
        discountPct: 5,
        rating: 4.3,
        inStock: true,
        seller: 'Flashstar Commerce',
        deliveryText: 'Free Delivery in 3 days',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'amazon', price: 59999, savingsVsMrp: 5000 },
    allTimeLow: { price: 57999, retailer: 'amazon', date: new Date('2024-05-18') },
    allTimeHigh: { price: 64999, retailer: 'flipkart', date: new Date('2024-02-01') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c06',
    name: 'boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds',
    slug: 'boat-airdopes-141-tws',
    brand: 'boAt',
    category: 'Audio',
    description: 'Up to 42 hours total playback, ENx environmental noise cancellation technology for clear voice calls, Beast mode for low latency gaming, and ASAP charge.',
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Playtime': 'Up to 42 Hours',
      'Drivers': '8mm Dynamic Drivers',
      'Water Resistance': 'IPX4 Splash Proof',
      'Charging': 'Type-C ASAP Fast Charge'
    },
    sources: [
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/boat-airdopes-141-bluetooth-headset/p/itm5b94f9ab2c31e',
        currentPrice: 999,
        mrp: 4490,
        discountPct: 78,
        rating: 4.0,
        inStock: true,
        seller: 'Imagine Marketing (boAt Official)',
        deliveryText: 'Free Delivery Tomorrow',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B09N3ZNHTY',
        currentPrice: 1099,
        mrp: 4490,
        discountPct: 76,
        rating: 3.9,
        inStock: true,
        seller: 'Appario Retail',
        deliveryText: 'Prime Free Delivery',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'flipkart', price: 999, savingsVsMrp: 3491 },
    allTimeLow: { price: 899, retailer: 'flipkart', date: new Date('2024-04-10') },
    allTimeHigh: { price: 1499, retailer: 'amazon', date: new Date('2023-09-12') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c07',
    name: 'Sony Bravia 139 cm (55 inches) 4K Ultra HD Smart LED Google TV',
    slug: 'sony-bravia-55-inch-4k-google-tv',
    brand: 'Sony',
    category: 'Appliances',
    description: '4K Processor X1, 4K X-Reality PRO, Motionflow XR 100. Open Baffle Speaker with Dolby Audio. Google TV with Google Assistant, Chromecast built-in.',
    thumbnail: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Screen Size': '55 Inches (139 cm)',
      'Resolution': '4K Ultra HD (3840 x 2160)',
      'Sound Output': '20 Watts Dolby Audio',
      'Refresh Rate': '60 Hz'
    },
    sources: [
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B0C39TH1GB',
        currentPrice: 54990,
        mrp: 99900,
        discountPct: 45,
        rating: 4.7,
        inStock: true,
        seller: 'DAWNTECH',
        deliveryText: 'Free Scheduled Delivery & Installation',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/sony-bravia-138-8-cm-55-inch-ultra-hd-4k-led-smart-google-tv/p/itm5a8c9e50f585d',
        currentPrice: 56990,
        mrp: 99900,
        discountPct: 43,
        rating: 4.6,
        inStock: true,
        seller: 'OmniTechRetail',
        deliveryText: 'Free Delivery in 2 days',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'amazon', price: 54990, savingsVsMrp: 44910 },
    allTimeLow: { price: 51990, retailer: 'amazon', date: new Date('2024-03-15') },
    allTimeHigh: { price: 64990, retailer: 'flipkart', date: new Date('2023-10-25') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c08',
    name: 'Apple Watch Series 9 GPS 45mm Midnight Aluminium Case with Sport Band',
    slug: 'apple-watch-series-9-45mm',
    brand: 'Apple',
    category: 'Wearables',
    description: 'S9 SiP enables a super-illuminated display and Double Tap gesture. Advanced health, safety and activity features.',
    thumbnail: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Case Size': '45mm',
      'Display': 'Always-On Retina display',
      'Water Resistance': '50m swimproof',
      'Sensors': 'Blood Oxygen, ECG, Temperature sensing'
    },
    sources: [
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/apple-watch-series-9-gps-45mm/p/itm3d7f951e44f83',
        currentPrice: 38999,
        mrp: 44900,
        discountPct: 13,
        rating: 4.6,
        inStock: true,
        seller: 'SuperComNet',
        deliveryText: 'Free Delivery by Tomorrow',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B0CHX5T47D',
        currentPrice: 41900,
        mrp: 44900,
        discountPct: 7,
        rating: 4.5,
        inStock: true,
        seller: 'Appario Retail',
        deliveryText: 'Prime 1-Day Delivery',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'flipkart', price: 38999, savingsVsMrp: 5901 },
    allTimeLow: { price: 36999, retailer: 'flipkart', date: new Date('2024-05-02') },
    allTimeHigh: { price: 44900, retailer: 'amazon', date: new Date('2023-11-20') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c09',
    name: 'Nike Air Jordan 1 Low Men Retro Lifestyle Sneakers',
    slug: 'nike-air-jordan-1-low-sneakers',
    brand: 'Nike',
    category: 'Fashion',
    description: 'Always in, always fresh. The Air Jordan 1 Low sets you up with a piece of Jordan history and heritage that is comfortable all day. Premium leather and encapsulated Air-Sole unit.',
    thumbnail: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Upper Material': 'Genuine Leather',
      'Sole': 'Solid Rubber Outsole with Deep Flex Grooves',
      'Cushioning': 'Encapsulated Nike Air-Sole',
      'Colorway': 'Gym Red / White / Black'
    },
    sources: [
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/nike-air-jordan-1-low-sneakers/p/itm98234abcf2918',
        currentPrice: 8295,
        mrp: 9995,
        discountPct: 17,
        rating: 4.8,
        inStock: true,
        seller: 'Nike Authorized Store',
        deliveryText: 'Free Delivery within 2 days',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B08XWN42KL',
        currentPrice: 8995,
        mrp: 9995,
        discountPct: 10,
        rating: 4.7,
        inStock: true,
        seller: 'Cloudtail Fashion',
        deliveryText: 'Prime Free Delivery',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'flipkart', price: 8295, savingsVsMrp: 1700 },
    allTimeLow: { price: 7495, retailer: 'flipkart', date: new Date('2024-03-10') },
    allTimeHigh: { price: 9995, retailer: 'amazon', date: new Date('2023-12-01') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c10',
    name: 'Philips Digital Air Fryer HD9252/90 (4.1 Litre, Rapid Air Technology, Touch Panel)',
    slug: 'philips-digital-air-fryer-hd9252',
    brand: 'Philips',
    category: 'Home & Kitchen',
    description: 'Fry with up to 90% less fat. Rapid Air Technology with unique starfish design swirls hot air to create delicious foods that are crispy on the outside and tender on the inside.',
    thumbnail: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Capacity': '4.1 Litres (0.8 kg fry basket)',
      'Power': '1400 Watts',
      'Presets': '7 Preset cooking programs',
      'Warranty': '2 Year Worldwide Guarantee'
    },
    sources: [
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B096419TXV',
        currentPrice: 6999,
        mrp: 11995,
        discountPct: 42,
        rating: 4.6,
        inStock: true,
        seller: 'Philips Domestic Appliances',
        deliveryText: 'Prime 1-Day Delivery',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/philips-hd9252-90-air-fryer/p/itm51293abc84729',
        currentPrice: 7499,
        mrp: 11995,
        discountPct: 37,
        rating: 4.5,
        inStock: true,
        seller: 'RetailNet Kitchen',
        deliveryText: 'Free 2-day delivery',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'amazon', price: 6999, savingsVsMrp: 4996 },
    allTimeLow: { price: 6499, retailer: 'amazon', date: new Date('2024-04-05') },
    allTimeHigh: { price: 11995, retailer: 'flipkart', date: new Date('2023-09-18') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c11',
    name: 'Atomic Habits by James Clear (Hardcover / Paperback)',
    slug: 'atomic-habits-james-clear',
    brand: 'Penguin Random House',
    category: 'Books',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Over 15 million copies sold worldwide. World-renowned habits expert James Clear reveals practical strategies to form good habits.',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Author': 'James Clear',
      'Language': 'English',
      'Format': 'Paperback / 320 pages',
      'Publisher': 'Random House Business Books'
    },
    sources: [
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/1847941834',
        currentPrice: 425,
        mrp: 799,
        discountPct: 47,
        rating: 4.8,
        inStock: true,
        seller: 'Cocoblu Retail',
        deliveryText: 'Prime 1-Day Delivery',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/atomic-habits-james-clear/p/itmd5f8a923bc849',
        currentPrice: 499,
        mrp: 799,
        discountPct: 38,
        rating: 4.7,
        inStock: true,
        seller: 'BookWorm Online',
        deliveryText: 'Free Delivery in 3 days',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'amazon', price: 425, savingsVsMrp: 374 },
    allTimeLow: { price: 380, retailer: 'amazon', date: new Date('2024-02-14') },
    allTimeHigh: { price: 799, retailer: 'flipkart', date: new Date('2023-08-01') },
    createdAt: new Date()
  },
  {
    _id: '65e01a1b2c3d4e5f6a7b8c12',
    name: 'Boldfit Adjustable Home Gym Rubber Dumbbells Kit (20 Kg Set)',
    slug: 'boldfit-home-gym-dumbbell-set-20kg',
    brand: 'Boldfit',
    category: 'Fitness',
    description: 'Complete home workout gym setup with adjustable weight plates, dumbbell rods, connecting rod for barbell conversion, and non-slip rubber grip.',
    thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80'
    ],
    specs: {
      'Weight Set': '20 Kg Total (Weight Plates + 2 Dumbbell Bars + 1 Barbell Connector)',
      'Material': 'Durable PVC Coated Rubber Plates with Cast Iron Rods',
      'Usage': 'Bicep curls, chest press, squats, shoulder press',
      'Warranty': '1 Year Manufacturer Warranty'
    },
    sources: [
      {
        retailer: 'flipkart',
        url: 'https://www.flipkart.com/boldfit-20kg-home-gym-set/p/itm58291bcde2839',
        currentPrice: 1499,
        mrp: 3499,
        discountPct: 57,
        rating: 4.3,
        inStock: true,
        seller: 'Sasvat Omnichannel (Boldfit Official)',
        deliveryText: 'Free Delivery Tomorrow',
        lastCheckedAt: new Date()
      },
      {
        retailer: 'amazon',
        url: 'https://www.amazon.in/dp/B08NVN7W4K',
        currentPrice: 1699,
        mrp: 3499,
        discountPct: 51,
        rating: 4.2,
        inStock: true,
        seller: 'Boldfit Official Store',
        deliveryText: 'Prime 2-Day Delivery',
        lastCheckedAt: new Date()
      }
    ],
    cheapestSource: { retailer: 'flipkart', price: 1499, savingsVsMrp: 2000 },
    allTimeLow: { price: 1299, retailer: 'flipkart', date: new Date('2024-01-15') },
    allTimeHigh: { price: 3499, retailer: 'amazon', date: new Date('2023-10-10') },
    createdAt: new Date()
  }
];

// In-Memory store instances
let products = [...defaultProducts];
let users = [
  {
    _id: '65e01a1b2c3d4e5f6a7b8c99',
    name: 'Rahul Sharma',
    email: 'shopper@bachatbazar.in',
    passwordHash: bcrypt.hashSync('password123', 10),
    wishlist: ['65e01a1b2c3d4e5f6a7b8c01', '65e01a1b2c3d4e5f6a7b8c02'],
    createdAt: new Date()
  }
];
let alerts = [
  {
    _id: '65e01a1b2c3d4e5f6a7b8c88',
    user: '65e01a1b2c3d4e5f6a7b8c99',
    userEmail: 'shopper@bachatbazar.in',
    product: '65e01a1b2c3d4e5f6a7b8c01',
    targetPrice: 60000,
    currentPriceWhenSet: 65999,
    retailerPreference: 'any',
    status: 'active',
    createdAt: new Date()
  }
];

// Generate dynamic price history for any product
const getPriceHistoryForProduct = (productId, days = 180) => {
  const prod = products.find(p => p._id === productId || p.slug === productId);
  if (!prod) return { chartData: [], stats: {} };

  const timeline = [];
  const now = new Date();
  const step = Math.max(1, Math.floor(days / 20));

  for (let d = days; d >= 0; d -= step) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - d);
    const dateStr = dt.toISOString().split('T')[0];

    const fkSrc = prod.sources.find(s => s.retailer === 'flipkart');
    const amzSrc = prod.sources.find(s => s.retailer === 'amazon');

    const point = {
      date: dateStr,
      timestamp: dt
    };

    if (fkSrc) {
      if (d === 0) {
        point.flipkartPrice = fkSrc.currentPrice;
      } else {
        const factor = 1 + (Math.sin(d / 8) * 0.05) + ((d % 3 === 0 ? 0.02 : -0.02));
        point.flipkartPrice = Math.round((fkSrc.currentPrice * factor) / 50) * 50;
      }
    }

    if (amzSrc) {
      if (d === 0) {
        point.amazonPrice = amzSrc.currentPrice;
      } else {
        const factor = 1 + (Math.cos(d / 9) * 0.04) + ((d % 2 === 0 ? -0.015 : 0.015));
        point.amazonPrice = Math.round((amzSrc.currentPrice * factor) / 50) * 50;
      }
    }

    timeline.push(point);
  }

  const allPrices = [];
  timeline.forEach(t => {
    if (t.flipkartPrice) allPrices.push(t.flipkartPrice);
    if (t.amazonPrice) allPrices.push(t.amazonPrice);
  });

  return {
    chartData: timeline,
    stats: {
      allTimeLow: prod.allTimeLow?.price || (allPrices.length ? Math.min(...allPrices) : 0),
      allTimeHigh: prod.allTimeHigh?.price || (allPrices.length ? Math.max(...allPrices) : 0),
      averagePrice: allPrices.length ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length) : 0,
      dataPointsCount: timeline.length
    }
  };
};

module.exports = {
  products,
  users,
  alerts,
  getPriceHistoryForProduct
};
