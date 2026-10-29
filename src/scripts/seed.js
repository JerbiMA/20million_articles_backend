/**
 * Database Seed Script
 * Usage: npm run seed
 *
 * Populates the database with initial categories, teams, products, coupons, and users.
 */
const mongoose = require('mongoose');
const { connectDB, disconnectDB, logger } = require('../config');
const User = require('../modules/user/user.model');
const Category = require('../modules/category/category.model');
const Team = require('../modules/team/team.model');
const Product = require('../modules/product/product.model');
const Coupon = require('../modules/coupon/coupon.model');

const seedData = async () => {
  try {
    await connectDB();

    // ─── Clear existing data ──────────────────────
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Team.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
    ]);
    logger.info('Cleared existing collections.');

    // ─── Users ──────────────────────────────────
    await User.create([
      {
        name: 'Admin',
        email: 'admin@mriwl.com',
        password: 'Admin@12345678',
        role: 'admin',
      },
      {
        name: 'Test Client',
        email: 'user@mriwl.com',
        password: 'User@12345678',
        role: 'user',
        phone: '+212611223344',
        address: {
          street: 'Boulevard d’Anfa',
          city: 'Casablanca',
          postalCode: '20000',
          country: 'Morocco',
        },
      },
    ]);
    logger.info('Seeded 2 users (admin + test client).');

    // ─── Categories ─────────────────────────────
    const categories = await Category.create([
      { name: 'New Season', description: 'Latest 2024/25 season football shirts', sortOrder: 1 },
      { name: 'Classical', description: 'Retro and vintage football club shirts', sortOrder: 2 },
      { name: 'International', description: 'National team tournament and friendly shirts', sortOrder: 3 },
      { name: 'Classical International', description: 'Legendary World Cup & Euro retro kits', sortOrder: 4 },
      { name: 'Thrifting', description: 'Pre-owned & authenticated rare football gems', sortOrder: 5 },
      { name: 'Winter Collection', description: 'Club survetements, jackets, windbreakers, and fleece', sortOrder: 6 },
    ]);
    logger.info('Seeded 6 categories.');

    const catMap = {};
    categories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    // ─── Teams ──────────────────────────────────
    const teams = await Team.create([
      // ─── Premier League (England) ───────────────
      { name: 'Manchester City', type: 'club', league: 'Premier League', country: 'England' },
      { name: 'Arsenal', type: 'club', league: 'Premier League', country: 'England' },
      { name: 'Manchester United', type: 'club', league: 'Premier League', country: 'England' },
      { name: 'Chelsea', type: 'club', league: 'Premier League', country: 'England' },
      { name: 'Tottenham Hotspur', type: 'club', league: 'Premier League', country: 'England' },
      { name: 'Liverpool', type: 'club', league: 'Premier League', country: 'England' },
      { name: 'Newcastle United', type: 'club', league: 'Premier League', country: 'England' },
      { name: 'Aston Villa', type: 'club', league: 'Premier League', country: 'England' },
      { name: 'Brighton', type: 'club', league: 'Premier League', country: 'England' },
      { name: 'Everton', type: 'club', league: 'Premier League', country: 'England' },

      // ─── La Liga (Spain) ────────────────────────
      { name: 'Real Madrid', type: 'club', league: 'La Liga', country: 'Spain' },
      { name: 'FC Barcelona', type: 'club', league: 'La Liga', country: 'Spain' },
      { name: 'Atlético Madrid', type: 'club', league: 'La Liga', country: 'Spain' },
      { name: 'Real Betis', type: 'club', league: 'La Liga', country: 'Spain' },

      // ─── Ligue 1 (France) ───────────────────────
      { name: 'Paris Saint-Germain', type: 'club', league: 'Ligue 1', country: 'France' },
      { name: 'Olympique de Marseille', type: 'club', league: 'Ligue 1', country: 'France' },
      { name: 'OGC Nice', type: 'club', league: 'Ligue 1', country: 'France' },

      // ─── Bundesliga (Germany) ───────────────────
      { name: 'Bayern Munich', type: 'club', league: 'Bundesliga', country: 'Germany' },
      { name: 'Borussia Dortmund', type: 'club', league: 'Bundesliga', country: 'Germany' },
      { name: 'RB Leipzig', type: 'club', league: 'Bundesliga', country: 'Germany' },
      { name: 'Borussia Mönchengladbach', type: 'club', league: 'Bundesliga', country: 'Germany' },

      // ─── Serie A (Italy) ────────────────────────
      { name: 'AC Milan', type: 'club', league: 'Serie A', country: 'Italy' },
      { name: 'Inter Milan', type: 'club', league: 'Serie A', country: 'Italy' },
      { name: 'Juventus', type: 'club', league: 'Serie A', country: 'Italy' },
      { name: 'AS Roma', type: 'club', league: 'Serie A', country: 'Italy' },
      { name: 'Napoli', type: 'club', league: 'Serie A', country: 'Italy' },
      { name: 'Lazio', type: 'club', league: 'Serie A', country: 'Italy' },
      { name: 'Atalanta', type: 'club', league: 'Serie A', country: 'Italy' },

      // ─── Saudi Pro League (Saudi Arabia) ─────────
      { name: 'Al Hilal', type: 'club', league: 'Saudi Pro League', country: 'Saudi Arabia' },
      { name: 'Al Nassr', type: 'club', league: 'Saudi Pro League', country: 'Saudi Arabia' },
      { name: 'Al Ahli', type: 'club', league: 'Saudi Pro League', country: 'Saudi Arabia' },
      { name: 'Al Ittihad', type: 'club', league: 'Saudi Pro League', country: 'Saudi Arabia' },

      // ─── National Teams ─────────────────────────
      // All World Cup Winners:
      { name: 'Brazil', type: 'national', country: 'Brazil' }, // 5 titles
      { name: 'Germany', type: 'national', country: 'Germany' }, // 4 titles
      { name: 'Italy', type: 'national', country: 'Italy' }, // 4 titles
      { name: 'Argentina', type: 'national', country: 'Argentina' }, // 3 titles
      { name: 'France', type: 'national', country: 'France' }, // 2 titles
      { name: 'Uruguay', type: 'national', country: 'Uruguay' }, // 2 titles
      { name: 'England', type: 'national', country: 'England' }, // 1 title
      { name: 'Spain', type: 'national', country: 'Spain' }, // 1 title
      // Requested Additional Nations:
      { name: 'Netherlands', type: 'national', country: 'Netherlands' },
      { name: 'Tunisia', type: 'national', country: 'Tunisia' },
      { name: 'Portugal', type: 'national', country: 'Portugal' },
      { name: 'Belgium', type: 'national', country: 'Belgium' },
      { name: 'Morocco', type: 'national', country: 'Morocco' },
    ]);
    logger.info(`Seeded ${teams.length} teams across top European leagues, Saudi Pro League & World Cup nations.`);

    const teamMap = {};
    teams.forEach((t) => {
      teamMap[t.name] = t._id;
    });

    // ─── Products ───────────────────────────────
    await Product.create([
      {
        name: 'Real Madrid Home Kit 2024/25',
        description: 'Official 24/25 Real Madrid home jersey featuring custom houndstooth pattern and gold accents.',
        price: 95,
        salePrice: 85,
        category: catMap['New Season'],
        team: teamMap['Real Madrid'],
        season: '2024/2025',
        isFeatured: true,
        isActive: true,
        tags: ['real madrid', 'la liga', 'bellingham', 'mbappe', 'home'],
        sizes: [
          { size: 'S', stock: 15 },
          { size: 'M', stock: 25 },
          { size: 'L', stock: 20 },
          { size: 'XL', stock: 10 },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80',
            publicId: 'seed_rm_home',
            isMain: true,
          },
        ],
      },
      {
        name: 'Arsenal 2003/04 "The Invincibles" Retro Jersey',
        description: 'Iconic O2 sponsored jersey worn during the historic 49-game unbeaten Premier League season.',
        price: 110,
        salePrice: null,
        category: catMap['Classical'],
        team: teamMap['Arsenal'],
        season: '2003/2004',
        isFeatured: true,
        isActive: true,
        tags: ['arsenal', 'retro', 'henry', 'bergkamp', 'invincibles'],
        sizes: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 12 },
          { size: 'L', stock: 8 },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
            publicId: 'seed_arsenal_retro',
            isMain: true,
          },
        ],
      },
      {
        name: 'Morocco World Cup 2022 Home Jersey',
        description: 'Commemorative jersey celebrating the Atlas Lions historic semi-final run in Qatar 2022.',
        price: 85,
        salePrice: 70,
        category: catMap['International'],
        team: teamMap['Morocco'],
        season: '2022',
        isFeatured: true,
        isActive: true,
        tags: ['morocco', 'atlas lions', 'world cup', 'qatar 2022', 'hakimi', 'bounou'],
        sizes: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 20 },
          { size: 'L', stock: 18 },
          { size: 'XL', stock: 12 },
          { size: 'XXL', stock: 6 },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
            publicId: 'seed_morocco_wc',
            isMain: true,
          },
        ],
      },
      {
        name: 'Argentina 1986 World Cup Final Jersey - Maradona',
        description: 'Legendary Le Coq Sportif blue away kit worn by Diego Maradona in the 1986 Mexico World Cup.',
        price: 120,
        salePrice: null,
        category: catMap['Classical International'],
        team: teamMap['Argentina'],
        season: '1986',
        isFeatured: true,
        isActive: true,
        tags: ['argentina', 'maradona', 'mexico 86', 'vintage'],
        sizes: [
          { size: 'M', stock: 8 },
          { size: 'L', stock: 14 },
          { size: 'XL', stock: 5 },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80',
            publicId: 'seed_arg_86',
            isMain: true,
          },
        ],
      },
      {
        name: 'Vintage FC Barcelona 1999 Centenary Shirt',
        description: 'Authentic thrifting gem from 1999 celebrating 100 years of FC Barcelona with dual-split colors.',
        price: 65,
        salePrice: null,
        category: catMap['Thrifting'],
        team: teamMap['FC Barcelona'],
        season: '1999/2000',
        isFeatured: false,
        isActive: true,
        tags: ['barcelona', 'thrifting', 'rivaldo', 'figo', 'centenary'],
        sizes: [
          { size: 'L', stock: 1 },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=800&q=80',
            publicId: 'seed_barca_99',
            isMain: true,
          },
        ],
      },
      {
        name: 'Paris Saint-Germain Winter Survetement & Track Jacket',
        description: 'Warm club tracksuit designed for cold weather training with thermal fleece lining and zip pockets.',
        price: 135,
        salePrice: 115,
        category: catMap['Winter Collection'],
        team: teamMap['Paris Saint-Germain'],
        season: '2024/2025',
        isFeatured: true,
        isActive: true,
        tags: ['psg', 'winter', 'tracksuit', 'survetement', 'fleece'],
        sizes: [
          { size: 'S', stock: 8 },
          { size: 'M', stock: 15 },
          { size: 'L', stock: 15 },
          { size: 'XL', stock: 10 },
          { size: 'XXL', stock: 4 },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
            publicId: 'seed_psg_winter',
            isMain: true,
          },
        ],
      },
      {
        name: 'Bayern Munich Heavy Thermal Winter Jacket',
        description: 'All-weather waterproof club coat with down insulation, perfect for winter matches and outdoor wear.',
        price: 160,
        salePrice: null,
        category: catMap['Winter Collection'],
        team: teamMap['Bayern Munich'],
        season: '2024/2025',
        isFeatured: false,
        isActive: true,
        tags: ['bayern', 'winter', 'jacket', 'coat', 'down'],
        sizes: [
          { size: 'M', stock: 6 },
          { size: 'L', stock: 10 },
          { size: 'XL', stock: 8 },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
            publicId: 'seed_bayern_jacket',
            isMain: true,
          },
        ],
      },
      {
        name: 'Liverpool FC Home Jersey 2024/25',
        description: 'Classic all-red kit with yellow and white collar trim and YNWA tribute on nape.',
        price: 88,
        salePrice: null,
        category: catMap['New Season'],
        team: teamMap['Liverpool'],
        season: '2024/2025',
        isFeatured: false,
        isActive: true,
        tags: ['liverpool', 'premier league', 'salah', 'anfield'],
        sizes: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 18 },
          { size: 'L', stock: 16 },
          { size: 'XL', stock: 7 },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80',
            publicId: 'seed_lfc_home',
            isMain: true,
          },
        ],
      },
      {
        name: 'Al Nassr Home Jersey 2024/25 - Cristiano Ronaldo #7',
        description: 'Official yellow and blue Nike home kit for Al Nassr FC with authentic Ronaldo printing.',
        price: 90,
        salePrice: 80,
        category: catMap['New Season'],
        team: teamMap['Al Nassr'],
        season: '2024/2025',
        isFeatured: true,
        isActive: true,
        tags: ['al nassr', 'saudi pro league', 'ronaldo', 'cr7', 'yellow'],
        sizes: [
          { size: 'S', stock: 12 },
          { size: 'M', stock: 25 },
          { size: 'L', stock: 20 },
          { size: 'XL', stock: 15 },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80',
            publicId: 'seed_alnassr_home',
            isMain: true,
          },
        ],
      },
      {
        name: 'Portugal Euro 2016 Champions Retro Shirt',
        description: 'Historic crimson red Portugal jersey worn during the historic Euro 2016 victory in Paris.',
        price: 115,
        salePrice: null,
        category: catMap['Classical International'],
        team: teamMap['Portugal'],
        season: '2016',
        isFeatured: true,
        isActive: true,
        tags: ['portugal', 'euro 2016', 'champions', 'ronaldo', 'retro'],
        sizes: [
          { size: 'S', stock: 8 },
          { size: 'M', stock: 15 },
          { size: 'L', stock: 12 },
          { size: 'XL', stock: 6 },
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
            publicId: 'seed_portugal_2016',
            isMain: true,
          },
        ],
      },
    ]);
    logger.info('Seeded 10 realistic products.');

    // ─── Coupons ────────────────────────────────
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    await Coupon.create([
      {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minOrderAmount: 50,
        maxDiscount: 30,
        endDate: futureDate,
        usageLimit: 100,
        isActive: true,
      },
      {
        code: 'MRIWL20',
        type: 'fixed',
        value: 20,
        minOrderAmount: 100,
        endDate: futureDate,
        usageLimit: 50,
        isActive: true,
      },
    ]);
    logger.info('Seeded 2 discount coupons.');

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🔑 Login Credentials:');
    logger.info('  • Admin:  admin@mriwl.com / Admin@12345678');
    logger.info('  • Client: user@mriwl.com  / User@12345678');
    logger.info('🎟️ Active Coupons:');
    logger.info('  • WELCOME10 (10% off, min order 50)');
    logger.info('  • MRIWL20   (20 EUR/MAD off, min order 100)');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedData();
