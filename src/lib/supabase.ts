import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mvvcpwghdyzlgghupizw.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qeYe4rySmIQqThZOgWWbMQ_s8uIV1TE';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Product {
  id: string;
  title: string;
  category: 'installation' | 'creative' | 'technical';
  base_price: number;
  discount_price?: number;
  stock: number;
  image: string;
  icon: string;
  rating: number;
  reviews: number;
  duration: string;
  description: string;
  tags: string[];
  tiers: Tier[];
  related: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Tier {
  name: string;
  price: number;
  features: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SupportTicket {
  id: string;
  user_id?: string;
  subject: string;
  category: string;
  email: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  payment_method: string;
  payment_reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  tier: string;
  price: number;
  quantity: number;
}

// Product CRUD Operations
export const ProductService = {
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return getMockProducts();
    }
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      const mock = getMockProducts().find(p => p.id === id);
      return mock || null;
    }
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateStock(id: string, stock: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ stock, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async updatePrice(id: string, basePrice: number, discountPrice?: number): Promise<void> {
    const updates: Partial<Product> = { 
      base_price: basePrice, 
      updated_at: new Date().toISOString() 
    };
    if (discountPrice !== undefined) {
      updates.discount_price = discountPrice;
    }
    
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  }
};

// User Profile Operations
export const UserService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async createProfile(profile: UserProfile): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .insert(profile);
    
    if (error) throw error;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) throw error;
  },

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data?.is_admin || false;
    } catch (error) {
      return false;
    }
  }
};

// Support Ticket Operations
export const TicketService = {
  async create(ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({ ...ticket, status: 'open' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByUser(userId: string): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  },

  async getAll(): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  },

  async updateStatus(id: string, status: SupportTicket['status']): Promise<void> {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Order Operations
export const OrderService = {
  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByUser(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  },

  async getAll(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      return [];
    }
  },

  async updateStatus(id: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async updatePayment(id: string, paymentReference: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_reference: paymentReference, 
        status: 'paid',
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Mock products for fallback
function getMockProducts(): Product[] {
  return [
    {
      id: 'wifi',
      title: 'Wi-Fi Installation Service',
      category: 'installation',
      base_price: 89000,
      discount_price: 79000,
      stock: 100,
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
      icon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200',
      rating: 4.8,
      reviews: 156,
      duration: '2-3 jam',
      description: 'Pemasangan dan konfigurasi jaringan wireless profesional untuk rumah dan kantor.',
      tags: ['network', 'internet', 'setup'],
      tiers: [
        { name: 'Basic', price: 89000, features: ['Setup 1 router', 'Konfigurasi dasar', 'Optimasi kecepatan', 'Garansi 1 tahun'] },
        { name: 'Standard', price: 149000, features: ['Setup mesh network', 'Keamanan advanced', 'Optimasi multi device', 'Guest network', 'Garansi 2 tahun'] },
        { name: 'Premium', price: 249000, features: ['Enterprise mesh system', 'Security suite', 'IoT management', 'Priority support', 'Garansi 3 tahun'] }
      ],
      related: ['vps', 'code']
    },
    {
      id: 'cctv',
      title: 'CCTV Security System',
      category: 'installation',
      base_price: 199000,
      discount_price: 179000,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400',
      icon: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=200',
      rating: 4.7,
      reviews: 89,
      duration: '4-6 jam',
      description: 'Instalasi kamera keamanan lengkap dengan monitoring dan akses mobile.',
      tags: ['security', 'camera', 'monitoring'],
      tiers: [
        { name: 'Basic', price: 199000, features: ['2 kamera HD', 'Recording dasar', 'Akses mobile app', 'Storage 1 TB'] },
        { name: 'Standard', price: 399000, features: ['4 kamera 4K', 'Night vision', 'Motion detection', 'Cloud backup', 'Storage 2 TB'] },
        { name: 'Premium', price: 699000, features: ['8 kamera 4K', 'AI detection', '24/7 monitoring', 'Professional monitoring', 'Storage 4 TB'] }
      ],
      related: ['wifi', 'vps']
    },
    {
      id: 'code',
      title: 'Code Error Repair',
      category: 'technical',
      base_price: 59000,
      discount_price: 49000,
      stock: 200,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
      icon: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200',
      rating: 4.9,
      reviews: 234,
      duration: '1-4 jam',
      description: 'Debugging dan optimasi kode expert untuk website dan aplikasi.',
      tags: ['debugging', 'coding', 'development'],
      tiers: [
        { name: 'Basic', price: 59000, features: ['Identifikasi bug', 'Fix sederhana', 'Code review', 'Dokumentasi'] },
        { name: 'Standard', price: 129000, features: ['Complex debugging', 'Performance optimization', 'Security audit', 'Testing'] },
        { name: 'Premium', price: 249000, features: ['Full code refactoring', 'Architecture review', 'Performance tuning', 'Long-term support'] }
      ],
      related: ['vps', 'wifi']
    },
    {
      id: 'photo',
      title: 'Photo Editing',
      category: 'creative',
      base_price: 29000,
      discount_price: 25000,
      stock: 150,
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400',
      icon: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200',
      rating: 4.6,
      reviews: 120,
      duration: '1-2 hari',
      description: 'Retouching dan enhancement gambar profesional.',
      tags: ['photo', 'editing', 'creative'],
      tiers: [
        { name: 'Basic', price: 29000, features: ['Color correction', 'Basic retouching', 'Format conversion', '5 revisi'] },
        { name: 'Standard', price: 79000, features: ['Advanced retouching', 'Background removal', 'Skin smoothing', 'Unlimited revisi'] },
        { name: 'Premium', price: 149000, features: ['High-end editing', 'Composite work', 'RAW processing', 'Priority delivery'] }
      ],
      related: ['video', 'code']
    },
    {
      id: 'video',
      title: 'Video Editing',
      category: 'creative',
      base_price: 79000,
      discount_price: 69000,
      stock: 80,
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400',
      icon: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200',
      rating: 4.8,
      reviews: 95,
      duration: '2-5 hari',
      description: 'Editing video dan post-production profesional.',
      tags: ['video', 'editing', 'production'],
      tiers: [
        { name: 'Basic', price: 79000, features: ['Basic cuts', 'Transitions', 'Audio sync', 'Output 1080p'] },
        { name: 'Standard', price: 199000, features: ['Color grading', 'Motion graphics', 'Sound mixing', 'Output 4K'] },
        { name: 'Premium', price: 399000, features: ['VFX', 'Animation', 'Professional sound design', 'Cinema quality'] }
      ],
      related: ['photo', 'code']
    },
    {
      id: 'vps',
      title: 'VPS Hosting',
      category: 'technical',
      base_price: 49000,
      discount_price: 39000,
      stock: 500,
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
      icon: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200',
      rating: 4.5,
      reviews: 180,
      duration: 'Instant',
      description: 'Solusi hosting Virtual Private Server.',
      tags: ['hosting', 'server', 'infrastructure'],
      tiers: [
        { name: 'Basic', price: 49000, features: ['2 CPU cores', '4GB RAM', '50GB SSD', '1TB bandwidth'] },
        { name: 'Standard', price: 99000, features: ['4 CPU cores', '8GB RAM', '100GB SSD', '2TB bandwidth'] },
        { name: 'Premium', price: 199000, features: ['8 CPU cores', '16GB RAM', '200GB SSD', 'Unlimited bandwidth'] }
      ],
      related: ['wifi', 'code']
    }
  ];
}
