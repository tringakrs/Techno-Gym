const { toTitleCase } = require("../config/function");
const categoryModel = require("../models/categories");
const productModel = require("../models/products");

class Category {
  async getAllCategory(req, res) {
    try {
      let Categories = await categoryModel.find({}).sort({ _id: -1 });
      if (Categories) {
        return res.json({ Categories });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async postAddCategory(req, res) {
    let { cName, cStatus } = req.body;
  
    if (!cName || !cStatus) {
      return res.json({ error: "All fields must be required" });
    } else if (cName.length > 400) {
      return res.json({
        error: "Name must not exceed 400 characters",
      });
    } else {
      cName = toTitleCase(cName);
      try {
        let checkCategoryExists = await categoryModel.findOne({ cName: cName });
        if (checkCategoryExists) {
          return res.json({ error: "Category already exists" });
        } else {
          let newCategory = new categoryModel({
            cName,
            cStatus,
          });
          let saveCat = await newCategory.save();
          if (saveCat) {
            return res.json({ success: "Category created successfully" });
          }
        }
      } catch (err) {
        console.log(err);
        return res.json({ error: "An error occurred while saving the category" });
      }
    }
  }
  

  async postEditCategory(req, res) {
    let { cId, cStatus } = req.body;
    if (!cStatus) {
      return res.json({ error: "All filled must be required" });
    }
    try {
      let editCategory = categoryModel.findByIdAndUpdate(cId, {
        cStatus,
        updatedAt: Date.now(),
      });
      let edit = await editCategory.exec();
      if (edit) {
        return res.json({ success: "Category edit successfully" });
      }
    } catch (err) {
      console.log(err);
    }
  }
  async getDeleteCategory(req, res) {
    let { cId } = req.body;
    if (!cId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        // Check if any products are associated with the category
        let products = await productModel.find({ pCategory: cId });
        if (products.length > 0) {
          return res.json({
            error:
              "This category is being used by a product, it cannot be deleted.",
          });
        } else {
          let deletedCategoryFile = await categoryModel.findById(cId);
          let deleteCategory = await categoryModel.findByIdAndDelete(cId);
          if (deleteCategory) {
              return res.json({ success: "Category deleted successfully" });
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}

const categoryController = new Category();
module.exports = categoryController;
