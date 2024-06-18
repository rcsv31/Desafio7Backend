const cartService = require("../services/cart.service.js");
const PurchaseCartDTO = require("../dto/carts.dto.js");

exports.createCart = async (req, res) => {
  try {
    const createCartDTO = new CreateCartDTO(req.body);
    const newCart = await cartService.createCart(createCartDTO);
    res.status(201).json(newCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCartById = async (req, res) => {
  try {
    const cart = await cartService.getCartById(req.params.id);
    res.render("carts", { cart });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const updateCartDTO = new UpdateCartDTO(req.body);
    const updatedCart = await cartService.updateCart(
      req.params.id,
      updateCartDTO
    );
    res.render("carts", { cart: updatedCart });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    await cartService.deleteCart(req.params.id);
    res.render("carts", { message: "Carrito eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCarts = async (req, res) => {
  try {
    const carts = await cartService.getCarts();
    res.render("carts", { carts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductsFromCart = async (req, res) => {
  try {
    const cart = await cartService.getProductsFromCart(req.params.id);
    if (!cart) {
      res
        .status(404)
        .json({ message: `Carrito no encontrado con ID ${req.params.id}` });
    } else {
      res.render("carts", { cart });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addProductToCart = async (req, res) => {
  try {
    const addProductToCartDTO = new AddProductToCartDTO(req.body);
    const cart = await cartService.addProductToCart(
      req.params.id,
      addProductToCartDTO
    );
    res.render("carts", { cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProductById = async (req, res) => {
  try {
    const deleteProductByIdDTO = new DeleteProductByIdDTO(req.params);
    const cart = await cartService.deleteProductById(
      req.params.id,
      deleteProductByIdDTO.productId
    );
    res.render("carts", { cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.params.id);
    res.render("carts", { cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.purchaseCart = async (req, res) => {
  try {
    const purchaseCartDTO = new PurchaseCartDTO(req.body);
    const result = await cartService.purchaseCart(
      req.params.cid,
      purchaseCartDTO
    );

    if (result.success) {
      // Generar ticket con los datos de la compra
      const ticket = await ticketService.generateTicket(
        result.cart,
        result.purchaseDateTime
      );

      // Limpiar el carrito después de la compra
      const updatedCart = await cartService.clearCart(req.params.cid);

      res.render("ticket", { ticket });
    } else {
      res
        .status(400)
        .json({ productsNotProcessed: result.productsNotProcessed });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
