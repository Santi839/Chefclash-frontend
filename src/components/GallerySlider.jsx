import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1200&q=80',
    alt: 'Plato gourmet con decoración',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=1200&q=80',
    alt: 'Chef decorando un postre',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    alt: 'Mesa con degustaciones variadas',
  },
];

function GallerySlider() {
  return (
    <section className="c-gallery-section" aria-label="Galería destacada de platos">
      <Swiper
        className="c-gallery-slider"
        modules={[Autoplay, Pagination]}
        loop
        autoplay={{ delay: 3200, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        speed={900}
        onSwiper={(swiper) => swiper.update()} // Ensure Swiper updates on initialization
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <img 
              src={slide.image} 
              alt={slide.alt} 
              loading="lazy" 
              onError={(e) => e.target.src = '/src/assets/images/fallback.jpg'} // Fallback image
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default GallerySlider;
