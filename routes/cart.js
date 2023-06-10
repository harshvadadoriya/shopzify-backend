const router = require('express').Router();
const Cart = require('../models/cart');
const User = require('../models/user');
const Product = require('../models/product');
const verifyToken = require('../middleware/verifyToken');

router.post('/post/cart', verifyToken, async (req, res) => {
	const { product } = req.body;
	const productId = product._id;
	const userId = req.userId;

	try {
		// Check if the user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Find the user's cart
		let cart = await Cart.findOne({ userId });

		if (!cart) {
			// If the cart doesn't exist, create a new one
			cart = new Cart({
				userId,
				products: [],
			});
		}

		// Check if the product already exists in the cart
		const existingProduct = cart.products.find(
			(item) => item.product.toString() === productId
		);

		if (existingProduct) {
			// If the product already exists, remove it from the cart
			cart.products = cart.products.filter(
				(item) => item.product.toString() !== productId
			);
			await cart.save();
			res.status(200).json({ message: 'Product removed from cart' });
		} else {
			// If the product doesn't exist, add it to the cart
			const productDetails = await Product.findById(productId);
			if (!productDetails) {
				return res.status(404).json({ message: 'Product not found' });
			}

			const newProduct = {
				product: productDetails._id,
				category: productDetails.category,
				description: productDetails.description,
				discountedPrice: productDetails.discountedPrice,
				displaySection: productDetails.displaySection,
				gender: productDetails.gender,
				image: productDetails.image,
				name: productDetails.name,
				originalPrice: productDetails.originalPrice,
				quantity: productDetails.quantity,
				recordDate: productDetails.recordDate,
			};

			cart.products.push(newProduct);
			await cart.save();
			res.status(200).json({ message: 'Product added to cart' });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Something went wrong' });
	}
});

// GET endpoint to fetch the cart
router.get('/carts', verifyToken, async (req, res) => {
	const userId = req.userId;

	try {
		// Check if the user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Find the user's cart
		const cart = await Cart.findOne({ userId }).populate('products.product');

		if (!cart) {
			return res.status(404).json({ message: 'Cart not found' });
		}

		res.status(200).json({ cart });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Something went wrong' });
	}
});

module.exports = router;
