import { useState } from "react";
import { ProductReviewCard } from "./ProductReviewCard";
import { ProductReviewForm } from "./ProductReviewForm";

interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  content: string;
  avatar?: string;
}

interface ProductReviewsProps {
  productId: string;
  initialReviews?: Review[];
}

export function ProductReviews({ productId, initialReviews = [] }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const handleAddReview = async (newReview: { rating: number; content: string }) => {
    // Burada gerçek bir API çağrısı yapılabilir
    const fakeReview: Review = {
      id: Math.random().toString(36).substring(2, 9),
      author: "Mevcut Kullanıcı",
      date: new Date().toLocaleDateString("tr-TR"),
      ...newReview,
    };

    // Normalde burada API çağrısı olacak
    // await fetch(`/api/products/${productId}/reviews`, {
    //   method: "POST",
    //   body: JSON.stringify(newReview),
    // });

    setReviews((prev) => [fakeReview, ...prev]);
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Ürün Değerlendirmeleri</h2>
      
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold">{averageRating}</div>
          <div className="text-lg text-muted-foreground">
            {reviews.length} değerlendirme
          </div>
        </div>
      </div>

      <div className="border-t border-b py-6 my-6">
        <h3 className="font-medium text-lg mb-4">Değerlendirmenizi Ekleyin</h3>
        <ProductReviewForm onSubmit={handleAddReview} />
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ProductReviewCard key={review.id} {...review} />
          ))
        ) : (
          <p className="text-muted-foreground">
            Bu ürün için henüz değerlendirme bulunmuyor. İlk değerlendirmeyi siz yapın!
          </p>
        )}
      </div>
    </div>
  );
} 