import React from 'react';
import {
  Beef,
  Beer,
  CupSoda,
  Salad,
  Flame,
  Coffee,
  Soup,
  CakeSlice,
  Utensils,
  Pizza,
} from 'lucide-react';

interface ItemIconProps {
  iconName?: string;
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ iconName, className = 'w-5 h-5' }) => {
  switch (iconName) {
    case 'burger':
      return <Beef className={className} />;
    case 'beer':
      return <Beer className={className} />;
    case 'soda':
      return <CupSoda className={className} />;
    case 'salad':
      return <Salad className={className} />;
    case 'hotdog':
      return <Flame className={className} />;
    case 'cup':
    case 'coffee':
      return <Coffee className={className} />;
    case 'soup':
      return <Soup className={className} />;
    case 'cake':
      return <CakeSlice className={className} />;
    case 'pizza':
      return <Pizza className={className} />;
    default:
      return <Utensils className={className} />;
  }
};

