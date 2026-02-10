import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/store/appStore';
import { Link } from 'react-router-dom';

export function CartSection() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    toggleItemSelection,
    selectAllItems,
    clearCart,
  } = useAppStore();
  const [selectAll, setSelectAll] = useState(true);

  const selectedItems = cart.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    selectAllItems(checked);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Keranjang Kosong</h2>
        <p className="text-gray-500 text-center mt-2 mb-6">
          Keranjang belanja Anda masih kosong. Yuk, jelajahi layanan kami!
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-blue-600 to-orange-500">
            Jelajahi Layanan
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Keranjang Belanja</h1>
        <button 
          onClick={clearCart}
          className="text-red-500 text-sm hover:underline"
        >
          Hapus Semua
        </button>
      </div>

      {/* Select All */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <Checkbox 
          checked={selectAll} 
          onCheckedChange={handleSelectAll}
          id="select-all"
        />
        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
          Pilih Semua ({cart.length} item)
        </label>
      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {cart.map((item, index) => (
          <Card 
            key={item.id} 
            className={`overflow-hidden transition-all ${item.selected ? 'border-blue-500' : ''}`}
          >
            <CardContent className="p-3">
              <div className="flex gap-3">
                <Checkbox 
                  checked={item.selected}
                  onCheckedChange={() => toggleItemSelection(index)}
                  className="mt-1"
                />
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-gray-500">Paket {item.tier}</p>
                  <p className="text-blue-600 font-bold mt-1">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(index, -1)}
                      className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, 1)}
                      className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFromCart(index)}
                  className="text-gray-400 hover:text-red-500 self-start"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-600">Total ({selectedCount} item)</p>
              <p className="text-2xl font-bold text-blue-600">
                Rp {subtotal.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          <Link to="/checkout">
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
            >
              Checkout
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
