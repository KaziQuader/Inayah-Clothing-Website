const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");


// Create Product - Admin
exports.createProduct = catchAsyncError (async (req, res, next) => {
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    });
});

// Update product - Admin
exports.updateProduct = catchAsyncError (async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(500).json({
            success: false,
            message: "Product not found"
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    })
});

// Delete Product - Admin
exports.deleteProduct = catchAsyncError (async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(500).json({
            success: false,
            message: "Product not found"
        })
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Product deleted"
    })
});

// Get Product details
exports.getProductDetails = catchAsyncError (async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(500).json({
            success: false,
            message: "Product not found"
        })
    }

    res.status(200).json({
        success: true,
        product
    });
});

// Get all products
exports.getAllProducts = catchAsyncError (async (req, res) => {
    const resultPerPage = 4;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage)
    
    // let products = await apiFeatures.query;
    // let filteredProductsCount = products.length;
    // apiFeatures.pagination(resultPerPage);
    
    const products = await apiFeatures.query;
    const filteredlength = products.length;

    // console.log(products);
    res.status(201).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredlength
    });
});

// Create New Review or Update the review
exports.createProductReview = async(req, res, next) => {
    const {rating, comment, productId} = req.body;
    
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString());

    if(isReviewed){
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString()){ 
                rev.rating = rating,
                rev.comment = comment
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    
    let avg = 0;
    product.ratings = product.reviews.forEach(rev => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
    })
}

// Get all Reviews of a product
exports.getProductReviews = async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
}

// Delete Review
exports.deleteReview = async (req, res, next) => {
    const product = await Product.findById(req.query.productid);

    if (!product) { 
        res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

    let avg = 0;
    reviews.forEach(rev => {
        avg += rev.rating;
    });

    const ratings = avg / reviews.length;
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productid, {
        reviews, ratings, numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
    });

}

