// STEP 1: Import required libraries
import express from "express";
import { Product } from "../../../Modules/Common/Product.js";
import { Checkout } from "../../../Modules/User/Checkout.js";

// STEP 2: Define router
const Router = express.Router();

// STEP 3: Create addtocart router
Router.post("/addtocart/:id", async (request, response) => {
  try {
    // Define customer id , ProductId
    const CustomerId = request.user._id;
    const ProdutId = request.params.id;

    // Find product price
    const product = await Product.findById(ProdutId);
    const TotalPrice = product.ProductSellingPrice;

    // Define new cart details
    const newCart = await Checkout({
      CustomerId,
      ProdutId,
      CheckoutStatus: "Cart added",
      ProductCount: 1,
      ProductPrice: product.ProductSellingPrice,
      TotalPrice,
    }).save();

    // Send an error response if any error in add cart process
    if (!newCart)
      return response.status(400).json({ message: "Something went wrong" });

    // Send success response if all process done successfully
    response.status(200).json({ message: "Cart added successfully" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal server problem" });
  }
});

// STEP 4: Create router to order product
Router.put("/order/:id", async (request, response) => {
  try {
    //  Define id
    const id = request.params.id;

    // Update cart to order status
    const update = await Checkout.findByIdAndUpdate(
      id,
      {
        $set: {
          CheckoutStatus: "Ordered",
          OrderStage: "Ordered",
          OrderedDate: Date.now(),
        },
      },
      { new: true }
    );

    // Find checkout product
    const checkoutProduct = await Checkout.findById(id);

    // Find product
    const product = await Product.findById(checkoutProduct.ProdutId);

    // Update the product count in product
    const UpdateProduct = await Product.findByIdAndUpdate(
      product._id,
      {
        $set: {
          ProductsCount: product.ProductsCount - checkoutProduct.ProductCount,
        },
      },
      { new: true }
    );

    // Send an error response if any errors occur during the update proess
    if (!update || !UpdateProduct)
      return response.status(400).json({ message: "Something went wrong" });

    // Send success response if all process done successfully
    response.status(200).json({ message: "Product ordered successfully" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal server problem" });
  }
});

// STEP 5: Increase and decrease product count
Router.put("/productcount/:id", async (request, response) => {
  try {
    // Define product count message
    const ProductCountMessage = request.headers["productcountmessage"];

    // Define id
    const id = request.params.id;

    // Find checkout product
    const product = await Checkout.findById(id);

    // Define product count and price
    let ProductCount, TotalPrice;

    // Product count and price increment process
    if (ProductCountMessage === "Increase") {
      ProductCount = product.ProductCount + 1;
      TotalPrice = product.ProductPrice * ProductCount;
    }
    // Product count and price decrement proess
    else {
      ProductCount = product.ProductCount - 1;
      TotalPrice = product.ProductPrice * ProductCount;
    }

    // Update the product count and prie
    const update = await Checkout.findByIdAndUpdate(
      id,
      {
        $set: {
          ProductCount,
          TotalPrice,
        },
      },
      { new: true }
    );

    // Send an error response if any errors occur during the update proess
    if (!update)
      return response.status(400).json({ message: "Something went wrong" });

    // Send success response if all process done successfully
    return response
      .status(200)
      .json({ message: "Product count and price updated" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal server problem" });
  }
});

// STEP 6: Create router to remove from cart and cancel order
Router.put("/removal/:id", async (request, response) => {
  try {
    // Define product count message
    const ProductStatusMessage = request.headers["productstatusmessage"];

    // Define id
    const id = request.params.id;

    // Find checkout product
    const checkoutProduct = await Checkout.findById(id);

    // Find product
    const product = await Product.findById(checkoutProduct.ProdutId);

    // Define CartRemovedDate, CheckoutStatus, ReturnedDate and OrderCanceledDate
    let CartRemovedDate, OrderCanceledDate, CheckoutStatus, ReturnedDate;

    // Remove from cart
    if (ProductStatusMessage === "Removed from cart") {
      CheckoutStatus = "Removed from cart";
      CartRemovedDate = Date.now();
    }
    // Cancel order
    else if (ProductStatusMessage === "Order cancelled") {
      CheckoutStatus = "Order cancelled";
      OrderCanceledDate = Date.now();

      // Update the product count in product
      const UpdateProduct = await Product.findByIdAndUpdate(
        product._id,
        {
          $set: {
            ProductsCount: product.ProductsCount + checkoutProduct.ProductCount,
          },
        },
        { new: true }
      );

      if (!UpdateProduct)
        return response.status(400).json({ message: "Something went wrong" });
    }
    // Return product
    else if (ProductStatusMessage === "Returned") {
      CheckoutStatus = "Returned";
      ReturnedDate = Date.now();

      // Update the product count in product
      const UpdateProduct = await Product.findByIdAndUpdate(
        product._id,
        {
          $set: {
            ProductsCount: product.ProductsCount + checkoutProduct.ProductCount,
          },
        },
        { new: true }
      );

      if (!UpdateProduct)
        return response.status(400).json({ message: "Something went wrong" });
    }

    // Update the product status
    const update = await Checkout.findByIdAndUpdate(
      id,
      {
        $set: {
          CheckoutStatus,
          CartRemovedDate,
          OrderCanceledDate,
          ReturnedDate,
        },
      },
      { new: true }
    );

    // Send an error response if any errors occur during the update proess
    if (!update)
      return response.status(400).json({ message: "Something went wrong" });

    // Send success response if all process done successfully
    return response.status(200).json({ message: "Product status updated" });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal server problem" });
  }
});

// STEP 7: Create router to get all checkout products
Router.get("/", async (request, response) => {
  try {
    // Define customer id
    const CustomerId = request.user._id;

    // Find all checkout products
    const products = await Checkout.find({ CustomerId });

    // Send an error response if the products cannot be found
    if (!products)
      return response.status(400).json({ message: "Something went wrong" });

    // Send success response if all process done successfully
    response.status(200).json(products);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ message: "Internal server problem" });
  }
});

// STEP 8: Define and export checkout router
export const CheckoutRouter = Router;
