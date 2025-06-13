// This script can be used to seed initial data into Firebase Firestore
const { initializeApp } = require("firebase/app")
const { getFirestore, collection, addDoc, writeBatch, doc } = require("firebase/firestore")

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqnQYT1H1u7BjpCIzVtn9InJq2TjvOLyE",
  authDomain: "shop-and-orders.firebaseapp.com",
  projectId: "shop-and-orders",
  storageBucket: "shop-and-orders.firebasestorage.app",
  messagingSenderId: "689238140548",
  appId: "1:689238140548:web:e2a1a12bad61371ce744d1",
  measurementId: "G-KN9FFNEESW",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample data
const initialShops = [
  {
    id: 1,
    shopId: "SH001",
    clientName: "John's Electronics",
    status: "Active",
    tags: ["New Shop", "VIP"],
    creditScore: 85,
    balance: 15000.5,
  },
  {
    id: 2,
    shopId: "SH002",
    clientName: "Mary's Boutique",
    status: "On Hold",
    tags: ["With Loan", "Old Client"],
    creditScore: 72,
    balance: -2500.0,
  },
  {
    id: 3,
    shopId: "SH003",
    clientName: "Tech Solutions Inc",
    status: "Active",
    tags: ["VIP", "No Product"],
    creditScore: 78,
    balance: 8750.25,
  },
  {
    id: 4,
    shopId: "SH004",
    clientName: "Corner Store",
    status: "Inactive",
    tags: ["Frozen", "Old Client"],
    creditScore: 65,
    balance: 0.0,
  },
  {
    id: 5,
    shopId: "SH005",
    clientName: "Fashion Forward",
    status: "Active",
    tags: ["New Shop", "With Loan"],
    creditScore: 70,
    balance: 12300.75,
  },
]

const initialOrders = [
  {
    id: 1,
    shopId: "SH001",
    clientName: "John's Electronics",
    amount: 1200.5,
    location: "United States",
    createdAt: new Date(2023, 5, 15, 9, 30),
  },
  {
    id: 2,
    shopId: "SH003",
    clientName: "Tech Solutions Inc",
    amount: 3500.0,
    location: "Canada",
    createdAt: new Date(2023, 5, 18, 14, 45),
  },
  {
    id: 3,
    shopId: "SH002",
    clientName: "Mary's Boutique",
    amount: 750.25,
    location: "United Kingdom",
    createdAt: new Date(2023, 5, 20, 11, 15),
  },
  {
    id: 4,
    shopId: "SH005",
    clientName: "Fashion Forward",
    amount: 2100.0,
    location: "France",
    createdAt: new Date(2023, 5, 10, 16, 20),
  },
]

const initialAdvanceOrders = [
  {
    id: 1,
    orderId: "ADV-001234-567",
    shopId: "SH001",
    requestType: "Order",
    message: "Need 100 units of wireless headphones, model WH-1000XM4. Delivery required by end of month.",
    createdAt: new Date(2024, 0, 15, 10, 30),
  },
  {
    id: 2,
    orderId: "ADV-001235-568",
    shopId: "SH003",
    requestType: "Buyer Inquiry",
    message: "Customer asking about bulk pricing for laptops. Need quote for 50+ units with warranty options.",
    createdAt: new Date(2024, 0, 16, 14, 20),
  },
  {
    id: 3,
    orderId: "ADV-001236-569",
    shopId: "SH002",
    requestType: "Order",
    message: "Fashion items for spring collection. Need samples first, then bulk order of 200 pieces.",
    createdAt: new Date(2024, 0, 17, 9, 15),
  },
]

async function seedDatabase() {
  try {
    console.log("Starting database seeding...")

    // Seed shops
    console.log("Seeding shops...")
    const shopsCollection = collection(db, "shops")
    const shopsBatch = writeBatch(db)

    initialShops.forEach((shop) => {
      const shopRef = doc(shopsCollection)
      shopsBatch.set(shopRef, shop)
    })

    await shopsBatch.commit()
    console.log("✅ Successfully seeded shops!")

    // Seed orders
    console.log("Seeding orders...")
    const ordersCollection = collection(db, "orders")
    const ordersBatch = writeBatch(db)

    initialOrders.forEach((order) => {
      const orderRef = doc(ordersCollection)
      // Convert Date to Firestore Timestamp
      ordersBatch.set(orderRef, {
        ...order,
        createdAt: new Date(order.createdAt),
      })
    })

    await ordersBatch.commit()
    console.log("✅ Successfully seeded orders!")

    // Seed advance orders
    console.log("Seeding advance orders...")
    const advanceOrdersCollection = collection(db, "advanceOrders")
    const advanceOrdersBatch = writeBatch(db)

    initialAdvanceOrders.forEach((advanceOrder) => {
      const advanceOrderRef = doc(advanceOrdersCollection)
      advanceOrdersBatch.set(advanceOrderRef, {
        ...advanceOrder,
        createdAt: new Date(advanceOrder.createdAt),
      })
    })

    await advanceOrdersBatch.commit()
    console.log("✅ Successfully seeded advance orders!")

    console.log("🎉 Database seeding completed successfully!")
    console.log(`📊 Seeded:`)
    console.log(`   - ${initialShops.length} shops`)
    console.log(`   - ${initialOrders.length} orders`)
    console.log(`   - ${initialAdvanceOrders.length} advance orders`)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  }
}

// Run the seed function
seedDatabase()
