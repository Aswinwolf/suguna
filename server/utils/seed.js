import dotenv from 'dotenv';
import mongoose from 'mongoose';

import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import ServiceCategory from '../models/ServiceCategory.js';
import RepairService from '../models/RepairService.js';
import SparePart from '../models/SparePart.js';

dotenv.config();

// ─── Service categories (Urban Company style) ────────────────────────────────
const serviceCategorySeed = [
  {
    name: 'AC Repair',
    icon: '❄️',
    visitingCharge: 199,
    description: 'Servicing, gas refill and repair for all AC types.',
    issues: ['Not cooling', 'Water leakage', 'Noisy operation', 'Gas refill', 'Installation']
  },
  {
    name: 'Refrigerator Repair',
    icon: '🧊',
    visitingCharge: 199,
    description: 'Fridge cooling, compressor and gas issues.',
    issues: ['Not cooling', 'Excess ice', 'Water leakage', 'Compressor noise', 'Door not sealing']
  },
  {
    name: 'Washing Machine Repair',
    icon: '🌀',
    visitingCharge: 149,
    description: 'Drum, motor and drainage repairs.',
    issues: ['Not spinning', 'Water not draining', 'Noise/vibration', 'Not powering on']
  },
  {
    name: 'Microwave Repair',
    icon: '🍽️',
    visitingCharge: 149,
    description: 'Heating, turntable and panel repairs.',
    issues: ['Not heating', 'Turntable not rotating', 'Sparking', 'Display not working']
  },
  {
    name: 'Water Purifier Repair',
    icon: '💧',
    visitingCharge: 149,
    description: 'Filter, membrane and pump servicing.',
    issues: ['No water flow', 'Bad taste', 'Filter replacement', 'Leakage']
  },
  {
    name: 'TV Repair',
    icon: '📺',
    visitingCharge: 199,
    description: 'Panel, display and sound repairs.',
    issues: ['No display', 'No sound', 'Lines on screen', 'Not powering on']
  },

  // NEW SERVICES

  {
    name: 'Mixer Grinder Repair',
    icon: '🥤',
    visitingCharge: 149,
    description: 'Motor, blade and switch repairs.',
    issues: ['Motor not working', 'Blade issue', 'Burning smell', 'Noise', 'Jar leakage']
  },
  {
    name: 'Gas Stove Repair',
    icon: '🔥',
    visitingCharge: 149,
    description: 'Burner, ignition and gas flow repairs.',
    issues: ['Gas leakage', 'Burner not lighting', 'Low flame', 'Ignition issue']
  },
  {
    name: 'Gas Pipeline Service',
    icon: '⛽',
    visitingCharge: 249,
    description: 'Gas pipeline installation and leak inspection.',
    issues: ['Gas leakage', 'Pipe replacement', 'New connection', 'Pressure issue']
  },
  {
    name: 'Ceiling Fan Repair',
    icon: '🪭',
    visitingCharge: 99,
    description: 'Capacitor, motor and regulator repairs.',
    issues: ['Not rotating', 'Slow speed', 'Noise', 'Regulator issue']
  },
  {
    name: 'Table Fan Repair',
    icon: '🌪️',
    visitingCharge: 99,
    description: 'Motor and blade repairs.',
    issues: ['Not rotating', 'Motor issue', 'Noise', 'Speed issue']
  },
  {
    name: 'Exhaust Fan Repair',
    icon: '💨',
    visitingCharge: 99,
    description: 'Motor and ventilation repairs.',
    issues: ['Not working', 'Noise', 'Low airflow']
  },
  {
    name: 'Geyser Repair',
    icon: '🚿',
    visitingCharge: 149,
    description: 'Heating element and thermostat repairs.',
    issues: ['No hot water', 'Leakage', 'Thermostat issue', 'Power issue']
  },
  {
    name: 'Induction Stove Repair',
    icon: '🍳',
    visitingCharge: 149,
    description: 'PCB and heating repairs.',
    issues: ['Not heating', 'Display issue', 'Power issue']
  },
  {
    name: 'Chimney Repair',
    icon: '🏠',
    visitingCharge: 199,
    description: 'Kitchen chimney servicing and repairs.',
    issues: ['Low suction', 'Noise', 'Motor issue', 'Filter replacement']
  },
  {
    name: 'Vacuum Cleaner Repair',
    icon: '🧹',
    visitingCharge: 149,
    description: 'Motor and suction repairs.',
    issues: ['Low suction', 'Motor issue', 'Power issue']
  },
  {
    name: 'Iron Box Repair',
    icon: '👔',
    visitingCharge: 99,
    description: 'Heating and thermostat repairs.',
    issues: ['Not heating', 'Power issue', 'Thermostat issue']
  }
];

