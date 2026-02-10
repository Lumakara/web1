import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, User, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { audioService } from '@/lib/audio';

interface ProductReviewsProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductReviews({ productId, isOpen, onClose }: ProductReviewsProps) {
  const { addReview, getProductReviews, user, isAuthenticated } = useAppStore();
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const { soundEnabled } = useAppStore();

  const productReviews = getProductReviews(productId);

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      if (soundEnabled) audioService.playError();
      alert('Silakan login terlebih dahulu untuk memberikan ulasan');
      return;
    }

    if (newComment.trim().length < 10) {
      if (soundEnabled) audioService.playError();
      alert('Ulasan minimal 10 karakter');
      return;
    }

    const review = {
      id: `review-${Date.now()}`,
      productId,
      userId: user?.uid || 'guest',
      userName: user?.displayName || 'Pengguna',
      userAvatar: user?.photoURL || undefined,
      rating: newRating,
      comment: newComment,
      createdAt: new Date().toISOString(),
    };

    addReview(review);
    if (soundEnabled) audioService.playSuccess();
    setNewComment('');
    setNewRating(5);
  };

  const averageRating = productReviews.length > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: productReviews.filter(r => r.rating === stars).length,
    percentage: productReviews.length > 0
      ? (productReviews.filter(r => r.rating === stars).length / productReviews.length) * 100
      : 0,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Ulasan Produk
          </DialogTitle>
        </DialogHeader>

        {/* Rating Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
              <div className="flex gap-0.5 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">{productReviews.length} ulasan</p>
            </div>
            <div className="flex-1 space-y-1">
              {ratingCounts.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-xs w-3">{stars}</span>
                  <Star className="h-3 w-3 text-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Review */}
        {isAuthenticated && (
          <div className="border-t pt-4 mb-4">
            <p className="font-medium mb-2">Tulis Ulasan</p>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoverRating || newRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Bagikan pengalaman Anda dengan produk ini..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2"
              rows={3}
            />
            <Button
              onClick={handleSubmitReview}
              className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
              disabled={newComment.trim().length < 10}
            >
              <Send className="h-4 w-4 mr-2" />
              Kirim Ulasan
            </Button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {productReviews.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Belum ada ulasan</p>
          ) : (
            productReviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {review.userAvatar ? (
                      <img src={review.userAvatar} alt={review.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{review.userName}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
