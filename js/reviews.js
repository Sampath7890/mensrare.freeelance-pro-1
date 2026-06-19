import { storage } from './storage.js';

const KEY = 'mensrare_reviews';

export function getReviews(productId) {
  const reviews = storage.get(KEY, []);
  return productId ? reviews.filter((review) => String(review.productId) === String(productId)) : reviews;
}

export function addReview(review) {
  storage.update(KEY, [], (reviews) => [...reviews, { ...review, id: crypto.randomUUID(), createdAt: Date.now() }]);
}

export function deleteReview(id) {
  storage.update(KEY, [], (reviews) => reviews.filter((review) => review.id !== id));
}
