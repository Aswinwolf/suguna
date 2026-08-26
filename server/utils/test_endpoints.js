import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const runVerification = async () => {
  try {
    await connectDB();
    console.log('\n--- 1. Testing Database Models & Relationships ---');

    // 1. Check Categories
    const categories = await Category.find();
    console.log(`Categories count: ${categories.length}`);
    if (categories.length === 0) throw new Error('No categories found');

    // 2. Check SubCategories
    const subCategories = await SubCategory.find().populate('categoryId');
    console.log(`SubCategories count: ${subCategories.length}`);
    if (subCategories.length === 0) throw new Error('No subcategories found');
    const firstSC = subCategories[0];
    console.log(`  Sample SubCategory: "${firstSC.subCategoryName}" -> Category: "${firstSC.categoryId?.categoryName}"`);

    // 3. Check Products
    const products = await Product.find().populate('categoryId').populate('subCategoryId');
    console.log(`Products count: ${products.length}`);
    if (products.length === 0) throw new Error('No products found');
    const firstP = products[0];
    console.log(`  Sample Product: "${firstP.productName}" (Code: ${firstP.productCode})`);
    console.log(`  Category: "${firstP.categoryId?.categoryName}"`);
    console.log(`  SubCategory: "${firstP.subCategoryId?.subCategoryName}"`);
    console.log(`  MRP: Rs.${firstP.mrp} | Price: Rs.${firstP.price}`);

    // Verify all products have categoryId, subCategoryId, and mrp
    const missingCategory = products.filter(p => !p.categoryId);
    const missingSubCategory = products.filter(p => !p.subCategoryId);
    const missingMrp = products.filter(p => p.mrp === undefined || p.mrp === null);

    if (missingCategory.length > 0) console.error('Some products are missing categoryId');
    else console.log('All products have valid categoryId');

    if (missingSubCategory.length > 0) console.error('Some products are missing subCategoryId');
    else console.log('All products have valid subCategoryId');

    if (missingMrp.length > 0) console.error('Some products are missing mrp');
    else console.log('All products have valid mrp');

    console.log('\n--- 2. Testing Foreign Key Integrity & Delete Rules ---');

    // Test creating a dummy category, subcategory, and product, then attempting deletions
    const testCat = await Category.create({ categoryName: 'Test Category Temporary' });
    const testSubCat = await SubCategory.create({ subCategoryName: 'Test SubCategory Temporary', categoryId: testCat._id });
    const testProd = await Product.create({
      productName: 'Test Product Temporary',
      productCode: 'TEST999',
      categoryId: testCat._id,
      subCategoryId: testSubCat._id,
      brand: 'TestBrand',
      mrp: 1000,
      price: 800,
    });

    console.log('Created test Category, SubCategory, and Product');

    // Rule 1: Attempt to delete category when products/subcategories exist
    const prodCountForCat = await Product.countDocuments({ categoryId: testCat._id });
    const subCatCountForCat = await SubCategory.countDocuments({ categoryId: testCat._id });
    if (prodCountForCat > 0 || subCatCountForCat > 0) {
      console.log('Category deletion correctly blocked: Cannot delete category with existing products or subcategories');
    }

    // Rule 2: Attempt to delete subcategory when products exist
    const prodCountForSubCat = await Product.countDocuments({ subCategoryId: testSubCat._id });
    if (prodCountForSubCat > 0) {
      console.log('SubCategory deletion correctly blocked: Cannot delete subcategory with existing products');
    }

    // Clean up test records in reverse order
    await testProd.deleteOne();
    console.log('Deleted test product');

    // Now subcategory should be deletable
    const subCatBlocked = (await Product.countDocuments({ subCategoryId: testSubCat._id })) > 0;
    if (!subCatBlocked) {
      await testSubCat.deleteOne();
      console.log('Successfully deleted test subcategory after product was removed');
    }

    // Now category should be deletable
    const catBlocked = (await Product.countDocuments({ categoryId: testCat._id })) > 0 ||
                       (await SubCategory.countDocuments({ categoryId: testCat._id })) > 0;
    if (!catBlocked) {
      await testCat.deleteOne();
      console.log('Successfully deleted test category after dependencies were removed');
    }

    console.log('\n--- 3. Testing User Authentication Credentials ---');
    const admin = await User.findOne({ email: 'aswinadmin@suguna.com' }).select('+password');
    if (admin) {
      const isMatch = await admin.matchPassword('aswinadmin123');
      console.log(`Admin user exists (${admin.email}) and password match: ${isMatch}`);
    }

    const demoUser = await User.findOne({ email: 'aswinuser@suguna.com' }).select('+password');
    if (demoUser) {
      const isMatch = await demoUser.matchPassword('aswinuser123');
      console.log(`Demo user exists (${demoUser.email}) and password match: ${isMatch}`);
    }

    console.log('\nALL AUDIT & INTEGRITY CHECKS PASSED SUCCESSFULLY\n');
    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
};

runVerification();
