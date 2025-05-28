import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";

interface ProductReviewFormProps {
  onSubmit: (review: { rating: number; content: string }) => void;
}

export function ProductReviewForm({ onSubmit }: ProductReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    onSubmit({ rating, content });
    setRating(0);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div className="flex items-center gap-1">
        <span className="font-medium mr-2">Puanınız:</span>
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            className="focus:outline-none"
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(0)}
          >
            {(hoverRating || rating) > i ? (
              <StarFilledIcon className="h-6 w-6 text-yellow-500" />
            ) : (
              <StarIcon className="h-6 w-6 text-gray-300 hover:text-yellow-500" />
            )}
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-32"
      />

      <Button 
        type="submit" 
        disabled={rating === 0}
        className="font-medium"
      >
        Değerlendirme Gönder
      </Button>
    </form>
  );
} 