
import React, { useState, useMemo } from 'react';
import { Product, Transaction, CartItem, PaymentMethod } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ReceiptIcon } from './icons/ReceiptIcon';
import { SearchIcon } from './icons/SearchIcon';

interface TillPageProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  transactions: Transaction[];
  onProcessTransaction: (items: CartItem[], total: number, method: PaymentMethod) => void;
}

const TillPage: React.FC<TillPageProps> = ({ products, onAddProduct, transactions, onProcessTransaction }) => {
  const [view, setView] = useState<'terminal' | 'history'>('terminal');
  const [basket, setBasket] = useState<{ [id: string]: number }>({}); // Product ID -> Quantity
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  
  // New Product State
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  // Add to basket
  const addToBasket = (productId: string) => {
    setBasket(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  // Remove/Decrement from basket
  const removeFromBasket = (productId: string) => {
    setBasket(prev => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  const clearBasket = () => setBasket({});

  const cartItems: CartItem[] = useMemo(() => {
    return Object.entries(basket).map(([id, qty]) => {
      const product = products.find(p => p.id === id);
      if (!product) return null;
      return { ...product, quantity: qty };
    }).filter(Boolean) as CartItem[];
  }, [basket, products]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const handleCheckout = (method: PaymentMethod) => {
    onProcessTransaction(cartItems, subtotal, method);
    setBasket({});
    setIsCheckoutOpen(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProductName && newProductPrice) {
      const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      onAddProduct({
        name: newProductName,
        price: parseFloat(newProductPrice),
        color: randomColor
      });
      setNewProductName('');
      setNewProductPrice('');
      setIsAddProductOpen(false);
    }
  };

  // Transactions Logic
  const totalRevenue = useMemo(() => transactions.reduce((sum, t) => sum + t.total, 0), [transactions]);
  const [transactionSearch, setTransactionSearch] = useState('');

  const filteredTransactions = useMemo(() => {
      return transactions.filter(t => {
          // Search by ID or if item names match
          const matchesId = t.id.toLowerCase().includes(transactionSearch.toLowerCase());
          const matchesItems = t.items.some(i => i.name.toLowerCase().includes(transactionSearch.toLowerCase()));
          return matchesId || matchesItems;
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, transactionSearch]);

  if (view === 'history') {
    return (
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Transaction History</h1>
            <button onClick={() => setView('terminal')} className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors">
                Back to Till
            </button>
        </div>
        
        <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
            </div>
            <input
                type="text"
                placeholder="Search transactions..."
                value={transactionSearch}
                onChange={e => setTransactionSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
            />
        </div>

        <div className="bg-dark-card rounded-lg shadow overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-dark-border">
                    <thead className="bg-gray-800/50 sticky top-0">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Method</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Total</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                    {filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-dark-border/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                            {new Date(t.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                            <div className="flex flex-col">
                            {t.items.map((item, idx) => (
                                <span key={idx} className="text-xs md:text-sm">{item.quantity}x {item.name}</span>
                            ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.method === PaymentMethod.Card ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'}`}>
                                {t.method}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-brand-primary">
                            £{t.total.toFixed(2)}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-gray-900 border-t border-dark-border">
                <div className="flex justify-between items-center text-xl font-bold text-white">
                    <span>Total Revenue</span>
                    <span>£{totalRevenue.toFixed(2)}</span>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Terminal View
  return (
    <div className="h-full flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Left Side - Product Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4 shrink-0">
             <h1 className="text-2xl md:text-3xl font-bold text-white">Bar Till</h1>
             <button onClick={() => setView('history')} className="flex items-center px-3 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text hover:text-white hover:bg-dark-border transition-colors">
                <ReceiptIcon />
                <span className="ml-2 text-sm font-medium hidden md:inline">History</span>
             </button>
        </div>
       
        <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map(product => (
                    <button
                        key={product.id}
                        onClick={() => addToBasket(product.id)}
                        className={`${product.color || 'bg-gray-700'} hover:brightness-110 active:scale-95 transition-all duration-150 h-32 md:h-40 rounded-xl shadow-lg flex flex-col items-center justify-center p-4 text-center border border-white/10`}
                    >
                        <span className="text-white font-bold text-lg md:text-xl leading-tight">{product.name}</span>
                        <span className="text-white/90 mt-2 font-medium bg-black/20 px-3 py-1 rounded-full">£{product.price.toFixed(2)}</span>
                    </button>
                ))}
                
                {/* Add Item Button */}
                <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="bg-dark-card border-2 border-dashed border-dark-border hover:border-brand-primary hover:text-brand-primary text-dark-text-secondary h-32 md:h-40 rounded-xl flex flex-col items-center justify-center p-4 transition-colors"
                >
                    <span className="text-4xl font-light mb-2">+</span>
                    <span className="font-medium">Add Item</span>
                </button>
            </div>
        </div>
      </div>

      {/* Right Side - Basket */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col bg-dark-card rounded-xl border border-dark-border shadow-2xl h-[40vh] md:h-full shrink-0">
        <div className="p-4 border-b border-dark-border flex justify-between items-center bg-gray-800/50 rounded-t-xl">
            <h2 className="text-lg font-bold text-white">Current Basket</h2>
            <button onClick={clearBasket} className="text-xs text-red-400 hover:text-red-300 underline">Clear All</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-dark-text-secondary opacity-50">
                     <p>Basket Empty</p>
                </div>
            ) : (
                cartItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-dark-bg p-3 rounded-lg border border-dark-border">
                        <div className="flex flex-col">
                            <span className="text-white font-medium">{item.name}</span>
                            <span className="text-xs text-dark-text-secondary">£{item.price.toFixed(2)} each</span>
                        </div>
                        <div className="flex items-center space-x-3">
                             <button onClick={() => removeFromBasket(item.id)} className="w-8 h-8 flex items-center justify-center bg-gray-700 text-white rounded hover:bg-gray-600">-</button>
                             <span className="w-4 text-center text-white font-bold">{item.quantity}</span>
                             <button onClick={() => addToBasket(item.id)} className="w-8 h-8 flex items-center justify-center bg-gray-700 text-white rounded hover:bg-gray-600">+</button>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-4 border-t border-dark-border bg-gray-800/50 rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
                <span className="text-dark-text-secondary">Subtotal</span>
                <span className="text-2xl font-bold text-brand-primary">£{subtotal.toFixed(2)}</span>
            </div>
            <button 
                onClick={() => setIsCheckoutOpen(true)}
                disabled={cartItems.length === 0}
                className="w-full py-4 bg-brand-primary text-white text-lg font-bold rounded-lg hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.99]"
            >
                Proceed to Checkout
            </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card w-full max-w-md rounded-2xl shadow-2xl border border-dark-border overflow-hidden">
                <div className="p-6 border-b border-dark-border">
                    <h2 className="text-2xl font-bold text-white text-center">Confirm Transaction</h2>
                </div>
                
                <div className="p-6 max-h-[40vh] overflow-y-auto">
                    <div className="space-y-2">
                         {cartItems.map(item => (
                             <div key={item.id} className="flex justify-between text-sm text-dark-text">
                                 <span>{item.quantity}x {item.name}</span>
                                 <span>£{(item.quantity * item.price).toFixed(2)}</span>
                             </div>
                         ))}
                    </div>
                    <div className="border-t border-dark-border mt-4 pt-4 flex justify-between text-xl font-bold text-white">
                        <span>Total to Pay</span>
                        <span>£{subtotal.toFixed(2)}</span>
                    </div>
                </div>

                <div className="p-6 bg-gray-800/50 grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleCheckout(PaymentMethod.Cash)}
                        className="py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex flex-col items-center justify-center transition-colors"
                    >
                        <span>CASH</span>
                    </button>
                     <button 
                        onClick={() => handleCheckout(PaymentMethod.Card)}
                        className="py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 flex flex-col items-center justify-center transition-colors"
                    >
                        <span>CARD</span>
                    </button>
                </div>
                <button onClick={() => setIsCheckoutOpen(false)} className="w-full py-3 text-dark-text-secondary hover:text-white text-sm bg-dark-bg">Cancel</button>
            </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-card w-full max-w-sm rounded-xl p-6 border border-dark-border shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">Add New Menu Item</h3>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Item Name</label>
                        <input 
                            autoFocus
                            type="text" 
                            required
                            value={newProductName}
                            onChange={e => setNewProductName(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Price (£)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            required
                            value={newProductPrice}
                            onChange={e => setNewProductPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-dark-border rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                         <button type="button" onClick={() => setIsAddProductOpen(false)} className="px-4 py-2 bg-dark-border text-white rounded-lg hover:bg-gray-600">Cancel</button>
                         <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">Add Item</button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};

export default TillPage;