// name → { charge } ; serviceCategory left null so they apply everywhere.
const repairServiceSeed = [
  { name: 'Gas Refill', charge: 1500 },
  { name: 'Compressor Repair', charge: 2500 },
  { name: 'Wiring Repair', charge: 600 },
  { name: 'Fan Motor Replacement', charge: 1200 },
  { name: 'General Servicing', charge: 499 },
  { name: 'Drainage Cleaning', charge: 400 },
  { name: 'Sensor Repair', charge: 800 },
  { name: 'PCB Repair', charge: 1800 },
];

const sparePartSeed = [
  { name: 'Capacitor', price: 350 },
  { name: 'Compressor', price: 4500 },
  { name: 'Motor', price: 1600 },
  { name: 'PCB Board', price: 2200 },
  { name: 'Thermostat', price: 550 },
  { name: 'RO Membrane', price: 1200 },
  { name: 'Filter Cartridge', price: 450 },
  { name: 'Display Panel', price: 3000 },
];

// ─── Category names ───────────────────────────────────────────────────────────
const categories = [
  'Refrigerators',
  'Washing Machines',
  'Air Conditioners',
  'Televisions',
  'Kitchen Appliances',
  'Fans',
  'Water Heaters',
  'Small Appliances',
];


const subCategorySeed = [
  // Refrigerators
  { category: 'Refrigerators', name: 'Double Door' },
  { category: 'Refrigerators', name: 'Single Door' },
  { category: 'Refrigerators', name: 'Side by Side' },

  // Washing Machines
  { category: 'Washing Machines', name: 'Front Load' },
  { category: 'Washing Machines', name: 'Top Load' },
  { category: 'Washing Machines', name: 'Semi Automatic' },

  // Air Conditioners
  { category: 'Air Conditioners', name: 'Split AC' },
  { category: 'Air Conditioners', name: 'Window AC' },

  // Televisions
  { category: 'Televisions', name: '4K Smart TV' },
  { category: 'Televisions', name: 'HD TV' },
  { category: 'Televisions', name: 'OLED TV' },

  // Kitchen Appliances
  { category: 'Kitchen Appliances', name: 'Induction Cooktop' },
  { category: 'Kitchen Appliances', name: 'Air Fryer' },
  { category: 'Kitchen Appliances', name: 'Mixer Grinder' },
  { category: 'Kitchen Appliances', name: 'Microwave Oven' },

  // Fans
  { category: 'Fans', name: 'Ceiling Fan' },
  { category: 'Fans', name: 'Table Fan' },

  // Water Heaters
  { category: 'Water Heaters', name: 'Storage Geyser' },
  { category: 'Water Heaters', name: 'Instant Geyser' },

  // Small Appliances
  { category: 'Small Appliances', name: 'Steam Iron' },
  { category: 'Small Appliances', name: 'Water Purifier' },
  { category: 'Small Appliances', name: 'Vacuum Cleaner' },
  { category: 'Small Appliances', name: 'Toaster' },
];

