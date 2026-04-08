export const ecommerceProV1 = {
  pack: {
    name: 'E-commerce Pro',
    slug: 'ecommerce-pro-v1',
    category: 'ecommerce',
    description:
      'Warm, trust-building e-commerce design system with deep indigo and amber accents optimized for conversion',
    version: '1.0.0',
    isPublic: true,
  },
  tokens: [
    { tokenKey: 'color.primary', tokenType: 'color' as const, tokenValue: '#4F46E5' },
    { tokenKey: 'color.primary-hover', tokenType: 'color' as const, tokenValue: '#4338CA' },
    { tokenKey: 'color.secondary', tokenType: 'color' as const, tokenValue: '#6366F1' },
    { tokenKey: 'color.accent', tokenType: 'color' as const, tokenValue: '#F59E0B' },
    { tokenKey: 'color.accent-hover', tokenType: 'color' as const, tokenValue: '#D97706' },
    { tokenKey: 'color.background', tokenType: 'color' as const, tokenValue: '#FFFFFF' },
    { tokenKey: 'color.surface', tokenType: 'color' as const, tokenValue: '#F9FAFB' },
    { tokenKey: 'color.text-primary', tokenType: 'color' as const, tokenValue: '#111827' },
    { tokenKey: 'color.text-secondary', tokenType: 'color' as const, tokenValue: '#6B7280' },
    { tokenKey: 'color.border', tokenType: 'color' as const, tokenValue: '#E5E7EB' },
    { tokenKey: 'color.success', tokenType: 'color' as const, tokenValue: '#16A34A' },
    { tokenKey: 'color.error', tokenType: 'color' as const, tokenValue: '#DC2626' },
    { tokenKey: 'radius.sm', tokenType: 'radius' as const, tokenValue: '4px' },
    { tokenKey: 'radius.md', tokenType: 'radius' as const, tokenValue: '8px' },
    { tokenKey: 'radius.lg', tokenType: 'radius' as const, tokenValue: '12px' },
    { tokenKey: 'radius.full', tokenType: 'radius' as const, tokenValue: '9999px' },
    { tokenKey: 'font.heading', tokenType: 'font' as const, tokenValue: 'DM Sans' },
    { tokenKey: 'font.body', tokenType: 'font' as const, tokenValue: 'Inter' },
    { tokenKey: 'font.mono', tokenType: 'font' as const, tokenValue: 'JetBrains Mono' },
    { tokenKey: 'spacing.xs', tokenType: 'spacing' as const, tokenValue: '4px' },
    { tokenKey: 'spacing.sm', tokenType: 'spacing' as const, tokenValue: '8px' },
    { tokenKey: 'spacing.md', tokenType: 'spacing' as const, tokenValue: '16px' },
    { tokenKey: 'spacing.lg', tokenType: 'spacing' as const, tokenValue: '24px' },
    { tokenKey: 'spacing.xl', tokenType: 'spacing' as const, tokenValue: '32px' },
    { tokenKey: 'spacing.xxl', tokenType: 'spacing' as const, tokenValue: '48px' },
    {
      tokenKey: 'shadow.sm',
      tokenType: 'shadow' as const,
      tokenValue: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
    {
      tokenKey: 'shadow.md',
      tokenType: 'shadow' as const,
      tokenValue: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    {
      tokenKey: 'shadow.lg',
      tokenType: 'shadow' as const,
      tokenValue: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
  ],
  recipes: [
    {
      name: 'Product Card',
      type: 'card' as const,
      codeTemplate: `<div className="group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
  <div className="relative aspect-square overflow-hidden bg-gray-100">
    <img src="{imageUrl}" alt="{productName}" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
    {showBadge && <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">{badgeText}</span>}
  </div>
  <div className="p-4">
    <p className="text-sm text-gray-500">{category}</p>
    <h3 className="mt-1 font-semibold text-gray-900 font-['DM_Sans']">{productName}</h3>
    <div className="mt-1 flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={\`h-4 w-4 \${i < {rating} ? 'text-amber-400' : 'text-gray-200'}\`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-500">({reviewCount})</span>
    </div>
    <div className="mt-2 flex items-center gap-2">
      <span className="text-lg font-bold text-gray-900">{price}</span>
      {originalPrice && <span className="text-sm text-gray-400 line-through">{originalPrice}</span>}
    </div>
    <button className="mt-3 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors">Add to Cart</button>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          imageUrl: { type: 'string', description: 'URL of the product image' },
          productName: { type: 'string', description: 'Name of the product' },
          category: { type: 'string', description: 'Product category label' },
          price: { type: 'string', description: 'Formatted current price, e.g. $29.99' },
          originalPrice: {
            type: 'string',
            description: 'Formatted original price before discount',
          },
          rating: { type: 'number', description: 'Star rating from 0 to 5' },
          reviewCount: { type: 'number', description: 'Number of reviews' },
          showBadge: { type: 'boolean', description: 'Whether to show a promotional badge' },
          badgeText: { type: 'string', description: 'Text for the promotional badge' },
        },
      },
      aiUsageRules:
        'Use for displaying individual products in grids or carousels. Always include an image, title, price, and rating. Show the Add to Cart button in success green to drive conversions. Use the badge for sale items or new arrivals.',
    },
    {
      name: 'Product Grid',
      type: 'layout' as const,
      codeTemplate: `<section className="bg-white py-12">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900 font-['DM_Sans']">{title}</h2>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{resultCount} products</span>
        <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:ring-indigo-500">
          <option>Sort by: {sortDefault}</option>
        </select>
      </div>
    </div>
    <div className="mt-8 flex gap-8">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
            <ul className="mt-2 space-y-2">{categoryFilters}</ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Price Range</h3>
            <div className="mt-2">{priceFilter}</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Rating</h3>
            <div className="mt-2">{ratingFilter}</div>
          </div>
        </div>
      </aside>
      <div className="flex-1 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products}
      </div>
    </div>
  </div>
</section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Page or section heading' },
          resultCount: { type: 'number', description: 'Total number of products' },
          sortDefault: { type: 'string', description: 'Default sort option label' },
          categoryFilters: {
            type: 'array',
            description: 'List of category filter items',
            items: {
              type: 'object',
              properties: { label: { type: 'string' }, count: { type: 'number' } },
            },
          },
          priceFilter: { type: 'object', description: 'Price range filter component' },
          ratingFilter: { type: 'object', description: 'Rating filter component' },
          products: {
            type: 'array',
            description: 'Array of Product Card components',
          },
        },
      },
      aiUsageRules:
        'Use as the main product listing page layout. The sidebar filters are hidden on mobile and shown on large screens. Populate with Product Card components in the grid area. Always show the result count and sorting options.',
    },
    {
      name: 'Shopping Cart Drawer',
      type: 'sidebar' as const,
      codeTemplate: `<div className="fixed inset-0 z-50 overflow-hidden">
  <div className="absolute inset-0 bg-black/50" />
  <div className="absolute inset-y-0 right-0 flex max-w-md w-full">
    <div className="flex h-full w-full flex-col bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900 font-['DM_Sans']">Shopping Cart ({itemCount})</h2>
        <button className="rounded-lg p-2 text-gray-400 hover:text-gray-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <ul className="divide-y divide-gray-200">
          {cartItems.map(item => (
            <li key={item.id} className="flex gap-4 py-4">
              <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                  <span className="text-sm font-semibold text-gray-900">{item.price}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{item.variant}</p>
                <div className="mt-auto flex items-center gap-2">
                  <button className="rounded border border-gray-300 px-2 py-1 text-sm">-</button>
                  <span className="text-sm font-medium">{item.quantity}</span>
                  <button className="rounded border border-gray-300 px-2 py-1 text-sm">+</button>
                  <button className="ml-auto text-sm text-red-500 hover:text-red-700">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span>{shipping}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
          <span>Total</span>
          <span>{total}</span>
        </div>
        <button className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">Proceed to Checkout</button>
        <button className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Continue Shopping</button>
      </div>
    </div>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          itemCount: { type: 'number', description: 'Total number of items in the cart' },
          cartItems: {
            type: 'array',
            description: 'Array of cart item objects',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                imageUrl: { type: 'string' },
                price: { type: 'string' },
                variant: { type: 'string' },
                quantity: { type: 'number' },
              },
            },
          },
          subtotal: { type: 'string', description: 'Formatted subtotal amount' },
          shipping: { type: 'string', description: 'Formatted shipping cost or "Free"' },
          total: { type: 'string', description: 'Formatted total amount' },
        },
      },
      aiUsageRules:
        'Use as a slide-out cart drawer triggered from the cart icon in the header. Always show item images, quantity controls, and a clear price breakdown. The checkout button should be prominent. Include a continue shopping option to keep users browsing.',
    },
    {
      name: 'Pricing Badge',
      type: 'badge' as const,
      codeTemplate: `<div className="inline-flex items-center gap-2">
  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">{discountLabel}</span>
  <span className="text-lg font-bold text-gray-900">{salePrice}</span>
  <span className="text-sm text-gray-400 line-through">{originalPrice}</span>
  {savingsAmount && <span className="text-sm font-medium text-green-600">Save {savingsAmount}</span>}
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          discountLabel: {
            type: 'string',
            description: 'Discount label text, e.g. -20% or SALE',
          },
          salePrice: { type: 'string', description: 'Current discounted price' },
          originalPrice: { type: 'string', description: 'Original price before discount' },
          savingsAmount: {
            type: 'string',
            description: 'Amount saved, e.g. $10.00',
          },
        },
      },
      aiUsageRules:
        'Use to highlight discounted products. Place next to or below the product title. The discount label should use a red badge for urgency. Always show both the sale price and the crossed-out original price so customers can see the value.',
    },
    {
      name: 'Category Navigation',
      type: 'navigation' as const,
      codeTemplate: `<nav className="border-b border-gray-200 bg-white">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
      {categories.map((cat, i) => (
        <a
          key={i}
          href={cat.href}
          className={\`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors \${
            cat.isActive
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }\`}
        >
          {cat.label}
        </a>
      ))}
    </div>
  </div>
</nav>`,
      jsonSchema: {
        type: 'object',
        properties: {
          categories: {
            type: 'array',
            description: 'Array of category objects',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', description: 'Category display name' },
                href: { type: 'string', description: 'Link URL for the category' },
                isActive: {
                  type: 'boolean',
                  description: 'Whether this category is currently selected',
                },
              },
            },
          },
        },
      },
      aiUsageRules:
        'Use below the main site header for category browsing. The pills scroll horizontally on mobile. Highlight the active category with the primary indigo color. Keep category names short, ideally one or two words.',
    },
    {
      name: 'Checkout Form',
      type: 'contact' as const,
      codeTemplate: `<form className="mx-auto max-w-2xl bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
  <h2 className="text-xl font-bold text-gray-900 font-['DM_Sans']">{title}</h2>
  <div className="mt-6 space-y-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">First Name</label>
        <input type="text" placeholder="{firstNamePlaceholder}" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Last Name</label>
        <input type="text" placeholder="{lastNamePlaceholder}" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Email Address</label>
      <input type="email" placeholder="{emailPlaceholder}" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">Street Address</label>
      <input type="text" placeholder="{addressPlaceholder}" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">City</label>
        <input type="text" placeholder="{cityPlaceholder}" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">State</label>
        <input type="text" placeholder="{statePlaceholder}" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
        <input type="text" placeholder="{zipPlaceholder}" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
      </div>
    </div>
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="text-lg font-semibold text-gray-900 font-['DM_Sans']">Payment Information</h3>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Card Number</label>
          <input type="text" placeholder="{cardPlaceholder}" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 font-mono focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input type="text" placeholder="{expiryPlaceholder}" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CVC</label>
            <input type="text" placeholder="{cvcPlaceholder}" className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <button type="submit" className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">{submitText}</button>
</form>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Form heading, e.g. Shipping & Payment' },
          firstNamePlaceholder: { type: 'string' },
          lastNamePlaceholder: { type: 'string' },
          emailPlaceholder: { type: 'string' },
          addressPlaceholder: { type: 'string' },
          cityPlaceholder: { type: 'string' },
          statePlaceholder: { type: 'string' },
          zipPlaceholder: { type: 'string' },
          cardPlaceholder: { type: 'string', description: 'Card number placeholder' },
          expiryPlaceholder: { type: 'string', description: 'Expiry date placeholder, e.g. MM/YY' },
          cvcPlaceholder: { type: 'string', description: 'CVC placeholder' },
          submitText: { type: 'string', description: 'Submit button text, e.g. Place Order' },
        },
      },
      aiUsageRules:
        'Use as the main checkout form combining shipping address and payment details. All inputs use rounded-lg borders with indigo focus rings for consistency. The card number field uses a monospace font. Place alongside the Order Summary Card for a complete checkout page.',
    },
    {
      name: 'Order Summary Card',
      type: 'card' as const,
      codeTemplate: `<div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
  <h3 className="text-lg font-bold text-gray-900 font-['DM_Sans']">{title}</h3>
  <ul className="mt-4 divide-y divide-gray-200">
    {items.map((item, i) => (
      <li key={i} className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
          <div>
            <p className="text-sm font-medium text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-900">{item.price}</span>
      </li>
    ))}
  </ul>
  <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
    <div className="flex justify-between text-sm text-gray-600">
      <span>Subtotal</span>
      <span>{subtotal}</span>
    </div>
    <div className="flex justify-between text-sm text-gray-600">
      <span>Shipping</span>
      <span>{shipping}</span>
    </div>
    <div className="flex justify-between text-sm text-gray-600">
      <span>Tax</span>
      <span>{tax}</span>
    </div>
    {discount && (
      <div className="flex justify-between text-sm text-green-600">
        <span>Discount</span>
        <span>-{discount}</span>
      </div>
    )}
    <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
      <span>Total</span>
      <span>{total}</span>
    </div>
  </div>
  <div className="mt-4 flex items-center gap-2">
    <input type="text" placeholder="{couponPlaceholder}" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500" />
    <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">Apply</button>
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Card heading, e.g. Order Summary' },
          items: {
            type: 'array',
            description: 'Array of line items',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                imageUrl: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'string' },
              },
            },
          },
          subtotal: { type: 'string' },
          shipping: { type: 'string' },
          tax: { type: 'string' },
          discount: { type: 'string', description: 'Discount amount if a coupon is applied' },
          total: { type: 'string' },
          couponPlaceholder: { type: 'string', description: 'Placeholder for coupon input' },
        },
      },
      aiUsageRules:
        'Use alongside the Checkout Form to show the order breakdown. Always display subtotal, shipping, tax, and total as separate line items. Include the coupon code input for promotions. Show item thumbnails for visual confirmation.',
    },
    {
      name: 'Product Hero Banner',
      type: 'hero' as const,
      codeTemplate: `<section className="relative overflow-hidden bg-indigo-900">
  <div className="absolute inset-0">
    <img src="{backgroundImageUrl}" alt="" className="h-full w-full object-cover opacity-30" />
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-900/80 to-transparent" />
  </div>
  <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
    <div className="max-w-xl">
      {tagline && <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">{tagline}</p>}
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl font-['DM_Sans']">{headline}</h1>
      <p className="mt-4 text-lg text-indigo-200">{description}</p>
      <div className="mt-8 flex items-center gap-4">
        <a href="{ctaLink}" className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-amber-400 transition-colors">{ctaText}</a>
        {secondaryCtaText && <a href="{secondaryCtaLink}" className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">{secondaryCtaText}</a>}
      </div>
    </div>
  </div>
</section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          backgroundImageUrl: { type: 'string', description: 'Full-width background image URL' },
          tagline: { type: 'string', description: 'Small uppercase tagline above the headline' },
          headline: { type: 'string', description: 'Main promotional headline' },
          description: { type: 'string', description: 'Supporting description text' },
          ctaText: { type: 'string', description: 'Primary call-to-action button text' },
          ctaLink: { type: 'string', description: 'Primary CTA link URL' },
          secondaryCtaText: { type: 'string', description: 'Optional secondary CTA button text' },
          secondaryCtaLink: { type: 'string', description: 'Optional secondary CTA link URL' },
        },
      },
      aiUsageRules:
        'Use at the top of the homepage or landing pages for seasonal promotions and featured collections. The primary CTA uses amber/gold for high visibility against the dark indigo background. Keep headlines under 8 words for impact. Include a background image that relates to the promotion.',
    },
    {
      name: 'Review Card',
      type: 'testimonial' as const,
      codeTemplate: `<div className="rounded-lg border border-gray-200 bg-white p-6">
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={\`h-5 w-5 \${i < {rating} ? 'text-amber-400' : 'text-gray-200'}\`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
  <h4 className="mt-3 text-sm font-semibold text-gray-900">{reviewTitle}</h4>
  <p className="mt-2 text-sm leading-relaxed text-gray-600">{reviewText}</p>
  <div className="mt-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      {avatarUrl && <img src="{avatarUrl}" alt="{reviewerName}" className="h-8 w-8 rounded-full object-cover" />}
      <div>
        <p className="text-sm font-medium text-gray-900">{reviewerName}</p>
        <p className="text-xs text-gray-500">{reviewDate}</p>
      </div>
    </div>
    {isVerified && (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        Verified Buyer
      </span>
    )}
  </div>
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          rating: { type: 'number', description: 'Star rating from 1 to 5' },
          reviewTitle: { type: 'string', description: 'Short review headline' },
          reviewText: { type: 'string', description: 'Full review body text' },
          reviewerName: { type: 'string', description: 'Name of the reviewer' },
          reviewDate: { type: 'string', description: 'Date of the review, e.g. March 15, 2025' },
          avatarUrl: { type: 'string', description: 'URL of the reviewer avatar image' },
          isVerified: { type: 'boolean', description: 'Whether the reviewer is a verified buyer' },
        },
      },
      aiUsageRules:
        'Use on product detail pages to display customer reviews. Show in a grid or list layout. The verified buyer badge in green adds trust and social proof. Always display the star rating visually. Keep review text to a reasonable length with truncation if needed.',
    },
    {
      name: 'Newsletter Signup',
      type: 'cta' as const,
      codeTemplate: `<section className="bg-indigo-600 py-16">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-2xl font-bold text-white font-['DM_Sans']">{headline}</h2>
      <p className="mt-3 text-base text-indigo-200">{description}</p>
      {discountText && <p className="mt-2 text-lg font-semibold text-amber-300">{discountText}</p>}
      <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <input type="email" placeholder="{emailPlaceholder}" className="w-full rounded-lg border-0 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-amber-400 sm:max-w-xs" />
        <button type="submit" className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-amber-400 transition-colors">{buttonText}</button>
      </form>
      <p className="mt-3 text-xs text-indigo-300">{privacyNote}</p>
    </div>
  </div>
</section>`,
      jsonSchema: {
        type: 'object',
        properties: {
          headline: { type: 'string', description: 'Section headline' },
          description: { type: 'string', description: 'Supporting text below headline' },
          discountText: {
            type: 'string',
            description: 'Optional discount offer text, e.g. Get 15% off your first order',
          },
          emailPlaceholder: { type: 'string', description: 'Placeholder for the email input' },
          buttonText: { type: 'string', description: 'Submit button text' },
          privacyNote: {
            type: 'string',
            description: 'Privacy disclaimer text below the form',
          },
        },
      },
      aiUsageRules:
        'Use near the bottom of pages to capture email subscribers. Lead with a discount offer to incentivize signups. The amber button contrasts against the indigo background for high visibility. Always include a privacy note. Keep the form to a single email field for maximum conversion.',
    },
    {
      name: 'Size Selector',
      type: 'select' as const,
      codeTemplate: `<div>
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-medium text-gray-900">{label}</h3>
    {sizeGuideLink && <a href="{sizeGuideLink}" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Size Guide</a>}
  </div>
  <div className="mt-3 flex flex-wrap gap-2">
    {options.map((option, i) => (
      <button
        key={i}
        disabled={option.isOutOfStock}
        className={\`relative flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors \${
          option.isSelected
            ? 'border-indigo-600 bg-indigo-600 text-white'
            : option.isOutOfStock
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
            : 'border-gray-300 bg-white text-gray-900 hover:border-indigo-400'
        }\`}
      >
        {option.label}
        {option.isOutOfStock && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-px w-full rotate-[-45deg] bg-gray-300" />
          </span>
        )}
      </button>
    ))}
  </div>
  {selectedDescription && <p className="mt-2 text-sm text-gray-500">{selectedDescription}</p>}
</div>`,
      jsonSchema: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Selector label, e.g. Size or Color' },
          sizeGuideLink: { type: 'string', description: 'Optional link to size guide page' },
          options: {
            type: 'array',
            description: 'Array of size/variant options',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', description: 'Option display text, e.g. S, M, L, XL' },
                isSelected: { type: 'boolean', description: 'Whether this option is selected' },
                isOutOfStock: {
                  type: 'boolean',
                  description: 'Whether this option is out of stock',
                },
              },
            },
          },
          selectedDescription: {
            type: 'string',
            description: 'Description for the selected option, e.g. fits true to size',
          },
        },
      },
      aiUsageRules:
        'Use on product detail pages for size or variant selection. Out-of-stock options are visually disabled with a diagonal strikethrough line. The selected option uses the primary indigo color. Include a size guide link for apparel. Can also be adapted for color or material selection.',
    },
    {
      name: 'Wishlist Button',
      type: 'button' as const,
      codeTemplate: `<button
  className={\`group inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 \${
    {isWishlisted}
      ? 'border-red-200 bg-red-50 text-red-600'
      : 'border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:text-red-500'
  }\`}
>
  <svg
    className={\`h-5 w-5 transition-transform duration-200 group-hover:scale-110 \${
      {isWishlisted} ? 'fill-red-500 text-red-500' : 'fill-none text-current'
    }\`}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
  <span>{isWishlisted ? {removeText} : {addText}}</span>
  {wishlistCount && <span className="text-xs text-gray-400">({wishlistCount})</span>}
</button>`,
      jsonSchema: {
        type: 'object',
        properties: {
          isWishlisted: { type: 'boolean', description: 'Whether the item is in the wishlist' },
          addText: {
            type: 'string',
            description: 'Text when not wishlisted, e.g. Add to Wishlist',
          },
          removeText: {
            type: 'string',
            description: 'Text when wishlisted, e.g. Remove from Wishlist',
          },
          wishlistCount: {
            type: 'number',
            description: 'Optional count of users who wishlisted this item',
          },
        },
      },
      aiUsageRules:
        'Use on product cards and product detail pages. The heart icon scales up on hover for a subtle animation hint. When wishlisted, the button switches to a filled red heart with a red-tinted background. Include the wishlist count for social proof when available. Can be used as an icon-only variant by omitting the text props.',
    },
  ],
};
