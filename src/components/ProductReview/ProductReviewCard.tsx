import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";

interface ProductReviewCardProps {
  author: string;
  date: string;
  rating: number;
  content: string;
  avatar?: string;
}

export function ProductReviewCard({
  author,
  date,
  rating,
  content,
  avatar,
}: ProductReviewCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} alt={author} />
          <AvatarFallback>{author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="font-medium">{author}</div>
          <div className="text-sm text-muted-foreground">{date}</div>
        </div>
        <div className="ml-auto flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            i < rating 
              ? <StarFilledIcon key={i} className="h-4 w-4 text-yellow-500" /> 
              : <StarIcon key={i} className="h-4 w-4 text-gray-300" />
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm">{content}</p>
      </CardContent>
    </Card>
  );
} 