// ─── Products ─────────────────────────────────────────────────────────────────
// Each entry: category + subCategory match the names above.
// mrp is always >= price (original retail price before discount).
const productSeed = [
  // Refrigerators – Double Door
  { productName: 'Samsung 253L Double Door Refrigerator', productCode: 'REF001', category: 'Refrigerators', subCategory: 'Double Door', brand: 'Samsung', mrp: 29990, price: 25990, description: 'Frost-free double door refrigerator with digital inverter compressor and convertible freezer.', image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600' },
  { productName: 'Whirlpool 300L Frost Free Refrigerator', productCode: 'REF003', category: 'Refrigerators', subCategory: 'Double Door', brand: 'Whirlpool', mrp: 34990, price: 29990, description: 'Triple door frost-free refrigerator with 6th Sense DeepFreeze technology.', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600' },

  // Refrigerators – Single Door
  { productName: 'LG 190L Single Door Refrigerator', productCode: 'REF002', category: 'Refrigerators', subCategory: 'Single Door', brand: 'LG', mrp: 18490, price: 15490, description: 'Direct cool single door fridge with smart inverter compressor and stabilizer-free operation.', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600' },

  // Refrigerators – Side by Side
  { productName: 'Haier 565L Side-by-Side Refrigerator', productCode: 'REF004', category: 'Refrigerators', subCategory: 'Side by Side', brand: 'Haier', mrp: 62990, price: 54990, description: 'Side-by-side refrigerator with twin inverter and convertible zones for large families.', image: 'https://images.unsplash.com/photo-1536353284924-9220c464e262?w=600' },

  // Washing Machines – Front Load
  { productName: 'Bosch 7kg Front Load Washing Machine', productCode: 'WM001', category: 'Washing Machines', subCategory: 'Front Load', brand: 'Bosch', mrp: 37990, price: 32990, description: 'Fully automatic front load washer with EcoSilence Drive and anti-tangle programs.', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600' },
  { productName: 'Samsung 8kg Fully Automatic Washer', productCode: 'WM003', category: 'Washing Machines', subCategory: 'Front Load', brand: 'Samsung', mrp: 32990, price: 27990, description: 'Front load washer with EcoBubble technology and hygiene steam wash.', image: 'https://images.unsplash.com/photo-1604335398980-ededcadcf7a5?w=600' },

  // Washing Machines – Top Load
  { productName: 'LG 6.5kg Top Load Washing Machine', productCode: 'WM002', category: 'Washing Machines', subCategory: 'Top Load', brand: 'LG', mrp: 20490, price: 17490, description: 'Fully automatic top load washer with Smart Inverter and Jet Spray+ technology.', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600' },

  // Washing Machines – Semi Automatic
  { productName: 'Whirlpool 7.5kg Semi Automatic Washer', productCode: 'WM004', category: 'Washing Machines', subCategory: 'Semi Automatic', brand: 'Whirlpool', mrp: 14990, price: 11990, description: 'Semi-automatic top load washer with 3D scrub technology and superior wash.', image: 'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=600' },

  // Air Conditioners – Split AC
  { productName: 'Daikin 1.5 Ton 5 Star Split AC', productCode: 'AC001', category: 'Air Conditioners', subCategory: 'Split AC', brand: 'Daikin', mrp: 52990, price: 46990, description: 'Inverter split AC with copper condenser, PM 2.5 filter and power-saving mode.', image: 'https://images.unsplash.com/photo-1631545806609-24a3a6b7b6e6?w=600' },
  { productName: 'LG 2 Ton 4 Star Inverter Split AC', productCode: 'AC003', category: 'Air Conditioners', subCategory: 'Split AC', brand: 'LG', mrp: 65990, price: 58990, description: 'Dual inverter split AC with 4-way swing and low gas detection.', image: 'https://images.unsplash.com/photo-1614633833026-0b23c69f0f3a?w=600' },
  { productName: 'Blue Star 1.5 Ton Inverter AC', productCode: 'AC004', category: 'Air Conditioners', subCategory: 'Split AC', brand: 'Blue Star', mrp: 48990, price: 42990, description: 'Precision cooling inverter AC with self-diagnosis and turbo cool.', image: 'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?w=600' },

  // Air Conditioners – Window AC
  { productName: 'Voltas 1 Ton 3 Star Window AC', productCode: 'AC002', category: 'Air Conditioners', subCategory: 'Window AC', brand: 'Voltas', mrp: 31490, price: 27490, description: 'Window AC with high ambient cooling and anti-dust filter for compact spaces.', image: 'https://images.unsplash.com/photo-1580595999172-187fc5c4a1b1?w=600' },

  // Televisions – 4K Smart TV
  { productName: 'Sony Bravia 55" 4K Smart TV', productCode: 'TV001', category: 'Televisions', subCategory: '4K Smart TV', brand: 'Sony', mrp: 84990, price: 74990, description: '55-inch 4K Ultra HD LED smart TV with Google TV and Dolby Audio.', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600' },
  { productName: 'Samsung 43" Crystal 4K Smart TV', productCode: 'TV002', category: 'Televisions', subCategory: '4K Smart TV', brand: 'Samsung', mrp: 44990, price: 37990, description: '43-inch Crystal 4K UHD TV with Tizen OS and multi-voice assistant.', image: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600' },

  // Televisions – OLED TV
  { productName: 'LG 65" OLED evo Smart TV', productCode: 'TV003', category: 'Televisions', subCategory: 'OLED TV', brand: 'LG', mrp: 219990, price: 189990, description: '65-inch OLED evo 4K TV with a9 AI processor and Dolby Vision.', image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600' },

  // Televisions – HD TV
  { productName: 'Mi 32" HD Ready Smart TV', productCode: 'TV004', category: 'Televisions', subCategory: 'HD TV', brand: 'Mi', mrp: 16999, price: 13999, description: '32-inch HD Ready LED smart TV with PatchWall and Android TV.', image: 'https://images.unsplash.com/photo-1552975084-6e027cd345c2?w=600' },

  // Kitchen Appliances – Induction Cooktop
  { productName: 'Prestige Induction Cooktop 2000W', productCode: 'KIT001', category: 'Kitchen Appliances', subCategory: 'Induction Cooktop', brand: 'Prestige', mrp: 3499, price: 2799, description: 'Induction cooktop with Indian menu presets and auto shut-off safety.', image: 'https://images.unsplash.com/photo-1585237017125-24baf8d7406f?w=600' },

  // Kitchen Appliances – Air Fryer
  { productName: 'Philips Air Fryer HD9200', productCode: 'KIT002', category: 'Kitchen Appliances', subCategory: 'Air Fryer', brand: 'Philips', mrp: 9999, price: 8499, description: 'Rapid air technology air fryer for low-oil frying, baking and grilling.', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600' },

  // Kitchen Appliances – Mixer Grinder
  { productName: 'Bajaj 750W Mixer Grinder', productCode: 'KIT003', category: 'Kitchen Appliances', subCategory: 'Mixer Grinder', brand: 'Bajaj', mrp: 3999, price: 3299, description: '750W mixer grinder with 3 stainless steel jars and overload protection.', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600' },

  // Kitchen Appliances – Microwave Oven
  { productName: 'IFB 30L Convection Microwave Oven', productCode: 'KIT004', category: 'Kitchen Appliances', subCategory: 'Microwave Oven', brand: 'IFB', mrp: 17990, price: 14990, description: '30L convection microwave with 101 auto-cook menus and steam clean.', image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600' },

  // Fans – Ceiling Fan
  { productName: 'Havells Ceiling Fan 1200mm', productCode: 'FAN001', category: 'Fans', subCategory: 'Ceiling Fan', brand: 'Havells', mrp: 2999, price: 2499, description: 'High-speed decorative ceiling fan with aerodynamic blades and rust-free finish.', image: 'https://images.unsplash.com/photo-1573883431205-98b5f10aaedb?w=600' },
  { productName: 'Crompton BLDC Ceiling Fan', productCode: 'FAN003', category: 'Fans', subCategory: 'Ceiling Fan', brand: 'Crompton', mrp: 4299, price: 3699, description: 'Energy-efficient BLDC ceiling fan with remote and 5-star rating.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },

  // Fans – Table Fan
  { productName: 'Orient Table Fan 400mm', productCode: 'FAN002', category: 'Fans', subCategory: 'Table Fan', brand: 'Orient', mrp: 2199, price: 1799, description: 'High-air-delivery table fan with 3-speed control and thermal overload protection.', image: 'https://images.unsplash.com/photo-1565608087341-404b25492fee?w=600' },

  // Water Heaters – Storage Geyser
  { productName: 'AO Smith 15L Storage Water Heater', productCode: 'WH001', category: 'Water Heaters', subCategory: 'Storage Geyser', brand: 'AO Smith', mrp: 12990, price: 9990, description: '15L storage geyser with Blue Diamond glass-lined tank and 8-bar pressure.', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600' },
  { productName: 'Havells 25L Storage Geyser', productCode: 'WH003', category: 'Water Heaters', subCategory: 'Storage Geyser', brand: 'Havells', mrp: 14990, price: 12490, description: '25L storage water heater with feroglas coating and adjustable thermostat.', image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600' },

  // Water Heaters – Instant Geyser
  { productName: 'Bajaj 3L Instant Water Heater', productCode: 'WH002', category: 'Water Heaters', subCategory: 'Instant Geyser', brand: 'Bajaj', mrp: 4299, price: 3499, description: 'Instant 3L geyser with copper heating element and neon indicator.', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600' },

  // Small Appliances – Steam Iron
  { productName: 'Philips Steam Iron GC1905', productCode: 'SA001', category: 'Small Appliances', subCategory: 'Steam Iron', brand: 'Philips', mrp: 1799, price: 1299, description: 'Steam iron with non-stick soleplate and spray for crisp everyday pressing.', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600' },

  // Small Appliances – Water Purifier
  { productName: 'Kent Grand Plus RO Water Purifier', productCode: 'SA002', category: 'Small Appliances', subCategory: 'Water Purifier', brand: 'Kent', mrp: 20999, price: 17999, description: 'RO + UV + UF water purifier with TDS control and 8L storage.', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600' },

  // Small Appliances – Vacuum Cleaner
  { productName: 'Eureka Forbes Vacuum Cleaner', productCode: 'SA003', category: 'Small Appliances', subCategory: 'Vacuum Cleaner', brand: 'Eureka Forbes', mrp: 6999, price: 5499, description: '1200W vacuum cleaner with strong suction and reusable dust bag.', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600' },

  // Small Appliances – Toaster
  { productName: 'Morphy Richards 4-Slice Toaster', productCode: 'SA004', category: 'Small Appliances', subCategory: 'Toaster', brand: 'Morphy Richards', mrp: 3999, price: 3299, description: '4-slice pop-up toaster with variable browning and reheat function.', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600' },
];

// ─── Seed runner ─────────────────────────────────────────────────────────────
const importData = async () => {
  try {
    await connectDB();

    // Wipe existing data in the correct dependency order
    await Promise.all([
      Order.deleteMany(),
      Cart.deleteMany(),
      Product.deleteMany(),
      SubCategory.deleteMany(),
      Category.deleteMany(),
      User.deleteMany(),
      ServiceCategory.deleteMany(),
      RepairService.deleteMany(),
      SparePart.deleteMany(),
    ]);

    // 1. Users
    await User.create({ name: 'Admin', email: 'aswinadmin@suguna.com', password: 'aswinadmin123', role: 'admin' });
    await User.create({ name: 'Demo User', email: 'aswinuser@suguna.com', password: 'aswinuser123', role: 'user' });
    await User.create({ name: 'Ravi Technician', email: 'aswintech@suguna.com', password: 'aswintech123', role: 'technician', phone: '9876543210', specializations: ['AC Repair', 'Refrigerator Repair'] });

    // 2. Categories
    const createdCategories = await Category.insertMany(
      categories.map((categoryName) => ({ categoryName }))
    );
    // name → _id map
    const categoryMap = Object.fromEntries(
      createdCategories.map((c) => [c.categoryName, c._id])
    );

    // 3. SubCategories (linked to their parent category)
    const createdSubCategories = await SubCategory.insertMany(
      subCategorySeed.map((sc) => ({
        subCategoryName: sc.name,
        categoryId: categoryMap[sc.category],
      }))
    );
    // "CategoryName|SubCategoryName" → _id map for easy product lookup
    const subCategoryMap = Object.fromEntries(
      createdSubCategories.map((sc, i) => [
        `${subCategorySeed[i].category}|${subCategorySeed[i].name}`,
        sc._id,
      ])
    );

    // 4. Products (linked to both category and subcategory)
    const products = productSeed.map((p) => ({
      productName: p.productName,
      productCode: p.productCode,
      categoryId: categoryMap[p.category],
      subCategoryId: subCategoryMap[`${p.category}|${p.subCategory}`],
      brand: p.brand,
      mrp: p.mrp,
      price: p.price,
      description: p.description,
      image: p.image,
    }));

    await Product.insertMany(products);

    // 5. Service module masters
    const createdServiceCategories = await ServiceCategory.insertMany(serviceCategorySeed);
    const createdRepairServices = await RepairService.insertMany(repairServiceSeed);
    const createdSpareParts = await SparePart.insertMany(sparePartSeed);

    console.log(`Seeded ${createdCategories.length} categories, ${createdSubCategories.length} subcategories, and ${products.length} products successfully.`);
    console.log(`Seeded ${createdServiceCategories.length} service categories, ${createdRepairServices.length} repair services, ${createdSpareParts.length} spare parts.`);
    console.log('Admin login:      aswinadmin@suguna.com / aswinadmin123');
    console.log('User login:       aswinuser@suguna.com / aswinuser123');
    console.log('Technician login: aswintech@suguna.com / aswintech123');
    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    process.exit(1);
  }
};

importData();
