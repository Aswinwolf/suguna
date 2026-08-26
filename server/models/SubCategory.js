import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema(
  {
    subCategoryName: {
      type: String,
      required: [true, 'SubCategory name is required'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate subCategory names within the same category
subCategorySchema.index({ subCategoryName: 1, categoryId: 1 }, { unique: true });

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

export default SubCategory;
