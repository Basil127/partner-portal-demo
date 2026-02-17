const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    price: { type: 'number' },
    currency: { type: 'string', default: 'USD' },
    image_url: { type: 'string' },
    category: { type: 'string' },
    in_stock: { type: 'boolean' },
    metadata: { type: 'object' }
  }
};

const cartItemSchema = {
  type: 'object',
  properties: {
    product_id: { type: 'string' },
    quantity: { type: 'integer', minimum: 1 },
    price: { type: 'number' },
    name: { type: 'string' }
  },
  required: ['product_id', 'quantity']
};

const cartSchema = {
  type: 'object',
  properties: {
    cart_id: { type: 'string' },
    user_id: { type: 'string' },
    items: { type: 'array', items: cartItemSchema },
    total: { type: 'number' },
    currency: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' }
  }
};

const orderSchema = {
  type: 'object',
  properties: {
    order_id: { type: 'string' },
    user_id: { type: 'string' },
    items: { type: 'array', items: cartItemSchema },
    total: { type: 'number' },
    currency: { type: 'string' },
    status: { 
      type: 'string',
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    payment_status: {
      type: 'string',
      enum: ['pending', 'confirmed', 'failed']
    },
    created_at: { type: 'string' }
  }
};

export {
  productSchema,
  cartItemSchema,
  cartSchema,
  orderSchema
};