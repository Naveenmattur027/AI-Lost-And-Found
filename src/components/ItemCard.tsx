import { LostItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Package } from 'lucide-react';

interface ItemCardProps {
  item: LostItem;
  onClaim: () => void;
}

const ItemCard = ({ item, onClaim }: ItemCardProps) => {
  const categoryColors: Record<string, string> = {
    phone: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    book: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    bottle: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    wallet: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    bag: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    electronics: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    accessories: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.status === 'pending' && (
          <Badge className="absolute top-2 right-2 bg-warning text-warning-foreground">
            Claim Pending
          </Badge>
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <Badge variant="outline" className={categoryColors[item.category]}>
            {item.category}
          </Badge>
        </div>
        <CardDescription className="space-y-1">
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            {item.location}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            Found on {new Date(item.dateFound).toLocaleDateString()}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
        <Button 
          className="w-full" 
          onClick={onClaim}
          disabled={item.status === 'pending'}
        >
          <Package className="mr-2 h-4 w-4" />
          {item.status === 'pending' ? 'Claim Pending' : 'Claim This Item'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
