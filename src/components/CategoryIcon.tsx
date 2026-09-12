import React from 'react';
import {
  Utensils,
  Beer,
  ShoppingCart,
  Disc,
  Car,
  HeartPulse,
  Shirt,
  Ticket,
  Package,
  Tag,
  CreditCard,
  Home,
  Zap,
  Phone,
  Smartphone,
  ShieldCheck,
  Building2,
  Tv,
  Film,
  Dumbbell,
  Plane,
  Pill,
  Cloud,
  PlaySquare,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface CategoryIconProps {
  name?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  const normalized = (name || '').toLowerCase();

  if (normalized.includes('delivery') || normalized.includes('ifood')) {
    return <Utensils className={className} />;
  }
  if (normalized.includes('restaurante') || normalized.includes('bar')) {
    return <Beer className={className} />;
  }
  if (normalized.includes('mercado') || normalized.includes('supermercado')) {
    return <ShoppingCart className={className} />;
  }
  if (normalized.includes('disco') || normalized.includes('vinil') || normalized.includes('música')) {
    return <Disc className={className} />;
  }
  if (normalized.includes('transporte') || normalized.includes('uber') || normalized.includes('combustível')) {
    return <Car className={className} />;
  }
  if (normalized.includes('saúde') || normalized.includes('farmácia') || normalized.includes('médic')) {
    return <HeartPulse className={className} />;
  }
  if (normalized.includes('vestuário') || normalized.includes('roupa')) {
    return <Shirt className={className} />;
  }
  if (normalized.includes('lazer') || normalized.includes('cinema') || normalized.includes('show')) {
    return <Ticket className={className} />;
  }
  if (normalized.includes('condomínio')) {
    return <Home className={className} />;
  }
  if (normalized.includes('luz') || normalized.includes('energia')) {
    return <Zap className={className} />;
  }
  if (normalized.includes('vivo') || normalized.includes('internet')) {
    return <Phone className={className} />;
  }
  if (normalized.includes('claro') || normalized.includes('celular')) {
    return <Smartphone className={className} />;
  }
  if (normalized.includes('seguro')) {
    return <ShieldCheck className={className} />;
  }
  if (normalized.includes('das') || normalized.includes('receita') || normalized.includes('imposto')) {
    return <Building2 className={className} />;
  }
  if (normalized.includes('academia') || normalized.includes('vasco')) {
    return <Dumbbell className={className} />;
  }
  if (normalized.includes('globoplay') || normalized.includes('hbo') || normalized.includes('prime')) {
    return <Tv className={className} />;
  }
  if (normalized.includes('gol') || normalized.includes('viagem')) {
    return <Plane className={className} />;
  }
  if (normalized.includes('rd saúde') || normalized.includes('droga')) {
    return <Pill className={className} />;
  }
  if (normalized.includes('google') || normalized.includes('apple') || normalized.includes('one')) {
    return <Cloud className={className} />;
  }

  return <Package className={className} />;
};
