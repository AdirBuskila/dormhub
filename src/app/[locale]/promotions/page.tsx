import { getProducts } from '@/lib/database';
import NewOrderProductList from '@/components/customer/NewOrderProductList';
import { Product } from '@/types/database';

export default async function PromotionsPage() {
  let products: Product[] = [];
  
  try {
    const allProducts = await getProducts();
    // Filter for promotion products only
    products = allProducts.filter(product => product.is_promotion);
  } catch (error) {
    console.error('Failed to load promotion products:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">מבצעים</h1>
          <p className="mt-2 text-lg text-gray-600">
            עיין במוצרים במבצע מיוחד
          </p>
        </div>
        
        <NewOrderProductList
          products={products}
          onAddToCart={() => {}} // This will be handled by the parent component
          cartItems={[]}
          isAdmin={false}
        />
      </div>
    </div>
  );
}
